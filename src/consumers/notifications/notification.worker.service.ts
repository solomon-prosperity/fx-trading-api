import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import amqp from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { NotificationService } from './notification.service';
import { INotificationMessage } from 'src/common/utils/interfaces';

@Injectable()
export class NotificationWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = {
    info: console.info,
    error: console.error,
  };

  private readonly isTls = process.env.RABBITMQ_ISTLS === 'true';
  private readonly queuePrefix = `${process.env.RABBITMQ_QUEUE_PREFIX}.notification`;

  private readonly connectionOptions = {
    protocol: this.isTls ? 'amqps' : 'amqp',
    hostname: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT),
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    locale: 'en_US',
    frameMax: 0,
    heartbeat: 0,
    vhost: process.env.RABBITMQ_VHOST,
  };

  private readonly connection = amqp.connect(this.connectionOptions);
  private readonly EXCHANGE_NAME = `${process.env.RABBITMQ_QUEUE_PREFIX}.exchange`;
  private readonly RETRY_EXCHANGE_NAME = `${this.queuePrefix}.retry.exchange`;
  private readonly QUEUE = `${this.queuePrefix}.queue`;
  private readonly ROUTING_KEY = `${this.queuePrefix}.route`;

  private readonly RETRY_QUEUES = {
    THIRTY_SECONDS: {
      retryQueueName: `${this.queuePrefix}.retry.30s`,
      delay: 30000,
      retryRoutingKey: 'retry.30s.route',
    },
    FIVE_MINUTES: {
      retryQueueName: `${this.queuePrefix}.retry.5m`,
      delay: 60000 * 5,
      retryRoutingKey: 'retry.5m.route',
    },
    THIRTY_MINUTES: {
      retryQueueName: `${this.queuePrefix}.retry.30m`,
      delay: 60000 * 30,
      retryRoutingKey: 'retry.30m.route',
    },
  };

  private readonly MAX_JOB_RETRIES = 2;

  public readonly channelWrapper = this.connection.createChannel({
    json: true,
    setup: (channel: ConfirmChannel) => this.setupChannel(channel),
  });

  constructor(private readonly notificationService: NotificationService) {
    this.connection.on('connect', () =>
      this.logger.info('RabbitMq is connected!'),
    );
    this.connection.on('disconnect', () =>
      this.logger.info('RabbitMq disconnected. Retrying...'),
    );

    this.channelWrapper.on('connect', () => {
      this.logger.info(
        'Notifications channel has connected, listening for messages...',
      );
    });

    this.channelWrapper.on('close', () => {
      this.logger.info('RabbitMq channel has closed');
    });
  }

  onModuleInit() {
    // Optionally, additional initialization logic can be placed here.
  }

  onModuleDestroy() {
    // Close the connection gracefully on shutdown
    this.connection.close();
  }

  private async setupChannel(channel: ConfirmChannel) {
    await Promise.all([
      channel.assertExchange(this.EXCHANGE_NAME, 'topic', {
        durable: true,
      }),
      channel.assertQueue(this.QUEUE, { durable: true }),
      channel.bindQueue(this.QUEUE, this.EXCHANGE_NAME, this.ROUTING_KEY),
      channel.prefetch(1),
      channel.consume(this.QUEUE, async (messageBuffer) => {
        if (messageBuffer) {
          await this.handleMessage(channel, messageBuffer);
        }
      }),
    ]);
  }

  private async handleMessage(channel: ConfirmChannel, msg: ConsumeMessage) {
    const message: INotificationMessage = JSON.parse(msg.content.toString());
    try {
      const eventName = `${message.action}_${message.type}`;
      switch (eventName) {
        case 'send_email':
          this.logger.info(' [Received] %s', eventName);
          await this.notificationService.sendMail(message.data);
          this.logger.info(' [Processed] %s', eventName);
          this.channelWrapper.ack(msg);
          break;

        default:
          this.logger.info(' [Received] %s', 'UnknownMessage');
          this.channelWrapper.ack(msg);
          this.logger.info(' [Processed] %s', 'UnknownMessage');
          break;
      }
    } catch (error) {
      this.logger.error({ JobError: error });
      this.logger.error(error);

      channel.reject(msg, false);

      await this.retryMessage(channel, msg, message);
    }
  }

  private async retryMessage(
    channel: ConfirmChannel,
    msg: ConsumeMessage,
    message: INotificationMessage,
  ) {
    await channel.assertExchange(this.RETRY_EXCHANGE_NAME, 'direct', {
      durable: true,
    });

    const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;

    if (retryCount > this.MAX_JOB_RETRIES) {
      this.logger.info({ message: msg.content });
      this.logger.info(`Exhausted max retries for ${message.type}`);
      channel.publish(this.EXCHANGE_NAME, this.ROUTING_KEY, msg.content, {
        deliveryMode: 2,
        mandatory: true,
      });
    } else {
      this.logger.info(`Setting retry count ${message.type} to ${retryCount}`);
      const { retryQueueName, delay, retryRoutingKey } =
        this.getRetryQueue(retryCount);
      const retryQueue = await channel.assertQueue(retryQueueName, {
        durable: true,
        messageTtl: delay,
        deadLetterExchange: this.EXCHANGE_NAME,
        deadLetterRoutingKey: this.ROUTING_KEY,
      });

      await channel.bindQueue(
        retryQueue.queue,
        this.RETRY_EXCHANGE_NAME,
        retryRoutingKey,
      );

      const messageOptions = {
        headers: {
          'x-retry-count': retryCount,
        },
      };

      channel.publish(this.RETRY_EXCHANGE_NAME, retryRoutingKey, msg.content, {
        ...messageOptions,
        deliveryMode: 2,
        mandatory: true,
      });
    }
  }

  private getRetryQueue(count: number) {
    if (count === 1) {
      return this.RETRY_QUEUES.THIRTY_SECONDS;
    }
    if (count === 2) {
      return this.RETRY_QUEUES.FIVE_MINUTES;
    }
    return this.RETRY_QUEUES.THIRTY_MINUTES;
  }
}

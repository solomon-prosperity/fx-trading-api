import { Injectable, Inject } from '@nestjs/common';
import { MessagePublisherInterface } from './interfaces/rabbitmq.interface';
import { queueTopology } from '../common/utils/queue-topology';
import { ConfigService } from '@nestjs/config';
import { ChannelWrapper } from 'amqp-connection-manager';

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject('RABBITMQ_CHANNEL_WRAPPER')
    private readonly channelWrapper: ChannelWrapper,
    private readonly configService: ConfigService,
  ) {}

  async publishMessage(data: Array<MessagePublisherInterface>) {
    return new Promise(async (resolve, reject) => {
      try {
        const dataToPublish = data;
        if (dataToPublish.length > 0) {
          for (let i = 0; i < dataToPublish.length; i += 1) {
            const { message, worker } = dataToPublish[i];
            const { routing_key, exchange } = queueTopology(worker);
            await this.channelWrapper.publish(exchange, routing_key, message, {
              deliveryMode: 2,
              mandatory: true,
            });
          }
        } else {
          reject(
            new Error('Nothing to publish. Please provide job description'),
          );
        }
        console.log('published message(s) to rabbitmq');
        resolve({ done: true });
      } catch (error) {
        reject(error);
      }
    });
  }
}

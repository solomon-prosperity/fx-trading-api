import 'dotenv/config';
import { QueueTopologyInterface } from './interfaces';

export const queueTopology = (worker: string): QueueTopologyInterface => {
  const queue_prefix = process.env.RABBITMQ_QUEUE_PREFIX;
  const exchange = `${queue_prefix}.exchange`;
  let topology;
  switch (worker) {
    case 'test':
      topology = {
        queue: `${queue_prefix}.queue`,
        exchange,
        routing_key: `${queue_prefix}.route`,
      };
      break;
    case 'verification':
      topology = {
        queue: `${queue_prefix}.verification.queue`,
        exchange,
        routing_key: `${queue_prefix}.verification.route`,
      };
      break;
    case 'transaction':
      topology = {
        queue: `${queue_prefix}.transaction.queue`,
        exchange,
        routing_key: `${queue_prefix}.transaction.route`,
      };
      break;
    case 'notification':
      topology = {
        queue: `${queue_prefix}.notification.queue`,
        exchange,
        routing_key: `${queue_prefix}.notification.route`,
      };
      break;
    case 'activity':
      topology = {
        queue: `${queue_prefix}.activity.queue`,
        exchange,
        routing_key: `${queue_prefix}.activity.route`,
      };
      break;
    default:
      throw new Error('Invalid queue: Something bad happened!');
  }

  return topology;
};

export const RETRY_EXCHANGE_NAME = 'retry.exchange';

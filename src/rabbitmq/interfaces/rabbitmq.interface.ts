export interface ResponseMessageInterface {
  status_code: number;
  message: Array<string>;
  data: object;
}

export interface QueueTopologyInterface {
  queue: string;
  exchange: string;
  routing_key: string;
}

export interface MessageInterface {
  action: string;
  type: string;
  data: object;
}

export interface MessagePublisherInterface {
  worker: string;
  message: MessageInterface;
}

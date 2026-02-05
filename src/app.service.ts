import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      env: process.env.NODE_ENV,
      docs: '/api-docs',
    };
  }
}

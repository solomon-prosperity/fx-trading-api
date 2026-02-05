import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { formatErrorMessages } from '../helpers';
import { ErrorsInterface } from '../utils/interfaces';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const name =
      exception instanceof HttpException
        ? exception.name
        : 'InternalServerErrorException';
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errors =
      exception instanceof HttpException && name === 'BadRequestException'
        ? exception.getResponse()
        : [];
    console.log({ exception });
    response.status(status).json({
      status: 'failed',
      status_code: status,
      error_type: name,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errors: formatErrorMessages(errors as ErrorsInterface, message),
    });
  }
}

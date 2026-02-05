import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseInterface } from '../utils/interfaces';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseInterface> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        let doc = {};
        let metadata = {};
        if (data.response) {
          const { pagination } = data.response;
          doc = pagination ? data.response.docs : data.response;
          metadata = pagination ? pagination : {};
        }
        return {
          status: 'success',
          status_code: statusCode,
          message: data.message || '',
          timestamp: new Date().toISOString(),
          data: doc,
          metadata,
        };
      }),
    );
  }
}

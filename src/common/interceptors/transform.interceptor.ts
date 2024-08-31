import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    // console.log(response);
    // return next.handle().pipe(map((data) => ({ data })));
    return next.handle().pipe(
      map((data) => {
        return {
          code: response.statusCode || 200,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          data,
        };
      }),
    );
  }
}

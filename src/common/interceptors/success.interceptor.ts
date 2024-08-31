// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class SuccessInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     // const request = context.switchToHttp().getRequest();

//     return next.handle().pipe(
//       map((data) => {
//         return {
//           code: 200,
//           data,
//         };
//       }),
//     );
//   }
// }

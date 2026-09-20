import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, Injectable, Module } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';

import { DetranError } from '@detran/shared';

const body = (exception: DetranError) => ({
  code: exception.code,
  status: exception.status,
  message: exception.message,
  messageKey: exception.messageKey,
  ...(exception.requestId ? { requestId: exception.requestId } : {}),
  context: exception.context,
});

export const asDetranHttpException = (exception: DetranError): HttpException =>
  new HttpException(body(exception), exception.status);

@Catch(DetranError)
export class DetranErrorFilter implements ExceptionFilter<DetranError> {
  catch(exception: DetranError, host: ArgumentsHost): void {
    if (!(exception instanceof DetranError)) throw exception;
    const response = host.switchToHttp().getResponse<{
      status(code: number): { json(body: Record<string, unknown>): void };
    }>();
    response.status(exception.status).json(body(exception));
  }
}

@Injectable()
class DetranErrorFilterRegistrar {
  constructor(applicationConfig: ApplicationConfig, filter: DetranErrorFilter) {
    applicationConfig.addGlobalFilter(filter);
  }
}

@Module({
  providers: [DetranErrorFilter, DetranErrorFilterRegistrar],
})
export class DetranErrorFilterModule {}

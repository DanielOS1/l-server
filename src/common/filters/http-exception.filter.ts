import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorReponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapaterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapaterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Error interno del servidor';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };
        
        // Handle class-validator array of errors
        if (Array.isArray(responseObj.message)) {
          message = 'Error de validación';
          errors = responseObj.message;
        } else if (typeof responseObj.message === 'string') {
           message = responseObj.message;
        } else if (responseObj.error) {
           message = responseObj.error;
        }
      }
    } else {
       // Log non-HttpExceptions for debugging
       console.error('Unhandled Exception:', exception);
    }

    // Map common status codes to Spanish messages
    switch (httpStatus) {
      case HttpStatus.UNAUTHORIZED:
        if (message === 'Unauthorized' || message === 'Error interno del servidor') message = 'No autorizado';
        break;
      case HttpStatus.FORBIDDEN:
        if (message === 'Forbidden') message = 'Acceso denegado';
        break;
      case HttpStatus.NOT_FOUND:
        if (message === 'Not Found') message = 'Recurso no encontrado';
        break;
    }

    const errorResponse: ErrorReponse = {
      status: httpStatus >= 500 ? 'error' : 'fail',
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}


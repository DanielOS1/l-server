import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let data = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as any;
        // Prioritize 'message' from NestJS exceptions (often validation errors)
        if (body.message) {
          if (Array.isArray(body.message)) {
            message = 'Error de validación';
            data = body.message;
          } else {
            message = body.message;
          }
        }
      }
    } else if (exception instanceof Error) {
      // Fallback for non-HttpExceptions (e.g., standard JS errors)
      // In production, we might want to log this and not expose the stack/message details directly
      // But for development/this specific request, generic message is handled above.
      console.error('Unhandled Exception:', exception);
    }

    // Map common status codes to Spanish messages if the message is roughly the default
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        if (message === 'Unauthorized') message = 'No autorizado';
        break;
      case HttpStatus.FORBIDDEN:
        if (message === 'Forbidden') message = 'Acceso denegado';
        break;
      case HttpStatus.NOT_FOUND:
        if (message === 'Not Found') message = 'Recurso no encontrado';
        break;
    }

    const errorResponse: ApiResponse<any> = {
      status: 'error',
      message: message,
      data: data,
    };

    response.status(status).json(errorResponse);
  }
}

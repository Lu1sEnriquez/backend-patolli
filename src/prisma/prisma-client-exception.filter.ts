import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { errorMappings } from './prisma-erorrs-mappings';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientUnknownRequestError,
    host: ArgumentsHost,
  ) {
    console.error(exception.message);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof PrismaClientKnownRequestError) {
      const errorCode = exception.code; // Obtiene el código de error para errores conocidos
      const errorMapping = errorMappings[errorCode];

      if (errorMapping) {
        const { status, message } = errorMapping;
        response.status(status).json({
          message: `${message} at path: ${
            request.url.split('/')[request.url.split('/').length - 1]
          }, Error Code: ${errorCode}`,
          statusCode: status,
        });
      } else {
        console.log('No Entro', errorCode);
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
        super.catch(exception, host); // Handle unknown error codes
      }
    }

    if (exception instanceof PrismaClientValidationError) {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      const messageDetails = `at path: ${request.url.split('/')[request.url.split('/').length - 2]} :: ${exception.message.split('Argument')[1]}`;

      response.status(status).json({
        message: `Prisma Validation error ${messageDetails}`,
        statusCode: status,
      });
    }

    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage = exception.message;

      const errorMessageParts = errorMessage.split('"');
      const relevantErrorMessage = errorMessageParts[1] || errorMessageParts[0];

      response.status(status).json({
        message: `Unknown Prisma error at path: ${request.url.split('/')[request.url.split('/').length - 1]} :: ${relevantErrorMessage}`,
        statusCode: status,
      });
    }
  }
}

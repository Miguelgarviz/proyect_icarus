import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // PrismaClientValidationError no tiene código — lo identificamos por el tipo
    if (exception instanceof Prisma.PrismaClientValidationError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Datos de entrada inválidos',
      });
      return;
    }

    // PrismaClientKnownRequestError — tiene código P2025, P2002, etc.
    switch (exception.code) {
      case 'P2025':
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: 404,
          message: 'Registro no encontrado',
        });
        break;
      case 'P2002':
        response.status(HttpStatus.CONFLICT).json({
          statusCode: 409,
          message: 'Ya existe un registro con esos datos',
        });
        break;
      case 'P2003':
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: 400,
          message: 'Referencia a un registro que no existe',
        });
        break;
      default:
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: 500,
          message: 'Error interno del servidor',
        });
    }
  }
}

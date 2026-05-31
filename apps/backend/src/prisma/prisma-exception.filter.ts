// prisma-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 🔍 P2025 es el código interno de Prisma para "Registro no encontrado en un OrThrow"
    if (exception.code === 'P2025') {
      const status = HttpStatus.NOT_FOUND;
      
      return response.status(status).json({
        statusCode: status,
        error: 'NOT_FOUND',
        // 🚀 Extraemos el mensaje detallado de Prisma (que incluye el modelo afectado)
        message: `Error de persistencia: ${exception.meta?.cause || 'El registro solicitado no existe.'}`,
        prismaErrorCode: exception.code,
        timestamp: new Date().toISOString(),
      });
    }

    // Control de otros errores de Prisma (opcional)
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno en la base de datos.',
    });
  }
}
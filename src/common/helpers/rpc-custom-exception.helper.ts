import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export class RpcExceptionHelper {
  static notFound(resource: string, id?: string) {
    throw new RpcException({
      statusCode: HttpStatus.NOT_FOUND,
      message: id ? `${resource} with id ${id} not found` : `${resource} not found`,
    });
  }

  static conflict(message: string) {
    throw new RpcException({
      statusCode: HttpStatus.CONFLICT,
      message,
    });
  }

  static badRequest(message: string) {
    throw new RpcException({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
    });
  }

  static unauthorized(message: string = 'Unauthorized') {
    throw new RpcException({
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
    });
  }

  static internal(message: string = 'Internal server error') {
    throw new RpcException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
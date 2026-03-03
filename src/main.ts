import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Users-MS');

  const app = await NestFactory.create(AppModule);

  // Conectar TCP para comunicación con el Gateway
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: envs.host,
      port: envs.port,
    },
  });

  // Conectar RabbitMQ como microservicio
  // Consumir de users_queue que está bindeada al exchange riff_events
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbit_url],
      queue: 'users_queue',
      queueOptions: {
        durable: true,
      },
      // No necesitamos especificar noAck: false es el default
      // Los mensajes se confirmarán automáticamente después del handler
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.startAllMicroservices();

  logger.log(`TCP microservice listening on ${envs.host}:${envs.port}`);
  logger.log(`RabbitMQ connected`);
}

void bootstrap();

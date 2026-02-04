import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger('Auth-MS')

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options:{
        port: 3001
      }
    }
  );
  await app.listen();
  logger.log('Microservice is listening on port 3001');
}
bootstrap();

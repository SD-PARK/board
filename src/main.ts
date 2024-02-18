import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validationPipeConfig } from './config/validation-pipe.config';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './config/swagger.seup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
  app.use(cookieParser());
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();

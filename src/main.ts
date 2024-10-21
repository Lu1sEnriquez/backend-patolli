import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Permite solo este origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permitir credenciales (cookies, autenticación HTTP)
    allowedHeaders: 'Content-Type, Authorization', // Encabezados permitidos
  });

  await app.listen(3001);
}

bootstrap();

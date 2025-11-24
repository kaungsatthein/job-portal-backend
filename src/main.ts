import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';

import { HttpExceptionFilter } from './common/exceptions/http-exception';

import { writeFileSync } from 'fs';
import { PrismaExceptionFilter } from 'prisma/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const jwtTokenName = 'jwt';

const configureCors = (app: INestApplication<any>) => {
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.DEVELOPMENT_URL,
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
};

const configureGlobalSettings = (app: INestApplication<any>) => {
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useLogger(new Logger());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

const configureSwagger = (app: INestApplication<any>) => {
  const config = new DocumentBuilder()
    .setTitle('Job Portal API Documentation')
    .setDescription('API documentation for Job Portal')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      jwtTokenName,
    )
    .addSecurityRequirements(jwtTokenName)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  SwaggerModule.setup('swagger', app, document);

  console.log('Swagger UI enabled at /swagger');
};

const startApplication = async (app: INestApplication<any>) => {
  const PORT = process.env.PORT || 3002;
  try {
    await app.listen(PORT);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.log('Connection failed', error);
  }
};

export const configureStaticAssets = (app: NestExpressApplication) => {
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureCors(app);
  configureGlobalSettings(app);
  configureSwagger(app);
  configureStaticAssets(app);
  await startApplication(app);
}
bootstrap();

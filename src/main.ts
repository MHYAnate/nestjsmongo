import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Export for Vercel serverless function
let cachedServer: any;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });
  const configService = app.get(ConfigService);
  
  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  
  // CORS

  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());
  
  await app.init();
  return app;
}

// Vercel serverless handler
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  
  const app = cachedServer.getHttpAdapter().getInstance();
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrapServer().then(async (app) => {
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  });
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let cachedApp: any;

async function createApp() {
  const app = await NestFactory.create(AppModule);
  
  // CORS - Allow all origins for now
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  
  // Global prefix - matches frontend calls to /api/*
  app.setGlobalPrefix('api/v1');
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  await app.init();
  return app;
}

// Vercel Serverless Handler
export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  
  const instance = cachedApp.getHttpAdapter().getInstance();
  return instance(req, res);
}

// Local Development
if (process.env.NODE_ENV !== 'production') {
  createApp().then(async (app) => {
    await app.listen(4000);
    console.log('🚀 Server running on http://localhost:4000/api/v1');
  });
}
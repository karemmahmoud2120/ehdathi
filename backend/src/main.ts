import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // السماح بالاتصال من أي مكان (CORS)
  app.enableCors({ origin: true });
  
  // التحقق من صحة البيانات
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // ⚠️ مهم جداً لـ Fly.io: قراءة البورت من متغير البيئة
  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();
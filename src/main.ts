import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  console.log('🔍 FULL RAW ENV KEYS:', Object.keys(process.env).sort());

  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Restrict this in production!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Performance
  // app.use(compression());

  // Global Pipe & Interceptor
  // app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapterHost));
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

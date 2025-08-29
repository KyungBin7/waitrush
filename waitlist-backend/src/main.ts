import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // Get configuration service
    const configService = app.get(ConfigService);

    // Configure compression middleware
    app.use(
      compression({
        threshold: 1024, // Only compress responses > 1KB
        level: 6, // Compression level (0-9, default is 6)
        filter: (req: any, res: any) => {
          // Skip compression for server-sent events or streaming
          if (res.getHeader('content-type')?.includes('text/event-stream')) {
            return false;
          }
          return compression.filter(req, res);
        },
      }),
    );

    // Configure security headers with Helmet
    app.use(helmet());

    // Configure CORS
    app.enableCors({
      origin: configService.get<string>('cors.origin'),
      credentials: configService.get<boolean>('cors.credentials'),
      methods: configService.get<string[]>('cors.methods'),
      allowedHeaders: configService.get<string[]>('cors.allowedHeaders'),
    });

    // Configure global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Configure global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Enable shutdown hooks for graceful shutdown
    app.enableShutdownHooks();

    const port = configService.get<number>('app.port') ?? 3000;
    await app.listen(port);

    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Health check available at: http://localhost:${port}/health`);
    logger.log(`Environment: ${configService.get<string>('app.nodeEnv')}`);
  } catch (error) {
    logger.error('Error starting application', error);
    process.exit(1);
  }
}

void bootstrap();

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthModule } from './modules/health';
import { DatabaseModule } from './modules/database';
import { AuthModule } from './modules/auth/auth.module';
import { ServicesModule } from './modules/services/services.module';
import {
  Service,
  ServiceSchema,
} from './modules/services/schemas/service.schema';
import { ParticipantsModule } from './modules/participants/participants.module';
import { UploadModule } from './modules/upload/upload.module';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import corsConfig from './config/cors.config';
import throttleConfig from './config/throttle.config';
import appConfig from './config/app.config';
import minioConfig from './config/minio.config';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, corsConfig, throttleConfig, appConfig, minioConfig],
      validate,
      cache: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('throttle.ttl') ?? 60,
            limit: configService.get<number>('throttle.limit') ?? 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    HealthModule,
    AuthModule,
    ServicesModule,
    ParticipantsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

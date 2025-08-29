import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');

        const uri = configService.get<string>('database.uri');
        const dbName = configService.get<string>('database.name');
        const connectionTimeout = configService.get<number>(
          'database.connectionTimeout',
        );
        const socketTimeout = configService.get<number>(
          'database.socketTimeout',
        );
        const maxPoolSize = configService.get<number>('database.maxPoolSize');
        const minPoolSize = configService.get<number>('database.minPoolSize');
        const retryAttempts = configService.get<number>(
          'database.retryAttempts',
        );
        const retryDelay = configService.get<number>('database.retryDelay');

        return {
          uri,
          dbName,
          connectTimeoutMS: connectionTimeout,
          socketTimeoutMS: socketTimeout,
          maxPoolSize,
          minPoolSize,
          retryAttempts,
          retryDelay,
          connectionFactory: (connection: Connection) => {
            // Connection event handlers
            connection.on('connected', () => {
              logger.log('MongoDB connected successfully');
            });

            connection.on('error', (error: Error) => {
              logger.error('MongoDB connection error:', error);
            });

            connection.on('disconnected', () => {
              logger.warn('MongoDB disconnected');
            });

            connection.on('reconnected', () => {
              logger.log('MongoDB reconnected');
            });

            connection.on('reconnectFailed', () => {
              logger.error('MongoDB reconnection failed');
            });

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

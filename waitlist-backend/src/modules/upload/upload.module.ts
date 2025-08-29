import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { MinioService } from '../../shared/services/minio.service';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [ConfigModule, ServicesModule],
  controllers: [UploadController],
  providers: [MinioService],
  exports: [MinioService],
})
export class UploadModule {}
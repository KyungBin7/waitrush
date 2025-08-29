import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const minioConfig = this.configService.get('minio');
    
    this.minioClient = new Minio.Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });
    
    this.bucketName = minioConfig.bucketName;
  }

  async onModuleInit() {
    try {
      // 버킷이 존재하는지 확인하고 없으면 생성
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Created bucket: ${this.bucketName}`);
        
        // 공개 읽기 정책 설정
        await this.setBucketPolicy();
      }
      
      this.logger.log('MinIO service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MinIO service', error);
      throw error;
    }
  }

  private async setBucketPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    try {
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.log('Bucket policy set for public read access');
    } catch (error) {
      this.logger.error('Failed to set bucket policy', error);
      throw error;
    }
  }

  /**
   * 서비스별 폴더 구조로 아이콘 이미지 업로드
   * 폴더 구조: services/{serviceSlug}/icon/{fileName}
   */
  async uploadIconImage(
    serviceSlug: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `icon-${uuidv4()}${fileExtension}`;
    const objectName = `services/${serviceSlug}/icon/${fileName}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'Cache-Control': 'max-age=31536000', // 1년 캐시
        },
      );

      const imageUrl = await this.getPublicUrl(objectName);
      this.logger.log(`Uploaded icon image: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error(`Failed to upload icon image for service ${serviceSlug}`, error);
      throw error;
    }
  }

  /**
   * 서비스별 폴더 구조로 상세 이미지 업로드
   * 폴더 구조: services/{serviceSlug}/details/{fileName}
   */
  async uploadDetailImage(
    serviceSlug: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `detail-${uuidv4()}${fileExtension}`;
    const objectName = `services/${serviceSlug}/details/${fileName}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'Cache-Control': 'max-age=31536000', // 1년 캐시
        },
      );

      const imageUrl = await this.getPublicUrl(objectName);
      this.logger.log(`Uploaded detail image: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error(`Failed to upload detail image for service ${serviceSlug}`, error);
      throw error;
    }
  }

  /**
   * 여러 상세 이미지 업로드
   */
  async uploadMultipleDetailImages(
    serviceSlug: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const uploadPromises = files.map(file => 
      this.uploadDetailImage(serviceSlug, file)
    );

    try {
      const imageUrls = await Promise.all(uploadPromises);
      this.logger.log(`Uploaded ${imageUrls.length} detail images for service ${serviceSlug}`);
      return imageUrls;
    } catch (error) {
      this.logger.error(`Failed to upload multiple detail images for service ${serviceSlug}`, error);
      throw error;
    }
  }

  /**
   * 이미지 삭제
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const objectName = this.extractObjectNameFromUrl(imageUrl);
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`Deleted image: ${imageUrl}`);
    } catch (error) {
      this.logger.error(`Failed to delete image: ${imageUrl}`, error);
      throw error;
    }
  }

  /**
   * 서비스의 모든 이미지 삭제
   */
  async deleteServiceImages(serviceSlug: string): Promise<void> {
    try {
      const objectsStream = this.minioClient.listObjects(
        this.bucketName,
        `services/${serviceSlug}/`,
        true
      );

      const objectsToDelete: string[] = [];
      
      for await (const obj of objectsStream) {
        objectsToDelete.push(obj.name);
      }

      if (objectsToDelete.length > 0) {
        await this.minioClient.removeObjects(this.bucketName, objectsToDelete);
        this.logger.log(`Deleted ${objectsToDelete.length} images for service ${serviceSlug}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete images for service ${serviceSlug}`, error);
      throw error;
    }
  }

  /**
   * 공개 URL 생성
   */
  private async getPublicUrl(objectName: string): Promise<string> {
    const minioConfig = this.configService.get('minio');
    const protocol = minioConfig.useSSL ? 'https' : 'http';
    const port = minioConfig.port === 80 || minioConfig.port === 443 ? '' : `:${minioConfig.port}`;
    
    return `${protocol}://${minioConfig.endPoint}${port}/${this.bucketName}/${objectName}`;
  }

  /**
   * URL에서 객체명 추출
   */
  private extractObjectNameFromUrl(imageUrl: string): string {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    // Remove empty string and bucket name
    pathParts.shift(); // Remove empty string from leading '/'
    pathParts.shift(); // Remove bucket name
    return pathParts.join('/');
  }

  /**
   * 파일 확장자 추출
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot);
  }

  /**
   * 이미지 파일 검증
   */
  validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: 10MB`);
    }

    return true;
  }
}
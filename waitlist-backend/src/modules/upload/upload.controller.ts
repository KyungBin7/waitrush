import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MinioService } from '../../shared/services/minio.service';
import { ServicesService } from '../services/services.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly minioService: MinioService,
    private readonly servicesService: ServicesService,
  ) {}

  /**
   * 서비스 아이콘 이미지 업로드
   * POST /upload/services/:serviceId/icon
   */
  @Post('services/:serviceId/icon')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Only image files are allowed.'), false);
        }
      },
    }),
  )
  async uploadIcon(
    @Param('serviceId') serviceId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // 서비스 존재 및 소유권 확인
      const service = await this.servicesService.findOne(serviceId, req.user.id);
      
      // 파일 검증
      this.minioService.validateImageFile(file);

      // 이전 아이콘 이미지가 있다면 삭제
      if (service.iconImage) {
        try {
          await this.minioService.deleteImage(service.iconImage);
        } catch (error) {
          console.warn('Failed to delete previous icon image:', error);
        }
      }

      // 새 이미지 업로드
      const imageUrl = await this.minioService.uploadIconImage(service.slug, file);

      // 서비스 업데이트
      await this.servicesService.update(serviceId, { iconImage: imageUrl }, req.user.id);

      return {
        success: true,
        message: 'Icon image uploaded successfully',
        imageUrl,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Failed to upload icon image');
    }
  }

  /**
   * 서비스 상세 이미지 업로드 (단일)
   * POST /upload/services/:serviceId/detail
   */
  @Post('services/:serviceId/detail')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Only image files are allowed.'), false);
        }
      },
    }),
  )
  async uploadDetailImage(
    @Param('serviceId') serviceId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // 서비스 존재 및 소유권 확인
      const service = await this.servicesService.findOne(serviceId, req.user.id);
      
      // 파일 검증
      this.minioService.validateImageFile(file);

      // 이미지 업로드
      const imageUrl = await this.minioService.uploadDetailImage(service.slug, file);

      // 서비스의 상세 이미지 배열에 추가
      const updatedDetailImages = [...(service.detailImages || []), imageUrl];
      await this.servicesService.update(
        serviceId,
        { detailImages: updatedDetailImages },
        req.user.id,
      );

      return {
        success: true,
        message: 'Detail image uploaded successfully',
        imageUrl,
        totalImages: updatedDetailImages.length,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Failed to upload detail image');
    }
  }

  /**
   * 서비스 상세 이미지 업로드 (다중)
   * POST /upload/services/:serviceId/details
   */
  @Post('services/:serviceId/details')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('files', 5, { // 최대 5개 파일
      limits: {
        fileSize: 10 * 1024 * 1024, // 각 파일 10MB
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Only image files are allowed.'), false);
        }
      },
    }),
  )
  async uploadDetailImages(
    @Param('serviceId') serviceId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: AuthenticatedRequest,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    try {
      // 서비스 존재 및 소유권 확인
      const service = await this.servicesService.findOne(serviceId, req.user.id);
      
      // 파일들 검증
      files.forEach(file => this.minioService.validateImageFile(file));

      // 현재 상세 이미지 개수 확인 (최대 5개 제한)
      const currentImageCount = (service.detailImages || []).length;
      const newImageCount = files.length;
      
      if (currentImageCount + newImageCount > 5) {
        throw new BadRequestException(
          `Cannot upload ${newImageCount} images. Maximum 5 images allowed. Current: ${currentImageCount}`
        );
      }

      // 이미지들 업로드
      const imageUrls = await this.minioService.uploadMultipleDetailImages(
        service.slug,
        files,
      );

      // 서비스의 상세 이미지 배열에 추가
      const updatedDetailImages = [...(service.detailImages || []), ...imageUrls];
      await this.servicesService.update(
        serviceId,
        { detailImages: updatedDetailImages },
        req.user.id,
      );

      return {
        success: true,
        message: `${imageUrls.length} detail images uploaded successfully`,
        imageUrls,
        totalImages: updatedDetailImages.length,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Failed to upload detail images');
    }
  }

  /**
   * 상세 이미지 대체 (기존 이미지들을 모두 삭제하고 새로 업로드)
   * POST /upload/services/:serviceId/details/replace
   */
  @Post('services/:serviceId/details/replace')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Only image files are allowed.'), false);
        }
      },
    }),
  )
  async replaceDetailImages(
    @Param('serviceId') serviceId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: AuthenticatedRequest,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    try {
      // 서비스 존재 및 소유권 확인
      const service = await this.servicesService.findOne(serviceId, req.user.id);
      
      // 파일들 검증
      files.forEach(file => this.minioService.validateImageFile(file));

      // 기존 상세 이미지들 삭제
      if (service.detailImages && service.detailImages.length > 0) {
        try {
          for (const imageUrl of service.detailImages) {
            await this.minioService.deleteImage(imageUrl);
          }
        } catch (error) {
          console.warn('Failed to delete some previous detail images:', error);
        }
      }

      // 새 이미지들 업로드
      const imageUrls = await this.minioService.uploadMultipleDetailImages(
        service.slug,
        files,
      );

      // 서비스 업데이트
      await this.servicesService.update(
        serviceId,
        { detailImages: imageUrls },
        req.user.id,
      );

      return {
        success: true,
        message: `${imageUrls.length} detail images uploaded successfully (replaced previous images)`,
        imageUrls,
        totalImages: imageUrls.length,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Failed to replace detail images');
    }
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log('Received create service data:', createServiceDto);
    const service = await this.servicesService.create(
      createServiceDto,
      req.user.id,
    );

    const participantCount = await this.servicesService.getParticipantCount(
      service._id as any,
    );

    return {
      id: (service._id as any).toString(),
      organizerId: service.organizerId.toString(),
      name: service.name,
      description: service.description,
      slug: service.slug,
      waitlistTitle: service.waitlistTitle,
      waitlistDescription: service.waitlistDescription,
      waitlistBackground: service.waitlistBackground,
      iconImage: service.iconImage,
      category: service.category,
      categories: service.categories,
      tagline: service.tagline,
      fullDescription: service.fullDescription,
      developer: service.developer,
      language: service.language,
      languages: service.languages,
      platform: service.platform,
      platforms: service.platforms,
      launchDate: service.launchDate,
      detailImages: service.detailImages,

      waitlistUrl: `/waitlist/${service.slug}`,
      participantCount,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const services = await this.servicesService.findAll(req.user.id);

    return services.map((service) => ({
      id: (service._id as any).toString(),
      organizerId: service.organizerId.toString(),
      name: service.name,
      description: service.description,
      slug: service.slug,
      waitlistTitle: service.waitlistTitle,
      waitlistDescription: service.waitlistDescription,
      waitlistBackground: service.waitlistBackground,
      iconImage: service.iconImage,
      category: service.category,
      categories: service.categories,
      tagline: service.tagline,
      fullDescription: service.fullDescription,
      developer: service.developer,
      language: service.language,
      languages: service.languages,
      platform: service.platform,
      platforms: service.platforms,
      launchDate: service.launchDate,
      detailImages: service.detailImages,

      waitlistUrl: `/waitlist/${service.slug}`,
      participantCount: (service as any).participantCount || 0,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const service = await this.servicesService.findOne(id, req.user.id);

    return {
      id: (service._id as any).toString(),
      organizerId: service.organizerId.toString(),
      name: service.name,
      description: service.description,
      slug: service.slug,
      waitlistTitle: service.waitlistTitle,
      waitlistDescription: service.waitlistDescription,
      waitlistBackground: service.waitlistBackground,
      iconImage: service.iconImage,
      category: service.category,
      categories: service.categories,
      tagline: service.tagline,
      fullDescription: service.fullDescription,
      developer: service.developer,
      language: service.language,
      languages: service.languages,
      platform: service.platform,
      platforms: service.platforms,
      launchDate: service.launchDate,
      detailImages: service.detailImages,

      waitlistUrl: `/waitlist/${service.slug}`,
      participantCount: (service as any).participantCount || 0,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const service = await this.servicesService.update(
      id,
      updateServiceDto,
      req.user.id,
    );

    const participantCount = await this.servicesService.getParticipantCount(
      service._id as any,
    );

    return {
      id: (service._id as any).toString(),
      organizerId: service.organizerId.toString(),
      name: service.name,
      description: service.description,
      slug: service.slug,
      waitlistTitle: service.waitlistTitle,
      waitlistDescription: service.waitlistDescription,
      waitlistBackground: service.waitlistBackground,
      iconImage: service.iconImage,
      category: service.category,
      categories: service.categories,
      tagline: service.tagline,
      fullDescription: service.fullDescription,
      developer: service.developer,
      language: service.language,
      languages: service.languages,
      platform: service.platform,
      platforms: service.platforms,
      launchDate: service.launchDate,
      detailImages: service.detailImages,

      waitlistUrl: `/waitlist/${service.slug}`,
      participantCount,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.servicesService.remove(id, req.user.id);
    return { message: 'Service deleted successfully' };
  }

  @Get(':id/participants')
  async exportParticipants(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const participants = await this.servicesService.getServiceParticipants(
      id,
      req.user.id,
    );

    // Generate CSV content
    const csvHeader = 'Email,Join Date\n';
    const csvRows = participants
      .map(
        (participant) =>
          `${participant.email},${participant.joinDate.toISOString()}`,
      )
      .join('\n');

    const csvContent = csvHeader + csvRows;

    // Set appropriate headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="participants-${id}.csv"`,
    );
    res.status(HttpStatus.OK).send(csvContent);
  }
}

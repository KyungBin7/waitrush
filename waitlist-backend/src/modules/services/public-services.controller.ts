import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('public/services')
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAllPublic() {
    const services = await this.servicesService.findAllPublic();

    return services.map((service) => ({
      id: (service._id as any).toString(),
      name: service.name,
      description: service.description,
      slug: service.slug,
      iconImage: service.iconImage,
      category: service.category,
      categories: service.categories,
      participantCount: (service as any).participantCount || 0,
    }));
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const service = await this.servicesService.findBySlug(slug);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Get actual participant count from database
    const participantCount = await this.servicesService.getParticipantCount(
      service._id as any,
    );

    return {
      id: (service._id as any).toString(),
      name: service.name,
      title: service.name,
      description: service.description,
      slug: service.slug,
      iconImage: service.iconImage,
      category: service.category,
      categories: service.categories,
      tagline: service.tagline,
      fullDescription: service.fullDescription,
      participantCount: participantCount,
      developer: service.developer,
      language: service.language,
      languages: service.languages,
      platform: service.platform,
      platforms: service.platforms,
      launchDate: service.launchDate,
      detailImages: service.detailImages || [],

      waitlistTitle: service.waitlistTitle,
      waitlistDescription: service.waitlistDescription,
    };
  }
}
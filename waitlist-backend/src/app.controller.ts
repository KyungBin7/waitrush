import { Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel('Service') private serviceModel: Model<any>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed-dev-data')
  async seedDevData() {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Seed endpoint only available in development',
      );
    }

    // Clear existing services first
    await this.serviceModel.deleteMany({}).exec();

    // Create mock organizer ID (in real app this would be actual user ID)
    const mockOrganizerId = new Types.ObjectId();

    // Create the three services that match ServiceDetailPage mock data
    const services = [
      {
        name: 'Premium App Launch',
        description: 'Revolutionize your productivity workflow',
        slug: 'premium-app-launch',
        waitlistTitle: 'Premium App Launch',
        waitlistDescription:
          'Join thousands waiting for our revolutionary productivity app. Be among the first to experience the future of task management with AI-powered insights, seamless collaboration, and intuitive design.',
        waitlistBackground: '#1a1a1a',
        organizerId: mockOrganizerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Beta Testing Program',
        description: 'Shape the future of our platform',
        slug: 'beta-testing',
        waitlistTitle: 'Beta Testing Program',
        waitlistDescription:
          "Get exclusive early access to test new features before they're released. Help shape the future of our platform.",
        waitlistBackground: '#2563eb',
        organizerId: mockOrganizerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Early Access Course',
        description: 'Master advanced techniques',
        slug: 'early-access-course',
        waitlistTitle: 'Early Access Course',
        waitlistDescription:
          'Master advanced techniques with our comprehensive online course. Limited spots available for the first cohort.',
        waitlistBackground: '#059669',
        organizerId: mockOrganizerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const createdServices = await this.serviceModel.insertMany(services);

    return {
      message: 'Development seed data created successfully',
      services: createdServices.map((service) => ({
        id: service._id.toString(),
        name: service.name,
        slug: service.slug,
      })),
    };
  }
}

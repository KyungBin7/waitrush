import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import {
  WaitlistParticipant,
  WaitlistParticipantDocument,
} from '../participants/schemas/participant.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(WaitlistParticipant.name)
    private participantModel: Model<WaitlistParticipantDocument>,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
    organizerId: string,
  ): Promise<ServiceDocument> {
    try {
      // Handle backward compatibility: if category is provided but categories is not
      const serviceData = {
        ...createServiceDto,
        organizerId: new Types.ObjectId(organizerId),
      };
      
      // If only legacy category field is provided, also set it in categories array
      if (createServiceDto.category && !createServiceDto.categories?.length) {
        serviceData.categories = [createServiceDto.category];
      }

      // Handle backward compatibility for languages
      if (createServiceDto.language && !createServiceDto.languages?.length) {
        serviceData.languages = [createServiceDto.language];
      }

      // Handle backward compatibility for platforms
      if (createServiceDto.platform && !createServiceDto.platforms?.length) {
        serviceData.platforms = [createServiceDto.platform];
      }

      const service = new this.serviceModel(serviceData);

      return await service.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('A service with this name already exists');
      }
      throw error;
    }
  }

  async findAll(organizerId: string): Promise<ServiceDocument[]> {
    const services = await this.serviceModel
      .find({ organizerId: new Types.ObjectId(organizerId) })
      .sort({ createdAt: -1 })
      .exec();

    // Add participant count to each service
    const servicesWithCounts = await Promise.all(
      services.map(async (service) => {
        const participantCount = await this.getParticipantCount(
          service._id as Types.ObjectId,
        );
        return {
          ...service.toObject(),
          participantCount,
        };
      }),
    );

    return servicesWithCounts as any;
  }

  async findOne(id: string, organizerId: string): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findOne({
        _id: new Types.ObjectId(id),
        organizerId: new Types.ObjectId(organizerId),
      })
      .exec();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const participantCount = await this.getParticipantCount(
      service._id as Types.ObjectId,
    );

    return {
      ...service.toObject(),
      participantCount,
    } as any;
  }

  async findBySlug(slug: string): Promise<ServiceDocument | null> {
    return await this.serviceModel.findOne({ slug }).exec();
  }

  async findAllPublic(): Promise<ServiceDocument[]> {
    const services = await this.serviceModel
      .find({})
      .sort({ createdAt: -1 })
      .exec();

    // Add participant count to each service
    const servicesWithCounts = await Promise.all(
      services.map(async (service) => {
        const participantCount = await this.getParticipantCount(
          service._id as Types.ObjectId,
        );
        return {
          ...service.toObject(),
          participantCount,
        };
      }),
    );

    return servicesWithCounts as any;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    organizerId: string,
  ): Promise<ServiceDocument> {
    try {
      console.log('Update service - ID:', id);
      console.log('Update service - DTO:', updateServiceDto);
      console.log('Update service - Organizer ID:', organizerId);
      
      // First find the existing service to ensure it exists
      const existingService = await this.serviceModel
        .findOne({
          _id: new Types.ObjectId(id),
          organizerId: new Types.ObjectId(organizerId),
        })
        .exec();

      if (!existingService) {
        throw new NotFoundException('Service not found');
      }

      console.log('Existing service before update:', existingService.toObject());

      // Perform the update with explicit field setting
      const updateData = {
        ...updateServiceDto,
        updatedAt: new Date(),
      };
      
      // Handle backward compatibility: if category is provided but categories is not
      if (updateServiceDto.category && !updateServiceDto.categories?.length) {
        updateData.categories = [updateServiceDto.category];
      }

      // Handle backward compatibility for languages
      if (updateServiceDto.language && !updateServiceDto.languages?.length) {
        updateData.languages = [updateServiceDto.language];
      }

      // Handle backward compatibility for platforms
      if (updateServiceDto.platform && !updateServiceDto.platforms?.length) {
        updateData.platforms = [updateServiceDto.platform];
      }

      console.log('Update data being applied:', updateData);

      const service = await this.serviceModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(id),
            organizerId: new Types.ObjectId(organizerId),
          },
          { $set: updateData },
          { 
            new: true,
            runValidators: true,
            upsert: false
          },
        )
        .exec();

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      console.log('Updated service in DB:', service.toObject());

      // Add participant count to the updated service
      const participantCount = await this.getParticipantCount(
        service._id as Types.ObjectId,
      );

      const result = {
        ...service.toObject(),
        participantCount,
      } as any;

      console.log('Final update result:', result);

      return result;
    } catch (error: any) {
      console.error('Update service error:', error);
      if (error.code === 11000) {
        throw new ConflictException('A service with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string, organizerId: string): Promise<void> {
    const result = await this.serviceModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        organizerId: new Types.ObjectId(organizerId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Service not found');
    }

    // Also remove all participants for this service
    await this.participantModel
      .deleteMany({ serviceId: new Types.ObjectId(id) })
      .exec();
  }

  async getParticipantCount(serviceId: Types.ObjectId): Promise<number> {
    return await this.participantModel.countDocuments({ serviceId }).exec();
  }

  async getServiceParticipants(
    serviceId: string,
    organizerId: string,
  ): Promise<WaitlistParticipantDocument[]> {
    // First verify the service belongs to the organizer
    const service = await this.serviceModel
      .findOne({
        _id: new Types.ObjectId(serviceId),
        organizerId: new Types.ObjectId(organizerId),
      })
      .exec();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return await this.participantModel
      .find({ serviceId: new Types.ObjectId(serviceId) })
      .sort({ joinDate: 1 })
      .exec();
  }
}

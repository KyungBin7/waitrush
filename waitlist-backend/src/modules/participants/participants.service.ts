import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WaitlistParticipant,
  WaitlistParticipantDocument,
} from './schemas/participant.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectModel(WaitlistParticipant.name)
    private participantModel: Model<WaitlistParticipantDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async getWaitlistBySlug(slug: string): Promise<{
    title: string;
    description: string;
    background: string;
    currentParticipants: number;
  }> {
    const service = await this.serviceModel.findOne({ slug }).exec();

    if (!service) {
      throw new NotFoundException('Waitlist not found');
    }

    const participantCount = await this.participantModel
      .countDocuments({ serviceId: service._id })
      .exec();

    return {
      title: service.waitlistTitle || service.name,
      description: service.waitlistDescription || service.description || '',
      background: service.waitlistBackground || '#ffffff',
      currentParticipants: participantCount,
    };
  }

  async joinWaitlist(
    slug: string,
    joinWaitlistDto: JoinWaitlistDto,
  ): Promise<{
    message: string;
    waitlistEntryId: string;
  }> {
    const service = await this.serviceModel.findOne({ slug }).exec();

    if (!service) {
      throw new NotFoundException('Waitlist not found');
    }

    try {
      const participant = new this.participantModel({
        serviceId: service._id,
        email: joinWaitlistDto.email.toLowerCase().trim(),
        joinDate: new Date(),
      });

      const savedParticipant = await participant.save();

      // Update the participant count in the service
      await this.serviceModel.findByIdAndUpdate(
        service._id,
        { $inc: { participantCount: 1 } },
      );

      return {
        message: 'Successfully joined the waitlist!',
        waitlistEntryId: (savedParticipant._id as any).toString(),
      };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          'This email is already registered for this waitlist',
        );
      }
      throw error;
    }
  }

  async getParticipantCountBySlug(slug: string): Promise<number> {
    const service = await this.serviceModel.findOne({ slug }).exec();

    if (!service) {
      throw new NotFoundException('Waitlist not found');
    }

    return await this.participantModel
      .countDocuments({ serviceId: service._id })
      .exec();
  }

  async isEmailRegistered(slug: string, email: string): Promise<boolean> {
    const service = await this.serviceModel.findOne({ slug }).exec();

    if (!service) {
      return false;
    }

    const participant = await this.participantModel
      .findOne({
        serviceId: service._id,
        email: email.toLowerCase().trim(),
      })
      .exec();

    return !!participant;
  }
}

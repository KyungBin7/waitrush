import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import {
  WaitlistParticipant,
  WaitlistParticipantSchema,
} from './schemas/participant.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WaitlistParticipant.name, schema: WaitlistParticipantSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
  exports: [ParticipantsService],
})
export class ParticipantsModule {}

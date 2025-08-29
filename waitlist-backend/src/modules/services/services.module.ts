import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PublicServicesController } from './public-services.controller';
import { Service, ServiceSchema } from './schemas/service.schema';
import {
  WaitlistParticipant,
  WaitlistParticipantSchema,
} from '../participants/schemas/participant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: WaitlistParticipant.name, schema: WaitlistParticipantSchema },
    ]),
  ],
  controllers: [ServicesController, PublicServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}

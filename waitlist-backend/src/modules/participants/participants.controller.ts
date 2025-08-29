import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Controller('public/waitlists')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get(':slug')
  async getWaitlistDetails(@Param('slug') slug: string) {
    const waitlistDetails =
      await this.participantsService.getWaitlistBySlug(slug);

    return {
      title: waitlistDetails.title,
      description: waitlistDetails.description,
      background: waitlistDetails.background,
      currentParticipants: waitlistDetails.currentParticipants,
    };
  }

  @Post(':slug/join')
  @HttpCode(HttpStatus.CREATED)
  async joinWaitlist(
    @Param('slug') slug: string,
    @Body() joinWaitlistDto: JoinWaitlistDto,
  ) {
    const result = await this.participantsService.joinWaitlist(
      slug,
      joinWaitlistDto,
    );

    return {
      message: result.message,
      waitlistEntryId: result.waitlistEntryId,
    };
  }

  @Get(':slug/count')
  async getParticipantCount(@Param('slug') slug: string) {
    const count =
      await this.participantsService.getParticipantCountBySlug(slug);

    return {
      currentParticipants: count,
    };
  }
}

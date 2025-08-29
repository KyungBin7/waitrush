import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

describe('ParticipantsController', () => {
  let controller: ParticipantsController;

  const mockParticipantsService = {
    getWaitlistBySlug: jest.fn(),
    joinWaitlist: jest.fn(),
    getParticipantCountBySlug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantsController],
      providers: [
        {
          provide: ParticipantsService,
          useValue: mockParticipantsService,
        },
      ],
    }).compile();

    controller = module.get<ParticipantsController>(ParticipantsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWaitlistDetails', () => {
    it('should return waitlist details', async () => {
      const slug = 'test-waitlist';
      const mockWaitlistDetails = {
        title: 'Join our waitlist',
        description: 'Get early access',
        background: '#ff0000',
        currentParticipants: 42,
      };

      mockParticipantsService.getWaitlistBySlug.mockResolvedValue(
        mockWaitlistDetails,
      );

      const result = await controller.getWaitlistDetails(slug);

      expect(mockParticipantsService.getWaitlistBySlug).toHaveBeenCalledWith(
        slug,
      );
      expect(result).toEqual({
        title: 'Join our waitlist',
        description: 'Get early access',
        background: '#ff0000',
        currentParticipants: 42,
      });
    });
  });

  describe('joinWaitlist', () => {
    it('should successfully join a waitlist', async () => {
      const slug = 'test-waitlist';
      const joinWaitlistDto: JoinWaitlistDto = {
        email: 'test@example.com',
      };

      const mockResult = {
        message: 'Successfully joined the waitlist!',
        waitlistEntryId: new Types.ObjectId().toString(),
      };

      mockParticipantsService.joinWaitlist.mockResolvedValue(mockResult);

      const result = await controller.joinWaitlist(slug, joinWaitlistDto);

      expect(mockParticipantsService.joinWaitlist).toHaveBeenCalledWith(
        slug,
        joinWaitlistDto,
      );
      expect(result).toEqual({
        message: 'Successfully joined the waitlist!',
        waitlistEntryId: mockResult.waitlistEntryId,
      });
    });
  });

  describe('getParticipantCount', () => {
    it('should return participant count', async () => {
      const slug = 'test-waitlist';
      const mockCount = 25;

      mockParticipantsService.getParticipantCountBySlug.mockResolvedValue(
        mockCount,
      );

      const result = await controller.getParticipantCount(slug);

      expect(
        mockParticipantsService.getParticipantCountBySlug,
      ).toHaveBeenCalledWith(slug);
      expect(result).toEqual({
        currentParticipants: 25,
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParticipantsService } from './participants.service';
import { WaitlistParticipant } from './schemas/participant.schema';
import { Service } from '../services/schemas/service.schema';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

describe('ParticipantsService', () => {
  let service: ParticipantsService;

  const mockParticipantModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockServiceModel = {
    findOne: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantsService,
        {
          provide: getModelToken(WaitlistParticipant.name),
          useValue: mockParticipantModel,
        },
        {
          provide: getModelToken(Service.name),
          useValue: mockServiceModel,
        },
      ],
    }).compile();

    service = module.get<ParticipantsService>(ParticipantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWaitlistBySlug', () => {
    it('should return waitlist details by slug', async () => {
      const slug = 'test-waitlist';
      const mockService = {
        _id: new Types.ObjectId(),
        name: 'Test Service',
        waitlistTitle: 'Join our waitlist',
        waitlistDescription: 'Get early access',
        waitlistBackground: '#ff0000',
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      mockParticipantModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(42),
      });

      const result = await service.getWaitlistBySlug(slug);

      expect(mockServiceModel.findOne).toHaveBeenCalledWith({ slug });
      expect(mockParticipantModel.countDocuments).toHaveBeenCalledWith({
        serviceId: mockService._id,
      });
      expect(result).toEqual({
        title: 'Join our waitlist',
        description: 'Get early access',
        background: '#ff0000',
        currentParticipants: 42,
      });
    });

    it('should use service name as title if waitlistTitle is not set', async () => {
      const slug = 'test-waitlist';
      const mockService = {
        _id: new Types.ObjectId(),
        name: 'Test Service',
        description: 'Service description',
        waitlistBackground: '#ffffff',
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      mockParticipantModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.getWaitlistBySlug(slug);

      expect(result.title).toBe('Test Service');
      expect(result.description).toBe('Service description');
    });

    it('should throw NotFoundException when service not found', async () => {
      const slug = 'non-existent-slug';

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getWaitlistBySlug(slug)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('joinWaitlist', () => {
    it('should successfully join a waitlist', async () => {
      const slug = 'test-waitlist';
      const joinWaitlistDto: JoinWaitlistDto = {
        email: 'Test@Example.com',
      };

      const mockService = {
        _id: new Types.ObjectId(),
        name: 'Test Service',
        slug,
      };

      const mockParticipant = {
        _id: new Types.ObjectId(),
        serviceId: mockService._id,
        email: 'test@example.com',
        joinDate: new Date(),
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          serviceId: mockService._id,
          email: 'test@example.com',
          joinDate: new Date(),
        }),
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      // Mock the constructor function
      (service as any).participantModel = jest
        .fn()
        .mockImplementation(() => mockParticipant);

      const result = await service.joinWaitlist(slug, joinWaitlistDto);

      expect(mockServiceModel.findOne).toHaveBeenCalledWith({ slug });
      expect((service as any).participantModel).toHaveBeenCalledWith({
        serviceId: mockService._id,
        email: 'test@example.com',
        joinDate: expect.any(Date),
      });
      expect(mockParticipant.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Successfully joined the waitlist!',
        waitlistEntryId: expect.any(String),
      });
    });

    it('should throw NotFoundException when service not found', async () => {
      const slug = 'non-existent-slug';
      const joinWaitlistDto: JoinWaitlistDto = {
        email: 'test@example.com',
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.joinWaitlist(slug, joinWaitlistDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const slug = 'test-waitlist';
      const joinWaitlistDto: JoinWaitlistDto = {
        email: 'existing@example.com',
      };

      const mockService = {
        _id: new Types.ObjectId(),
        name: 'Test Service',
        slug,
      };

      const mockParticipant = {
        save: jest.fn().mockRejectedValue({ code: 11000 }),
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      // Mock the constructor function
      (service as any).participantModel = jest
        .fn()
        .mockImplementation(() => mockParticipant);

      await expect(service.joinWaitlist(slug, joinWaitlistDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getParticipantCountBySlug', () => {
    it('should return participant count for a service by slug', async () => {
      const slug = 'test-waitlist';
      const mockService = {
        _id: new Types.ObjectId(),
        slug,
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      mockParticipantModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(15),
      });

      const result = await service.getParticipantCountBySlug(slug);

      expect(mockServiceModel.findOne).toHaveBeenCalledWith({ slug });
      expect(mockParticipantModel.countDocuments).toHaveBeenCalledWith({
        serviceId: mockService._id,
      });
      expect(result).toBe(15);
    });

    it('should throw NotFoundException when service not found', async () => {
      const slug = 'non-existent-slug';

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getParticipantCountBySlug(slug)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('isEmailRegistered', () => {
    it('should return true if email is registered', async () => {
      const slug = 'test-waitlist';
      const email = 'test@example.com';
      const mockService = {
        _id: new Types.ObjectId(),
        slug,
      };

      const mockParticipant = {
        _id: new Types.ObjectId(),
        serviceId: mockService._id,
        email,
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      mockParticipantModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockParticipant),
      });

      const result = await service.isEmailRegistered(slug, email);

      expect(result).toBe(true);
      expect(mockParticipantModel.findOne).toHaveBeenCalledWith({
        serviceId: mockService._id,
        email: 'test@example.com',
      });
    });

    it('should return false if email is not registered', async () => {
      const slug = 'test-waitlist';
      const email = 'test@example.com';
      const mockService = {
        _id: new Types.ObjectId(),
        slug,
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      mockParticipantModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.isEmailRegistered(slug, email);

      expect(result).toBe(false);
    });

    it('should return false if service not found', async () => {
      const slug = 'non-existent-slug';
      const email = 'test@example.com';

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.isEmailRegistered(slug, email);

      expect(result).toBe(false);
    });
  });
});

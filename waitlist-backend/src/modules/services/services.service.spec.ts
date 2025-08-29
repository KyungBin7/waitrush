import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ServicesService } from './services.service';
import { Service } from './schemas/service.schema';
import { WaitlistParticipant } from '../participants/schemas/participant.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

describe('ServicesService', () => {
  let service: ServicesService;

  const mockServiceModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockParticipantModel = {
    countDocuments: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getModelToken(Service.name),
          useValue: mockServiceModel,
        },
        {
          provide: getModelToken(WaitlistParticipant.name),
          useValue: mockParticipantModel,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const createServiceDto: CreateServiceDto = {
        name: 'Test Service',
        description: 'Test Description',
        slug: 'test-service',
        waitlistTitle: 'Join Test',
        waitlistDescription: 'Test waitlist',
        waitlistBackground: '#ffffff',
      };

      const organizerId = new Types.ObjectId().toString();
      const mockService = {
        _id: new Types.ObjectId(),
        ...createServiceDto,
        organizerId: new Types.ObjectId(organizerId),
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
      };

      // Mock the constructor function
      (service as any).serviceModel = jest
        .fn()
        .mockImplementation(() => mockService);
      mockService.save.mockResolvedValue(mockService);

      const result = await service.create(createServiceDto, organizerId);

      expect((service as any).serviceModel).toHaveBeenCalledWith({
        ...createServiceDto,
        organizerId: new Types.ObjectId(organizerId),
      });
      expect(mockService.save).toHaveBeenCalled();
      expect(result).toEqual(mockService);
    });

    it('should throw ConflictException for duplicate slug', async () => {
      const createServiceDto: CreateServiceDto = {
        name: 'Test Service',
        slug: 'existing-slug',
      };

      const organizerId = new Types.ObjectId().toString();
      const mockService = {
        save: jest.fn().mockRejectedValue({ code: 11000 }),
      };

      // Mock the constructor function
      (service as any).serviceModel = jest
        .fn()
        .mockImplementation(() => mockService);

      await expect(
        service.create(createServiceDto, organizerId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all services for organizer with participant counts', async () => {
      const organizerId = new Types.ObjectId().toString();
      const mockServices = [
        {
          _id: new Types.ObjectId(),
          name: 'Service 1',
          organizerId: new Types.ObjectId(organizerId),
          toObject: jest.fn().mockReturnValue({
            _id: new Types.ObjectId(),
            name: 'Service 1',
            organizerId: new Types.ObjectId(organizerId),
          }),
        },
      ];

      mockServiceModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockServices),
        }),
      });

      mockParticipantModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await service.findAll(organizerId);

      expect(mockServiceModel.find).toHaveBeenCalledWith({
        organizerId: new Types.ObjectId(organizerId),
      });
      expect(result).toHaveLength(1);
      expect((result[0] as any).participantCount).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a service with participant count', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();
      const mockService = {
        _id: new Types.ObjectId(serviceId),
        name: 'Test Service',
        organizerId: new Types.ObjectId(organizerId),
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(serviceId),
          name: 'Test Service',
          organizerId: new Types.ObjectId(organizerId),
        }),
      };

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      mockParticipantModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await service.findOne(serviceId, organizerId);

      expect(mockServiceModel.findOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(serviceId),
        organizerId: new Types.ObjectId(organizerId),
      });
      expect((result as any).participantCount).toBe(3);
    });

    it('should throw NotFoundException when service not found', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(serviceId, organizerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();
      const updateServiceDto: UpdateServiceDto = {
        name: 'Updated Service',
      };

      const mockUpdatedService = {
        _id: new Types.ObjectId(serviceId),
        name: 'Updated Service',
        organizerId: new Types.ObjectId(organizerId),
      };

      mockServiceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedService),
      });

      const result = await service.update(
        serviceId,
        updateServiceDto,
        organizerId,
      );

      expect(mockServiceModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: new Types.ObjectId(serviceId),
          organizerId: new Types.ObjectId(organizerId),
        },
        expect.objectContaining({
          ...updateServiceDto,
          updatedAt: expect.any(Date),
        }),
        { new: true },
      );
      expect(result).toEqual(mockUpdatedService);
    });

    it('should throw NotFoundException when service not found', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();
      const updateServiceDto: UpdateServiceDto = {
        name: 'Updated Service',
      };

      mockServiceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(serviceId, updateServiceDto, organizerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a service and its participants', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();

      mockServiceModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      mockParticipantModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
      });

      await service.remove(serviceId, organizerId);

      expect(mockServiceModel.deleteOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(serviceId),
        organizerId: new Types.ObjectId(organizerId),
      });
      expect(mockParticipantModel.deleteMany).toHaveBeenCalledWith({
        serviceId: new Types.ObjectId(serviceId),
      });
    });

    it('should throw NotFoundException when service not found', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();

      mockServiceModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.remove(serviceId, organizerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getParticipantCount', () => {
    it('should return participant count for a service', async () => {
      const serviceId = new Types.ObjectId();

      mockParticipantModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await service.getParticipantCount(serviceId);

      expect(mockParticipantModel.countDocuments).toHaveBeenCalledWith({
        serviceId,
      });
      expect(result).toBe(10);
    });
  });

  describe('getServiceParticipants', () => {
    it('should return participants for a service', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();

      const mockService = {
        _id: new Types.ObjectId(serviceId),
        organizerId: new Types.ObjectId(organizerId),
      };

      const mockParticipants = [
        {
          _id: new Types.ObjectId(),
          serviceId: new Types.ObjectId(serviceId),
          email: 'test@example.com',
          joinDate: new Date(),
        },
      ];

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockService),
      });

      mockParticipantModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockParticipants),
        }),
      });

      const result = await service.getServiceParticipants(
        serviceId,
        organizerId,
      );

      expect(mockServiceModel.findOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(serviceId),
        organizerId: new Types.ObjectId(organizerId),
      });
      expect(mockParticipantModel.find).toHaveBeenCalledWith({
        serviceId: new Types.ObjectId(serviceId),
      });
      expect(result).toEqual(mockParticipants);
    });

    it('should throw NotFoundException when service not found', async () => {
      const serviceId = new Types.ObjectId().toString();
      const organizerId = new Types.ObjectId().toString();

      mockServiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getServiceParticipants(serviceId, organizerId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

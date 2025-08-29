import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

describe('ServicesController', () => {
  let controller: ServicesController;

  const mockServicesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getParticipantCount: jest.fn(),
    getServiceParticipants: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: new Types.ObjectId().toString(),
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service and return formatted response', async () => {
      const createServiceDto: CreateServiceDto = {
        name: 'Test Service',
        description: 'Test Description',
        slug: 'test-service',
        waitlistTitle: 'Join Test',
        waitlistDescription: 'Test waitlist',
        waitlistBackground: '#ffffff',
      };

      const mockService = {
        _id: new Types.ObjectId(),
        ...createServiceDto,
        organizerId: new Types.ObjectId(mockRequest.user.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockServicesService.create.mockResolvedValue(mockService);
      mockServicesService.getParticipantCount.mockResolvedValue(0);

      const result = await controller.create(
        createServiceDto,
        mockRequest as any,
      );

      expect(mockServicesService.create).toHaveBeenCalledWith(
        createServiceDto,
        mockRequest.user.id,
      );
      expect(result).toMatchObject({
        id: mockService._id.toString(),
        organizerId: mockService.organizerId.toString(),
        name: mockService.name,
        slug: mockService.slug,
        waitlistUrl: `/waitlist/${mockService.slug}`,
        participantCount: 0,
      });
    });
  });

  describe('findAll', () => {
    it('should return all services for the organizer', async () => {
      const mockServices = [
        {
          _id: new Types.ObjectId(),
          name: 'Service 1',
          slug: 'service-1',
          organizerId: new Types.ObjectId(mockRequest.user.id),
          createdAt: new Date(),
          updatedAt: new Date(),
          participantCount: 5,
        },
      ];

      mockServicesService.findAll.mockResolvedValue(mockServices);

      const result = await controller.findAll(mockRequest as any);

      expect(mockServicesService.findAll).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockServices[0]._id.toString(),
        name: 'Service 1',
        waitlistUrl: '/waitlist/service-1',
        participantCount: 5,
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific service', async () => {
      const serviceId = new Types.ObjectId().toString();
      const mockService = {
        _id: new Types.ObjectId(serviceId),
        name: 'Test Service',
        slug: 'test-service',
        organizerId: new Types.ObjectId(mockRequest.user.id),
        createdAt: new Date(),
        updatedAt: new Date(),
        participantCount: 3,
      };

      mockServicesService.findOne.mockResolvedValue(mockService);

      const result = await controller.findOne(serviceId, mockRequest as any);

      expect(mockServicesService.findOne).toHaveBeenCalledWith(
        serviceId,
        mockRequest.user.id,
      );
      expect(result).toMatchObject({
        id: serviceId,
        name: 'Test Service',
        waitlistUrl: '/waitlist/test-service',
        participantCount: 3,
      });
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const serviceId = new Types.ObjectId().toString();
      const updateServiceDto: UpdateServiceDto = {
        name: 'Updated Service',
      };

      const mockUpdatedService = {
        _id: new Types.ObjectId(serviceId),
        name: 'Updated Service',
        slug: 'updated-service',
        organizerId: new Types.ObjectId(mockRequest.user.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockServicesService.update.mockResolvedValue(mockUpdatedService);
      mockServicesService.getParticipantCount.mockResolvedValue(2);

      const result = await controller.update(
        serviceId,
        updateServiceDto,
        mockRequest as any,
      );

      expect(mockServicesService.update).toHaveBeenCalledWith(
        serviceId,
        updateServiceDto,
        mockRequest.user.id,
      );
      expect(result).toMatchObject({
        id: serviceId,
        name: 'Updated Service',
        participantCount: 2,
      });
    });
  });

  describe('remove', () => {
    it('should delete a service', async () => {
      const serviceId = new Types.ObjectId().toString();

      mockServicesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(serviceId, mockRequest as any);

      expect(mockServicesService.remove).toHaveBeenCalledWith(
        serviceId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'Service deleted successfully' });
    });
  });

  describe('exportParticipants', () => {
    it('should export participants as CSV', async () => {
      const serviceId = new Types.ObjectId().toString();
      const mockParticipants = [
        {
          email: 'user1@example.com',
          joinDate: new Date('2023-01-01T00:00:00.000Z'),
        },
        {
          email: 'user2@example.com',
          joinDate: new Date('2023-01-02T00:00:00.000Z'),
        },
      ];

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      mockServicesService.getServiceParticipants.mockResolvedValue(
        mockParticipants,
      );

      await controller.exportParticipants(
        serviceId,
        mockRequest as any,
        mockResponse,
      );

      expect(mockServicesService.getServiceParticipants).toHaveBeenCalledWith(
        serviceId,
        mockRequest.user.id,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="participants-${serviceId}.csv"`,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(
        'Email,Join Date\nuser1@example.com,2023-01-01T00:00:00.000Z\nuser2@example.com,2023-01-02T00:00:00.000Z',
      );
    });
  });
});

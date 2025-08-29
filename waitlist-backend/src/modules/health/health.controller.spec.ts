import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { getConnectionToken } from '@nestjs/mongoose';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const mockConnection = {
      readyState: 1,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const result = {
        status: 'ok',
        database: { status: 'up' },
      };
      const getHealthSpy = jest
        .spyOn(service, 'getHealth')
        .mockResolvedValue(result);

      const response = await controller.getHealth();
      expect(response).toBe(result);
      expect(getHealthSpy).toHaveBeenCalled();
    });
  });
});

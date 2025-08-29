import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { getConnectionToken } from '@nestjs/mongoose';

describe('HealthService', () => {
  let service: HealthService;
  let mockConnection: { readyState: number };

  beforeEach(async () => {
    mockConnection = {
      readyState: 1, // Connected state
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status with database up when connected', async () => {
      const result = await service.getHealth();
      expect(result).toEqual({
        status: 'ok',
        database: { status: 'up' },
      });
    });

    it('should return health status with database down when disconnected', async () => {
      mockConnection.readyState = 0; // Disconnected state
      const result = await service.getHealth();
      expect(result).toEqual({
        status: 'ok',
        database: {
          status: 'down',
          message: 'Connection state: disconnected',
        },
      });
    });

    it('should handle connection errors gracefully', async () => {
      mockConnection.readyState = 999; // Invalid state
      const result = await service.getHealth();
      expect(result.status).toBe('ok');
      expect(result.database.status).toBe('down');
      expect(result.database.message).toContain('Connection state: unknown');
    });
  });
});

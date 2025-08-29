import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getHealth(): Promise<{
    status: string;
    database: { status: string; message?: string };
  }> {
    let databaseStatus: { status: string; message?: string } = {
      status: 'down',
      message: 'Not connected',
    };

    try {
      // Check MongoDB connection state
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (this.connection.readyState === 1) {
        databaseStatus = { status: 'up' };
      } else {
        const states = [
          'disconnected',
          'connected',
          'connecting',
          'disconnecting',
        ];
        databaseStatus = {
          status: 'down',
          message: `Connection state: ${states[this.connection.readyState] || 'unknown'}`,
        };
      }
    } catch (error) {
      databaseStatus = {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    return Promise.resolve({
      status: 'ok',
      database: databaseStatus,
    });
  }
}

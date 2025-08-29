import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT = 3000;

  // Database configuration
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string = 'mongodb://localhost:27017/waitlist';

  @IsString()
  @IsOptional()
  DATABASE_NAME = 'waitlist';

  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @IsOptional()
  DATABASE_CONNECTION_TIMEOUT = 10000;

  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @IsOptional()
  DATABASE_SOCKET_TIMEOUT = 45000;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  DATABASE_MAX_POOL_SIZE = 10;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  DATABASE_MIN_POOL_SIZE = 2;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  DATABASE_RETRY_ATTEMPTS = 3;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  DATABASE_RETRY_DELAY = 5000;

  // JWT configuration
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION = '24h';

  // CORS configuration
  @IsString()
  @IsOptional()
  CORS_ORIGIN = 'http://localhost:3000';

  // Rate limiting configuration
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  RATE_LIMIT_TTL = 60;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  RATE_LIMIT_MAX = 100;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

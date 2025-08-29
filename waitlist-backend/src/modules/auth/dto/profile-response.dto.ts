import {
  IsString,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SocialProviderDto {
  @IsString()
  provider!: string;

  @IsString()
  providerId!: string;
}

export class ProfileResponseDto {
  @IsString()
  id!: string;

  @IsString()
  email!: string;

  @IsDateString()
  createdAt!: Date;

  @IsArray()
  @IsString({ each: true })
  authMethods!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialProviderDto)
  socialProviders!: SocialProviderDto[];
}

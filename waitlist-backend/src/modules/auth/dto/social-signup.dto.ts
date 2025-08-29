import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';

export class SocialSignupDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsEnum(['google', 'github'])
  @IsNotEmpty()
  provider!: 'google' | 'github';

  @IsNotEmpty()
  providerId!: string;

  @IsOptional()
  @IsObject()
  additionalData?: {
    name?: string;
    username?: string;
    picture?: string;
    // Add more fields as needed
  };
}

import { IsString, IsNotEmpty } from 'class-validator';

export class SocialAuthDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class LinkProviderDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

import { IsOptional, IsString } from 'class-validator';

export class TokenGeneratedEventDto {
  @IsString()
  userId!: string;

  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

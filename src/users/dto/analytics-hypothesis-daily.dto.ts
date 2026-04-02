import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class AnalyticsHypothesisDailyDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsOptional()
  @IsIn(['global', 'user'])
  scope?: 'global' | 'user';

  @ValidateIf((o) => o.scope === 'user')
  @IsString()
  userId?: string;
}

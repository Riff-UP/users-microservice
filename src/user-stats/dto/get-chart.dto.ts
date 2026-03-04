import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Payload para las rutas de gráficos con rango de fechas opcional.
 * Usado por FollowerGrowthChart e InteractionsChart.
 */
export class GetChartDto {
  @IsString()
  @IsUUID()
  userId!: string;

  /** ISO date string — fecha de inicio (inclusive). Ej.: "2026-01-01" */
  @IsDateString()
  @IsOptional()
  from?: string;

  /** ISO date string — fecha de fin (inclusive). Ej.: "2026-03-04" */
  @IsDateString()
  @IsOptional()
  to?: string;
}

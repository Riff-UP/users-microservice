import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEventAttendanceDto {
  @IsString()
  @IsUUID()
  userId!: string;

  /** ID del evento en el microservicio de eventos. */
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @IsString()
  @IsNotEmpty()
  eventName!: string;

  /** Fecha de asistencia. Por defecto: now(). */
  @IsDateString()
  @IsOptional()
  attendedAt?: string;
}

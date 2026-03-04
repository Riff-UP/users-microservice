import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateEventRatingDto {
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

  /** Calificación del evento en escala 0–5 (con decimales). */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating!: number;
}

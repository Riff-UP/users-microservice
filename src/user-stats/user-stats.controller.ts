import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserStatsService } from './user-stats.service';
import { GetChartDto } from './dto/get-chart.dto';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { CreateEventRatingDto } from './dto/create-event-rating.dto';

@Controller()
export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  // ── MongoDB ──────────────────────────────────────────────────────────────

  @MessagePattern('findUserStats')
  findOne(@Payload() sqlUserId: string) {
    return this.userStatsService.findOne(sqlUserId);
  }

  @MessagePattern('incrementProfileViews')
  incrementProfileViews(@Payload() sqlUserId: string) {
    return this.userStatsService.incrementProfileViews(sqlUserId);
  }

  // ── Gráfico 1: FollowerGrowthChart (línea) ───────────────────────────────

  /** Nuevos seguidores agrupados por día. Payload: GetChartDto */
  @MessagePattern('getFollowerGrowth')
  getFollowerGrowth(@Payload() dto: GetChartDto) {
    return this.userStatsService.getFollowerGrowth(dto);
  }

  // ── Gráfico 2: InteractionsChart (línea) ─────────────────────────────────

  /** Interacciones (nuevos seguidores) agrupadas por semana. Payload: GetChartDto */
  @MessagePattern('getWeeklyInteractions')
  getWeeklyInteractions(@Payload() dto: GetChartDto) {
    return this.userStatsService.getWeeklyInteractions(dto);
  }

  // ── Gráfico 3: EventAttendanceChart (barras) ─────────────────────────────

  /** Asistencias totales por evento. Payload: { userId: string } */
  @MessagePattern('getEventAttendance')
  getEventAttendance(@Payload() payload: { userId: string }) {
    return this.userStatsService.getEventAttendance(payload.userId);
  }

  // ── Gráfico 4: EventRatingChart (barras 0–5) ─────────────────────────────

  /** Calificación promedio por evento. Payload: { userId: string } */
  @MessagePattern('getEventRating')
  getEventRating(@Payload() payload: { userId: string }) {
    return this.userStatsService.getEventRating(payload.userId);
  }

  // ── Escritura de datos de eventos ────────────────────────────────────────

  /** Registra la asistencia de un artista a un evento. */
  @MessagePattern('createEventAttendance')
  createEventAttendance(@Payload() dto: CreateEventAttendanceDto) {
    return this.userStatsService.createEventAttendance(dto);
  }

  /** Registra o actualiza la calificación de un evento para un artista. */
  @MessagePattern('createEventRating')
  createEventRating(@Payload() dto: CreateEventRatingDto) {
    return this.userStatsService.createEventRating(dto);
  }
}

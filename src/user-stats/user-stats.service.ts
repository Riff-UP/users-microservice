import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserStats } from './schemas/user-stats.schema';
import { Model } from 'mongoose';
import { RpcExceptionHelper } from 'src/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetChartDto } from './dto/get-chart.dto';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { CreateEventRatingDto } from './dto/create-event-rating.dto';

// ── Tipos de retorno para cada vista ──────────────────────────────────────────

export interface FollowerGrowthRow {
  user_id: string;
  day: Date;
  new_followers: number;
}

export interface WeeklyInteractionsRow {
  user_id: string;
  week_start: Date;
  interactions: number;
}

export interface EventAttendanceRow {
  user_id: string;
  event_id: string;
  event_name: string;
  total_attendances: number;
}

export interface EventRatingRow {
  user_id: string;
  event_id: string;
  event_name: string;
  avg_rating: number;
  total_ratings: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class UserStatsService {
  constructor(
    @InjectModel(UserStats.name)
    private readonly userStatsModel: Model<UserStats>,
    private readonly prisma: PrismaService
  ) {}

  // ── MongoDB — profile views ──────────────────────────────────────────────

  async create(sqlUserId: string) {
    return await this.userStatsModel.create({ sqlUserId, profileViews: 0 });
  }

  async findOne(sqlUserId: string) {
    const stats = await this.userStatsModel.findOne({ sqlUserId }).exec();
    if (!stats) RpcExceptionHelper.notFound('Stats', sqlUserId);
    return stats!;
  }

  async incrementProfileViews(sqlUserId: string) {
    return await this.userStatsModel
      .findOneAndUpdate(
        { sqlUserId },
        { $inc: { profileViews: 1 } },
        { new: true }
      )
      .exec();
  }

  async delete(sqlUserId: string): Promise<{ deletedCount: number }> {
    const result = await this.userStatsModel.deleteOne({ sqlUserId }).exec();
    return { deletedCount: result.deletedCount ?? 0 };
  }

  // ── PostgreSQL — gráfico 1: FollowerGrowthChart ──────────────────────────

  /**
   * Devuelve los nuevos seguidores agrupados por día para un usuario.
   * Rango de fechas opcional (from / to en formato ISO "YYYY-MM-DD").
   */
  async getFollowerGrowth(dto: GetChartDto): Promise<FollowerGrowthRow[]> {
    const { userId, from, to } = dto;

    const rows = await this.prisma.$queryRaw<FollowerGrowthRow[]>(
      Prisma.sql`
        SELECT user_id, day, new_followers
        FROM vw_follower_growth
        WHERE user_id = ${userId}
          ${from ? Prisma.sql`AND day >= ${new Date(from)}` : Prisma.empty}
          ${to ? Prisma.sql`AND day <= ${new Date(to)}` : Prisma.empty}
        ORDER BY day ASC
      `
    );

    return rows;
  }

  // ── PostgreSQL — gráfico 2: InteractionsChart ────────────────────────────

  /**
   * Devuelve las interacciones (nuevos seguidores) agrupadas por semana.
   * Rango de fechas opcional sobre week_start.
   */
  async getWeeklyInteractions(
    dto: GetChartDto
  ): Promise<WeeklyInteractionsRow[]> {
    const { userId, from, to } = dto;

    const rows = await this.prisma.$queryRaw<WeeklyInteractionsRow[]>(
      Prisma.sql`
        SELECT user_id, week_start, interactions
        FROM vw_weekly_interactions
        WHERE user_id = ${userId}
          ${from ? Prisma.sql`AND week_start >= ${new Date(from)}` : Prisma.empty}
          ${to ? Prisma.sql`AND week_start <= ${new Date(to)}` : Prisma.empty}
        ORDER BY week_start ASC
      `
    );

    return rows;
  }

  // ── PostgreSQL — gráfico 3: EventAttendanceChart ─────────────────────────

  /**
   * Devuelve el total de asistencias por evento para un usuario (artista).
   */
  async getEventAttendance(userId: string): Promise<EventAttendanceRow[]> {
    return this.prisma.$queryRaw<EventAttendanceRow[]>(
      Prisma.sql`
        SELECT user_id, event_id, event_name, total_attendances
        FROM vw_event_attendance
        WHERE user_id = ${userId}
        ORDER BY total_attendances DESC
      `
    );
  }

  // ── PostgreSQL — gráfico 4: EventRatingChart ─────────────────────────────

  /**
   * Devuelve la calificación promedio por evento para un usuario (artista).
   */
  async getEventRating(userId: string): Promise<EventRatingRow[]> {
    return this.prisma.$queryRaw<EventRatingRow[]>(
      Prisma.sql`
        SELECT user_id, event_id, event_name, avg_rating::float AS avg_rating, total_ratings
        FROM vw_event_rating
        WHERE user_id = ${userId}
        ORDER BY avg_rating DESC
      `
    );
  }

  // ── PostgreSQL — escritura de datos de eventos ────────────────────────────

  async createEventAttendance(dto: CreateEventAttendanceDto) {
    return this.prisma.eventAttendance.create({
      data: {
        userId: dto.userId,
        eventId: dto.eventId,
        eventName: dto.eventName,
        ...(dto.attendedAt ? { attendedAt: new Date(dto.attendedAt) } : {}),
      },
    });
  }

  async createEventRating(dto: CreateEventRatingDto) {
    return this.prisma.eventRating.upsert({
      where: {
        userId_eventId: { userId: dto.userId, eventId: dto.eventId },
      },
      update: {
        rating: dto.rating,
        eventName: dto.eventName,
      },
      create: {
        userId: dto.userId,
        eventId: dto.eventId,
        eventName: dto.eventName,
        rating: dto.rating,
      },
    });
  }
}

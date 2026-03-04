-- ============================================================
-- Stats Views — base de datos para los 4 gráficos de estadísticas
-- ============================================================

-- 1. vw_follower_growth
--    Nuevos seguidores agrupados por día para cada usuario (artista).
--    Fuente: FollowerGrowthChart (línea)
CREATE OR REPLACE VIEW vw_follower_growth AS
SELECT
  followed_id              AS user_id,
  DATE(created_at)         AS day,
  COUNT(*)::int            AS new_followers
FROM user_follows
GROUP BY followed_id, DATE(created_at);

-- 2. vw_weekly_interactions
--    Interacciones (nuevos seguidores recibidos) agrupadas por semana
--    para cada usuario. Fuente: InteractionsChart (línea)
CREATE OR REPLACE VIEW vw_weekly_interactions AS
SELECT
  followed_id                              AS user_id,
  DATE_TRUNC('week', created_at)::date     AS week_start,
  COUNT(*)::int                            AS interactions
FROM user_follows
GROUP BY followed_id, DATE_TRUNC('week', created_at);

-- 3. vw_event_attendance
--    Total de asistencias por evento para cada usuario (artista).
--    Fuente: EventAttendanceChart (barras)
CREATE OR REPLACE VIEW vw_event_attendance AS
SELECT
  user_id,
  event_id,
  event_name,
  COUNT(*)::int  AS total_attendances
FROM event_attendances
GROUP BY user_id, event_id, event_name;

-- 4. vw_event_rating
--    Calificación promedio (0–5) por evento para cada usuario (artista).
--    Fuente: EventRatingChart (barras)
CREATE OR REPLACE VIEW vw_event_rating AS
SELECT
  user_id,
  event_id,
  event_name,
  ROUND(AVG(rating)::numeric, 2)  AS avg_rating,
  COUNT(*)::int                   AS total_ratings
FROM event_ratings
GROUP BY user_id, event_id, event_name;

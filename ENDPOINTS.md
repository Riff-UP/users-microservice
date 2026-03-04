# Users Microservice - Endpoints

> Este microservicio se comunica vía **TCP + RabbitMQ** (MessagePattern). No expone rutas HTTP directamente — las URLs REST las define el API Gateway. A continuación se listan los endpoints con la URL sugerida para el gateway.

---

## Users

### `POST /users` — `createUser`

Crea un nuevo usuario.

```json
{
  "name": "string (requerido)",
  "email": "string (requerido)",
  "password": "string (requerido)",
  "googleId": "string (opcional)",
  "biography": "string (opcional)",
  "role": "USER | ARTIST (opcional, default: USER)"
}
```

### `GET /users` — `findAllUsers`

Obtiene todos los usuarios. No requiere body.

### `GET /users/:id` — `findOneUser`

Obtiene un usuario por UUID.

### `PATCH /users/:id` — `updateUser`

Actualiza un usuario existente.

```json
{
  "id": "string (requerido)",
  "name": "string (opcional)",
  "email": "string (opcional)",
  "password": "string (opcional)",
  "googleId": "string (opcional)",
  "biography": "string (opcional)",
  "role": "USER | ARTIST (opcional)"
}
```

### `DELETE /users/:id` — `removeUser`

Elimina un usuario por UUID.

### `POST /users/find-by-email` — `findUserByEmail`

Busca un usuario por email.

```json
{
  "email": "string (requerido)"
}
```

### `POST /users/generate-token` — `generateToken`

Genera un token para un usuario.

```json
{
  "user": "object (cualquier dato del usuario)"
}
```

### `POST /users/google` — `createUserGoogle`

Crea un usuario con datos de Google.

```json
{
  "payload": "object (datos de Google)"
}
```

### `POST /users/login` — `login`

Inicia sesión con email y contraseña.

```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

---

## Social Media

### `POST /social-media` — `createSocialMedia`

Crea un registro de red social para un usuario.

```json
{
  "userId": "string (requerido)",
  "url": "string (requerido)"
}
```

### `GET /social-media` — `findAllSocialMedia`

Obtiene todos los registros de redes sociales. No requiere body.

### `GET /social-media/:id` — `findOneSocialMedia`

Obtiene un registro de red social por UUID.

### `PATCH /social-media/:id` — `updateSocialMedia`

Actualiza un registro de red social.

```json
{
  "id": "string (requerido)",
  "userId": "string (opcional)",
  "url": "string (opcional)"
}
```

### `DELETE /social-media/:id` — `removeSocialMedia`

Elimina un registro de red social por UUID.

---

## User Follows

### `POST /user-follows` — `toggleUserFollow`

Sigue o deja de seguir a un usuario (toggle).

```json
{
  "followerId": "string (requerido)",
  "followedId": "string (requerido)"
}
```

### `GET /user-follows/:followerId` — `findAllUserFollows`

Obtiene todos los follows de un usuario.

### `GET /user-follows/:followerId/:followedId` — `findOneUserFollow`

Verifica si un usuario sigue a otro.

---

## User Stats

### `GET /user-stats/:sqlUserId` — `findUserStats`

Obtiene las estadísticas de un usuario (perfil views — MongoDB).

### `PATCH /user-stats/:sqlUserId/views` — `incrementProfileViews`

Incrementa las visitas al perfil de un usuario.

---

## Stats Charts (vistas de BD)

> Los cuatro endpoints siguientes consultan vistas de PostgreSQL. Todos devuelven arrays listos para graficar.

### `GET /user-stats/:userId/follower-growth` — `getFollowerGrowth`

**FollowerGrowthChart** — Crecimiento de seguidores (línea).
Nuevos seguidores agrupados por **día**.

```json
{
  "userId": "uuid (requerido)",
  "from": "YYYY-MM-DD (opcional)",
  "to": "YYYY-MM-DD (opcional)"
}
```

Respuesta:

```json
[{ "user_id": "uuid", "day": "2026-03-01T00:00:00.000Z", "new_followers": 5 }]
```

### `GET /user-stats/:userId/weekly-interactions` — `getWeeklyInteractions`

**InteractionsChart** — Interacciones por semana (línea).
Nuevos seguidores recibidos agrupados por **semana ISO**.

```json
{
  "userId": "uuid (requerido)",
  "from": "YYYY-MM-DD (opcional)",
  "to": "YYYY-MM-DD (opcional)"
}
```

Respuesta:

```json
[
  {
    "user_id": "uuid",
    "week_start": "2026-02-24T00:00:00.000Z",
    "interactions": 12
  }
]
```

### `GET /user-stats/:userId/event-attendance` — `getEventAttendance`

**EventAttendanceChart** — Asistencia por evento (barras).

```json
{ "userId": "uuid (requerido)" }
```

Respuesta:

```json
[
  {
    "user_id": "uuid",
    "event_id": "uuid",
    "event_name": "Festival X",
    "total_attendances": 320
  }
]
```

### `GET /user-stats/:userId/event-rating` — `getEventRating`

**EventRatingChart** — Calificación promedio por evento (barras, escala 0–5).

```json
{ "userId": "uuid (requerido)" }
```

Respuesta:

```json
[
  {
    "user_id": "uuid",
    "event_id": "uuid",
    "event_name": "Festival X",
    "avg_rating": 4.25,
    "total_ratings": 87
  }
]
```

---

## Event Data (escritura desde otros microservicios)

### `POST /user-stats/event-attendance` — `createEventAttendance`

Registra la asistencia de un artista a un evento.

```json
{
  "userId": "uuid (requerido)",
  "eventId": "string (requerido)",
  "eventName": "string (requerido)",
  "attendedAt": "ISO date string (opcional)"
}
```

### `POST /user-stats/event-rating` — `createEventRating`

Registra o actualiza la calificación (0–5) de un evento para un artista.
Si ya existe una calificación del mismo `(userId, eventId)` se sobreescribe.

```json
{
  "userId": "uuid (requerido)",
  "eventId": "string (requerido)",
  "eventName": "string (requerido)",
  "rating": "number 0–5 (requerido)"
}
```

---

## Password Resets

### `POST /password-resets` — `createPasswordReset`

Crea un registro de reseteo de contraseña.

```json
{
  "userId": "string (requerido)",
  "token": "string (requerido)",
  "expiresAt": "ISO date string (requerido)",
  "used": "boolean (opcional)"
}
```

### `GET /password-resets` — `findAllPasswordResets`

Obtiene todos los registros de reseteo. No requiere body.

### `GET /password-resets/:id` — `findOnePasswordReset`

Obtiene un registro de reseteo por ID.

### `PATCH /password-resets/:id` — `updatePasswordReset`

Actualiza un registro de reseteo de contraseña.

```json
{
  "id": "string (requerido)",
  "userId": "string (opcional)",
  "token": "string (opcional)",
  "expiresAt": "ISO date string (opcional)",
  "used": "boolean (opcional)"
}
```

### `DELETE /password-resets/:id` — `removePasswordReset`

Elimina un registro de reseteo por ID.

### `POST /password-resets/send` — `sendPasswordReset`

Envía un correo de reseteo de contraseña.

```json
{
  "mail": "string email (requerido)"
}
```

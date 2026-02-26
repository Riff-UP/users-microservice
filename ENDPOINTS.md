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

Obtiene las estadísticas de un usuario.

### `PATCH /user-stats/:sqlUserId/views` — `incrementProfileViews`

Incrementa las visitas al perfil de un usuario.

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

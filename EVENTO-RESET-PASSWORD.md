# Configuración del Envío de Evento `send.resetPassword` por RabbitMQ

## Resumen del Flujo

```
Gateway (Postman)
  → TCP → UsersController (@MessagePattern('psswrdResetSender'))
    → PasswordResetsService.psswrdResetSender()
      → Busca usuario en BD
      → Genera y hashea token
      → Guarda token en BD (tabla password_resets)
      → Emite evento a RabbitMQ: 'send.resetPassword'
        → Otro microservicio (consumidor) lo recibe y envía el correo
```

---

## 1. `main.ts` — Conexión a RabbitMQ y TCP

Se configuraron **dos transportes** de microservicio:

```typescript
// Transporte RabbitMQ — para escuchar/emitir eventos
app.connectMicroservice({
  transport: Transport.RMQ,
  options: {
    urls: [envs.rabbit_url], // amqp://localhost:5672
    queue: 'riff_queue',
    queueOptions: { durable: true },
  },
});

// Transporte TCP — para que el gateway se comunique con este microservicio
app.connectMicroservice({
  transport: Transport.TCP,
  options: {
    host: '0.0.0.0',
    port: 3001,
  },
});

await app.startAllMicroservices();
```

**¿Por qué dos transportes?**

- **TCP (puerto 3001):** El gateway envía mensajes al microservicio usando `@MessagePattern` a través de TCP.
- **RabbitMQ (`riff_queue`):** El microservicio emite eventos (como `send.resetPassword`) a la cola de RabbitMQ para que otros microservicios los consuman.

---

## 2. `users.controller.ts` — Punto de entrada (TCP)

El gateway llama a este microservicio por TCP usando el patrón `'psswrdResetSender'`:

```typescript
@MessagePattern('psswrdResetSender')
sendPasswordReset(@Payload() mailDto: mailDto) {
  return this.passwordResetsService.psswrdResetSender(mailDto);
}
```

- **`@MessagePattern('psswrdResetSender')`**: Escucha mensajes TCP del gateway con ese patrón.
- **`@Payload()`**: Extrae el body del mensaje (el DTO con el email).
- Delega toda la lógica al `PasswordResetsService`.

---

## 3. `password-resets-sender.service.ts` — Lógica y emisión del evento

### 3.1 Creación del productor RabbitMQ

En el constructor se crea un `ClientProxy` que se conecta a RabbitMQ:

```typescript
this.client = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'riff_queue',
  },
});
```

Este `client` es el **productor** que publica mensajes en la cola `riff_queue`.

### 3.2 Método `psswrdResetSender`

```typescript
async psswrdResetSender(mailDto: mailDto) {
  // 1. Busca el usuario por email
  const user = await this.prisma.user.findUnique({
    where: { email: mailDto.mail },
  });

  // 2. Si no existe, lanza error
  if (!user) {
    throw new RpcException({ status: 404, message: 'user not found' });
  }

  // 3. Genera un token aleatorio y lo hashea con SHA-256
  const hashedToken = hashing(rawToken());

  // 4. Guarda el token en la tabla password_resets con expiración de 15 min
  await this.prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 900_000), // 15 minutos
    },
  });

  // 5. Emite el evento a RabbitMQ
  this.client.emit('send.resetPassword', {
    mail: user.email,
    userId: user.id,
    userName: user.name,
    token: hashedToken,
  });

  return { status: 200, message: 'Password reset email sent' };
}
```

**`this.client.emit()`** es la línea clave:

- **`emit`** = evento fire-and-forget (no espera respuesta del consumidor).
- **`'send.resetPassword'`** = nombre del patrón del evento.
- El segundo argumento es el payload que recibe el consumidor.

---

## 4. `mail-dto.ts` — DTO de entrada

```typescript
export class mailDto {
  mail!: string;
}
```

El body que envías desde Postman debe ser:

```json
{ "mail": "usuario@ejemplo.com" }
```

---

## 5. Configuración de Módulos (Inyección de Dependencias)

### `password-resets.module.ts`

```typescript
@Module({
  providers: [PasswordResetsService],
  exports: [PasswordResetsService], // ← CLAVE: exporta el servicio
})
export class PasswordResetsModule {}
```

### `users.module.ts`

```typescript
@Module({
  imports: [PasswordResetsModule], // ← CLAVE: importa el módulo
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### `app.module.ts`

```typescript
@Module({
  imports: [
    UsersModule,
    PasswordResetsModule,
    PrismaModule,
    // ... otros módulos
  ],
})
export class AppModule {}
```

**Sin estos cambios**, NestJS lanza el error:

> `Nest can't resolve dependencies of the UsersController (UsersService, ?)`

---

## 6. Consumidor (otro microservicio)

Para que el evento `send.resetPassword` sea recibido, **otro microservicio** debe:

1. Estar conectado a la misma cola RabbitMQ (`riff_queue`).
2. Tener un handler con `@EventPattern`:

```typescript
@EventPattern('send.resetPassword')
handleResetPassword(@Payload() data: any) {
  // Aquí se envía el correo real al usuario
  console.log('Datos recibidos:', data);
}
```

Si no hay ningún consumidor escuchando, aparece el error:

> `There is no matching event handler defined in the remote service.`

---

## 7. Requisitos para que todo funcione

| Componente     | Requisito                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------- |
| **RabbitMQ**   | Corriendo en `localhost:5672`                                                               |
| **PostgreSQL** | Corriendo en `localhost:5432` con la BD `riff_users`                                        |
| **`.env`**     | `DATABASE_URL`, `RABBIT_URL`, `PORT`, `RESEND_KEY` configurados                             |
| **Prisma**     | `npx prisma generate` ejecutado después de cada `npm install`                               |
| **Users-MS**   | Corriendo (`npm run start:dev`)                                                             |
| **Consumidor** | Otro microservicio escuchando `@EventPattern('send.resetPassword')` en la cola `riff_queue` |

---

## 8. Prueba desde Postman

```
POST {{BASE_URL}}/api/auth/password/reset/send

Body (JSON):
{
  "mail": "correo-de-usuario-existente@ejemplo.com"
}
```

**Respuesta esperada:**

```json
{
  "status": 200,
  "message": "Password reset email sent"
}
```

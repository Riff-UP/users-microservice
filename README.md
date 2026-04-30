# Users Microservice

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-0C344B?style=for-the-badge&logo=prisma&logoColor=white)

## 📌 Descripción

Microservicio encargado de la identidad y el ciclo de vida de los usuarios en Riff. Centraliza registro, autenticación, perfiles, relaciones de seguimiento, recuperación de contraseña y estadísticas, con persistencia en PostgreSQL mediante Prisma.

## Problema que resuelve

En una arquitectura de microservicios, los datos de usuario no deben duplicarse ni dispersarse entre servicios. users-ms actúa como la fuente de verdad para identidad y relaciones sociales, permitiendo que el gateway y el resto de la plataforma consuman información consistente sin acoplarse a la lógica interna del dominio.

## Responsabilidades principales

- Crear, actualizar, desactivar y consultar usuarios.
- Validar inicio de sesión con contraseña.
- Generar tokens para autenticación.
- Crear usuarios con Google.
- Gestionar follow y unfollow.
- Recuperar y actualizar contraseñas.
- Promover automáticamente a un usuario a artista cuando publica contenido.
- Consultar estadísticas de perfil.

## Flujo general

```text
Frontend -> Gateway -> users-ms

users-ms -> PostgreSQL + Prisma
  - users
  - follows
  - password resets
  - stats

Gateway -> users-ms
  - createUser
  - login
  - updateUser
  - createUserGoogle
  - generateToken

RabbitMQ -> users-ms
  - user.publishedContent
```

Los flujos más frecuentes pasan por el gateway, mientras que los eventos de dominio permiten sincronizar cambios sin acoplar servicios.

## Modelo de datos

El esquema de Prisma concentra el dominio de usuarios en cuatro entidades principales:

- `User`: identidad, rol, biografía, imagen y estado.
- `UserFollows`: relaciones seguidor/seguido.
- `PasswordReset`: tokens, expiración y control de uso.
- `SocialMedia`: enlaces sociales asociados al perfil.

## Comunicación con otros servicios

users-ms expone operaciones síncronas para el gateway y escucha eventos de dominio para mantener coherencia con el resto de Riff. Esa separación permite que autenticación, contenido y notificaciones evolucionen sin depender de una única base de código.

- TCP para `createUser`, `login`, `findOneUser`, `updateUser` y consultas similares.
- RabbitMQ para eventos como `user.publishedContent`.
- PostgreSQL como almacenamiento principal de identidad y relaciones.

## Decisiones técnicas

- Prisma simplifica el acceso a datos y mantiene el modelo explícito.
- PostgreSQL se usa por la naturaleza relacional de usuarios, follows y resets.
- El dominio de usuarios se separa del gateway para evitar acoplamiento.
- Las relaciones sociales se modelan con una tabla puente con clave compuesta.

## Desarrollo local

```bash
npm install
npm run start:dev
```

## Pruebas

```bash
npm run test
npm run test:e2e
```

## Relación con el sistema

Este microservicio no orquesta la experiencia completa. Su valor está en concentrar la lógica de identidad y persistencia de usuarios para que el gateway y los demás servicios trabajen con datos consistentes y fáciles de consumir.

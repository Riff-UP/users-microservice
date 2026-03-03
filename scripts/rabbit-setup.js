#!/usr/bin/env node
/**
 * Script para provisionar la topología de RabbitMQ:
 * - Exchange: riff_events (tipo topic, durable)
 * - Colas: users_queue, notifications_queue, content_queue (durable)
 * - Bindings con routing keys apropiadas
 */

const amqp = require('amqplib');
require('dotenv/config');

const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'riff_events';

async function setupRabbitMQ() {
  let connection;
  try {
    console.log(`🐰 Conectando a RabbitMQ: ${RABBIT_URL}`);
    connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    // 1. Declarar el exchange topic
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    console.log(`✅ Exchange creado: ${EXCHANGE_NAME} (topic, durable)`);

    // 2. Declarar las colas
    const queues = [
      'users_queue',
      'notifications_queue',
      'content_queue',
      'riff_queue', // cola legacy (por compatibilidad temporal)
    ];

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });
      console.log(`✅ Cola creada: ${queue} (durable)`);
    }

    // 3. Bindings - users_queue
    const usersBindings = [
      'auth.tokenGenerated',
      'user.created',
      'user.updated',
      'user.deactivated',
    ];
    for (const routingKey of usersBindings) {
      await channel.bindQueue('users_queue', EXCHANGE_NAME, routingKey);
      console.log(`🔗 Binding: users_queue <-- ${routingKey}`);
    }

    // 4. Bindings - notifications_queue
    const notificationsBindings = [
      'send.resetPassword',
      'follow.created',
      'follow.removed',
      'user.deactivated',
      'post.created',
      'event.created',
      'event.updated',
      'event.cancelled',
    ];
    for (const routingKey of notificationsBindings) {
      await channel.bindQueue('notifications_queue', EXCHANGE_NAME, routingKey);
      console.log(`🔗 Binding: notifications_queue <-- ${routingKey}`);
    }

    // 5. Bindings - content_queue
    const contentBindings = [
      'user.deactivated',
      'post.created',
      'post.updated',
      'post.deleted',
      'event.created',
      'event.updated',
      'event.cancelled',
    ];
    for (const routingKey of contentBindings) {
      await channel.bindQueue('content_queue', EXCHANGE_NAME, routingKey);
      console.log(`🔗 Binding: content_queue <-- ${routingKey}`);
    }

    // 6. Bindings - riff_queue (legacy - puede recibir todo con patrón wildcard)
    await channel.bindQueue('riff_queue', EXCHANGE_NAME, '#');
    console.log(`🔗 Binding: riff_queue <-- # (todo)`);

    console.log('\n✨ Topología de RabbitMQ configurada exitosamente\n');

    await channel.close();
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando RabbitMQ:', error.message);
    if (connection) await connection.close();
    process.exit(1);
  }
}

setupRabbitMQ();


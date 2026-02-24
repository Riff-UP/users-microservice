import * as joi from 'joi';
import 'dotenv/config';

interface EnvVars{
    PORT: number
    MONGO_URI: string
interface EnvVars {
  PORT: number;
  RABBIT_URL: string;
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    MONGO_URI: joi.string().required()
}).unknown(true)
const envSchema = joi
  .object({
    PORT: joi.number().required(),
    RABBIT_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    host: process.env.USERS_MS_HOST || '0.0.0.0',
    mongoUri: envVars.MONGO_URI
}
  port: envVars.PORT,
  rabbit_url: envVars.RABBIT_URL,
};

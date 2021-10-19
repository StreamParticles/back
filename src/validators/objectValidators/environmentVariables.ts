import Joi from "joi";

export const environmentVariablesValidator = Joi.object({
  // AUTH SECURITY
  JWT_PASSPHRASE: Joi.string().required(),

  // GATEWAY
  MEDIA_GATEWAY: Joi.string().required(),

  // MONGODB
  MONGODB_HOST: Joi.string().required(),
  MONGODB_DBNAME: Joi.string().required(),
  MONGODB_USER: Joi.string(),
  MONGODB_PWD: Joi.string(),

  // MONGODB ENCRYPTION
  KEY: Joi.string().required(),
  IV: Joi.string().required(),

  // REDIS
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PWD: Joi.string(), //.required(),

  // ENTRY_POINT
  API_PORT: Joi.number().required(),
  UPLOAD_GATEWAY: Joi.string().required(),

  // ELROND
  ELROND_GATEWAY_URL: Joi.string().required(),
  ELROND_API_URL: Joi.string().required(),
  ELROND_HEROTAG_DOMAIN: Joi.string().required(),

  // IFTTT
  IFTTT_API: Joi.string().required(),

  // DEBUG
  ENABLE_CONSOLE_TRANSPORT: Joi.boolean(),

  // MEDIAS
  MEDIAS_FOLDER: Joi.string(),
}).unknown(true);

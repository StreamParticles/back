import dotenv from "dotenv-defaults";
import Joi from "joi";
import path from "path";

const envFileName = () => {
  return [".env", process.env.NODE_ENV === "test" && "test"]
    .filter(Boolean)
    .join(".");
};

interface EnvVariables {
  NODE_ENV: string;

  // ENTRY_POINT
  API_PORT?: number;

  // GATEWAY
  MEDIAS_GATEWAY: string;

  // AUTH SECURITY
  JWT_PASSPHRASE: string;

  // MONGODB
  MONGODB_HOST: string;
  MONGODB_DBNAME: string;
  MONGODB_PORT: number;
  MONGODB_USER?: string;
  MONGODB_PWD?: string;

  // MONGODB ENCRYPTION
  KEY: string;
  IV: string;

  // REDIS
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PWD?: string;

  // ELROND
  ELROND_PROXY_URL: string;
  ELROND_TRANSACTIONS_API_URL: string;
  ELROND_HEROTAG_DOMAIN: string;

  // IFTTT
  IFTTT_API: string;

  // DEBUG
  ENABLE_CONSOLE_TRANSPORT?: boolean;
}

const environmentVariablesValidator = Joi.object({
  NODE_ENV: Joi.string().required(),

  // ENTRY_POINT
  API_PORT: Joi.number().required(),

  // GATEWAY
  MEDIAS_GATEWAY: Joi.string().required(),

  // AUTH SECURITY
  JWT_PASSPHRASE: Joi.string().required(),

  // MONGODB
  MONGODB_HOST: Joi.string().required(),
  MONGODB_DBNAME: Joi.string().required(),
  MONGODB_PORT: Joi.number().required(),
  MONGODB_USER: Joi.string(),
  MONGODB_PWD: Joi.string(),

  // MONGODB ENCRYPTION
  KEY: Joi.string().required(),
  IV: Joi.string().required(),

  // REDIS
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PWD: Joi.string(), //.required(),

  // ELROND
  ELROND_PROXY_URL: Joi.string().required(),
  ELROND_TRANSACTIONS_API_URL: Joi.string().required(),
  ELROND_HEROTAG_DOMAIN: Joi.string().required(),

  // IFTTT
  IFTTT_API: Joi.string().required(),

  // DEBUG
  ENABLE_CONSOLE_TRANSPORT: Joi.boolean(),
}).unknown(true);

// Load environment config
dotenv.config({
  encoding: "utf8",
  path: path.resolve(process.cwd(), envFileName()),
  defaults: path.resolve(process.cwd(), ".env.defaults"),
});

const ENV: EnvVariables = Object.entries(process.env).reduce(
  (acc, [_key, _value]) => {
    //  null values
    if (_value === "null" || _value === undefined) return acc;

    // Convert booleans
    if (_value === "true") return { ...acc, [_key]: true };
    else if (_value === "false") return { ...acc, [_key]: false };

    if (isFinite(Number(_value)) && _value !== "")
      return { ...acc, [_key]: Number(_value) };

    return { ...acc, [_key]: _value };
  },
  {} as EnvVariables
);

const { error } = environmentVariablesValidator.validate(ENV);

if (error) throw error;

// Expose environment vars
export { ENV };

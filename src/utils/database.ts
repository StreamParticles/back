import { createCipheriv, createDecipheriv } from "crypto";

import logger from "#services/logger";
import { connectToDatabase } from "#services/mongoose";

import { ENV } from "./env";

//set field
export const encrypt = (text: string): string | undefined => {
  if (text === undefined || text === null) return undefined;

  try {
    const cipher = createCipheriv(
      "aes-256-cbc",
      ENV.KEY as string,
      ENV.IV as string
    );

    const encrypted = cipher.update(text, "utf8", "hex");

    return encrypted + cipher.final("hex");
  } catch (error) {
    throw new Error("UNABLE_TO_ENCRYPT");
  }
};

//get field
export const decrypt = (text: string): string | undefined => {
  if (text === undefined || text === null) return undefined;

  try {
    const decipher = createDecipheriv(
      "aes-256-cbc",
      ENV.KEY as string,
      ENV.IV as string
    );

    const decrypted = decipher.update(text, "hex", "utf8");

    return decrypted + decipher.final("utf8");
  } catch (error) {
    throw new Error("UNABLE_TO_DECRYPT");
  }
};

export const encryptNumberToString = (text: number): string | undefined => {
  if (text === undefined) return undefined;

  return encrypt(String(text as number));
};

//get field
export const decryptStringToNumber = (text: string): number | undefined => {
  if (text === undefined) return undefined;

  return Number(decrypt(text));
};

export const withDatabase = (
  fn: (...args: unknown[]) => Promise<void>
): void => {
  connectToDatabase()
    .then(async () => {
      logger.info("Starting script");

      await fn();

      logger.info("Done");
    })
    .catch((error) => {
      logger.error(error);
    })
    .finally(() => process.exit());
};

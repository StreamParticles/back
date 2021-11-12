import { ElrondTransaction } from "@streamparticles/lib";
import { Decimal } from "decimal.js";

import { ENV } from "./env";

// Should only be used to normalize user input, not necessary on stored data since it is already normalized
export const normalizeHerotag = (herotag: string): string => {
  return herotag.endsWith(`${ENV.ELROND_HEROTAG_DOMAIN}`)
    ? herotag.replace("@", "")
    : `${herotag}.elrond`.replace("@", "");
};

export const computeTransactionAmount = (amount: string): number => {
  return Number(
    Decimal.set({ precision: amount.length }).mul(amount, Math.pow(10, -18))
  );
};

export const decodeDataFromTx = (transaction: ElrondTransaction): string => {
  return transaction.data
    ? Buffer.from(transaction.data, "base64").toString()
    : "";
};

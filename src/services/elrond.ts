import { ElrondTransaction } from "@streamparticles/lib";
import { Address, Dns, ProxyProvider } from "elrondjs";

import { axiosGet } from "#utils/axios";
import { ENV } from "#utils/env";

import logger from "./logger";

const proxy = new ProxyProvider(`${ENV.ELROND_PROXY_URL}`);
const dns = new Dns({ provider: proxy });

interface ProxyResponse<DataType> {
  data: DataType;
}

type AddressResponse = ProxyResponse<{ account: Address }>;

const getAddress = async (erdAddress: string): Promise<Address> => {
  try {
    const { data }: AddressResponse = await axiosGet(
      `${ENV.ELROND_PROXY_URL}/address/${erdAddress}`
    );

    if (!data?.account) throw new Error("ERD_ADDRESS_NOT_FOUND");

    return data.account;
  } catch (error) {
    logger.error(error);
    throw new Error("ERD_ADDRESS_NOT_FOUND");
  }
};

export const getUsername = async (erdAddress: string): Promise<string> => {
  const { username } = await getAddress(erdAddress);

  return username || "";
};

export const getUpdatedBalance = async (
  erdAddress: string
): Promise<string> => {
  const { balance } = await getAddress(erdAddress);

  return balance;
};

type TransactionResponse = ProxyResponse<{
  transaction: ElrondTransaction;
}>;

export const getTransactionByHash = async (
  hash: string
): Promise<ElrondTransaction> => {
  try {
    const { data }: TransactionResponse = await axiosGet(
      `${ENV.ELROND_PROXY_URL}/transaction/${hash}`
    );

    if (!data?.transaction) throw new Error("TRANSACTION_NOT_FOUND");

    return data.transaction;
  } catch (error) {
    logger.error(error);
    throw new Error("TRANSACTION_NOT_FOUND");
  }
};

type TransactionsResponse = ProxyResponse<{
  transactions: ElrondTransaction[];
}>;

// The /address/:erdAddress/transactions endpoint is not served on our own proxy since it requires Elastic Search connector,
// whose documentation has not been provided yet by Elrond
// --- SUBJECT TO CHANGE ---
export const getLastTransactions = async (
  erdAddress: string
): Promise<ElrondTransaction[]> => {
  try {
    const { data }: TransactionsResponse = await axiosGet(
      `${ENV.ELROND_TRANSACTIONS_API_URL}/address/${erdAddress}/transactions`
    );

    return data?.transactions || [];
  } catch (error) {
    logger.error(error);
    return [];
  }
};

export const getErdAddress = (herotag: string): Promise<string> => {
  return dns.resolve(herotag);
};

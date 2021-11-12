import {
  ElrondTransaction,
  ErrorKinds,
  UserAccountStatus,
  UserType,
} from "@streamparticles/lib";

import Donation from "#models/Donation";
import User from "#models/User";
import { getErdAddress, getLastTransactions } from "#services/elrond";
import { jwtSign } from "#services/jwt";
import logger from "#services/logger";
import {
  getAlreadyListennedTransactions,
  getLastRestart,
  setAlreadyListennedTransactions,
} from "#services/redis";
import { getHashedPassword, verifyPassword } from "#utils/auth";
import { throwError } from "#utils/http";
import { json } from "#utils/mongoose";
import { generateNewVerificationReference } from "#utils/nanoid";
import poll from "#utils/poll";
import { decodeDataFromTx } from "#utils/transactions";
import { normalizeHerotag } from "#utils/transactions";

import { balanceHandler } from "../blockchain-monitoring";

const STREAM_PARTICLES_ERD_ADDRESS =
  "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm";

export interface UserAccountCreationData {
  herotag: string;
  password: string;
  confirm: string;
}

export interface UserAuthenticationData {
  herotag: string;
  password: string;
}

export const validateAccountCreationData = async (
  data: UserAccountCreationData
): Promise<{ herotag: string; erdAddress: string }> => {
  if (data.password !== data.confirm)
    return throwError(ErrorKinds.PASSWORD_AND_CONFIRM_NOT_MATCHING);

  const normalized = normalizeHerotag(data.herotag as string);
  const erdAddress = await getErdAddress(normalized);

  if (!erdAddress) return throwError(ErrorKinds.COULD_NOT_FIND_HETOTAG_ON_DNS);

  if (
    await User.exists({
      herotag: normalized,
    })
  )
    return throwError(ErrorKinds.ALREADY_REGISTERED_USER);

  return { herotag: normalized, erdAddress };
};

export const createUserAccount = async (
  data: UserAccountCreationData
): Promise<{
  herotag: string;
}> => {
  const { erdAddress, herotag } = await validateAccountCreationData(data);
  const verificationReference = await generateNewVerificationReference();
  const hashedPassword = await getHashedPassword(data.password as string);

  const user = await User.create({
    herotag,
    erdAddress,
    password: hashedPassword,
    verificationReference,
    verificationStartDate: new Date().toISOString(),
    status: UserAccountStatus.PENDING_VERIFICATION,
  });

  return { herotag: user.herotag };
};

export const authenticateUser = async (
  data: UserAuthenticationData
): Promise<{
  user: UserType;
  token: string;
  expiresIn: number;
}> => {
  const user = (await json(
    User.findByHerotag(data.herotag as string)
  )) as UserType;

  if (!user) return throwError(ErrorKinds.NOT_REGISTERED_HEROTAG);

  verifyPassword(data.password as string, user.password as string);

  if (user.status !== UserAccountStatus.VERIFIED)
    return throwError(ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING);

  const expiresIn = 60 * 60 * 48;

  const token = jwtSign(user.herotag, user._id, expiresIn);

  return { user, token: token, expiresIn };
};

export const isProfileVerified = async (
  erdAddress: string
): Promise<{ isStatusVerified: boolean }> => {
  const user = await User.findByErdAddress(erdAddress)
    .select({ status: true })
    .lean();

  return { isStatusVerified: user?.status === UserAccountStatus.VERIFIED };
};

export const getVerificationReference = async (
  erdAddress: string
): Promise<{
  verificationReference: string | null;
  accountStatus: UserAccountStatus | null;
}> => {
  const user = await User.findByErdAddress(erdAddress)
    .select({
      verificationReference: true,
      passwordEditionVerificationReference: true,
      status: true,
    })
    .lean();

  if (user?.status === UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION)
    return {
      verificationReference: user?.passwordEditionVerificationReference || null,
      accountStatus: user?.status || null,
    };

  return {
    verificationReference: user?.verificationReference || null,
    accountStatus: user?.status || null,
  };
};

export const isHerotagValid = async (
  herotag: string
): Promise<{ herotag: string }> => {
  const user = await User.findByHerotag(herotag)
    .select({ herotag: true })
    .lean();

  if (!user) return throwError(ErrorKinds.NOT_REGISTERED_HEROTAG);

  return { herotag: user.herotag };
};

export const validatePasswordEditionData = async (
  data?: UserAccountCreationData
): Promise<void> => {
  if (!data || !data.herotag || !data.password || !data.confirm)
    return throwError(ErrorKinds.MISSING_DATA_FOR_ACCOUNT_CREATION);

  if (data.password !== data.confirm)
    return throwError(ErrorKinds.PASSWORD_AND_CONFIRM_NOT_MATCHING);

  await isHerotagValid(data.herotag);
};

export const editPassword = async (
  data: UserAccountCreationData
): Promise<void> => {
  await validatePasswordEditionData(data);

  const passwordEditionVerificationReference = await generateNewVerificationReference();

  const hashedPassword = getHashedPassword(data.password as string);

  await User.updateOne(
    { herotag: normalizeHerotag(data.herotag as string) },
    {
      pendingPassword: hashedPassword,
      passwordEditionVerificationReference,
      passwordEditionVerificationStartDate: new Date().toISOString(),
      status: UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION,
    }
  );
};

export const deleteAccount = async (
  userId: string,
  password: string
): Promise<void> => {
  const user: UserType | null = await User.findById(userId).lean();

  if (!user) return throwError(ErrorKinds.NOT_REGISTERED_HEROTAG);

  await verifyPassword(password as string, user.password as string);

  await Promise.all([
    Donation.deleteMany({ receiverErdAdress: user.erdAddress }),
    User.deleteOne({ _id: user._id }),
  ]);
};

const transactionsHandler = (lastRestartTimestamp: number) => async () => {
  const transactions = await getLastTransactions(STREAM_PARTICLES_ERD_ADDRESS);

  const last30ListennedTransactions = await getAlreadyListennedTransactions(
    STREAM_PARTICLES_ERD_ADDRESS
  );

  const newTransactions = transactions.filter(
    ({ receiver, timestamp, hash, status }: ElrondTransaction) => {
      return (
        receiver === STREAM_PARTICLES_ERD_ADDRESS &&
        timestamp > lastRestartTimestamp &&
        !last30ListennedTransactions.includes(hash) &&
        status === "success"
      );
    }
  );

  if (!newTransactions.length) return false;

  await setAlreadyListennedTransactions(
    STREAM_PARTICLES_ERD_ADDRESS,
    newTransactions.map(({ hash }) => hash)
  );

  await Promise.all(
    newTransactions.map(async (transaction) => {
      const user = await User.findOne({
        erdAddress: transaction.sender,
      })
        .select({
          herotag: true,
          status: true,
          verificationReference: true,
          passwordEditionVerificationReference: true,
        })
        .lean();

      if (
        user?.status === UserAccountStatus.PENDING_VERIFICATION &&
        decodeDataFromTx(transaction) === user.verificationReference
      ) {
        logger.info("User account creation has been validated.", {
          herotag: user.herotag,
        });

        await User.updateOne(
          { _id: user._id },
          { $set: { status: UserAccountStatus.VERIFIED } }
        );
      }

      if (
        user?.status === UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION &&
        decodeDataFromTx(transaction) ===
          user.passwordEditionVerificationReference
      ) {
        logger.info("User account password edition has been validated.", {
          herotag: user.herotag,
        });

        await User.updateOne({ _id: user._id }, [
          {
            $set: {
              status: UserAccountStatus.VERIFIED,
              password: "$pendingPassword",
            },
          },
          {
            $unset: [
              "pendingPassword",
              "passwordEditionVerificationReference",
              "passwordEditionVerificationStartDate",
            ],
          },
        ]);
      }
    })
  );

  return false;
};

export const validateAuthenticationDataFromTransaction = async (): Promise<void> => {
  const lastRestartTimestamp = await getLastRestart();

  const handleTransactionsOnStreamParticleHerotag = transactionsHandler(
    lastRestartTimestamp
  );
  const handleBalance = balanceHandler(
    STREAM_PARTICLES_ERD_ADDRESS,
    handleTransactionsOnStreamParticleHerotag
  );

  logger.info(
    "Start polling streamParticles balance to verify accounts statuses"
  );
  poll(handleBalance, 15000, () => false);
};

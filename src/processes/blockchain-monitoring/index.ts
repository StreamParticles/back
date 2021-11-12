import {
  ElrondTransaction,
  LastSnapshotBalance,
  UserType,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";

import User, { UserMongooseDocument } from "#models/User";
import { getLastTransactions, getUpdatedBalance } from "#services/elrond";
import logger from "#services/logger";
import {
  getAlreadyListennedTransactions,
  getLastBalanceSnapShot,
  getLastRestart,
  setAlreadyListennedTransactions,
  setNewBalance,
} from "#services/redis";
import poll from "#utils/poll";

import { reactToManyTransactions } from "../blockchain-interaction";

export const filterNewIncomingTransactions = (
  transactions: ElrondTransaction[],
  user: UserType,
  last30ListennedTransactions: string[],
  lastRestartTimestamp: number
): ElrondTransaction[] => {
  const isTimestampOk = (timestamp: number) =>
    timestamp > lastRestartTimestamp &&
    user?.streamingStartDate &&
    timestamp > Math.ceil(new Date(user?.streamingStartDate).getTime() * 0.001);

  const isSenderBanned = (sender: string) => {
    return (user?.moderation?.bannedAddresses || []).some(
      (address) => address === sender
    );
  };

  // Filters below are also taken into account in reactToNewTransaction fn
  // decoded data should not include banned words
  // transaction amount should be above minimum amount set up by the user
  // transaction herotag should not be banned by the user
  return transactions.filter(
    ({ receiver, timestamp, hash, status, sender }: ElrondTransaction) => {
      return (
        !isSenderBanned(sender) &&
        receiver === user.erdAddress &&
        isTimestampOk(timestamp) &&
        !last30ListennedTransactions.includes(hash) &&
        status === "success"
      );
    }
  );
};

export interface HandleTransactionFn {
  (): Promise<boolean>;
}

export const transactionsHandler = (
  userId: Id,
  lastRestartTimestamp: number
): HandleTransactionFn => {
  return async (): Promise<boolean> => {
    const user = await User.findById(userId).lean();

    if (!user?.erdAddress) return true;

    const transactions = await getLastTransactions(user.erdAddress);

    const last30ListennedTransactions = await getAlreadyListennedTransactions(
      user.erdAddress
    );

    const newTransactions = filterNewIncomingTransactions(
      transactions,
      user,
      last30ListennedTransactions,
      lastRestartTimestamp
    );

    if (!newTransactions.length) return false;

    await setAlreadyListennedTransactions(
      user.erdAddress,
      newTransactions.map(({ hash }) => hash)
    );

    reactToManyTransactions(newTransactions, user);

    return false;
  };
};

interface HandleBalanceFn {
  (): Promise<void>;
}

export const balanceHandler = (
  erdAddress: string,
  handleTransactions: HandleTransactionFn
): HandleBalanceFn => async () => {
  const newBalance = await getUpdatedBalance(erdAddress);

  if (!newBalance) return;

  const lastSnapshotBalance: LastSnapshotBalance | null = await getLastBalanceSnapShot(
    erdAddress
  );

  if (!lastSnapshotBalance?.amount) {
    await setNewBalance(erdAddress, newBalance);

    return;
  }

  if (newBalance !== lastSnapshotBalance?.amount)
    await setNewBalance(erdAddress, String(newBalance));

  if (newBalance > lastSnapshotBalance?.amount)
    await poll(null, 10000, handleTransactions, 60000);
};

export const monitorBlockChain = async (
  erdAddress: string,
  user: UserType
): Promise<string> => {
  const lastRestartTimestamp = await getLastRestart();

  const handleTransactions = transactionsHandler(
    user._id,
    lastRestartTimestamp
  );

  const handleBalance = balanceHandler(erdAddress, handleTransactions);

  const shouldStopPolling = async () => {
    const currentUser = await User.findById(user._id)
      .select({
        isStreaming: true,
      })
      .lean();

    return !currentUser?.isStreaming;
  };

  poll(handleBalance, 10000, shouldStopPolling);

  return user.herotag as string;
};

export const toggleBlockchainMonitoring = async (
  userId: Id,
  isStreaming: boolean
): Promise<UserMongooseDocument | void> => {
  const user: UserMongooseDocument | null = await User.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        isStreaming,
        streamingStartDate: isStreaming ? new Date() : null,
      },
    },
    { new: true }
  ).lean();

  if (!user?.erdAddress) return;

  if (isStreaming) {
    // Set updpated balance before monitoring the blockchain
    const newBalance = await getUpdatedBalance(user.erdAddress);
    await setNewBalance(user.erdAddress, newBalance);

    logger.info("Starting monitoring blockchain for user", {
      herotag: user.herotag,
    });

    await monitorBlockChain(user.erdAddress, user);
  }

  return user;
};

/**
 * This function restore the blockchain monitoring for a given user
 * @param user UserType the user for who we want to monitor the blockchain
 * @returns
 */
const resumeBlockchainMonitoringForUser = async (
  user: UserType
): Promise<string | null> => {
  if (!user.herotag) {
    logger.error("UNABLE_TO_LAUCH_BC_MONITORING - NO HEROTAG", {
      userId: user._id,
    });
    return null;
  }

  if (!user?.erdAddress) {
    logger.error("UNABLE_TO_LAUCH_BC_MONITORING - NO ERD ADDRESS", {
      herotag: user.herotag,
    });
    return null;
  }

  const newBalance = await getUpdatedBalance(user.erdAddress);

  if (!newBalance) {
    logger.error("UNABLE_TO_LAUCH_BC_MONITORING - NO NEW BALANCE", {
      herotag: user.herotag,
    });
    return null;
  }

  try {
    await setNewBalance(user.erdAddress, newBalance);

    logger.info("Resuming blockchain monitoring for user", {
      herotag: user.herotag,
    });
    const launchedUser = await monitorBlockChain(user.erdAddress, user);

    return launchedUser;
  } catch (error) {
    logger.error("UNABLE_TO_LAUCH_BC_MONITORING", {
      herotag: user.herotag,
    });
    return null;
  }
};

/**
 * This function restore the blockchain monitoring for every users that have streaming activated
 * Usefull when restarting the server
 * @returns Promise<string[]>
 */
export const resumeBlockchainMonitoring = async (): Promise<string[]> => {
  const usersToPoll = await User.find({ isStreaming: true }).lean();

  const users = await Promise.all(
    usersToPoll.map(resumeBlockchainMonitoringForUser)
  );

  const launchedUsers = users.filter(Boolean) as string[];

  return launchedUsers;
};

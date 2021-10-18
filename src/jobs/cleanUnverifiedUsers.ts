import { UserAccountStatus } from "@streamparticles/lib";
import sub from "date-fns/sub";

import User from "#models/User";
import logger from "#services/logger";

export const cleanUnverifiedUserAccount = async (): Promise<void> => {
  logger.info({ data: "Start cleaning unverified accounts" });

  const result = await User.deleteMany({
    status: UserAccountStatus.PENDING_VERIFICATION,
    verificationStartDate: {
      $lt: sub(new Date(), { minutes: 10 }).toISOString(),
    },
  });

  logger.info({ data: "Unverified user accounts cleaned", ...result });
};

// TODO : be fault tolerant by running a child process instead of main job
const main = (): void => {
  setInterval(async () => {
    await cleanUnverifiedUserAccount();
  }, 1000 * 60 * 10);
};

export default main;

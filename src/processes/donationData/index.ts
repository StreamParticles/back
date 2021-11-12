import { ErrorKinds } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";

import User from "#models/User";
import { error } from "#utils/http";

export const getDonationGoalSentAmount = async (
  herotag: string
): Promise<number> => {
  const user = await User.findByHerotag(herotag)
    .select({ donationData: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const currentSentAmount =
    user?.donationData?.donationGoal?.sentAmountAtDate || 0;

  return currentSentAmount;
};

export const resetDonationGoal = async (userId: Id): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        "donationData.donationGoal": {
          sentAmountAtDate: 0,
          lastResetDate: new Date(),
        },
      },
    }
  );
};

export const incrementDonationGoalSentAmount = async (
  userId: Id,
  amount: number
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ donationData: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const currentSentAmount =
    user?.donationData?.donationGoal?.sentAmountAtDate || 0;

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        "donationData.donationGoal.sentAmountAtDate":
          currentSentAmount + amount,
      },
    }
  );
  return;
};

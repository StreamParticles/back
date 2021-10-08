import { Id } from "@streamparticles/lib/out/types/mongoose";

import User from "#models/User";

export const getDonationGoalSentAmount = async (
  userId: Id
): Promise<number> => {
  const user = await User.findById(userId)
    .select({ donationData: true })
    .orFail(new Error("User not found"))
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
    .orFail(new Error("User not found"))
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

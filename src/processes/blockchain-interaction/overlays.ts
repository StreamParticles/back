import { EventData, UserType } from "@streamparticles/lib";

import { publisher } from "#services/redis";

export const triggerOverlaysEvent = async (
  eventData: EventData,
  user: UserType
): Promise<void> => {
  await publisher.publish(
    "DONATION",
    JSON.stringify({
      room: user.herotag,
      herotag: eventData.herotag,
      amount: eventData.amount,
      wordingAmount: eventData.wordingAmount,
      message: eventData.data,
    })
  );
};

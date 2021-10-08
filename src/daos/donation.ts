import Donation from "#models/Donation";
import { DonationType, EventData, UserType } from "@streamparticles/lib";

export const createDonation = async (
  formattedData: EventData,
  receiver: UserType,
  senderErdAdress: string,
  transactionTimestamp: number,
  isAllowed: boolean
): Promise<DonationType> => {
  const createdDonation = await Donation.create({
    senderErdAdress,
    receiverErdAdress: receiver.erdAddress,
    receiverHerotag: receiver.herotag,
    receiverUserId: receiver._id,
    amount: formattedData.amount,
    data: formattedData.data,
    timestamp: transactionTimestamp,
    ...(formattedData?.herotag && { senderHerotag: formattedData.herotag }),
    isAllowed,
  });

  return createdDonation;
};

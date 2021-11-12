import {
  DonationRecap,
  DonationType,
  PaginatedResult,
  PaginationSettings,
  TopDonator,
} from "@streamparticles/lib";
import isAfter from "date-fns/isAfter";
import startOfMonth from "date-fns/startOfMonth";
import Decimal from "decimal.js";

import Donation from "#models/Donation";
import User from "#models/User";
import * as mongooseAggregate from "#utils/mongoose";

export const getLastDonators = async (
  herotag: string,
  pagination?: PaginationSettings
): Promise<PaginatedResult<DonationType>> => {
  return Donation.find({ receiverHerotag: herotag })
    .sort({ timestamp: -1 })
    .paginate(pagination);
};

const getUserStreamingStartDate = async (
  herotag: string
): Promise<Date | null> => {
  const user = await User.findByHerotag(herotag)
    .select({ streamingStartDate: true })
    .lean();

  return user?.streamingStartDate || null;
};

export const getTopDonators = async (
  receiverHerotag: string,
  pagination?: PaginationSettings
): Promise<PaginatedResult<TopDonator>> => {
  const pipeline = [
    {
      $match: { receiverHerotag },
    },
    {
      $group: {
        _id: "$senderErdAdress",
        totalDonated: { $sum: "$amount" },
        senderHerotag: { $first: "$senderHerotag" },
        receiverHerotag: { $first: "$receiverHerotag" },
        receiverErdAdress: { $first: "$receiverErdAdress" },
        from: { $min: "$timestamp" },
        to: { $max: "$timestamp" },
      },
    },
    {
      $project: {
        totalDonated: 1,
        senderHerotag: 1,
        receiverHerotag: 1,
        receiverErdAdress: 1,
        senderErdAdress: "$_id",
        period: {
          from: "$from",
          to: "$to",
        },
      },
    },
    { $sort: { totalDonated: -1, timestamp: -1 } },
  ];

  const result: PaginatedResult<TopDonator> = await mongooseAggregate.paginate(
    Donation,
    pipeline,
    pagination
  );

  return {
    ...result,
    items: result.items.map(({ totalDonated, ...rest }) => ({
      ...rest,
      totalDonated: Math.round(totalDonated * 100) / 100,
    })),
  };
};

const computeTotalDonated = (donations: DonationType[]) =>
  Number(
    donations.reduce((acc, { amount }) => acc.plus(amount || 0), new Decimal(0))
  );

export const getDonationsRecap = async (
  receiverHerotag: string
): Promise<DonationRecap> => {
  const streamingStartDate = await getUserStreamingStartDate(receiverHerotag);

  const donations = await Donation.find({ receiverHerotag })
    .sort({ timestamp: 1 })
    .lean();

  const donationsThisMonth = donations.filter((donation) =>
    isAfter(new Date(donation.timestamp), startOfMonth(new Date()))
  );

  const donationsThisStream = streamingStartDate
    ? donations.filter((donation) =>
        isAfter(new Date(donation.timestamp), streamingStartDate)
      )
    : [];

  return {
    allTime: computeTotalDonated(donations),
    thisMonth: computeTotalDonated(donationsThisMonth),
    thisStream: computeTotalDonated(donationsThisStream),
  };
};

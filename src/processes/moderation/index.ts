import { ErrorKinds } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { uniq } from "lodash";

import User from "#models/User";
import { error } from "#utils/http";

export const addBannedWord = async (
  userId: Id,
  wordToAdd: string
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ moderation: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const bannedWords = user?.moderation?.bannedWords || [];

  const newBannedWords = uniq([...bannedWords, wordToAdd]);

  await User.updateOne(
    { _id: userId },
    { $set: { "moderation.bannedWords": newBannedWords } }
  );
};

export const addBannedAddress = async (
  userId: Id,
  addressToAdd: string
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ moderation: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const bannedAddresses = user?.moderation?.bannedAddresses || [];

  const newBannedAddresses = uniq([...bannedAddresses, addressToAdd]);

  await User.updateOne(
    { _id: userId },
    { $set: { "moderation.bannedAddresses": newBannedAddresses } }
  );
};

export const addVipAddress = async (
  userId: Id,
  addressToAdd: string
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ moderation: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const vipAddresses = user?.moderation?.vipAddresses || [];

  const newVipAddresses = uniq([...vipAddresses, addressToAdd]);

  await User.updateOne(
    { _id: userId },
    { $set: { "moderation.vipAddresses": newVipAddresses } }
  );
};

export const removeBannedWord = async (
  userId: Id,
  wordToRemove: string
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ moderation: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const bannedWords = user?.moderation?.bannedWords || [];

  const newBannedWords = bannedWords.filter((word) => word !== wordToRemove);

  await User.updateOne(
    { _id: userId },
    { $set: { "moderation.bannedWords": newBannedWords } }
  );
};

export const removeBannedAddress = async (
  userId: Id,
  addressToRemove: string
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ moderation: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const bannedAddresses = user?.moderation?.bannedAddresses || [];

  const newBannedAddresses = bannedAddresses.filter(
    (word) => word !== addressToRemove
  );

  await User.updateOne(
    { _id: userId },
    { $set: { "moderation.bannedAddresses": newBannedAddresses } }
  );
};

export const removeVipAddress = async (
  userId: Id,
  addressToRemove: string
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ moderation: true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const vipAddresses = user?.moderation?.vipAddresses || [];

  const newVipAddresses = vipAddresses.filter(
    (word) => word !== addressToRemove
  );

  await User.updateOne(
    { _id: userId },
    { $set: { "moderation.vipAddresses": newVipAddresses } }
  );
};

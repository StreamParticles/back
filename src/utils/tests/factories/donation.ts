import { DonationType } from "@streamparticles/lib";
import mongoose from "mongoose";

import Donation from "#models/Donation";

import { fakeHerotag, fakeHex, fakeTimestamp, fakeValue } from "../fake";

export const build = (overload?: Partial<DonationType>): DonationType => {
  return {
    _id: mongoose.Types.ObjectId(),
    senderHerotag: fakeHex(),
    senderErdAdress: fakeHex(),
    receiverUserId: mongoose.Types.ObjectId(),
    receiverHerotag: fakeHerotag(),
    receiverErdAdress: fakeHex(),
    amount: Number(fakeValue()),
    timestamp: fakeTimestamp(),
    isAllowed: true,
    isVisible: true,
    ...overload,
  };
};

export const create = async (
  overload?: Partial<DonationType>
): Promise<DonationType> => {
  const data = build(overload);

  const created = await Donation.create(data);

  return created.toObject();
};

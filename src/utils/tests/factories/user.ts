import { UserAccountStatus, UserType } from "@streamparticles/lib";
import faker from "faker";
import mongoose from "mongoose";

import User from "#models/User";
import { getHashedPassword } from "#utils/auth";

import { fakeHerotag } from "../fake";

const targetErdAdress =
  "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm";

export const build = (overload?: Partial<UserType>): UserType => {
  return {
    _id: mongoose.Types.ObjectId(),
    herotag: fakeHerotag(),
    password: getHashedPassword(faker.internet.password()),
    erdAddress: targetErdAdress,
    status: UserAccountStatus.VERIFIED,
    verificationStartDate: new Date(faker.date.recent()).toISOString(),
    verificationReference: faker.datatype.hexaDecimal(6).toUpperCase(),
    isStreaming: true,
    streamingStartDate: new Date(faker.date.recent()),
    ...overload,
    integrations: {
      ...overload?.integrations,
    },
  };
};

export const create = async (
  overload?: Partial<UserType>
): Promise<UserType> => {
  const user = await User.create(build(overload));

  return user.toObject();
};

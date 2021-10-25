import { IftttConfig, UserType } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { nanoid } from "nanoid";

import User from "#models/User";
import { json } from "#utils/mongoose";

export const toggleIftttParticle = async (
  userId: Id,
  activate: boolean
): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    { $set: { "integrations.ifttt.isActive": activate } }
  );
};

export const updateIftttParticleData = async (
  userId: Id,
  data: IftttConfig
): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        ...(data.triggerKey && {
          "integrations.ifttt.triggerKey": data.triggerKey,
        }),
        ...(data.eventName && {
          "integrations.ifttt.eventName": data.eventName,
        }),
      },
    }
  );
};

export const updateMinimumRequiredAmount = async (
  userId: Id,
  minimumRequiredAmount: number
): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        "integrations.minimumRequiredAmount": minimumRequiredAmount,
      },
    }
  );
};

export const updateTinyAmountsWording = async (
  userId: Id,
  ceilAmount: number,
  wording: string
): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        "integrations.tinyAmountWording": {
          ceilAmount: Number(ceilAmount),
          wording,
        },
      },
    }
  );
};

export const updateViewerOnboardingData = async (
  userId: Id,
  referralLink: string,
  herotagQrCodePath?: string
): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        referralLink: referralLink,
        herotagQrCodePath: herotagQrCodePath,
      },
    }
  );
};

export const getViewerOnboardingData = async (
  userId: Id
): Promise<UserType | null> => {
  return json(
    User.findById(userId).select({
      referralLink: true,
      herotagQrCodePath: true,
    })
  );
};

export const getUserData = async (userId: Id): Promise<UserType | null> => {
  return json(User.findById(userId));
};

export const updateUserWebhooks = async (
  userId: Id,
  webhooks: string[]
): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    { $set: { "integrations.webhooks": webhooks } }
  );
};

export const generateNewApiKey = async (userId: Id): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    { $set: { "integrations.apiKey": nanoid(24) } }
  );
};

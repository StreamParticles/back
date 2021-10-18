import { Response } from "express";

import * as moderationProcesses from "#processes/moderation";
import { AuthenticatedRequest } from "#types_/express";

export interface AddBannedWordRequestBody {
  wordToAdd: string;
}

export const addBannedWord = async (
  req: AuthenticatedRequest<{}, {}, AddBannedWordRequestBody>,
  res: Response
): Promise<void> => {
  const { wordToAdd } = req.body;

  await moderationProcesses.addBannedWord(req.userId as string, wordToAdd);

  res.sendStatus(201);
};

export interface AddAddressRequestBody {
  addressToAdd: string;
}

export const addBannedAddress = async (
  req: AuthenticatedRequest<{}, {}, AddAddressRequestBody>,
  res: Response
): Promise<void> => {
  const { addressToAdd } = req.body;

  await moderationProcesses.addBannedAddress(
    req.userId as string,
    addressToAdd
  );

  res.sendStatus(201);
};

export const addVipAddress = async (
  req: AuthenticatedRequest<{}, {}, AddAddressRequestBody>,
  res: Response
): Promise<void> => {
  const { addressToAdd } = req.body;

  await moderationProcesses.addVipAddress(req.userId as string, addressToAdd);

  res.sendStatus(201);
};

export interface RemoveBannedWordRequestBody {
  wordToRemove: string;
}

export const removeBannedWord = async (
  req: AuthenticatedRequest<{}, {}, RemoveBannedWordRequestBody>,
  res: Response
): Promise<void> => {
  const { wordToRemove } = req.body;

  await moderationProcesses.removeBannedWord(
    req.userId as string,
    wordToRemove
  );

  res.sendStatus(201);
};

export interface RemoveAddressRequestBody {
  addressToRemove: string;
}

export const removeBannedAddress = async (
  req: AuthenticatedRequest<{}, {}, RemoveAddressRequestBody>,
  res: Response
): Promise<void> => {
  const { addressToRemove } = req.body;

  await moderationProcesses.removeBannedAddress(
    req.userId as string,
    addressToRemove
  );

  res.sendStatus(201);
};

export const removeVipAddress = async (
  req: AuthenticatedRequest<{}, {}, RemoveAddressRequestBody>,
  res: Response
): Promise<void> => {
  const { addressToRemove } = req.body;

  await moderationProcesses.removeVipAddress(
    req.userId as string,
    addressToRemove
  );

  res.sendStatus(201);
};

import { MockedElrondTransaction } from "@streamparticles/lib";
import { Request, Response } from "express";

import * as blockchainInteractionProcesses from "#processes/blockchain-interaction";
import * as blockchainMonitoringProcesses from "#processes/blockchain-monitoring";
import * as donationDataProcesses from "#processes/donationData";
import * as userProcesses from "#processes/user";
import { AuthenticatedRequest } from "#types_/express";
import * as utilEgldPrice from "#utils/price";

export const getUserData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const user = await userProcesses.getUserData(req.userId as string);

  res.send(user);
};

export interface ToggleMonitoringRequestBody {
  isStreaming: boolean;
}

export const toggleBlockchainMonitoring = async (
  req: AuthenticatedRequest<{}, {}, ToggleMonitoringRequestBody>,
  res: Response
): Promise<void> => {
  await blockchainMonitoringProcesses.toggleBlockchainMonitoring(
    req.userId as string,
    req.body.isStreaming
  );

  res.sendStatus(204);
};

export interface TriggerFakeEventRequestBody {
  data: MockedElrondTransaction;
}

export const triggerFakeEvent = async (
  req: AuthenticatedRequest<{}, {}, TriggerFakeEventRequestBody>,
  res: Response
): Promise<void> => {
  await blockchainInteractionProcesses.triggerFakeEvent(
    req.userId as string,
    req.body.data
  );

  res.sendStatus(204);
};

export interface UpdateMinRequiredAmountRequestBody {
  minimumRequiredAmount: number;
}

export const updateMinimumRequiredAmount = async (
  req: AuthenticatedRequest<{}, {}, UpdateMinRequiredAmountRequestBody>,
  res: Response
): Promise<void> => {
  await userProcesses.updateMinimumRequiredAmount(
    req.userId as string,
    req.body.minimumRequiredAmount
  );

  res.sendStatus(204);
};

export interface UpdateTinyAmountsWordingRequestBody {
  ceilAmount: number;
  wording: string;
}

export const updateTinyAmountsWording = async (
  req: AuthenticatedRequest<{}, {}, UpdateTinyAmountsWordingRequestBody>,
  res: Response
): Promise<void> => {
  await userProcesses.updateTinyAmountsWording(
    req.userId as string,
    req.body.ceilAmount,
    req.body.wording
  );

  res.sendStatus(204);
};

export interface UpdateOnboardingDataRequestBody {
  referralLink: string;
  herotagQrCodePath: string;
}

export const updateViewerOnboardingData = async (
  req: AuthenticatedRequest<{}, {}, UpdateOnboardingDataRequestBody>,
  res: Response
): Promise<void> => {
  await userProcesses.updateViewerOnboardingData(
    req.userId as string,
    req.body.referralLink,
    req.body.herotagQrCodePath
  );

  res.sendStatus(204);
};

export const getViewerOnboardingData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const user = await userProcesses.getViewerOnboardingData(
    req.userId as string
  );

  res.send({
    referralLink: user?.referralLink,
    herotagQrCodePath: user?.herotagQrCodePath,
  });
};

export const getEgldPrice = async (
  req: Request,
  res: Response
): Promise<void> => {
  const price = await utilEgldPrice.getEgldPrice();

  res.send({ price });
};

export const resetDonationGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  await donationDataProcesses.resetDonationGoal(req.userId as string);

  res.sendStatus(201);
};

export const getDonationGoalSentAmount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const sentAmount = await donationDataProcesses.getDonationGoalSentAmount(
    req.userId as string
  );

  res.send({ sentAmount });
};

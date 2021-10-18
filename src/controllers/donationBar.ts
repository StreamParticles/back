import { DonationBar } from "@streamparticles/lib";
import { Response } from "express";

import * as donationBarProcesses from "#processes/donationBar";
import { AuthenticatedRequest } from "#types_/express";

export interface DonationBarRequestParams {
  overlayId: string;
  widgetDataId: string;
}

export const getDonationBar = async (
  req: AuthenticatedRequest<DonationBarRequestParams>,
  res: Response
): Promise<void> => {
  const result = await donationBarProcesses.getDonationBar(
    req.userId as string,
    req.params.overlayId,
    req.params.widgetDataId
  );

  res.send(result);
};

export interface UpdateDonationBarRequestBody {
  overlayId: string;
  widgetDataId: string;
  donationBar: DonationBar;
}

export const updateDonationBar = async (
  req: AuthenticatedRequest<{}, {}, UpdateDonationBarRequestBody>,
  res: Response
): Promise<void> => {
  await donationBarProcesses.updateDonationBar(
    req.userId as string,
    req.body.overlayId,
    req.body.widgetDataId,
    req.body.donationBar
  );

  res.sendStatus(201);
};

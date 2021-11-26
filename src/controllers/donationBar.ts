import { DonationBar } from "@streamparticles/lib";
import { Response } from "express";

import * as donationBarProcesses from "#processes/donationBar";
import { AuthenticatedRequest } from "#types_/express";

export interface DonationBarRequestParams {
  widgetDataId: string;
}

export const getDonationBar = async (
  req: AuthenticatedRequest<DonationBarRequestParams>,
  res: Response
): Promise<void> => {
  const { widgetDataId } = req.params;

  const result = await donationBarProcesses.getDonationBar(
    req.userId as string,
    widgetDataId
  );

  res.send(result);
};

export interface UpdateDonationBarRequestBody {
  widgetDataId: string;
  donationBar: DonationBar;
}

export const updateDonationBar = async (
  req: AuthenticatedRequest<{}, {}, UpdateDonationBarRequestBody>,
  res: Response
): Promise<void> => {
  const { widgetDataId, donationBar } = req.body;

  await donationBarProcesses.updateDonationBar(
    req.userId as string,
    widgetDataId,
    donationBar
  );

  res.sendStatus(201);
};

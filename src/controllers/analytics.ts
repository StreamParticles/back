import {
  PaginatedResult,
  PaginationSettings,
  TopDonator,
} from "@streamparticles/lib";
import { Response } from "express";

import * as donationsListingProcesses from "#processes/analytics";
import { AuthenticatedRequest } from "#types_/express";

const DEFAULT_PAGINATION = {
  page: 0,
  itemsPerPage: 10,
};

export type DonationRequest = AuthenticatedRequest<
  {},
  {
    pagination: PaginationSettings;
  }
>;

export const getLastDonators = async (
  req: DonationRequest,
  res: Response
): Promise<void> => {
  const receiverHerotag = req.herotag as string;

  const { pagination: { page, itemsPerPage } = DEFAULT_PAGINATION } = req.query;

  const result = await donationsListingProcesses.getLastDonators(
    receiverHerotag,
    { page: Number(page || 0), itemsPerPage: Number(itemsPerPage || 10) }
  );

  res.send(result);
};

export const getTopDonators = async (
  req: DonationRequest,
  res: Response<PaginatedResult<TopDonator>>
): Promise<void> => {
  const receiverHerotag = req.herotag as string;

  const { pagination: { page, itemsPerPage } = DEFAULT_PAGINATION } = req.query;

  const result = await donationsListingProcesses.getTopDonators(
    receiverHerotag,
    { page: Number(page || 0), itemsPerPage: Number(itemsPerPage || 10) }
  );

  res.send(result);
};

export const getDonationRecap = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const receiverHerotag = req.herotag as string;

  const result = await donationsListingProcesses.getDonationsRecap(
    receiverHerotag
  );

  res.send(result);
};

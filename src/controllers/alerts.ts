import { AlertVariation } from "@streamparticles/lib";
import { Response } from "express";

import * as alertProcesses from "#processes/alerts";
import { AuthenticatedRequest } from "#types_/express";

export interface CreateAlertVariationRequestBody {
  widgetId: string;
}

export const createAlertVariation = async (
  req: AuthenticatedRequest<{}, {}, CreateAlertVariationRequestBody>,
  res: Response
): Promise<void> => {
  await alertProcesses.createAlertVariation(
    req.userId as string,
    req.body.widgetId
  );

  res.sendStatus(204);
};

export interface GetAlertVariationRequestParams {
  widgetId: string;
  variationId: string;
}

export const getAlertVariation = async (
  req: AuthenticatedRequest<GetAlertVariationRequestParams>,
  res: Response
): Promise<void> => {
  const result = await alertProcesses.getAlertVariation(
    req.userId as string,
    req.params.widgetId,
    req.params.variationId
  );

  res.send(result);
};

export interface UpdateAlertVariationRequestBody {
  widgetId: string;
  variationId: string;
  variation: AlertVariation;
}

export const updateAlertVariation = async (
  req: AuthenticatedRequest<{}, {}, UpdateAlertVariationRequestBody>,
  res: Response
): Promise<void> => {
  const result = await alertProcesses.updateAlertVariation(
    req.userId as string,
    req.body.widgetId,
    req.body.variationId,
    req.body.variation
  );

  res.send(result);
};

export interface DeleteAlertVariationRequestParams {
  widgetId: string;
  variationId: string;
}

export const deleteAlertVariation = async (
  req: AuthenticatedRequest<DeleteAlertVariationRequestParams>,
  res: Response
): Promise<void> => {
  const result = await alertProcesses.deleteAlertVariation(
    req.userId as string,
    req.params.widgetId,
    req.params.variationId
  );

  res.send(result);
};

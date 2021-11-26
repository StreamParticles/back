import { WidgetPosition, WidgetsKinds } from "@streamparticles/lib";
import { Request, Response } from "express";

import * as overlaysProcesses from "#processes/overlays";
import { AuthenticatedRequest } from "#types_/express";

/** OVERLAY */

export const createOverlay = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  await overlaysProcesses.createOverlay(req.userId as string);

  res.sendStatus(201);
};

export interface OverlayRequestParams {
  overlayId: string;
}

export const getOverlay = async (
  req: AuthenticatedRequest<OverlayRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayId } = req.params;

  const overlay = await overlaysProcesses.getOverlay(
    req.userId as string,
    overlayId
  );

  res.send(overlay || null);
};

export const deleteOverlay = async (
  req: AuthenticatedRequest<OverlayRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayId } = req.params;

  await overlaysProcesses.deleteOverlay(req.userId as string, overlayId);

  res.sendStatus(204);
};

export interface UpdateOverlayNameRequestBody extends OverlayRequestParams {
  overlayName: string;
}

export const updateOverlayName = async (
  req: AuthenticatedRequest<{}, {}, UpdateOverlayNameRequestBody>,
  res: Response
): Promise<void> => {
  const { overlayId, overlayName } = req.body;

  await overlaysProcesses.updateOverlayName(
    req.userId as string,
    overlayId,
    overlayName
  );

  res.sendStatus(204);
};

export interface UpdateOverlayWidgetsPositionsRequestBody
  extends OverlayRequestParams {
  widgetsPositions: WidgetPosition[];
}

export const updateOverlayWidgetsPositions = async (
  req: AuthenticatedRequest<{}, {}, UpdateOverlayWidgetsPositionsRequestBody>,
  res: Response
): Promise<void> => {
  const { widgetsPositions } = req.body;

  await overlaysProcesses.updateWidgetsPositions(
    req.userId as string,
    widgetsPositions
  );

  res.sendStatus(204);
};

/** OVERLAY BY LINK */

export interface OverlayByLinkRequestParams {
  overlayLink: string;
}

export const getOverlayByGeneratedLink = async (
  req: Request<OverlayByLinkRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayLink } = req.params;

  const overlay = await overlaysProcesses.getOverlayByGeneratedLink(
    overlayLink
  );

  res.send(overlay || null);
};

export const getOverlayFonts = async (
  req: Request<OverlayByLinkRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayLink } = req.params;

  const fonts = await overlaysProcesses.getOverlayFonts(overlayLink);

  res.send(fonts);
};

/** WIDGET */

export interface CreateWidgetRequestBody {
  overlayId: string;
  widgetKind: WidgetsKinds;
}

export const createWidget = async (
  req: AuthenticatedRequest<{}, {}, CreateWidgetRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.createWidget(
    req.userId as string,
    req.body.overlayId,
    req.body.widgetKind
  );

  res.sendStatus(204);
};

export interface WidgetRequestParams {
  widgetId: string;
}

export const getWidget = async (
  req: AuthenticatedRequest<WidgetRequestParams, {}, {}>,
  res: Response
): Promise<void> => {
  const { widgetId } = req.params;

  const widgets = await overlaysProcesses.getWidget(widgetId);

  res.send(widgets);
};

export const deleteWidget = async (
  req: AuthenticatedRequest<WidgetRequestParams, {}, {}>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.deleteWidget(
    req.userId as string,
    req.params.widgetId
  );

  res.sendStatus(204);
};

export interface UpdateWidgetNameRequestBody {
  widgetId: string;
  widgetName: string;
}

export const updateWidgetName = async (
  req: AuthenticatedRequest<{}, {}, UpdateWidgetNameRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.updateWidgetName(
    req.userId as string,
    req.body.widgetId,
    req.body.widgetName
  );

  res.sendStatus(204);
};

export interface DuplicateWidgetRequestBody {
  widgetId: string;
  destOverlay: string;
}

export const duplicateWidget = async (
  req: AuthenticatedRequest<{}, {}, DuplicateWidgetRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.duplicateWidget(
    req.userId as string,
    req.body.widgetId,
    req.body.destOverlay
  );

  res.sendStatus(204);
};

export interface DuplicateVariationRequestBody {
  widgetId: string;
  variationId: string;
  destWidget: string;
}

export const duplicateVariation = async (
  req: AuthenticatedRequest<{}, {}, DuplicateVariationRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.duplicateVariation(
    req.userId as string,
    req.body.widgetId,
    req.body.variationId,
    req.body.destWidget
  );

  res.sendStatus(204);
};

export const getUserOverlays = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const overlays = await overlaysProcesses.getManyUserOverlays(
    req.userId as string
  );

  res.send(overlays);
};

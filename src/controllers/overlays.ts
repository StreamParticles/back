import { WidgetPosition, WidgetsKinds } from "@streamparticles/lib";
import { Request, Response } from "express";

import * as overlaysProcesses from "#processes/overlays";
import { AuthenticatedRequest } from "#types_/express";

//#region OVERLAYS
export const createOneOverlay = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  await overlaysProcesses.createOverlay(req.userId as string);

  res.sendStatus(204);
};

export interface OverlayRequestParams {
  overlayId: string;
}

export const getUserOverlay = async (
  req: Request<OverlayRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayId } = req.params;

  const overlay = await overlaysProcesses.getUserOverlay(overlayId);

  res.send(overlay || null);
};

export interface OverlayByLinkRequestParams {
  overlayLink: string;
}

export const getUserOverlayByGeneratedLink = async (
  req: Request<OverlayByLinkRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayLink } = req.params;

  const overlay = await overlaysProcesses.getUserOverlayByGeneratedLink(
    overlayLink
  );

  res.send(overlay || null);
};

export const getManyUserOverlays = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const overlays = await overlaysProcesses.getManyUserOverlays(
    req.userId as string
  );

  res.send(overlays);
};

export const getOverlayFonts = async (
  req: Request<OverlayByLinkRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayLink } = req.params;

  const fonts = await overlaysProcesses.getOverlayFonts(overlayLink);

  res.send(fonts);
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
  const { overlayId, widgetsPositions } = req.body;

  await overlaysProcesses.updateOverlayWidgetsPositions(
    req.userId as string,
    overlayId,
    widgetsPositions
  );

  res.sendStatus(204);
};

export const deleteOverlay = async (
  req: AuthenticatedRequest<OverlayRequestParams>,
  res: Response
): Promise<void> => {
  const { overlayId } = req.params;

  await overlaysProcesses.deleteOverlay(req.userId as string, overlayId);

  res.sendStatus(204);
};

//#endregion

//#region OVERLAY WIDGETS
export interface AddOverlayWidgetRequestBody {
  overlayId: string;
  widgetKind: WidgetsKinds;
}

export const addOverlayWidget = async (
  req: AuthenticatedRequest<{}, {}, AddOverlayWidgetRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.addOverlayWidget(
    req.userId as string,
    req.body.overlayId,
    req.body.widgetKind
  );

  res.sendStatus(204);
};

export interface OverlayWidgetRequestParams {
  overlayId: string;
  widgetId: string;
}

export const getOverlayWidget = async (
  req: AuthenticatedRequest<OverlayWidgetRequestParams, {}, {}>,
  res: Response
): Promise<void> => {
  const { overlayId, widgetId } = req.params;

  const widgets = await overlaysProcesses.getOverlayWidget(overlayId, widgetId);

  res.send(widgets);
};

export interface UpdateWidgetNameRequestBody {
  overlayId: string;
  widgetId: string;
  widgetName: string;
}

export const updateWidgetName = async (
  req: AuthenticatedRequest<{}, {}, UpdateWidgetNameRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.updateWidgetName(
    req.userId as string,
    req.body.overlayId,
    req.body.widgetId,
    req.body.widgetName
  );

  res.sendStatus(204);
};

export interface GetOverlayWidgetsRequestParams {
  overlayId: string;
}

export const getOverlayWidgets = async (
  req: AuthenticatedRequest<GetOverlayWidgetsRequestParams, {}, {}>,
  res: Response
): Promise<void> => {
  const { overlayId } = req.params;

  const widgets = await overlaysProcesses.getOverlayWidgets(overlayId);

  res.send(widgets);
};

export const deleteOverlayWidget = async (
  req: AuthenticatedRequest<OverlayWidgetRequestParams, {}, {}>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.deleteOverlayWidget(
    req.userId as string,
    req.params.overlayId,
    req.params.widgetId
  );

  res.sendStatus(204);
};

export interface DuplicateWidgetRequestBody {
  overlayId: string;
  widgetId: string;
  destOverlay: string;
}

export const duplicateWidget = async (
  req: AuthenticatedRequest<{}, {}, DuplicateWidgetRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.duplicateWidget(
    req.userId as string,
    req.body.overlayId,
    req.body.widgetId,
    req.body.destOverlay
  );

  res.sendStatus(204);
};

export interface DuplicateVariationRequestBody {
  overlayId: string;
  widgetId: string;
  variationId: string;
  destOverlay: string;
  destWidget: string;
}

export const duplicateVariation = async (
  req: AuthenticatedRequest<{}, {}, DuplicateVariationRequestBody>,
  res: Response
): Promise<void> => {
  await overlaysProcesses.duplicateVariation(
    req.userId as string,
    req.body.overlayId,
    req.body.widgetId,
    req.body.variationId,
    req.body.destOverlay,
    req.body.destWidget
  );

  res.sendStatus(204);
};

//#endregion

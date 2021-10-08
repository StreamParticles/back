import {
  AlertsSetWidget,
  AlertVariation,
  ErrorKinds,
  Widget,
  WidgetsKinds,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { merge } from "lodash";
import mongoose from "mongoose";

import User from "#models/User";
import { throwHttpError } from "#utils/http";
import { isEqualId } from "#utils/mongoose";

export const createAlertVariation = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id
): Promise<void> => {
  const variationId = mongoose.Types.ObjectId();

  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(new Error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlayToUpdate] = user?.integrations?.overlays || [];

  if (!overlayToUpdate) return throwHttpError(ErrorKinds.OVERLAY_NOT_FOUND);

  const eventuallyUpdateWidget = (widget: Widget) =>
    isEqualId(widget._id, widgetId)
      ? {
          ...widget,
          variations: [
            ...(widget as AlertsSetWidget).variations,
            {
              _id: variationId,
              name: `Variation ${(widget as AlertsSetWidget).variations.length +
                1}`,
            },
          ],
        }
      : widget;

  const widgets = overlayToUpdate.widgets.map(eventuallyUpdateWidget);

  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.widgets": widgets,
      },
    }
  );
};

export const getAlertVariation = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id,
  variationId: Id
): Promise<AlertVariation | null> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays.overlayId": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(new Error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlay] = user?.integrations?.overlays || [];

  if (!overlay) return throwHttpError(ErrorKinds.OVERLAY_NOT_FOUND);

  const widget = overlay.widgets.find((widget) =>
    isEqualId(widgetId, widget._id)
  );

  if (!widget) return throwHttpError(ErrorKinds.WIDGET_NOT_FOUND);

  const variation = (widget as AlertsSetWidget).variations.find((variation) =>
    isEqualId(variationId, variation._id)
  );

  if (!variation) return throwHttpError(ErrorKinds.VARIATION_NOT_FOUND);

  return variation;
};

export const updateAlertVariation = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id,
  variationId: Id,
  payload: AlertVariation
): Promise<void> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(new Error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlayToUpdate] = user?.integrations?.overlays || [];

  if (!overlayToUpdate) return throwHttpError(ErrorKinds.OVERLAY_NOT_FOUND);

  const eventuallyUpdateVariation = (variation: AlertVariation) =>
    isEqualId(variationId, variation._id)
      ? merge(variation, payload)
      : variation;

  const eventuallyUpdateWidget = (widget: Widget) =>
    isEqualId(widgetId, widget._id) && widget.kind === WidgetsKinds.ALERTS
      ? {
          ...widget,
          variations: (widget as AlertsSetWidget).variations.map(
            eventuallyUpdateVariation
          ),
        }
      : widget;

  const updatedWidgets = overlayToUpdate.widgets.map(eventuallyUpdateWidget);

  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.widgets": updatedWidgets,
      },
    }
  );
};

export const deleteAlertVariation = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id,
  variationId: Id
): Promise<void> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(new Error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlayToUpdate] = user?.integrations?.overlays || [];

  if (!overlayToUpdate) return throwHttpError(ErrorKinds.OVERLAY_NOT_FOUND);

  const eventuallyUpdateWidget = (widget: Widget) => {
    return isEqualId(widgetId, widget._id) &&
      widget.kind === WidgetsKinds.ALERTS
      ? {
          ...widget,
          variations: (widget as AlertsSetWidget).variations.filter(
            (variation) => !isEqualId(variationId, variation._id)
          ),
        }
      : widget;
  };

  const updatedWidgets = overlayToUpdate.widgets.map(eventuallyUpdateWidget);

  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.widgets": updatedWidgets,
      },
    }
  );
};

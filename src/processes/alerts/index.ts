import {
  AlertsSetWidget as AlertsSetWidgetType,
  AlertVariation,
  ErrorKinds,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { merge } from "lodash";
import mongoose from "mongoose";

import AlertsSetWidget from "#models/widgetsModels/AlertsSetWidget";

export const createAlertVariation = async (
  userId: Id,
  widgetId: Id
): Promise<void> => {
  const widget = await AlertsSetWidget.findOne({
    userId,
    _id: widgetId,
  })
    .select({ variations: true })
    .orFail(new Error(ErrorKinds.WIDGET_NOT_FOUND))
    .lean();

  const newVariation = {
    _id: mongoose.Types.ObjectId(),
    name: `Variation ${(widget as AlertsSetWidgetType).variations.length + 1}`,
  };

  await AlertsSetWidget.updateOne(
    {
      userId,
      _id: widgetId,
    },
    {
      $push: {
        variations: newVariation,
      },
    }
  );
};

export const getAlertVariation = async (
  userId: Id,
  widgetId: Id,
  variationId: Id
): Promise<AlertVariation | null> => {
  const widget = await AlertsSetWidget.findOne({
    userId,
    _id: widgetId,
    "variations._id": variationId,
  })
    .select({ "variations.$": true })
    .orFail(new Error(ErrorKinds.WIDGET_NOT_FOUND))
    .lean();

  const [variation] = widget.variations;

  if (!variation) throw new Error(ErrorKinds.VARIATION_NOT_FOUND);

  return variation;
};

export const updateAlertVariation = async (
  userId: Id,
  widgetId: Id,
  variationId: Id,
  payload: AlertVariation
): Promise<void> => {
  const variation = await getAlertVariation(userId, widgetId, variationId);

  const merged = merge(variation, payload);

  await AlertsSetWidget.updateOne(
    {
      userId,
      _id: widgetId,
      "variations._id": variationId,
    },
    {
      $set: {
        "variations.$": merged,
      },
    }
  );
};

export const deleteAlertVariation = async (
  userId: Id,
  widgetId: Id,
  variationId: Id
): Promise<void> => {
  await AlertsSetWidget.updateOne(
    {
      userId,
      _id: widgetId,
    },
    {
      $pull: {
        variations: { _id: variationId },
      },
    }
  );
};

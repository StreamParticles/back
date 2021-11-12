import {
  AlertsSetWidget,
  AlertsSetWidgetPosition,
  DonationBarPosition,
  DonationBarWidget,
  ErrorKinds,
  hasVariations,
  OverlayData,
  Position,
  Widget,
  WidgetPosition,
  WidgetsKinds,
  WidgetType,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { keyBy, omit, pick, uniq } from "lodash";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

import { colors } from "#constants/colors";
import User from "#models/User";
import { error, throwError } from "#utils/http";
import { merge } from "#utils/merge";
import { isEqualId } from "#utils/mongoose";
import { defaultVariationName, defaultWidgetName } from "#utils/overlays";

const POSITION_FIELDS = ["top", "left", "width", "height"];

const randomColor = (): string => {
  const colorsCount = colors.length;

  const randomIndex = Math.floor(Math.random() * colorsCount);

  const color = colors[randomIndex];

  return color.value;
};

export const getUserOverlay = async (
  overlayId: Id
): Promise<OverlayData | null> => {
  const user = await User.findOne({
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .lean();

  const overlay = user?.integrations?.overlays?.[0];

  if (!overlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  return overlay;
};

export const getUserOverlayByGeneratedLink = async (
  overlayLink: Id
): Promise<OverlayData | null> => {
  const user = await User.findOne({
    "integrations.overlays.generatedLink": overlayLink,
  })
    .select({ "integrations.overlays.$": true })
    .lean();

  const overlay = user?.integrations?.overlays?.[0];

  if (!overlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  return overlay;
};

export const getManyUserOverlays = async (
  userId: Id
): Promise<OverlayData[]> => {
  const user = await User.findById(userId)
    .select({ "integrations.overlays": true })
    .lean();

  return user?.integrations?.overlays || [];
};

export const createOverlay = async (userId: Id): Promise<void> => {
  const user = await User.findById(userId)
    .select({ "integrations.overlays": true })
    .lean();

  await User.updateOne(
    {
      _id: userId,
    },
    {
      $push: {
        "integrations.overlays": {
          generatedLink: nanoid(50),
          color: randomColor(),
          name: `Overlay ${(user?.integrations?.overlays?.length || 0) + 1}`,
        },
      },
    }
  );
};

export const deleteOverlay = async (
  userId: Id,
  overlayId: Id
): Promise<void> => {
  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays._id": overlayId,
    },
    { $pull: { "integrations.overlays": { _id: overlayId } } }
  );
};

export const updateOverlayName = async (
  userId: Id,
  overlayId: Id,
  overlayName: string
): Promise<void> => {
  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.name": overlayName,
      },
    }
  );
};

export const getOverlayFonts = async (
  overlayLink: string
): Promise<string[]> => {
  const user = await User.findOne({
    "integrations.overlays.generatedLink": overlayLink,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const overlay = user?.integrations?.overlays?.[0];

  if (!overlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const fonts = overlay.widgets
    .flatMap((widget) => {
      switch (widget.kind) {
        case WidgetsKinds.ALERTS:
          return (widget as AlertsSetWidget).variations.map(
            ({ text }) => text?.fontFamily
          );
        case WidgetsKinds.DONATION_BAR:
          return (widget as DonationBarWidget).data.text?.fontFamily;
        default:
          return null;
      }
    })
    .filter(Boolean) as string[];

  return uniq(fonts);
};

export const getOverlayWidgets = async (overlayId: Id): Promise<Widget[]> => {
  const user = await User.findOne({
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlay] = user?.integrations?.overlays || [];

  if (!overlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  return overlay.widgets;
};

export const getOverlayWidget = async (
  overlayId: Id,
  widgetId: Id
): Promise<Widget> => {
  const user = await User.findOne({
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlay] = user?.integrations?.overlays || [];

  if (!overlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const widget = overlay.widgets.find((widget) =>
    isEqualId(String(widget._id), String(widgetId))
  );

  if (!widget) return throwError(ErrorKinds.WIDGET_NOT_FOUND);

  return widget;
};

export const addOverlayWidget = async (
  userId: Id,
  overlayId: Id,
  widgetKind: WidgetsKinds
): Promise<void> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  if (!user?.integrations?.overlays?.[0])
    return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  await User.updateOne(
    {
      "integrations.overlays._id": overlayId,
    },
    {
      $push: {
        "integrations.overlays.$.widgets": {
          kind: widgetKind,
          name: defaultWidgetName(user.integrations.overlays[0], widgetKind),
        },
      },
      $inc: { "integrations.overlays.$.widgetsCount": 1 },
    }
  );
};

export const updateWidgetName = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id,
  widgetName: string
): Promise<void> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlayToUpdate] = user?.integrations?.overlays || [];

  if (!overlayToUpdate) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const eventuallyUpdateWidget = (widget: Widget) =>
    isEqualId(widgetId, widget._id)
      ? {
          ...widget,
          name: widgetName,
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

const updateAlertsSetPositions = (
  widget: AlertsSetWidget,
  widgetPosition: AlertsSetWidgetPosition
) => {
  const variationPositionById = keyBy(widgetPosition.variations, "_id");

  const variations = widget.variations.map((variation) => {
    const variationPosition = variationPositionById[String(variation._id)];

    return {
      ...merge(variation, pick(variationPosition, POSITION_FIELDS) as Position),
      ...(variation.image && {
        image: merge(
          variation.image,
          pick(variationPosition?.image, POSITION_FIELDS)
        ),
      }),
      ...(variation.text && {
        text: merge(
          variation.text,
          pick(variationPosition?.text, POSITION_FIELDS)
        ),
      }),
    };
  });

  return {
    ...widget,
    variations,
  };
};

const updateDonationBarPositions = (
  widget: DonationBarWidget,
  widgetPosition: DonationBarPosition
) => {
  const position = widgetPosition.data;

  const data = {
    ...merge(widget.data, pick(position, POSITION_FIELDS)),
    ...(widget.data.donationBarItemPosition && {
      donationBarItemPosition: position?.donationBarItemPosition,
    }),
    ...(widget.data.text && {
      text: merge(widget.data.text, pick(position?.text, POSITION_FIELDS)),
    }),
  };

  return {
    ...widget,
    data,
  };
};

const updateWidgetPosition = (
  widget: WidgetType,
  widgetPosition: WidgetPosition
) => {
  switch (widget.kind) {
    case WidgetsKinds.ALERTS:
      return updateAlertsSetPositions(
        widget as AlertsSetWidget,
        widgetPosition as AlertsSetWidgetPosition
      );
    case WidgetsKinds.DONATION_BAR:
      return updateDonationBarPositions(
        widget as DonationBarWidget,
        widgetPosition as DonationBarPosition
      );
  }
};

export const updateOverlayWidgetsPositions = async (
  userId: Id,
  overlayId: Id,
  widgetsPositions: WidgetPosition[]
): Promise<void> => {
  // Check if everything is fine first (to remove and replace by mongo transactions)
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  if (!user?.integrations?.overlays?.[0])
    return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const [overlay] = user?.integrations?.overlays;

  const widgetPositionsById = keyBy(widgetsPositions, "_id");

  const updatedPositionWidgets: Widget[] = overlay.widgets.map((widget) => {
    const widgetPosition = widgetPositionsById[String(widget._id)];

    return widgetPosition
      ? (updateWidgetPosition(widget, widgetPosition) as Widget)
      : widget;
  });

  await User.updateOne(
    {
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.widgets": updatedPositionWidgets,
      },
    }
  );
};

export const deleteOverlayWidget = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id
): Promise<void> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlayToUpdate] = user?.integrations?.overlays || [];

  if (!overlayToUpdate) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const updatedWidgets = overlayToUpdate.widgets.filter(
    (widget) => !isEqualId(widget._id, widgetId)
  );

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

export const duplicateWidget = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id,
  destOverlay: Id
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ "integrations.overlays": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const sourceOverlay = user.integrations?.overlays?.find(({ _id }) =>
    isEqualId(_id, overlayId)
  );

  if (!sourceOverlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const destinationOverlay = user.integrations?.overlays?.find(({ _id }) =>
    isEqualId(_id, destOverlay)
  );

  if (!destinationOverlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const widgetToDuplicate = sourceOverlay.widgets.find(({ _id }) =>
    isEqualId(_id, widgetId)
  );

  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays._id": destOverlay,
    },
    {
      $push: {
        "integrations.overlays.$.widgets": {
          ...widgetToDuplicate,
          _id: mongoose.Types.ObjectId(),
          name: defaultWidgetName(
            destinationOverlay,
            widgetToDuplicate?.kind as WidgetsKinds,
            widgetToDuplicate?.name
          ),
          ...(hasVariations(widgetToDuplicate)
            ? {
                variations: widgetToDuplicate.variations.map((variation) =>
                  omit(variation, ["_id"])
                ),
              }
            : { data: omit(widgetToDuplicate?.data, ["_id"]) }),
        },
      },
    }
  );
};

export const duplicateVariation = async (
  userId: Id,
  overlayId: Id,
  widgetId: Id,
  variationId: Id,
  destOverlay: Id,
  destWidget: Id
): Promise<void> => {
  const user = await User.findById(userId)
    .select({ "integrations.overlays": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const sourceOverlay = user.integrations?.overlays?.find(({ _id }) =>
    isEqualId(_id, overlayId)
  );

  if (!sourceOverlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const sourceWidget = sourceOverlay.widgets.find(({ _id }) =>
    isEqualId(_id, widgetId)
  );

  if (!sourceWidget) return throwError(ErrorKinds.WIDGET_NOT_FOUND);
  if (!hasVariations(sourceWidget))
    return throwError(ErrorKinds.INVALID_REQUEST_PAYLOAD);

  const variationToDuplicate = sourceWidget.variations.find(({ _id }) =>
    isEqualId(variationId, _id)
  );

  if (!variationToDuplicate) return throwError(ErrorKinds.VARIATION_NOT_FOUND);

  const destinationOverlay = user.integrations?.overlays?.find(({ _id }) =>
    isEqualId(destOverlay, _id)
  );

  if (!destinationOverlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const updated = destinationOverlay.widgets.map((widget) =>
    isEqualId(widget._id, destWidget) && hasVariations(widget)
      ? {
          ...widget,
          variations: [
            ...widget.variations,
            {
              ...variationToDuplicate,
              _id: mongoose.Types.ObjectId(),
              name: defaultVariationName(widget, variationToDuplicate?.name),
            },
          ],
        }
      : widget
  );

  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays._id": destOverlay,
    },
    {
      $set: {
        "integrations.overlays.$.widgets": updated,
      },
    }
  );
};

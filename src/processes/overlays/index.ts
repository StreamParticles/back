import {
  AlertsSetWidget as AlertsSetWidgetType,
  AlertsSetWidgetPosition,
  DonationBarPosition,
  DonationBarWidget as DonationBarWidgetType,
  ErrorKinds,
  OverlayData,
  Position,
  Widget as WidgetType_,
  WidgetPosition,
  WidgetsKinds,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { keyBy, omit, pick, uniq } from "lodash";
import { nanoid } from "nanoid";

import { colors } from "#constants/colors";
import Overlay from "#models/Overlay";
import User from "#models/User";
import AlertsSetWidget from "#models/widgetsModels/AlertsSetWidget";
import DonationBarWidget from "#models/widgetsModels/DonationBarWidget";
import Widget from "#models/widgetsModels/Widget";
import { merge } from "#utils/merge";
import { ObjectId } from "#utils/mongoose";

const widgetNameMapper = {
  [WidgetsKinds.ALERTS]: "Alerts set",
  [WidgetsKinds.DONATION_BAR]: "Donation bar",
  [WidgetsKinds.DONATIONS_LISTING]: "Donations Listings",
  [WidgetsKinds.CUSTOM_WIDGET]: "Custom Widget",
  [WidgetsKinds.NFTs]: "NFTs",
  [WidgetsKinds.PARTICLES_FALLS]: "Particles Falls",
};

const POSITION_FIELDS = ["top", "left", "width", "height"];

const randomColor = (): string => {
  const colorsCount = colors.length;

  const randomIndex = Math.floor(Math.random() * colorsCount);

  const color = colors[randomIndex];

  return color.value;
};

/** OVERLAY */

export const createOverlay = async (userId: Id): Promise<void> => {
  const overlays = await getManyUserOverlays(userId);

  const created = await Overlay.create({
    generatedLink: nanoid(50),
    color: randomColor(),
    name: `Overlay ${overlays.length + 1}`,
  });

  await User.updateOne(
    {
      _id: userId,
    },
    {
      $push: {
        "integrations.overlays": created._id,
      },
    }
  );
};

export const getOverlay = async (
  userId: Id,
  overlayId: Id
): Promise<OverlayData> => {
  const overlay = await Overlay.findOne({ _id: overlayId, userId })
    .populate({ path: "widgets" })
    .orFail(new Error(ErrorKinds.OVERLAY_NOT_FOUND))
    .lean();

  return overlay;
};

export const deleteOverlay = async (
  userId: Id,
  overlayId: Id
): Promise<void> => {
  await Overlay.deleteOne({
    _id: overlayId,
    userId,
  });

  await User.updateOne(
    {
      _id: userId,
      "integrations.overlays": overlayId,
    },
    { $pull: { "integrations.overlays": overlayId } }
  );
};

export const updateOverlayName = async (
  userId: Id,
  overlayId: Id,
  overlayName: string
): Promise<void> => {
  await Overlay.updateOne(
    {
      userId,
      _id: overlayId,
    },
    {
      $set: {
        name: overlayName,
      },
    }
  );
};

const updateAlertsSetPositions = async (
  widget: AlertsSetWidgetType,
  widgetPosition: AlertsSetWidgetPosition
): Promise<void> => {
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

  await AlertsSetWidget.updateOne(
    { _id: widget._id },
    {
      $set: {
        ...widget,
        variations,
      } as AlertsSetWidgetType,
    }
  );
};

const updateDonationBarPositions = async (
  widget: DonationBarWidgetType,
  widgetPosition: DonationBarPosition
): Promise<void> => {
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

  await DonationBarWidget.updateOne(
    { _id: widget._id },
    {
      $set: {
        ...widget,
        data,
      } as DonationBarWidgetType,
    }
  );
};

const updateWidgetPosition = (
  widget: WidgetType_,
  widgetPosition: WidgetPosition
): Promise<void> | void => {
  switch (widget.kind) {
    case WidgetsKinds.ALERTS:
      return updateAlertsSetPositions(
        widget as AlertsSetWidgetType,
        widgetPosition as AlertsSetWidgetPosition
      );
    case WidgetsKinds.DONATION_BAR:
      return updateDonationBarPositions(
        widget as DonationBarWidgetType,
        widgetPosition as DonationBarPosition
      );
    default:
      return;
  }
};

export const updateWidgetsPositions = async (
  userId: Id,
  widgetsPositions: WidgetPosition[]
): Promise<void> => {
  const ids = widgetsPositions.map(({ _id }) => _id);

  const widgets: WidgetType_[] = await Widget.find({
    _id: { $in: ids },
    userId,
  }).lean();

  const widgetPositionsById = keyBy(widgetsPositions, "_id");

  await Promise.all(
    widgets.map((widget) =>
      updateWidgetPosition(widget, widgetPositionsById[String(widget._id)])
    )
  );
};

/** OVERLAY BY LINK */

export const getOverlayByGeneratedLink = async (
  overlayLink: Id
): Promise<OverlayData> => {
  const overlay = await Overlay.findOne({
    generatedLink: overlayLink as string,
  })
    .populate({ path: "widgets" })
    .orFail(new Error(ErrorKinds.OVERLAY_NOT_FOUND))
    .lean();

  return overlay;
};

export const getOverlayWidgetsByGeneratedLink = async (
  overlayLink: string
): Promise<WidgetType_[]> => {
  const overlay = await getOverlayByGeneratedLink(overlayLink);

  const widgets = await Widget.find({ _id: { $in: overlay.widgets } })
    .populate({ path: "widgets" })
    .lean();

  return widgets;
};

export const getOverlayFonts = async (
  overlayLink: string
): Promise<string[]> => {
  const widgets = await getOverlayWidgetsByGeneratedLink(overlayLink);

  const fonts = widgets
    .flatMap((widget) => {
      switch (widget.kind) {
        case WidgetsKinds.ALERTS:
          return (widget as AlertsSetWidgetType).variations.map(
            ({ text }) => text?.fontFamily
          );
        case WidgetsKinds.DONATION_BAR:
          return (widget as DonationBarWidgetType).data.text?.fontFamily;
        default:
          return null;
      }
    })
    .filter(Boolean) as string[];

  return uniq(fonts);
};

/** WIDGET */

export const createWidget = async (
  userId: Id,
  overlayId: Id,
  widgetKind: WidgetsKinds
): Promise<void> => {
  const created = await Widget.create({
    kind: widgetKind,
    name: widgetNameMapper[widgetKind],
    userId,
  });

  await Overlay.updateOne(
    {
      _id: overlayId,
      userId,
    },
    {
      $push: {
        widgets: created._id,
      },
    }
  );
};

export const getWidget = async (widgetId: Id): Promise<WidgetType_> => {
  const widget = await Widget.findById(widgetId)
    .orFail(new Error(ErrorKinds.WIDGET_NOT_FOUND))
    .lean();

  return widget;
};

export const deleteWidget = async (userId: Id, widgetId: Id): Promise<void> => {
  await Widget.deleteOne({ userId, _id: widgetId });

  await Overlay.updateMany(
    {
      widgets: widgetId,
    },
    {
      $pull: {
        widgets: widgetId,
      },
    }
  );
};

export const updateWidgetName = async (
  userId: Id,
  widgetId: Id,
  widgetName: string
): Promise<void> => {
  await Widget.updateOne(
    {
      _id: widgetId,
      userId,
    },
    {
      $set: {
        name: widgetName,
      },
    }
  );
};

export const duplicateOverlay = async (
  userId: Id,
  overlayId: Id
): Promise<void> => {
  // const overlayToDuplicate = await Overlay.findOne({ userId, _id: overlayId })
  //   .orFail(new Error(ErrorKinds.OVERLAY_NOT_FOUND))
  //   .lean();
  // const duplicated = await Overlay.create({ ...overlayToDuplicate });
  // await User.updateOne(
  //   { _id: userId },
  //   { $push: { "integrations.overlays": duplicated._id } }
  // );
};

export const duplicateWidget = async (
  userId: Id,
  widgetId: Id,
  destOverlayId: Id
): Promise<void> => {
  const widgetToDuplicate = await Widget.findOne({ userId, _id: widgetId })
    .select({ _id: false, "variations._id": false, "data._id": false })
    .orFail(new Error(ErrorKinds.WIDGET_NOT_FOUND))
    .lean();

  const duplicated = await Widget.create({
    ...omit(widgetToDuplicate, ["_id"]),
  });

  await Overlay.updateOne(
    { _id: destOverlayId, userId },
    { $push: { widgets: duplicated._id } }
  );
};

export const duplicateVariation = async (
  userId: Id,
  widgetId: Id,
  variationId: Id,
  destWidget: Id
): Promise<void> => {
  const sourceWidget: AlertsSetWidgetType = await Widget.findOne({
    userId,
    _id: widgetId,
    "variations._id": ObjectId(variationId as string),
  })
    .select({ "variations.$": true, kind: true })
    .orFail(new Error(ErrorKinds.WIDGET_NOT_FOUND))
    .lean();

  const [variationToDuplicate] = sourceWidget.variations;

  await Widget.updateOne(
    { userId, _id: destWidget, kind: sourceWidget.kind },
    { $push: { variations: omit(variationToDuplicate, ["_id"]) } }
  );
};

/** MULTIPLE OVERLAY ENDPOINTS */

export const getManyUserOverlays = async (
  userId: Id
): Promise<OverlayData[]> => {
  const overlays = await Overlay.find({ userId })
    .populate({ path: "widgets" })
    .orFail(new Error(ErrorKinds.OVERLAY_NOT_FOUND))
    .lean();

  return overlays;
};

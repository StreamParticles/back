import {
  DonationBar,
  DonationBarWidget,
  ErrorKinds,
  Widget,
  WidgetsKinds,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { merge } from "lodash";

import User from "#models/User";
import { error, throwError } from "#utils/http";

export const getDonationBar = async (
  userId: Id,
  overlayId: Id,
  widgetDataId: Id
): Promise<DonationBar | null> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlay] = user?.integrations?.overlays || [];

  if (!overlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const widget = overlay.widgets.find(
    (widget) =>
      widget.kind === WidgetsKinds.DONATION_BAR &&
      String((widget as DonationBarWidget).data._id) === String(widgetDataId)
  );

  if (!widget) return throwError(ErrorKinds.WIDGET_NOT_FOUND);

  return (widget as DonationBarWidget).data;
};

export const updateDonationBar = async (
  userId: Id,
  overlayId: Id,
  widgetDataId: Id,
  donationBar: DonationBar
): Promise<void> => {
  const user = await User.findOne({
    _id: userId,
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays.$": true })
    .orFail(error(ErrorKinds.USER_NOT_FOUND))
    .lean();

  const [overlay] = user?.integrations?.overlays || [];

  if (!overlay) return throwError(ErrorKinds.OVERLAY_NOT_FOUND);

  const eventuallyUpdateWidget = (widget: Widget) =>
    String((widget as DonationBarWidget)?.data?._id) === widgetDataId &&
    widget.kind === WidgetsKinds.DONATION_BAR
      ? {
          ...widget,
          data: merge((widget as DonationBarWidget).data, donationBar),
        }
      : widget;

  const updatedWidgets = overlay.widgets.map(eventuallyUpdateWidget);

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

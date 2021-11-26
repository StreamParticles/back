import { DonationBar, ErrorKinds } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { merge } from "lodash";

import DonationBarWidget from "#models/widgetsModels/DonationBarWidget";

export const getDonationBar = async (
  userId: Id,
  widgetDataId: Id
): Promise<DonationBar> => {
  const widget = await DonationBarWidget.findOne({
    "data._id": widgetDataId,
    userId,
  })
    .orFail(new Error(ErrorKinds.WIDGET_NOT_FOUND))
    .lean();

  return widget.data;
};

export const updateDonationBar = async (
  userId: Id,
  widgetDataId: Id,
  data: DonationBar
): Promise<void> => {
  const widget = await getDonationBar(userId, widgetDataId);

  await DonationBarWidget.updateOne(
    { "data._id": widgetDataId, userId },
    {
      $set: {
        data: merge(widget, data),
      },
    }
  );
};

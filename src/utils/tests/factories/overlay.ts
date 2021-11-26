import { OverlayData } from "@streamparticles/lib";
import faker from "faker";
import mongoose from "mongoose";

import Overlay from "#models/Overlay";

import { fakeHex, fakeHexColor } from "../fake";
import factories from ".";

export const build = (overload?: Partial<OverlayData>): OverlayData => {
  return {
    _id: mongoose.Types.ObjectId(),
    name: faker.commerce.productName(),
    color: fakeHexColor(),
    generatedLink: fakeHex(),
    widgets: [],
    userId: mongoose.Types.ObjectId(),
    ...overload,
  };
};

export const create = async (
  overload?: Partial<OverlayData>
): Promise<OverlayData> => {
  const alertsSet = await factories.alertsSet.create();
  const donationBar = await factories.donationBar.create();

  const created = (await Overlay.create(
    build({
      ...overload,
      ...(!overload?.widgets && { widgets: [alertsSet._id, donationBar._id] }),
    })
  )) as OverlayData & mongoose.Document<any, any, OverlayData>;

  return created.toObject();
};

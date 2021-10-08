import { OverlayData, WidgetsKinds } from "@streamparticles/lib";
import faker from "faker";
import mongoose from "mongoose";

import { fakeHex, fakeHexColor } from "../fake";
import factories from ".";

export const build = (overload?: Partial<OverlayData>): OverlayData => {
  return {
    _id: mongoose.Types.ObjectId(),
    name: faker.commerce.productName(),
    color: fakeHexColor(),
    generatedLink: fakeHex(),
    widgets: [
      {
        _id: mongoose.Types.ObjectId(),
        name: faker.commerce.productName(),
        isActive: true,
        kind: WidgetsKinds.ALERTS,
        variations: [
          factories.alertsSet.buildVariation(),
          factories.alertsSet.buildVariation(),
          factories.alertsSet.buildVariation(),
        ],
      },
      {
        _id: mongoose.Types.ObjectId(),
        name: faker.commerce.productName(),
        isActive: true,
        kind: WidgetsKinds.DONATION_BAR,
        data: factories.donationBar.buildData(),
      },
    ],
    ...overload,
  };
};

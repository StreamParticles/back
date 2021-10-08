import {
  DonationBar,
  DonationBarDisplays,
  DonationBarWidget,
  InBarAmountDisplay,
  WidgetsKinds,
} from "@streamparticles/lib";
import faker from "faker";
import mongoose from "mongoose";

import { fakeHexColor, fakeMediaSource } from "../fake";

export const buildData = (overload?: Partial<DonationBar>): DonationBar => {
  return {
    amountDisplay: InBarAmountDisplay.EGLD,
    display: {
      kind: DonationBarDisplays.HORIZONTAL,
    },
    goalAmount: faker.datatype.number({ min: 0, max: 10, precision: 0.0001 }),
    cursor: {
      source: [fakeMediaSource("images")],
      scale: faker.datatype.number({ min: 0.1, max: 5 }),
      ...overload?.cursor,
    },
    border: {
      color: fakeHexColor(),
      width: faker.datatype.number({ min: 0, max: 3, precision: 0.1 }),
      radius: faker.datatype.number({ min: 0, max: 20, precision: 0.1 }),
      ...overload?.border,
    },
    text: {
      content: faker.lorem.sentences(2),
      fontColor: fakeHexColor(),
      fontSize: faker.datatype.number({ min: 20, max: 50 }),
      ...overload?.text,
    },
    leftToSend: {
      backgroundColor: fakeHexColor(),
      textColor: fakeHexColor(),
      ...overload?.leftToSend,
    },
    sentAmount: {
      backgroundColor: fakeHexColor(),
      textColor: fakeHexColor(),
      ...overload?.sentAmount,
    },
    ...overload,
  } as DonationBar;
};

export const build = (
  overload?: Partial<DonationBarWidget>
): DonationBarWidget => {
  return {
    _id: mongoose.Types.ObjectId(),
    kind: WidgetsKinds.DONATION_BAR,
    isActive: true,
    name: faker.commerce.productName(),
    data: buildData(overload?.data),
    ...overload,
  };
};

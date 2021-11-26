import {
  BarDisplayAnimations,
  DonationBarDisplays,
  DonationBarWidget,
  InBarAmountDisplay,
  LogoAnimations,
  WidgetsKinds,
} from "@streamparticles/lib";
import mongoose from "mongoose";

import { MediaSourceSchema, position, TextSchema } from "./style";
import Widget from "./Widget";

const AmountPart = new mongoose.Schema(
  {
    backgroundColor: String,
    textColor: String,
  },
  { _id: false }
);

const initialSize = {
  width: 600,
  height: 60,
};

const DonationBarSchema = new mongoose.Schema(
  {
    amountDisplay: { type: String, enum: InBarAmountDisplay },
    ...position({
      ...initialSize,
      left: 700,
      top: 500,
    }),
    display: {
      kind: {
        type: String,
        enum: DonationBarDisplays,
        default: DonationBarDisplays.HORIZONTAL,
      },
      height: Number,
      width: Number,
      strokeWidth: Number,
    },
    goalAmount: Number,
    donationBarItemPosition: position(initialSize),
    cursor: {
      source: [MediaSourceSchema],
      scale: Number,
    },
    border: {
      color: String,
      width: Number,
      radius: Number,
    },
    text: TextSchema,
    leftToSend: AmountPart,
    sentAmount: AmountPart,
    reaction: {
      audio: {
        source: [MediaSourceSchema],
      },
      fillSentAmount: {
        backgroundColor: String,
      },
      animateLogo: {
        kind: { type: String, enum: LogoAnimations },
      },
      animateBar: {
        kind: { type: String, enum: BarDisplayAnimations },
      },
      duration: Number,
    },
  },
  // Since we use the variationId to retrieve variation data for variations widgets,
  // for single wiget, we want to use the dataId to retrieve data
  { _id: true }
);

const DonationBarWidget = Widget.discriminator<DonationBarWidget>(
  WidgetsKinds.DONATION_BAR,
  new mongoose.Schema({
    data: {
      type: DonationBarSchema,
      default: {},
    },
  })
);

export default DonationBarWidget;

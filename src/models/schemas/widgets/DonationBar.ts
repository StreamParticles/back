import {
  BarDisplayAnimations,
  DonationBarDisplays,
  InBarAmountDisplay,
  LogoAnimations,
} from "@streamparticles/lib";
import mongoose from "mongoose";

import { MediaSourceSchema, position, TextSchema } from "./style";

const AmountPart = new mongoose.Schema(
  {
    backgroundColor: { type: String, required: false },
    textColor: { type: String, required: false },
  },
  { _id: false }
);

const initialSize = {
  width: 600,
  height: 60,
};

export const DonationBarSchema = new mongoose.Schema({
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
});

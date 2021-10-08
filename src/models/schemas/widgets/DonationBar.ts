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

export const DonationBarSchema = new mongoose.Schema({
  amountDisplay: { type: String, enum: InBarAmountDisplay },
  ...position,
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
  donationBarItemPosition: position,
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

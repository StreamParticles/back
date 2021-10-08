import {
  BarDisplayAnimations,
  DonationBarDisplays,
  InBarAmountDisplay,
  LogoAnimations,
} from "@streamparticles/lib";
import Joi from "joi";

import { mediaSourceValidator, textValidator } from "./style";

const amountPartValidator = Joi.object({
  backgroundColor: Joi.string(),
  textColor: Joi.string(),
});

export const donationBarValidator = Joi.object({
  _id: Joi.string(),
  goalAmount: Joi.number().min(0),
  width: Joi.number().min(0),
  height: Joi.number().min(0),
  top: Joi.number(),
  left: Joi.number(),
  amountDisplay: Joi.string().valid(
    InBarAmountDisplay.EGLD,
    InBarAmountDisplay.NONE,
    InBarAmountDisplay.PERCENTAGE
  ),
  display: Joi.alternatives(
    Joi.object({
      kind: Joi.string()
        .valid(DonationBarDisplays.CIRCLE)
        .required(),
      width: Joi.number().min(0),
      strokeWidth: Joi.number().min(0),
    }),
    Joi.object({
      kind: Joi.string()
        .valid(DonationBarDisplays.HORIZONTAL, DonationBarDisplays.VERTICAL)
        .required(),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
    })
  ),
  text: textValidator,
  border: Joi.object({
    color: Joi.string(),
    width: Joi.number(),
    radius: Joi.number(),
  }),
  cursor: Joi.object({
    source: Joi.array()
      .items(mediaSourceValidator)
      .max(1),
    scale: Joi.number()
      .min(0)
      .max(10),
  }),
  sentAmount: amountPartValidator,
  leftToSend: amountPartValidator,
  reaction: Joi.object({
    audio: Joi.object({
      source: Joi.array()
        .items(mediaSourceValidator)
        .max(1),
    }),
    fillSentAmount: Joi.object({ backgroundColor: Joi.string() }),
    animateLogo: Joi.object({
      kind: Joi.string().valid(
        LogoAnimations.BOUNCE,
        LogoAnimations.ROTATE,
        LogoAnimations.SHAKE
      ),
    }),
    animateBar: Joi.object({
      kind: Joi.string().valid(
        BarDisplayAnimations.BOUNCE,
        BarDisplayAnimations.CENTER,
        BarDisplayAnimations.LIGHTEN
      ),
    }),
    duration: Joi.number().min(0),
  }),
});

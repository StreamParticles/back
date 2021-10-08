import {
  EnterAnimationKinds,
  ExitAnimationKinds,
  TextAligns,
} from "@streamparticles/lib";
import Joi from "joi";

const animationValidator = Joi.object({
  enter: Joi.object({
    kind: Joi.string().valid(
      EnterAnimationKinds.FADE_IN,
      EnterAnimationKinds.GROW,
      EnterAnimationKinds.SLIDE_DOWN,
      EnterAnimationKinds.SLIDE_LEFT,
      EnterAnimationKinds.SLIDE_RIGHT,
      EnterAnimationKinds.SLIDE_UP
    ),
    duration: Joi.number().min(0),
    delay: Joi.number().min(0),
  }),
  exit: Joi.object({
    kind: Joi.string().valid(
      ExitAnimationKinds.FADE_OUT,
      ExitAnimationKinds.SHRINK,
      ExitAnimationKinds.SLIDE_DOWN,
      ExitAnimationKinds.SLIDE_LEFT,
      ExitAnimationKinds.SLIDE_RIGHT,
      ExitAnimationKinds.SLIDE_UP
    ),
    duration: Joi.number().min(0),
    offset: Joi.number().min(0),
  }),
});

export const textValidator = Joi.object({
  align: Joi.string().valid(
    TextAligns.LEFT,
    TextAligns.CENTER,
    TextAligns.RIGHT
  ),
  bold: Joi.boolean(),
  content: Joi.string(),
  fontFamily: Joi.string(),
  fontSize: Joi.number().min(0),
  italic: Joi.boolean(),
  underlined: Joi.boolean(),
  fontColor: Joi.string(),
  lineHeight: Joi.number().min(0),
  letterSpacing: Joi.number().min(0),
  wordSpacing: Joi.number().min(0),
  animation: animationValidator,
  stroke: Joi.object({
    color: Joi.string(),
    width: Joi.number().min(0),
  }),
});

export const mediaSourceValidator = Joi.object({
  name: Joi.string().required(),
  response: Joi.string().required(),
  status: Joi.string()
    .valid("done", "uploading")
    .required(),
  uid: Joi.string().required(),
  url: Joi.string().required(),
});

export const imageValidator = Joi.object({
  source: Joi.array()
    .items(mediaSourceValidator)
    .max(1),
  width: Joi.number().min(0),
  height: Joi.number().min(0),
  animation: animationValidator,
});

export const audioValidator = Joi.object({
  source: Joi.array()
    .items(mediaSourceValidator)
    .max(1),
  delay: Joi.number().min(0),
  offset: Joi.number().min(0),
});

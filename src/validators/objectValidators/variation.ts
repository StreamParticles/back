import Joi from "joi";

import { audioValidator, imageValidator, textValidator } from "./style";

export const variationValidator = Joi.object({
  name: Joi.string().required(),
  color: Joi.string(),
  duration: Joi.number().min(0),
  chances: Joi.number().min(0),
  requiredAmount: Joi.number().min(0),
  width: Joi.number().min(0),
  heigth: Joi.number().min(0),
  top: Joi.number(),
  left: Joi.number(),
  audio: audioValidator,
  image: imageValidator,
  text: textValidator,
});

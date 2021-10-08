import Joi from "joi";

export const iftttConfigValidator = Joi.object({
  eventName: Joi.string().required(),
  triggerKey: Joi.string().required(),
});

import Joi from "joi";

const position = Joi.object({
  top: Joi.number().required(),
  left: Joi.number().required(),
  width: Joi.number().required(),
  height: Joi.number().required(),
});

const alertVariationPositions = position.keys({
  _id: Joi.string().required(),
  variations: Joi.array().items(
    Joi.object({
      image: position,
      text: position,
    })
  ),
});

const donationBarPositions = position.keys({
  _id: Joi.string().required(),
  data: Joi.object({
    text: position,
  }),
});

export const widgetPositions = Joi.alternatives(
  alertVariationPositions,
  donationBarPositions
);

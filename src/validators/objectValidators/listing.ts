import Joi from "joi";

export const listingSettingsValidator = Joi.object({
  page: Joi.number().min(0),
  itemsPerPage: Joi.number().min(0),
  order: Joi.string().valid("asc", "desc"),
  orderBy: Joi.string(),
});

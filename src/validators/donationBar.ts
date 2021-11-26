import Joi from "joi";

import {
  DonationBarRequestParams,
  UpdateDonationBarRequestBody,
} from "#controllers/donationBar";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { AuthenticatedRequest } from "#types_/express";

import { donationBarValidator } from "./objectValidators/donationBar";

export const validateGetDonationBar = createValidationMiddleware<
  AuthenticatedRequest<DonationBarRequestParams>
>(
  Joi.object({
    params: Joi.object({
      widgetDataId: Joi.string().required(),
    }),
  })
);

export const validateUpdateDonationBar = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateDonationBarRequestBody>
>(
  Joi.object({
    body: Joi.object({
      widgetDataId: Joi.string().required(),
      donationBar: donationBarValidator.required(),
    }),
  })
);

import Joi from "joi";

import { DonationRequest } from "#controllers/analytics";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { PaginationSettings } from "@streamparticles/lib";
import { AuthenticatedRequest } from "#types_/express";

const pagination = Joi.object({
  page: Joi.number().min(0),
  itemsPerPage: Joi.number().min(0),
});

const sorter = Joi.object({
  order: Joi.string().valid("asc", "desc"),
  orderBy: Joi.string(),
});

export const validateGetLastDonators = createValidationMiddleware<
  DonationRequest
>(
  Joi.object({
    query: Joi.object({
      pagination,
    }),
  })
);

export const validateGetTopDonators = createValidationMiddleware<
  DonationRequest
>(
  Joi.object({
    query: Joi.object({
      pagination,
    }),
  })
);

export const validateGetDonationRecap = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object({}));

import // variationValidator,
"./objectValidators/variation";

import Joi from "joi";

import {
  CreateAlertVariationRequestBody,
  DeleteAlertVariationRequestParams,
  GetAlertVariationRequestParams,
  UpdateAlertVariationRequestBody,
} from "#controllers/alerts";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { AuthenticatedRequest } from "#types_/express";

import { variationValidator } from "./objectValidators/variation";

export const validateCreateAlertVariation = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, CreateAlertVariationRequestBody>
>(
  Joi.object({
    body: Joi.object({
      widgetId: Joi.string().required(),
    }),
  })
);

export const validateGetAlertVariation = createValidationMiddleware<
  AuthenticatedRequest<GetAlertVariationRequestParams>
>(
  Joi.object({
    params: Joi.object({
      widgetId: Joi.string().required(),
      variationId: Joi.string().required(),
    }),
  })
);

export const validateUpdateAlertVariation = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateAlertVariationRequestBody>
>(
  Joi.object({
    body: Joi.object({
      widgetId: Joi.string().required(),
      variationId: Joi.string().required(),
      variation: variationValidator,
    }),
  })
);

export const validateDeleteAlertVariation = createValidationMiddleware<
  AuthenticatedRequest<DeleteAlertVariationRequestParams>
>(
  Joi.object({
    params: Joi.object({
      widgetId: Joi.string().required(),
      variationId: Joi.string().required(),
    }),
  })
);

import Joi from "joi";

import {
  ToggleIftttRequestBody,
  UpdateIftttRequestBody,
} from "#controllers/ifttt";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { AuthenticatedRequest } from "#types_/express";

import { iftttConfigValidator } from "./objectValidators/iftttConfigValidator";

export const validateUpdateIftttParticleData = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateIftttRequestBody>
>(
  Joi.object({
    body: Joi.object({
      ifttt: iftttConfigValidator,
    }),
  })
);

export const validateToggleIftttParticle = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, ToggleIftttRequestBody>
>(
  Joi.object({
    body: Joi.object({
      isActive: Joi.boolean().default(false),
    }),
  })
);

import Joi from "joi";

import {
  ToggleMonitoringRequestBody,
  TriggerFakeEventRequestBody,
  UpdateMinRequiredAmountRequestBody,
  UpdateOnboardingDataRequestBody,
  UpdateTinyAmountsWordingRequestBody,
} from "#controllers/users";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { AuthenticatedRequest } from "#types_/express";

export const validateGetUserData = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object());

export const validateToggleBlockchainMonitoring = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, ToggleMonitoringRequestBody>
>(
  Joi.object({
    body: Joi.object({ isStreaming: Joi.boolean().default(false) }),
  })
);

export const validateTriggerFakeEvent = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, TriggerFakeEventRequestBody>
>(
  Joi.object({
    body: Joi.object({
      data: Joi.object({
        isMockedTransaction: Joi.boolean().valid(true),
        herotag: Joi.string().required(),
        amount: Joi.number()
          .required()
          .min(0),
        data: Joi.string().required(),
      }),
    }),
  })
);

export const validateUpdateMinimumRequiredAmount = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateMinRequiredAmountRequestBody>
>(
  Joi.object({
    body: Joi.object({
      minimumRequiredAmount: Joi.number()
        .min(0)
        .required(),
    }),
  })
);

export const validateUpdateTinyAmountsWording = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateTinyAmountsWordingRequestBody>
>(
  Joi.object({
    body: Joi.object({
      ceilAmount: Joi.number()
        .min(0)
        .required(),
      wording: Joi.string().required(),
    }),
  })
);

export const validateUpdateViewerOnboardingData = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateOnboardingDataRequestBody>
>(
  Joi.object({
    body: Joi.object({
      referralLink: Joi.string().required(),
      herotagQrCodePath: Joi.string().required(),
    }),
  })
);

export const validateGetViewerOnboardingData = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object());

export const validateGetEgldPrice = createValidationMiddleware(Joi.object());

export const validateGetDonationGoalSentAmount = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object());
export const validateResetDonationGoal = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object());

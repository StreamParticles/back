import Joi from "joi";

import {
  AddAddressRequestBody,
  AddBannedWordRequestBody,
  RemoveAddressRequestBody,
  RemoveBannedWordRequestBody,
} from "#controllers/moderation";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { AuthenticatedRequest } from "#types_/express";

export const validateAddBannedWord = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, AddBannedWordRequestBody>
>(
  Joi.object({
    body: Joi.object({
      wordToAdd: Joi.string().required(),
    }),
  })
);

export const validateAddBannedAddress = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, AddAddressRequestBody>
>(
  Joi.object({
    body: Joi.object({
      addressToAdd: Joi.string().required(),
    }),
  })
);

export const validateAddVipAddress = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, AddAddressRequestBody>
>(
  Joi.object({
    body: Joi.object({
      addressToAdd: Joi.string().required(),
    }),
  })
);

export const validateRemoveBannedWord = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, RemoveBannedWordRequestBody>
>(
  Joi.object({
    body: Joi.object({
      wordToRemove: Joi.string().required(),
    }),
  })
);

export const validateRemoveBannedAddress = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, RemoveAddressRequestBody>
>(
  Joi.object({
    body: Joi.object({
      addressToRemove: Joi.string().required(),
    }),
  })
);

export const validateRemoveVipAddress = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, RemoveAddressRequestBody>
>(
  Joi.object({
    body: Joi.object({
      addressToRemove: Joi.string().required(),
    }),
  })
);

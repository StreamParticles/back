import { Request } from "express";
import Joi from "joi";

import { DeleteAccountRequest } from "#controllers/auth";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import {
  UserAccountCreationData,
  UserAuthenticationData,
} from "#processes/authentication";
import {
  WithAddressRequestParams,
  WithHerotagRequestParams,
} from "#types_/express";

export const validateAuthenticateUser = createValidationMiddleware<
  Request<{}, {}, UserAuthenticationData>
>(
  Joi.object({
    body: Joi.object({
      herotag: Joi.string().required(),
      password: Joi.string().required(),
    }),
  })
);

export const validateCreateUserAccount = createValidationMiddleware<
  Request<{}, {}, UserAccountCreationData>
>(
  Joi.object({
    body: Joi.object({
      herotag: Joi.string().required(),
      password: Joi.string().required(),
      confirm: Joi.string().required(),
    }),
  })
);

export const validateEditPassword = createValidationMiddleware<
  Request<{}, {}, UserAccountCreationData>
>(
  Joi.object({
    body: Joi.object({
      herotag: Joi.string().required(),
      password: Joi.string().required(),
      confirm: Joi.string().required(),
    }),
  })
);

export const validateDeleteAccount = createValidationMiddleware<
  Request<{}, {}, DeleteAccountRequest>
>(
  Joi.object({
    body: Joi.object({
      password: Joi.string().required(),
      confirmation: Joi.string()
        .insensitive()
        .trim(true)
        .valid("I DO WANT TO DELETE MY ACCOUNT")
        .required(),
    }),
  })
);

export const validateIsProfileVerified = createValidationMiddleware<
  Request<WithAddressRequestParams>
>(
  Joi.object({
    params: Joi.object({
      erdAddress: Joi.string().required(),
    }),
  })
);

export const validateGetVerificationReference = createValidationMiddleware<
  Request<WithAddressRequestParams>
>(
  Joi.object({
    params: Joi.object({
      erdAddress: Joi.string().required(),
    }),
  })
);

export const validateIsHerotagValid = createValidationMiddleware<
  Request<WithHerotagRequestParams>
>(
  Joi.object({
    params: Joi.object({
      herotag: Joi.string().required(),
    }),
  })
);

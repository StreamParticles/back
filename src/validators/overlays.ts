import { WidgetsKinds } from "@streamparticles/lib";
import Joi from "joi";

import {
  AddOverlayWidgetRequestBody,
  DuplicateVariationRequestBody,
  DuplicateWidgetRequestBody,
  GetOverlayWidgetsRequestParams,
  OverlayByLinkRequestParams,
  OverlayRequestParams,
  OverlayWidgetRequestParams,
  UpdateOverlayNameRequestBody,
  UpdateOverlayWidgetsPositionsRequestBody,
  UpdateWidgetNameRequestBody,
} from "#controllers/overlays";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { AuthenticatedRequest } from "#types_/express";

export const validateGetUserOverlay = createValidationMiddleware<
  AuthenticatedRequest<OverlayRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayId: Joi.string().required(),
    }),
  })
);

export const validateGetUserOverlayByGeneratedLink = createValidationMiddleware<
  AuthenticatedRequest<OverlayByLinkRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayLink: Joi.string().required(),
    }),
  })
);

export const validateGetManyUserOverlays = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object());

export const validateCreateOneOverlay = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object());

export const validateDeleteOverlay = createValidationMiddleware<
  AuthenticatedRequest<OverlayRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayId: Joi.string().required(),
    }),
  })
);

export const validateUpdateOverlayName = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateOverlayNameRequestBody>
>(
  Joi.object({
    body: Joi.object({
      overlayId: Joi.string().required(),
      overlayName: Joi.string().required(),
    }),
  })
);

export const validateGetOverlayFonts = createValidationMiddleware<
  AuthenticatedRequest<OverlayByLinkRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayLink: Joi.string().required(),
    }),
  })
);

// NEW

export const validateAddOverlayWidget = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, AddOverlayWidgetRequestBody>
>(
  Joi.object({
    body: Joi.object({
      overlayId: Joi.string().required(),
      widgetKind: Joi.string()
        .valid(WidgetsKinds.ALERTS, WidgetsKinds.DONATION_BAR)
        .required(),
    }),
  })
);

export const validateUpdateWidgetName = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateWidgetNameRequestBody>
>(
  Joi.object({
    body: Joi.object({
      overlayId: Joi.string().required(),
      widgetId: Joi.string().required(),
      widgetName: Joi.string().required(),
    }),
  })
);

export const validateUpdateOverlayWidgetsPositions = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateOverlayWidgetsPositionsRequestBody>
>(
  Joi.object({
    body: Joi.object({
      overlayId: Joi.string().required(),
      widgetsPositions: Joi.any(),
    }),
  })
);

export const validateGetOverlayWidgets = createValidationMiddleware<
  AuthenticatedRequest<GetOverlayWidgetsRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayId: Joi.string().required(),
    }),
  })
);

export const validateGetOverlayWidget = createValidationMiddleware<
  AuthenticatedRequest<OverlayWidgetRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayId: Joi.string().required(),
      widgetId: Joi.string().required(),
    }),
  })
);

export const validateDeleteOverlayWidget = createValidationMiddleware<
  AuthenticatedRequest<OverlayWidgetRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayId: Joi.string().required(),
      widgetId: Joi.string().required(),
    }),
  })
);

export const validateDuplicateWidget = createValidationMiddleware<
  AuthenticatedRequest<DuplicateWidgetRequestBody>
>(
  Joi.object({
    body: Joi.object({
      overlayId: Joi.string().required(),
      widgetId: Joi.string().required(),
      destOverlay: Joi.string().required(),
    }),
  })
);

export const validateDuplicateVariation = createValidationMiddleware<
  AuthenticatedRequest<DuplicateVariationRequestBody>
>(
  Joi.object({
    body: Joi.object({
      overlayId: Joi.string().required(),
      widgetId: Joi.string().required(),
      variationId: Joi.string().required(),
      destOverlay: Joi.string().required(),
      destWidget: Joi.string().required(),
    }),
  })
);

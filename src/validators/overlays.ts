import { WidgetsKinds } from "@streamparticles/lib";
import Joi from "joi";

import {
  CreateWidgetRequestBody,
  DuplicateVariationRequestBody,
  DuplicateWidgetRequestBody,
  OverlayByLinkRequestParams,
  OverlayRequestParams,
  UpdateOverlayNameRequestBody,
  UpdateOverlayWidgetsPositionsRequestBody,
  UpdateWidgetNameRequestBody,
  WidgetRequestParams,
} from "#controllers/overlays";
import { createValidationMiddleware } from "#middlewares/validateMiddleware";
import { AuthenticatedRequest } from "#types_/express";

/** OVERLAY */

export const validateCreateOverlay = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object({}));

export const validateGetOverlay = createValidationMiddleware<
  AuthenticatedRequest<OverlayRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayId: Joi.string().required(),
    }),
  })
);

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

/** OVERLAY BY LINK */

export const validateGetOverlayByGeneratedLink = createValidationMiddleware<
  AuthenticatedRequest<OverlayByLinkRequestParams>
>(
  Joi.object({
    params: Joi.object({
      overlayLink: Joi.string().required(),
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

/** WIDGET */

export const validateCreateWidget = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, CreateWidgetRequestBody>
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

export const validateGetWidget = createValidationMiddleware<
  AuthenticatedRequest<WidgetRequestParams>
>(
  Joi.object({
    params: Joi.object({
      widgetId: Joi.string().required(),
    }),
  })
);

export const validateDeleteWidget = createValidationMiddleware<
  AuthenticatedRequest<WidgetRequestParams>
>(
  Joi.object({
    params: Joi.object({
      widgetId: Joi.string().required(),
    }),
  })
);

export const validateUpdateWidgetName = createValidationMiddleware<
  AuthenticatedRequest<{}, {}, UpdateWidgetNameRequestBody>
>(
  Joi.object({
    body: Joi.object({
      widgetId: Joi.string().required(),
      widgetName: Joi.string().required(),
    }),
  })
);

export const validateDuplicateWidget = createValidationMiddleware<
  AuthenticatedRequest<DuplicateWidgetRequestBody>
>(
  Joi.object({
    body: Joi.object({
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
      widgetId: Joi.string().required(),
      variationId: Joi.string().required(),
      destWidget: Joi.string().required(),
    }),
  })
);

/** MULTIPLE OVERLAY ENDPOINTS */

export const validateGetOverlays = createValidationMiddleware<
  AuthenticatedRequest
>(Joi.object());

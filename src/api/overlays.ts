import express from "express";

import {
  createOverlay,
  createWidget,
  deleteOverlay,
  deleteWidget,
  duplicateVariation,
  duplicateWidget,
  getOverlay,
  getOverlayByGeneratedLink,
  getOverlayFonts,
  getUserOverlays,
  getWidget,
  updateOverlayName,
  updateOverlayWidgetsPositions,
  updateWidgetName,
} from "#controllers/overlays";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateCreateOverlay,
  validateCreateWidget,
  validateDeleteOverlay,
  validateDeleteWidget,
  validateDuplicateVariation,
  validateDuplicateWidget,
  validateGetOverlay,
  validateGetOverlayByGeneratedLink,
  validateGetOverlayFonts,
  validateGetOverlays,
  validateGetWidget,
  validateUpdateOverlayName,
  validateUpdateOverlayWidgetsPositions,
  validateUpdateWidgetName,
} from "#validators/overlays";

const Router = express.Router();

/** OVERLAY */

Router.route("/overlay").post(
  authenticateMiddleware,
  validateCreateOverlay,
  createOverlay
);

Router.route("/overlay/:overlayId")
  .get(authenticateMiddleware, validateGetOverlay, getOverlay)
  .delete(authenticateMiddleware, validateDeleteOverlay, deleteOverlay);

Router.route("/overlay/name").put(
  authenticateMiddleware,
  validateUpdateOverlayName,
  updateOverlayName
);

Router.route("/overlay/widgets/positions").put(
  authenticateMiddleware,
  validateUpdateOverlayWidgetsPositions,
  updateOverlayWidgetsPositions
);

/** OVERLAY BY LINK */

Router.route("/overlay-by-link/:overlayLink").get(
  validateGetOverlayByGeneratedLink,
  getOverlayByGeneratedLink
);

Router.route("/overlay-by-link/:overlayLink/fonts").get(
  validateGetOverlayFonts,
  getOverlayFonts
);

/** WIDGET */

Router.route("/widget").post(
  authenticateMiddleware,
  validateCreateWidget,
  createWidget
);

Router.route("/widget/:widgetId")
  .get(authenticateMiddleware, validateGetWidget, getWidget)
  .delete(authenticateMiddleware, validateDeleteWidget, deleteWidget);

Router.route("/widget/name").put(
  authenticateMiddleware,
  validateUpdateWidgetName,
  updateWidgetName
);

Router.route("/widget/duplicate").post(
  authenticateMiddleware,
  validateDuplicateWidget,
  duplicateWidget
);

Router.route("/widget/variation/duplicate").post(
  authenticateMiddleware,
  validateDuplicateVariation,
  duplicateVariation
);

/** MULTIPLE OVERLAY ENDPOINTS */

Router.route("/overlays").get(
  authenticateMiddleware,
  validateGetOverlays,
  getUserOverlays
);

export default Router;

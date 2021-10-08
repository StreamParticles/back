import express from "express";

import {
  addOverlayWidget,
  createOneOverlay,
  deleteOverlay,
  deleteOverlayWidget,
  duplicateVariation,
  duplicateWidget,
  getManyUserOverlays,
  getOverlayFonts,
  getOverlayWidget,
  getOverlayWidgets,
  getUserOverlay,
  getUserOverlayByGeneratedLink,
  updateOverlayName,
  updateOverlayWidgetsPositions,
  updateWidgetName,
} from "#controllers/overlays";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateAddOverlayWidget,
  validateCreateOneOverlay,
  validateDeleteOverlay,
  validateDeleteOverlayWidget,
  validateDuplicateVariation,
  validateDuplicateWidget,
  validateGetManyUserOverlays,
  validateGetOverlayFonts,
  validateGetOverlayWidget,
  validateGetOverlayWidgets,
  validateGetUserOverlay,
  validateGetUserOverlayByGeneratedLink,
  validateUpdateOverlayName,
  validateUpdateOverlayWidgetsPositions,
  validateUpdateWidgetName,
} from "#validators/overlays";

const Router = express.Router();

Router.route("/overlays/overlay/:overlayId")
  .get(validateGetUserOverlay, getUserOverlay)
  .delete(authenticateMiddleware, validateDeleteOverlay, deleteOverlay);

Router.route("/overlays/overlay-link/:overlayLink").get(
  validateGetUserOverlayByGeneratedLink,
  getUserOverlayByGeneratedLink
);

Router.route("/overlays/").get(
  authenticateMiddleware,
  validateGetManyUserOverlays,
  getManyUserOverlays
);

Router.route("/overlays/overlay").post(
  authenticateMiddleware,
  validateCreateOneOverlay,
  createOneOverlay
);

Router.route("/overlays/overlay-name").post(
  authenticateMiddleware,
  validateUpdateOverlayName,
  updateOverlayName
);

Router.route("/overlays/add-widget").post(
  authenticateMiddleware,
  validateAddOverlayWidget,
  addOverlayWidget
);

Router.route("/overlays/overlay/widget-name").post(
  authenticateMiddleware,
  validateUpdateWidgetName,
  updateWidgetName
);

Router.route("/overlays/overlay/widgets-positions").post(
  authenticateMiddleware,
  validateUpdateOverlayWidgetsPositions,
  updateOverlayWidgetsPositions
);

Router.route("/overlays/:overlayId/widgets").get(
  authenticateMiddleware,
  validateGetOverlayWidgets,
  getOverlayWidgets
);

Router.route("/overlays/:overlayId/widget/:widgetId")
  .get(authenticateMiddleware, validateGetOverlayWidget, getOverlayWidget)
  .delete(
    authenticateMiddleware,
    validateDeleteOverlayWidget,
    deleteOverlayWidget
  );

Router.route("/overlays/duplicate-widget").post(
  authenticateMiddleware,
  validateDuplicateWidget,
  duplicateWidget
);

Router.route("/overlays/duplicate-variation").post(
  authenticateMiddleware,
  validateDuplicateVariation,
  duplicateVariation
);

Router.route("/overlays/fonts/overlay/:overlayLink").get(
  validateGetOverlayFonts,
  getOverlayFonts
);

export default Router;

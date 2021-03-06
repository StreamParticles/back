import express from "express";

import {
  createAlertVariation,
  deleteAlertVariation,
  getAlertVariation,
  updateAlertVariation,
} from "#controllers/alerts";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateCreateAlertVariation,
  validateDeleteAlertVariation,
  validateGetAlertVariation,
  validateUpdateAlertVariation,
} from "#validators/alerts";

const Router = express.Router();

Router.route("/alerts/variation/")
  .post(
    authenticateMiddleware,
    validateCreateAlertVariation,
    createAlertVariation
  )
  .put(
    authenticateMiddleware,
    validateUpdateAlertVariation,
    updateAlertVariation
  );

Router.route(
  "/alerts/overlay/:overlayId/widget/:widgetId/variation/:variationId"
)
  .get(authenticateMiddleware, validateGetAlertVariation, getAlertVariation)
  .delete(
    authenticateMiddleware,
    validateDeleteAlertVariation,
    deleteAlertVariation
  );

export default Router;

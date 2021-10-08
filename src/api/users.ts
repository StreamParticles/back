import express from "express";

import {
  getDonationGoalSentAmount,
  getEgldPrice,
  getUserData,
  getViewerOnboardingData,
  resetDonationGoal,
  toggleBlockchainMonitoring,
  triggerFakeEvent,
  updateMinimumRequiredAmount,
  updateTinyAmountsWording,
  updateViewerOnboardingData,
} from "#controllers/users";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateGetDonationGoalSentAmount,
  validateGetEgldPrice,
  validateGetUserData,
  validateGetViewerOnboardingData,
  validateResetDonationGoal,
  validateToggleBlockchainMonitoring,
  validateTriggerFakeEvent,
  validateUpdateMinimumRequiredAmount,
  validateUpdateTinyAmountsWording,
  validateUpdateViewerOnboardingData,
} from "#validators/users";

const Router = express.Router();

Router.route("/user/herotag").get(
  authenticateMiddleware,
  validateGetUserData,
  getUserData
);

Router.route("/user/poll-maiar/").post(
  authenticateMiddleware,
  validateToggleBlockchainMonitoring,
  toggleBlockchainMonitoring
);

Router.route("/user/trigger-event").post(
  authenticateMiddleware,
  validateTriggerFakeEvent,
  triggerFakeEvent
);

Router.route("/user/minimum-required-amount").post(
  authenticateMiddleware,
  validateUpdateMinimumRequiredAmount,
  updateMinimumRequiredAmount
);

Router.route("/user/tiny-amounts").post(
  authenticateMiddleware,
  validateUpdateTinyAmountsWording,
  updateTinyAmountsWording
);

Router.route("/user/viewers-onboarding-data").post(
  authenticateMiddleware,
  validateUpdateViewerOnboardingData,
  updateViewerOnboardingData
);

Router.route("/user/viewers-onboarding-data/").get(
  validateGetViewerOnboardingData,
  getViewerOnboardingData
);

Router.route("/egld-price").get(validateGetEgldPrice, getEgldPrice);

Router.route("/donation-goal-sent-amount/")
  .get(
    authenticateMiddleware,
    validateGetDonationGoalSentAmount,
    getDonationGoalSentAmount
  )
  .put(authenticateMiddleware, validateResetDonationGoal, resetDonationGoal);

export default Router;

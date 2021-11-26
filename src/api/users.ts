import express from "express";

import {
  generateNewApiKey,
  getDonationGoalSentAmount,
  getEgldPrice,
  getUserData,
  getViewerOnboardingData,
  resetDonationGoal,
  toggleBlockchainMonitoring,
  triggerFakeEvent,
  updateMinimumRequiredAmount,
  updateTinyAmountsWording,
  updateUserWebhooks,
  updateViewerOnboardingData,
} from "#controllers/users";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateGenerateNewApiKey,
  validateGetDonationGoalSentAmount,
  validateGetEgldPrice,
  validateGetUserData,
  validateGetViewerOnboardingData,
  validateResetDonationGoal,
  validateToggleBlockchainMonitoring,
  validateTriggerFakeEvent,
  validateUpdateMinimumRequiredAmount,
  validateUpdateTinyAmountsWording,
  validateUpdateUserWebhooks,
  validateUpdateViewerOnboardingData,
} from "#validators/users";

const Router = express.Router();

Router.route("/user/herotag").get(
  authenticateMiddleware,
  validateGetUserData,
  getUserData
);

Router.route("/user/blockchain-monitoring/").post(
  authenticateMiddleware,
  validateToggleBlockchainMonitoring,
  toggleBlockchainMonitoring
);

Router.route("/user/fake-event").post(
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

Router.route("/user/viewers-page")
  .get(validateGetViewerOnboardingData, getViewerOnboardingData)
  .post(
    authenticateMiddleware,
    validateUpdateViewerOnboardingData,
    updateViewerOnboardingData
  );

Router.route("/user/webhooks/").post(
  authenticateMiddleware,
  validateUpdateUserWebhooks,
  updateUserWebhooks
);

Router.route("/user/apikey/").post(
  authenticateMiddleware,
  validateGenerateNewApiKey,
  generateNewApiKey
);

Router.route("/egld-price").get(validateGetEgldPrice, getEgldPrice);

Router.route("/donation-goal-sent-amount/herotag/:herotag").get(
  validateGetDonationGoalSentAmount,
  getDonationGoalSentAmount
);

Router.route("/donation-goal-sent-amount/").put(
  authenticateMiddleware,
  validateResetDonationGoal,
  resetDonationGoal
);

export default Router;

import express from "express";

import {
  getDonationRecap,
  getLastDonators,
  getTopDonators,
} from "#controllers/analytics";
import { apiAuthenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateGetDonationRecap,
  validateGetLastDonators,
  validateGetTopDonators,
} from "#validators/analytics";

const Router = express.Router();

Router.route("/v1/analytics/last-donators/api-key/:apiKey").get(
  apiAuthenticateMiddleware,
  validateGetLastDonators,
  getLastDonators
);

Router.route("/v1/analytics/top-donators/api-key/:apiKey").get(
  apiAuthenticateMiddleware,
  validateGetTopDonators,
  getTopDonators
);

Router.route("/v1/analytics/donations-recap/api-key/:apiKey").get(
  apiAuthenticateMiddleware,
  validateGetDonationRecap,
  getDonationRecap
);

export default Router;

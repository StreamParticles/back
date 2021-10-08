import express from "express";

import {
  getDonationRecap,
  getLastDonators,
  getTopDonators,
} from "#controllers/analytics";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateGetDonationRecap,
  validateGetLastDonators,
  validateGetTopDonators,
} from "#validators/analytics";

const Router = express.Router();

Router.route("/analytics-data/last-donators/").get(
  authenticateMiddleware,
  validateGetLastDonators,
  getLastDonators
);

Router.route("/analytics-data/top-donators/").get(
  authenticateMiddleware,
  validateGetTopDonators,
  getTopDonators
);

Router.route("/analytics-data/donations-recap/").get(
  authenticateMiddleware,
  validateGetDonationRecap,
  getDonationRecap
);

export default Router;

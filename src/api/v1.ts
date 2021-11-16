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

Router.route("/v1/:apiKey/last-donators").get(
  apiAuthenticateMiddleware,
  validateGetLastDonators,
  getLastDonators
);

Router.route("/v1/:apiKey/top-donators").get(
  apiAuthenticateMiddleware,
  validateGetTopDonators,
  getTopDonators
);

Router.route("/v1/:apiKey/donations-recap").get(
  apiAuthenticateMiddleware,
  validateGetDonationRecap,
  getDonationRecap
);

export default Router;

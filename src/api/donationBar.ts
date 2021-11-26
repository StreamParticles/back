import express from "express";

import { getDonationBar, updateDonationBar } from "#controllers/donationBar";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateGetDonationBar,
  validateUpdateDonationBar,
} from "#validators/donationBar";

const Router = express.Router();

Router.route("/donation-bar").put(
  authenticateMiddleware,
  validateUpdateDonationBar,
  updateDonationBar
);

Router.route("/donation-bar/:widgetDataId").get(
  authenticateMiddleware,
  validateGetDonationBar,
  getDonationBar
);

export default Router;

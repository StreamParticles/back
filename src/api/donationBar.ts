import express from "express";

import { getDonationBar, updateDonationBar } from "#controllers/donationBar";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateGetDonationBar,
  validateUpdateDonationBar,
} from "#validators/donationBar";

const Router = express.Router();

Router.route("/donationBar").put(
  authenticateMiddleware,
  validateUpdateDonationBar,
  updateDonationBar
);

Router.route("/donationBar/overlay/:overlayId/widget/:widgetDataId").get(
  authenticateMiddleware,
  validateGetDonationBar,
  getDonationBar
);

export default Router;

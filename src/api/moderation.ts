import express from "express";

import {
  addBannedAddress,
  addBannedWord,
  addVipAddress,
  removeBannedAddress,
  removeBannedWord,
  removeVipAddress,
} from "#controllers/moderation";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateAddBannedAddress,
  validateAddBannedWord,
  validateAddVipAddress,
  validateRemoveBannedAddress,
  validateRemoveBannedWord,
  validateRemoveVipAddress,
} from "#validators/moderation";

const Router = express.Router();

Router.route("/moderation/add-banned-word").put(
  authenticateMiddleware,
  validateAddBannedWord,
  addBannedWord
);

Router.route("/moderation/add-banned-address").put(
  authenticateMiddleware,
  validateAddBannedAddress,
  addBannedAddress
);

Router.route("/moderation/add-vip-address").put(
  authenticateMiddleware,
  validateAddVipAddress,
  addVipAddress
);

Router.route("/moderation/remove-banned-word").put(
  authenticateMiddleware,
  validateRemoveBannedWord,
  removeBannedWord
);

Router.route("/moderation/remove-banned-address").put(
  authenticateMiddleware,
  validateRemoveBannedAddress,
  removeBannedAddress
);

Router.route("/moderation/remove-vip-address").put(
  authenticateMiddleware,
  validateRemoveVipAddress,
  removeVipAddress
);

export default Router;

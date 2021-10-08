import express from "express";

import {
  authenticateUser,
  createUserAccount,
  deleteAccount,
  editPassword,
  getVerificationReference,
  isHerotagValid,
  isProfileVerified,
} from "#controllers/auth";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateAuthenticateUser,
  validateCreateUserAccount,
  validateDeleteAccount,
  validateEditPassword,
  validateGetVerificationReference,
  validateIsHerotagValid,
  validateIsProfileVerified,
} from "#validators/auth";

const Router = express.Router();

Router.post("/authenticate", validateAuthenticateUser, authenticateUser);

Router.post("/create-account", validateCreateUserAccount, createUserAccount);

Router.post("/edit-password", validateEditPassword, editPassword);

Router.post(
  "/delete-account",
  authenticateMiddleware,
  validateDeleteAccount,
  deleteAccount
);

Router.get(
  "/verification-status/:erdAddress",
  validateIsProfileVerified,
  isProfileVerified
);

Router.get(
  "/verification-reference/:erdAddress",
  validateGetVerificationReference,
  getVerificationReference
);

Router.get(
  "/is-valid-herotag/:herotag",
  validateIsHerotagValid,
  isHerotagValid
);

export default Router;

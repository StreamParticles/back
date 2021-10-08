import express from "express";

import {
  toggleIftttParticle,
  updateIftttParticleData,
} from "#controllers/ifttt";
import { authenticateMiddleware } from "#middlewares/authMiddleware";
import {
  validateToggleIftttParticle,
  validateUpdateIftttParticleData,
} from "#validators/ifttt";

const Router = express.Router();

// define the home page route
Router.route("/ifttt/update").post(
  authenticateMiddleware,
  validateUpdateIftttParticleData,
  updateIftttParticleData
);

Router.route("/ifttt/toggle/").post(
  authenticateMiddleware,
  validateToggleIftttParticle,
  toggleIftttParticle
);

export default Router;

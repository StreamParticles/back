import { UserType } from "@streamparticles/lib";
import mongoose from "mongoose";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";
import { json } from "#utils/mongoose";
import factories from "#utils/tests";

import {
  getUserData,
  getViewerOnboardingData,
  toggleIftttParticle,
  updateIftttParticleData,
  updateMinimumRequiredAmount,
  updateTinyAmountsWording,
  updateViewerOnboardingData,
} from "./index";

describe("User integration test", () => {
  let user: UserType;

  beforeAll(async () => {
    await connectToDatabase();

    user = await factories.user.create({
      referralLink: "test_referralLink",
      herotagQrCodePath: "test_herotagQrCodePath",
    });
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("getUserData", () => {
    test("it should return all the user data", async () => {
      const fetched = await getUserData(user._id);

      expect(fetched).toMatchObject(user);
    });
  });

  describe("toggleIftttParticle", () => {
    test("it should update ifttt status particle", async () => {
      await toggleIftttParticle(user._id, true);

      const updated = await json(
        User.findById(user._id).select({ "integrations.ifttt": true })
      );

      expect(updated?.integrations?.ifttt).toHaveProperty("isActive", true);
    });
  });

  describe("updateIftttParticleData", () => {
    test("it should update ifttt config", async () => {
      await updateIftttParticleData(user._id, {
        eventName: "test_eventName",
        triggerKey: "test_triggerKey",
      });

      const updated = await json(
        User.findById(user._id).select({ "integrations.ifttt": true })
      );

      expect(updated?.integrations?.ifttt).toHaveProperty(
        "eventName",
        "test_eventName"
      );
      expect(updated?.integrations?.ifttt).toHaveProperty(
        "triggerKey",
        "test_triggerKey"
      );
    });
  });

  describe("updateMinimumRequiredAmount", () => {
    test("it should update minimum required amount", async () => {
      await updateMinimumRequiredAmount(user._id, 0.032);

      const updated = await json(
        User.findById(user._id).select({
          "integrations.minimumRequiredAmount": true,
        })
      );

      expect(updated?.integrations).toHaveProperty(
        "minimumRequiredAmount",
        0.032
      );
    });
  });

  describe("updateTinyAmountsWording", () => {
    test("it should update tiny amounts wording", async () => {
      await updateTinyAmountsWording(user._id, 0.025, "dust");

      const updated = await json(
        User.findById(user._id).select({
          "integrations.tinyAmountWording": true,
        })
      );

      expect(updated?.integrations?.tinyAmountWording).toHaveProperty(
        "ceilAmount",
        0.025
      );

      expect(updated?.integrations?.tinyAmountWording).toHaveProperty(
        "wording",
        "dust"
      );
    });
  });

  describe("getViewerOnboardingData", () => {
    test("it should return all the viewer onboarding page data", async () => {
      const fetched = await getViewerOnboardingData(user._id);

      expect(fetched).toHaveProperty("referralLink", user.referralLink);
      expect(fetched).toHaveProperty(
        "herotagQrCodePath",
        user.herotagQrCodePath
      );
    });
  });

  describe("updateViewerOnboardingData", () => {
    test("it should update the viewer onboarding page data", async () => {
      await updateViewerOnboardingData(
        user._id,
        "test_referralLink_updated",
        "test_herotagQrCode_updated"
      );

      const updated = await json(
        User.findById(user._id).select({
          referralLink: true,
          herotagQrCodePath: true,
        })
      );

      expect(updated).toHaveProperty(
        "referralLink",
        "test_referralLink_updated"
      );
      expect(updated).toHaveProperty(
        "herotagQrCodePath",
        "test_herotagQrCode_updated"
      );
    });
  });
});

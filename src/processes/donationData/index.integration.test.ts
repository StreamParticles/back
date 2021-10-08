import mongoose from "mongoose";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";

import {
  getDonationGoalSentAmount,
  incrementDonationGoalSentAmount,
  resetDonationGoal,
} from "./index";

describe("Moderation integration test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("getDonationGoalSentAmount", () => {
    test("should return donation goal amount", () => {
      test.todo;
      expect(1).toEqual(1);
    });
  });

  describe("incrementDonationGoalSentAmount", () => {
    test("should increment donation goal amount with amount sent", () => {
      test.todo;
      expect(1).toEqual(1);
    });
  });

  describe("resetDonationGoal", () => {
    test("should set donation goal amount to zero", () => {
      test.todo;
      expect(1).toEqual(1);
    });
  });
});

import mongoose from "mongoose";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";

import { validateAccountCreationData } from "../index";

describe("auth unit testing", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  describe("validateAccountCreationData", () => {
    test("when confirm and password does not match", () => {
      expect(
        validateAccountCreationData({
          herotag: "streamparticles",
          password: "helloWorld06",
          confirm: "helloWorld07",
        })
      ).rejects.toThrow("PASSWORD_AND_CONFIRM_NOT_MATCHING");
    });

    describe("when elrond dns does not find any address for herotag", () => {
      it("should throw", () => {
        expect(
          validateAccountCreationData({
            herotag: "streamparticles",
            password: "helloWorld06",
            confirm: "helloWorld06",
          })
        ).rejects.toThrow("COULD_NOT_FIND_HETOTAG_ON_DNS");
      });
    });

    describe("when the herotag is already registered", () => {
      beforeAll(async () => {
        await User.create({
          herotag: "streamparticles.elrond",
          erdAddress:
            "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm",
          verificationStartDate: new Date(),
          verificationReference: "test",
          password: "test",
          status: 1,
        });
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      it("should throw", async () => {
        expect(
          validateAccountCreationData({
            herotag: "streamparticles.elrond",
            password: "helloWorld06",
            confirm: "helloWorld06",
          })
        ).rejects.toThrow("ALREADY_REGISTERED_USER");
      });
    });
  });
});

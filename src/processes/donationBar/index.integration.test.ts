import {
  DonationBar,
  DonationBarWidget,
  Text,
  UserType,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import mongoose from "mongoose";

import Widget from "#models/widgetsModels/Widget";
import { connectToDatabase } from "#services/mongoose";
import { ObjectId } from "#utils/mongoose";
import factories from "#utils/tests";

import { getDonationBar, updateDonationBar } from ".";

describe("Donation Bar integration test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("getDonationBar", () => {
    let user: UserType;

    const userId = ObjectId();

    let donationBarWidget: DonationBarWidget;

    beforeAll(async () => {
      donationBarWidget = await factories.donationBar.create({ userId });

      const overlay = await factories.overlay.create({
        userId,
        widgets: [donationBarWidget._id],
      });

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: [overlay._id],
        },
      });
    });

    test("it should return the donation bar", async () => {
      const received = await getDonationBar(
        user._id as Id,
        donationBarWidget.data._id
      );

      expect(received).toMatchObject(donationBarWidget.data);
    });
  });

  describe("updateDonationBar", () => {
    let user: UserType;
    const userId = ObjectId();
    let donationBarWidget: DonationBarWidget;
    const payload = factories.donationBar.buildData({
      text: { bold: true, content: "Lorem ipsum" } as Text,
    } as DonationBar);

    beforeAll(async () => {
      donationBarWidget = await factories.donationBar.create({ userId });

      const overlay = await factories.overlay.create({
        userId,
        widgets: [donationBarWidget._id],
      });

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: [overlay._id],
        },
      });
    });

    test("it should update the donation data", async () => {
      await updateDonationBar(
        user._id as Id,
        donationBarWidget.data._id,
        payload
      );

      const updated = await Widget.findById(donationBarWidget._id).lean();

      expect((updated as DonationBarWidget).data).toMatchObject(payload);
    });
  });
});

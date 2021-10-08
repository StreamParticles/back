import {
  DonationBar,
  DonationBarWidget,
  OverlayData,
  Text,
  UserType,
} from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import mongoose from "mongoose";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";
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
    const donationBarWidget = factories.donationBar.build();

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              widgets: [donationBarWidget],
            }),
          ],
        },
      });
    });

    test("it should return the donation bar", async () => {
      const received = await getDonationBar(
        user._id as Id,
        user?.integrations?.overlays?.[0]._id as Id,
        (user?.integrations?.overlays?.[0].widgets[0] as DonationBarWidget).data
          ._id as Id
      );

      expect(received).toMatchObject(donationBarWidget.data);
    });
  });

  describe("updateDonationBar", () => {
    let user: UserType;
    const donationBarWidget = factories.donationBar.build();
    const payload = factories.donationBar.buildData({
      text: { bold: true, content: "Lorem ipsum" } as Text,
    } as DonationBar);

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              widgets: [donationBarWidget],
            }),
          ],
        },
      });
    });

    test("it should update the donation data", async () => {
      await updateDonationBar(
        user._id as Id,
        user?.integrations?.overlays?.[0]._id as Id,
        (user?.integrations?.overlays?.[0].widgets[0] as DonationBarWidget).data
          ._id,
        payload
      );

      const updatedUser = await User.findById(user._id)
        .select("integrations")
        .lean();

      expect(updatedUser?.integrations?.overlays).toHaveLength(1);

      const [overlay] = updatedUser?.integrations?.overlays as OverlayData[];

      expect(overlay.widgets).toHaveLength(1);

      const [widget] = overlay.widgets;

      expect(widget as DonationBarWidget).toMatchObject(donationBarWidget);
    });
  });
});

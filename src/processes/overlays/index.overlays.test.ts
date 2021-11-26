/* eslint-disable @typescript-eslint/no-explicit-any */
import { OverlayData, UserType } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import mongoose from "mongoose";

import Overlay from "#models/Overlay";
import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";
import { ObjectId } from "#utils/mongoose";
import factories from "#utils/tests";

import {
  createOverlay,
  deleteOverlay,
  getManyUserOverlays,
  getOverlayFonts,
  updateOverlayName,
} from "./index";

describe("Overlays integration test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("createOverlay", () => {
    let user: UserType;
    const userId = ObjectId();

    beforeAll(async () => {
      const overlay = await factories.overlay.create({ userId });

      user = await factories.user.create({
        integrations: {
          overlays: [overlay._id],
        },
        _id: userId,
      });
    });

    test("should create an overlay", async () => {
      await createOverlay(user._id);

      const updated = await User.findById(user._id).lean();

      expect(updated?.integrations?.overlays).toHaveLength(2);

      const created = updated?.integrations?.overlays?.[1];

      expect(created).toBeDefined;

      const createdOverlay = await Overlay.findById(created as Id).lean();

      expect(createdOverlay).toHaveProperty("generatedLink");
      expect(createdOverlay).toHaveProperty("color");
      expect(createdOverlay).toHaveProperty("name");
    });
  });

  describe("deleteOverlay", () => {
    let user: UserType;
    const overlayToKeepId = mongoose.Types.ObjectId();
    const overlayToDeleteId = mongoose.Types.ObjectId();
    const userId = ObjectId();

    beforeAll(async () => {
      await factories.overlay.create({ _id: overlayToKeepId, userId });
      await factories.overlay.create({ _id: overlayToDeleteId, userId });

      user = await factories.user.create({
        integrations: {
          overlays: [overlayToKeepId, overlayToDeleteId],
        },
        _id: userId,
      });
    });

    test("should delete an overlay", async () => {
      await deleteOverlay(user._id, overlayToDeleteId);

      const updated = await User.findById(user._id).lean();

      expect(updated?.integrations?.overlays).toHaveLength(1);

      expect(updated?.integrations?.overlays?.[0]).toHaveProperty(
        "_id",
        overlayToKeepId
      );
    });
  });

  describe("getManyUserOverlays", () => {
    let user: UserType;
    const userId = ObjectId();

    beforeAll(async () => {
      const overlayIds = [
        mongoose.Types.ObjectId(),
        mongoose.Types.ObjectId(),
        mongoose.Types.ObjectId(),
        mongoose.Types.ObjectId(),
      ];

      await Promise.all(
        overlayIds.map((_id) => factories.overlay.create({ _id, userId }))
      );

      user = await factories.user.create({
        integrations: {
          overlays: overlayIds,
        },
        _id: userId,
      });
    });

    test("should return all user's overlays", async () => {
      const overlays = await getManyUserOverlays(user._id);

      expect(overlays).toHaveLength(4);

      // TO-DO check overlays content
    });
  });

  describe("getOverlayFonts", () => {
    let overlays: OverlayData[];

    beforeAll(async () => {
      const widgets = await Promise.all([
        factories.alertsSet.create({
          variations: [
            factories.alertsSet.buildVariation({
              text: { fontFamily: "TestFontAlertVariation" } as any,
            }),
          ],
        }),
        factories.donationBar.create({
          data: factories.donationBar.buildData({
            text: { fontFamily: "TestFontDonation" } as any,
          }),
        }),
        factories.donationBar.create({
          data: factories.donationBar.buildData({
            text: { fontFamily: "ShouldNotAppear" } as any,
          }),
        }),
      ]);

      overlays = await Promise.all([
        factories.overlay.create({
          widgets: [widgets[0]._id, widgets[1]._id],
        }),
        factories.overlay.create({
          widgets: [widgets[2]._id],
        }),
      ]);
    });

    test("should return all fonts used in overlay", async () => {
      const fonts = await getOverlayFonts(
        overlays?.[0]?.generatedLink as string
      );

      expect(fonts).toMatchObject([
        "TestFontAlertVariation",
        "TestFontDonation",
      ]);
    });
  });

  describe("updateOverlayName", () => {
    let user: UserType;
    let overlay: OverlayData;
    const userId = ObjectId();

    beforeAll(async () => {
      overlay = await factories.overlay.create({
        _id: mongoose.Types.ObjectId(),
        name: "default_name",
        userId,
      });

      user = await factories.user.create({
        integrations: {
          overlays: [overlay._id],
        },
        _id: userId,
      });
    });

    test("should update overlay name", async () => {
      await updateOverlayName(user._id, overlay._id, "updated_name");

      const updated = await Overlay.findOne({
        _id: overlay._id,
      })
        .select({ name: true })
        .lean();

      expect(updated).toHaveProperty("name", "updated_name");
    });
  });
});

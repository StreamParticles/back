import { OverlayData, UserType } from "@streamparticles/lib";
import mongoose from "mongoose";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";
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

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [factories.overlay.build()],
        },
      });
    });

    test("should create an overlay", async () => {
      await createOverlay(user._id);

      const updated = await User.findById(user._id).lean();

      expect(updated?.integrations?.overlays).toHaveLength(2);

      const created = updated?.integrations?.overlays?.[1] as OverlayData;

      expect(created).toHaveProperty("generatedLink");
      expect(created).toHaveProperty("color");
      expect(created).toHaveProperty("name");
    });
  });

  describe("deleteOverlay", () => {
    let user: UserType;
    const overlayToKeepId = mongoose.Types.ObjectId();
    const overlayToDeleteId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({ _id: overlayToKeepId }),
            factories.overlay.build({ _id: overlayToDeleteId }),
          ],
        },
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

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build(),
            factories.overlay.build(),
            factories.overlay.build(),
            factories.overlay.build(),
          ],
        },
      });
    });

    test("should return all user's overlays", async () => {
      const overlays = await getManyUserOverlays(user._id);

      expect(overlays).toHaveLength(4);

      // TO-DO cehck overlays content
    });
  });

  describe("getOverlayFonts", () => {
    let user: UserType;

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              widgets: [
                factories.alertsSet.build({
                  variations: [
                    factories.alertsSet.buildVariation({
                      text: { fontFamily: "TestFontAlertVariation" } as any,
                    }),
                  ],
                }),
                factories.donationBar.build({
                  data: factories.donationBar.buildData({
                    text: { fontFamily: "TestFontDonation" } as any,
                  }),
                }),
              ],
            }),
            factories.overlay.build({
              widgets: [
                factories.donationBar.build({
                  data: factories.donationBar.buildData({
                    text: { fontFamily: "ShouldNotAppear" } as any,
                  }),
                }),
              ],
            }),
          ],
        },
      });
    });

    test("should return all fonts used in overlay", async () => {
      const fonts = await getOverlayFonts(
        user?.integrations?.overlays?.[0]?.generatedLink as string
      );

      expect(fonts).toMatchObject([
        "TestFontAlertVariation",
        "TestFontDonation",
      ]);
    });
  });

  describe("updateOverlayName", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              _id: overlayId,
              name: "default_name",
            }),
          ],
        },
      });
    });

    test("should update overlay name", async () => {
      await updateOverlayName(user._id, overlayId, "updated_name");

      const updated = await User.findOne({
        _id: user._id,
        "integrations.overlays._id": overlayId,
      })
        .select({ "integrations.overlays.$": true })
        .lean();

      const [overlay] = updated?.integrations?.overlays as OverlayData[];

      expect(overlay).toHaveProperty("name", "updated_name");
    });
  });
});

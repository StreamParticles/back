import {
  AlertsSetWidget,
  OverlayData,
  UserType,
  WidgetsKinds,
} from "@streamparticles/lib";
import mongoose from "mongoose";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";
import factories from "#utils/tests";

import {
  createAlertVariation,
  deleteAlertVariation,
  updateAlertVariation,
} from "./index";

describe("Alert Variations integration test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("createVariation", () => {
    describe("When alerts set has no alert variation yet", () => {
      let user: UserType;
      const overlayId = mongoose.Types.ObjectId();
      const widgetId = mongoose.Types.ObjectId();

      beforeAll(async () => {
        user = await factories.user.create({
          integrations: {
            overlays: [
              factories.overlay.build({
                _id: overlayId,
                widgets: [
                  factories.alertsSet.build({ _id: widgetId, variations: [] }),
                ],
              }),
            ],
          },
        });
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      test("it should create an alert variation in the rigth alerts set", async () => {
        await createAlertVariation(user._id, overlayId, widgetId);

        const updatedUser = await User.findByHerotag(user.herotag)
          .select({
            "integrations.overlays": true,
          })
          .lean();

        expect(updatedUser.integrations?.overlays).toHaveLength(1);

        const [overlay] = updatedUser.integrations?.overlays as OverlayData[];

        expect(overlay.widgets).toHaveLength(1);

        const [widget] = overlay.widgets;

        expect(widget.kind).toBe(WidgetsKinds.ALERTS);
        expect((widget as AlertsSetWidget).variations).toHaveLength(1);

        // Should check default data
      });
    });
  });

  describe("updateVariation", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const widgetId = mongoose.Types.ObjectId();
    const variation1 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });
    const variation2 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              _id: overlayId,
              widgets: [
                factories.alertsSet.build({
                  _id: widgetId,
                  variations: [variation1, variation2],
                }),
              ],
            }),
          ],
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should update the wanted variation", async () => {
      const updatedVariation = factories.alertsSet.buildVariation();

      await updateAlertVariation(
        user._id,
        overlayId,
        widgetId,
        variation1._id,
        updatedVariation
      );

      const updatedUser = await User.findByHerotag(user.herotag)
        .select({
          "integrations.overlays": true,
        })
        .lean();

      expect(updatedUser.integrations?.overlays).toHaveLength(1);

      const [overlay] = updatedUser.integrations?.overlays as OverlayData[];

      expect(overlay.widgets).toHaveLength(1);

      const [widget] = overlay.widgets;

      expect(widget.kind).toBe(WidgetsKinds.ALERTS);
      expect((widget as AlertsSetWidget).variations).toHaveLength(2);

      expect((widget as AlertsSetWidget).variations).toMatchObject([
        {
          ...updatedVariation,
          _id: variation1._id,
        },
        variation2,
      ]);
    });
  });

  describe("deleteVariation", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const widgetId = mongoose.Types.ObjectId();
    const variation1 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });
    const variation2 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              _id: overlayId,
              widgets: [
                factories.alertsSet.build({
                  _id: widgetId,
                  variations: [variation1, variation2],
                }),
              ],
            }),
          ],
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should delete the wanted variation", async () => {
      await deleteAlertVariation(user._id, overlayId, widgetId, variation2._id);

      const updatedUser = await User.findByHerotag(user.herotag)
        .select({
          "integrations.overlays": true,
        })
        .lean();

      expect(updatedUser.integrations?.overlays).toHaveLength(1);

      const [overlay] = updatedUser.integrations?.overlays as OverlayData[];

      expect(overlay.widgets).toHaveLength(1);

      const [widget] = overlay.widgets;

      expect(widget.kind).toBe(WidgetsKinds.ALERTS);
      expect((widget as AlertsSetWidget).variations).toHaveLength(1);

      expect((widget as AlertsSetWidget).variations).toMatchObject([
        variation1,
      ]);
    });
  });
});

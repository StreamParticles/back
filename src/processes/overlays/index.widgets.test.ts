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
  addOverlayWidget,
  deleteOverlayWidget,
  duplicateVariation,
  duplicateWidget,
  updateWidgetName,
} from "./index";

describe("Overlays Widgets integration test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("addOverlayWidget", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [factories.overlay.build({ _id: overlayId, widgets: [] })],
        },
      });
    });

    test("should add a widget to overlay", async () => {
      await addOverlayWidget(user._id, overlayId, WidgetsKinds.DONATION_BAR);

      const updated = await User.findById(user._id).lean();

      const [overlay] = updated?.integrations?.overlays as OverlayData[];

      expect(overlay.widgets).toHaveLength(1);

      const [widget] = overlay.widgets;

      expect(widget).toHaveProperty("kind", WidgetsKinds.DONATION_BAR);
      expect(widget).toHaveProperty("name", "Donation bar 0");
    });
  });

  describe("deleteOverlayWidget", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const widgetToKeepId = mongoose.Types.ObjectId();
    const widgetToDeleteId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              _id: overlayId,
              widgets: [
                factories.alertsSet.build({ _id: widgetToKeepId }),
                factories.alertsSet.build({ _id: widgetToDeleteId }),
              ],
            }),
          ],
        },
      });
    });

    test("should delete a widget from overlay", async () => {
      await deleteOverlayWidget(user._id, overlayId, widgetToDeleteId);

      const updated = await User.findById(user._id).lean();

      expect(updated?.integrations?.overlays).toHaveLength(1);

      const overlay = updated?.integrations?.overlays?.[0] as OverlayData;

      expect(overlay.widgets).toHaveLength(1);

      expect(overlay.widgets[0]).toHaveProperty("_id", widgetToKeepId);
    });
  });

  describe("duplicateVariation", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const widgetId = mongoose.Types.ObjectId();
    const variationToDuplicate = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
      name: "Variation To Duplicate",
    });

    const sameOverlayWidgetId = mongoose.Types.ObjectId();

    const destOverlayId = mongoose.Types.ObjectId();
    const destOverlayWidgetId = mongoose.Types.ObjectId();

    beforeEach(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              _id: overlayId,
              widgets: [
                factories.alertsSet.build({
                  _id: widgetId,
                  variations: [variationToDuplicate],
                }),
                factories.alertsSet.build({
                  _id: sameOverlayWidgetId,
                  variations: [],
                }),
              ],
            }),
            factories.overlay.build({
              _id: destOverlayId,
              widgets: [
                factories.alertsSet.build({
                  _id: destOverlayWidgetId,
                  variations: [],
                }),
              ],
            }),
          ],
        },
      });
    });

    afterEach(async () => {
      await User.deleteOne({ _id: user._id });
    });

    test("should duplicate a variation in the same widget", async () => {
      // destOverlay = sourceOverlay & destWidget = sourceWidget
      await duplicateVariation(
        user._id,
        overlayId,
        widgetId,
        variationToDuplicate._id,
        overlayId,
        widgetId
      );

      const updated = await User.findById(user._id).lean();

      const overlay = updated?.integrations?.overlays?.[0] as OverlayData;

      expect(overlay.widgets).toHaveLength(2);

      // Widget at index 0 is the source of duplicated variation
      const variations = (overlay.widgets[0] as AlertsSetWidget).variations;

      expect(variations).toHaveLength(2);

      const variation = variations[1];

      expect(variation).toHaveProperty("name", "Variation To Duplicate copy 1");

      // TO-DO check variation content
    });

    test("should duplicate a variation in another widget from same overlay", async () => {
      // destOverlay = sourceOverlay & destWidget != sourceWidget
      await duplicateVariation(
        user._id,
        overlayId,
        widgetId,
        variationToDuplicate._id,
        overlayId,
        sameOverlayWidgetId
      );

      const updated = await User.findById(user._id).lean();

      const overlay = updated?.integrations?.overlays?.[0] as OverlayData;

      expect(overlay.widgets).toHaveLength(2);

      // Widget at index 1 is another widget from same overlay
      const variations = (overlay.widgets[1] as AlertsSetWidget).variations;

      expect(variations).toHaveLength(1);

      const [variation] = variations;

      expect(variation).toHaveProperty("name", "Variation To Duplicate");

      // TO-DO check variation content
    });

    test("should duplicate a variation in another widget from another overlay", async () => {
      // destOverlay != sourceOverlay
      await duplicateVariation(
        user._id,
        overlayId,
        widgetId,
        variationToDuplicate._id,
        destOverlayId,
        destOverlayWidgetId
      );

      const updated = await User.findById(user._id).lean();

      // Overlay at index 1 is another overlay
      const overlay = updated?.integrations?.overlays?.[1] as OverlayData;

      expect(overlay.widgets).toHaveLength(1);

      const variations = (overlay.widgets[0] as AlertsSetWidget).variations;

      expect(variations).toHaveLength(1);

      const [variation] = variations;

      expect(variation).toHaveProperty("name", "Variation To Duplicate");

      // TO-DO check variation content
    });
  });

  describe("duplicateWidget", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const widgetId = mongoose.Types.ObjectId();
    const widgetToDuplicate = factories.donationBar.build({
      _id: widgetId,
      name: "Widget To Duplicate",
    });

    const destOverlayId = mongoose.Types.ObjectId();

    beforeEach(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [
            factories.overlay.build({
              _id: overlayId,
              widgets: [widgetToDuplicate],
            }),
            factories.overlay.build({
              _id: destOverlayId,
              widgets: [],
            }),
          ],
        },
      });
    });

    afterEach(async () => {
      await User.deleteOne({ _id: user._id });
    });

    test("should duplicate a widget in the same overlay", async () => {
      // destOverlay = sourceOverlay
      await duplicateWidget(user._id, overlayId, widgetId, overlayId);

      const updated = await User.findById(user._id).lean();

      // Overlay at index 0 is source overlay
      const overlay = updated?.integrations?.overlays?.[0] as OverlayData;

      expect(overlay.widgets).toHaveLength(2);

      const duplicated = overlay.widgets[1] as AlertsSetWidget;

      expect(duplicated).toHaveProperty("name", "Widget To Duplicate copy 1");

      // TO-DO check widget content
    });

    test("should duplicate a widget in another overlay", async () => {
      await duplicateWidget(user._id, overlayId, widgetId, destOverlayId);

      const updated = await User.findById(user._id).lean();

      // Overlay at index 1 is another overlay
      const overlay = updated?.integrations?.overlays?.[1] as OverlayData;

      expect(overlay.widgets).toHaveLength(1);

      const duplicated = overlay.widgets[0] as AlertsSetWidget;

      expect(duplicated).toHaveProperty("name", "Widget To Duplicate");

      // TO-DO check widget content
    });
  });

  // describe("updateOverlayWidgetsPositions", () => {
  //   test("should update widget's positions", () => {
  //     test.todo;
  //   });
  // });

  describe("updateWidgetName", () => {
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
                factories.alertsSet.build({
                  _id: widgetId,
                  name: "name_to_update",
                }),
              ],
            }),
          ],
        },
      });
    });

    test("should update widget's name", async () => {
      await updateWidgetName(user._id, overlayId, widgetId, "updated_name");

      const updated = await User.findById(user._id).lean();

      // Overlay at index 1 is another overlay
      const [overlay] = updated?.integrations?.overlays as OverlayData[];

      expect(overlay.widgets[0]).toHaveProperty("name", "updated_name");
    });
  });
});

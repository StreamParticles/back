import { AlertsSetWidget, UserType, WidgetsKinds } from "@streamparticles/lib";
import mongoose from "mongoose";

import Overlay from "#models/Overlay";
import User from "#models/User";
import Widget from "#models/widgetsModels/Widget";
import { connectToDatabase } from "#services/mongoose";
import factories from "#utils/tests";

import {
  createWidget,
  deleteWidget,
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

  describe("createWidget", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await factories.user.create({
        integrations: {
          overlays: [overlayId],
        },
      });

      await factories.overlay.create({
        _id: overlayId,
        userId: user._id,
        widgets: [],
      });
    });

    test("should add a widget to overlay", async () => {
      await createWidget(user._id, overlayId, WidgetsKinds.DONATION_BAR);

      const overlay = await Overlay.findById(overlayId).lean();

      expect(overlay).toBeDefined();
      expect(overlay?.widgets).toHaveLength(1);

      const created = await Widget.findById(overlay?.widgets[0]).lean();

      expect(created).toHaveProperty("kind", WidgetsKinds.DONATION_BAR);
      expect(created).toHaveProperty("name", "Donation bar");
    });
  });

  describe("deleteWidget", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const widgetToKeepId = mongoose.Types.ObjectId();
    const widgetToDeleteId = mongoose.Types.ObjectId();
    const userId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      const widgets = await Promise.all([
        factories.alertsSet.create({ _id: widgetToKeepId, userId }),
        factories.alertsSet.create({ _id: widgetToDeleteId, userId }),
      ]);

      await factories.overlay.create({
        _id: overlayId,
        userId,
        widgets: widgets.map(({ _id }) => _id),
      });

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: [overlayId],
        },
      });
    });

    test("should delete a widget from overlay", async () => {
      await deleteWidget(user._id, widgetToDeleteId);

      const updatedOverlay = await Overlay.findById(overlayId).lean();

      expect(updatedOverlay?.widgets).toHaveLength(1);
      expect(updatedOverlay?.widgets[0]).toHaveProperty("_id", widgetToKeepId);

      const widget = await Widget.findById(widgetToDeleteId).lean();

      expect(widget).toBeNull();
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

    const destOverlayId = mongoose.Types.ObjectId();
    const destWidgetId = mongoose.Types.ObjectId();

    beforeEach(async () => {
      const userId = mongoose.Types.ObjectId();
      const widgets = await Promise.all([
        factories.alertsSet.create({
          _id: widgetId,
          userId,
          variations: [variationToDuplicate],
        }),
        factories.alertsSet.create({
          _id: destWidgetId,
          userId,
          variations: [],
        }),
      ]);

      const overlays = await Promise.all([
        factories.overlay.create({
          _id: overlayId,
          userId,
          widgets: [widgets[0]._id],
        }),
        factories.overlay.create({
          _id: destOverlayId,
          userId,
          widgets: [widgets[1]._id],
        }),
      ]);

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: overlays.map(({ _id }) => _id),
        },
      });
    });

    afterEach(async () => {
      await User.deleteMany();
      await Widget.deleteMany();
      await Overlay.deleteMany();
    });

    test("should duplicate a variation in the same widget", async () => {
      // destOverlay = sourceOverlay & destWidget = sourceWidget
      await duplicateVariation(
        user._id,
        widgetId,
        variationToDuplicate._id,
        widgetId
      );

      const updated = await Widget.findById(widgetId).lean();

      const { variations } = updated as AlertsSetWidget;

      expect(variations).toHaveLength(2);

      const variation = variations[1];

      expect(variation).toHaveProperty("name", "Variation To Duplicate");

      // TO-DO check variation content
    });

    test("should duplicate a variation in another widget", async () => {
      // destOverlay = sourceOverlay & destWidget != sourceWidget
      await duplicateVariation(
        user._id,
        widgetId,
        variationToDuplicate._id,
        destWidgetId
      );

      const updated = await Widget.findById(destWidgetId).lean();

      const { variations } = updated as AlertsSetWidget;

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

    const destOverlayId = mongoose.Types.ObjectId();

    beforeEach(async () => {
      const userId = mongoose.Types.ObjectId();
      const widgetToDuplicate = await factories.donationBar.create({
        _id: widgetId,
        userId,
        name: "Widget To Duplicate",
      });

      const overlays = await Promise.all([
        factories.overlay.create({
          _id: overlayId,
          userId,
          widgets: [widgetToDuplicate._id],
        }),
        factories.overlay.create({
          _id: destOverlayId,
          userId,
          widgets: [],
        }),
      ]);

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: overlays.map(({ _id }) => _id),
        },
      });
    });

    afterEach(async () => {
      await User.deleteMany();
      await Widget.deleteMany();
      await Overlay.deleteMany();
    });

    test("should duplicate a widget in the same overlay", async () => {
      // destOverlay = sourceOverlay
      await duplicateWidget(user._id, widgetId, overlayId);

      const updated = await Overlay.findById(overlayId).lean();

      expect(updated?.widgets).toHaveLength(2);

      const duplicated = await Widget.findById(updated?.widgets[1]).lean();

      expect(duplicated).toHaveProperty("name", "Widget To Duplicate");

      // TO-DO check widget content
    });

    test("should duplicate a widget in another overlay", async () => {
      await duplicateWidget(user._id, widgetId, destOverlayId);

      const updated = await Overlay.findById(destOverlayId).lean();

      expect(updated?.widgets).toHaveLength(1);

      const duplicated = await Widget.findById(updated?.widgets[0]).lean();

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
      const userId = mongoose.Types.ObjectId();
      const widget = await factories.alertsSet.create({
        _id: widgetId,
        userId,
        name: "name_to_update",
      });

      const overlay = await factories.overlay.create({
        _id: overlayId,
        userId,
        widgets: [widget._id],
      });

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: [overlay._id],
        },
      });
    });

    test("should update widget's name", async () => {
      await updateWidgetName(user._id, widgetId, "updated_name");

      const updated = await Widget.findById(widgetId).lean();

      expect(updated).toHaveProperty("name", "updated_name");
    });
  });
});

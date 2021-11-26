import { AlertsSetWidget, UserType, WidgetsKinds } from "@streamparticles/lib";
import mongoose from "mongoose";

import Overlay from "#models/Overlay";
import User from "#models/User";
import Widget from "#models/widgetsModels/Widget";
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
      const userId = mongoose.Types.ObjectId();

      beforeAll(async () => {
        const widget = await factories.alertsSet.create({
          userId,
          _id: widgetId,
          variations: [],
        });

        const overlay = await factories.overlay.create({
          userId,
          _id: overlayId,
          widgets: [widget._id],
        });

        user = await factories.user.create({
          _id: userId,
          integrations: {
            overlays: [overlay._id],
          },
        });
      });

      afterAll(async () => {
        await User.deleteMany();
        await Overlay.deleteMany();
        await Widget.deleteMany();
      });

      test("it should create an alert variation in the rigth alerts set", async () => {
        await createAlertVariation(user._id, widgetId);

        const updatedWidget = await Widget.findById(widgetId).lean();

        expect(updatedWidget?.kind).toBe(WidgetsKinds.ALERTS);
        expect((updatedWidget as AlertsSetWidget).variations).toHaveLength(1);

        // Should check default data
      });
    });
  });

  describe("updateVariation", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const widgetId = mongoose.Types.ObjectId();
    const userId = mongoose.Types.ObjectId();
    const variation1 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });
    const variation2 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });

    beforeAll(async () => {
      const widget = await factories.alertsSet.create({
        userId,
        _id: widgetId,
        variations: [variation1, variation2],
      });

      const overlay = await factories.overlay.create({
        userId,
        _id: overlayId,
        widgets: [widget._id],
      });

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: [overlay._id],
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
      await Overlay.deleteMany();
      await Widget.deleteMany();
    });

    test("it should update the wanted variation", async () => {
      const updatedVariation = factories.alertsSet.buildVariation();

      await updateAlertVariation(
        user._id,
        widgetId,
        variation1._id,
        updatedVariation
      );

      const updatedWidget = await Widget.findById(widgetId).lean();

      expect(updatedWidget).toBeDefined();
      expect(updatedWidget?.kind).toBe(WidgetsKinds.ALERTS);
      expect((updatedWidget as AlertsSetWidget).variations).toHaveLength(2);

      expect((updatedWidget as AlertsSetWidget).variations).toMatchObject([
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
    const userId = mongoose.Types.ObjectId();
    const widgetId = mongoose.Types.ObjectId();
    const variation1 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });
    const variation2 = factories.alertsSet.buildVariation({
      _id: mongoose.Types.ObjectId(),
    });

    beforeAll(async () => {
      const widget = await factories.alertsSet.create({
        userId,
        _id: widgetId,
        variations: [variation1, variation2],
      });

      const overlay = await factories.overlay.create({
        userId,
        _id: overlayId,
        widgets: [widget._id],
      });

      user = await factories.user.create({
        _id: userId,
        integrations: {
          overlays: [overlay._id],
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
      await Overlay.deleteMany();
      await Widget.deleteMany();
    });

    test("it should delete the wanted variation", async () => {
      await deleteAlertVariation(user._id, widgetId, variation2._id);

      const updatedWidget = await Widget.findById(widgetId).lean();

      expect(updatedWidget).toBeDefined();
      expect(updatedWidget?.kind).toBe(WidgetsKinds.ALERTS);
      expect((updatedWidget as AlertsSetWidget).variations).toHaveLength(1);

      expect((updatedWidget as AlertsSetWidget).variations).toMatchObject([
        variation1,
      ]);
    });
  });
});

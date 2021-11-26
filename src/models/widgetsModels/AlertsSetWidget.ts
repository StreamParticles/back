import { AlertsSetWidget, WidgetsKinds } from "@streamparticles/lib";
import mongoose from "mongoose";

import { AudioSchema, ImageSchema, position, TextSchema } from "./style";
import Widget from "./Widget";

const AlertVariationSchema = new mongoose.Schema({
  name: String,
  color: String,
  requiredAmount: { type: Number, default: 0.01 },
  chances: { type: Number, default: 1 },
  duration: { type: Number, default: 10 },
  ...position(),
  audio: AudioSchema,
  image: ImageSchema,
  text: TextSchema,
});

const AlertsSetWidget = Widget.discriminator<AlertsSetWidget>(
  WidgetsKinds.ALERTS,
  new mongoose.Schema({
    variations: [AlertVariationSchema],
  })
);

export default AlertsSetWidget;

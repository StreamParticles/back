import { WidgetsKinds } from "@streamparticles/lib";
import { Schema } from "mongoose";

import { AlertVariationSchema } from "./widgets/AlertsSet";
import { DonationBarSchema } from "./widgets/DonationBar";

// DO NOT CHANGE MONGOOSE VERSION WITHOUT CHECKING THIS BELOW
// https://github.com/Automattic/mongoose/issues/10435

const WidgetSchema = new Schema(
  {
    name: { type: String, required: false },
    isActive: { type: Boolean, default: false },
    kind: { type: String, enum: WidgetsKinds, required: true },
  },
  { discriminatorKey: "kind" }
);

export const OverlaySchema = new Schema({
  name: { type: String, required: false },
  color: { type: String, required: false },
  generatedLink: { type: String, required: false },
  widgets: { type: [WidgetSchema] },
});

OverlaySchema.path<Schema.Types.Embedded>("widgets").discriminator(
  WidgetsKinds.ALERTS,
  new Schema({
    variations: {
      type: [AlertVariationSchema],
    },
  })
);

OverlaySchema.path<Schema.Types.Embedded>("widgets").discriminator(
  WidgetsKinds.DONATION_BAR,
  new Schema({
    data: {
      type: DonationBarSchema,
      default: {},
    },
  })
);

import { Widget, WidgetsKinds } from "@streamparticles/lib";
import mongoose, { Model, Schema } from "mongoose";

type WidgetModel = Model<Widget>;

const WidgetSchema = new Schema<Widget, WidgetModel>(
  {
    name: String,
    isActive: { type: Boolean, default: false },
    kind: { type: String, enum: WidgetsKinds, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { discriminatorKey: "kind", timestamps: true }
);

export default mongoose.model<Widget, WidgetModel>(
  "Widget",
  WidgetSchema,
  "widget"
);

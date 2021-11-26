import { OverlayData } from "@streamparticles/lib";
import mongoose, { Model, Schema } from "mongoose";

type OverlayMongooseDocument = OverlayData & mongoose.Document;
type OverlayModel = Model<OverlayMongooseDocument>;

const OverlaySchema = new Schema<OverlayMongooseDocument, OverlayModel>(
  {
    name: String,
    color: String,
    generatedLink: String,
    widgets: [{ type: Schema.Types.ObjectId, ref: "Widget" }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<OverlayMongooseDocument, OverlayModel>(
  "Overlay",
  OverlaySchema,
  "overlay"
);

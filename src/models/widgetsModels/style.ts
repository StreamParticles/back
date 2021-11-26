import {
  EnterAnimationKinds,
  ExitAnimationKinds,
  TextAligns,
} from "@streamparticles/lib";
import mongoose from "mongoose";

type PositionFields = "width" | "height" | "left" | "top";

export const position = (
  compelled?: Partial<Record<PositionFields, number>>
): Record<PositionFields, Record<string, unknown>> => ({
  width: { type: Number, default: compelled?.width || 200 },
  height: { type: Number, default: compelled?.height || 200 },
  left: { type: Number, default: compelled?.left || 0 },
  top: { type: Number, default: compelled?.top || 0 },
});

export const AnimationSchema = new mongoose.Schema(
  {
    enter: {
      kind: { type: String, enum: EnterAnimationKinds },
      duration: Number,
      delay: Number,
    },
    exit: {
      kind: { type: String, enum: ExitAnimationKinds },
      duration: Number,
      offset: Number,
    },
  },
  { _id: false, timestamps: true }
);

export const MediaSourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    response: { type: String, required: true },
    status: { type: String, required: true },
    uid: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

export const ImageSchema = new mongoose.Schema(
  {
    width: Number,
    height: Number,
    left: Number,
    top: Number,
    source: [MediaSourceSchema],
    animation: AnimationSchema,
    // ...position(),
  },
  { _id: false, timestamps: true }
);

export const AudioSchema = new mongoose.Schema(
  {
    source: [MediaSourceSchema],
    delay: { type: Number, default: 0 },
    offset: { type: Number, default: 0 },
  },
  { _id: false, timestamps: true }
);

export const TextSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: "{{herotag}} donated {{amount}}: {{message}}",
    },
    fontColor: { type: String, default: "#000000" },
    fontFamily: { type: String, default: "Roboto" },
    fontSize: { type: Number, default: 35 },
    align: {
      type: String,
      enum: TextAligns,
      default: TextAligns.LEFT,
    },
    italic: { type: Boolean, default: false },
    bold: { type: Boolean, default: false },
    underlined: { type: Boolean, default: false },
    letterSpacing: Number,
    lineHeight: Number,
    wordSpacing: Number,
    stroke: {
      color: { type: String },
      width: Number,
    },
    animation: AnimationSchema,
    ...position(),
  },
  { _id: false, timestamps: true }
);

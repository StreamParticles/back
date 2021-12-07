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
      kind: { type: EnterAnimationKinds, required: false },
      duration: { type: Number, required: false },
      delay: { type: Number, required: false },
    },
    exit: {
      kind: { type: String, enum: ExitAnimationKinds, required: false },
      duration: { type: Number, required: false },
      offset: { type: Number, required: false },
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
    source: { type: [MediaSourceSchema], required: false },
    animation: { type: AnimationSchema, required: false },
    ...position(),
  },
  { _id: false, timestamps: true }
);

export const AudioSchema = new mongoose.Schema(
  {
    source: { type: [MediaSourceSchema], required: false },
    delay: { type: Number, required: false, default: 0 },
    offset: { type: Number, required: false, default: 0 },
  },
  { _id: false, timestamps: true }
);

export const TextSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: false,
      default: "{{herotag}} donated {{amount}}: {{message}}",
    },
    fontColor: { type: String, required: false, default: "#000000" },
    fontFamily: { type: String, required: false, default: "Roboto" },
    fontSize: { type: Number, required: false, default: 35 },
    align: {
      type: String,
      enum: TextAligns,
      required: false,
      default: TextAligns.LEFT,
    },
    italic: { type: Boolean, required: false, default: false },
    bold: { type: Boolean, required: false, default: false },
    underlined: { type: Boolean, required: false, default: false },
    letterSpacing: { type: Number, required: false },
    lineHeight: { type: Number, required: false },
    wordSpacing: { type: Number, required: false },
    stroke: {
      type: {
        color: { type: String, required: false },
        width: { type: Number, required: false },
      },
      required: false,
    },
    animation: { type: AnimationSchema, required: false },
    ...position(),
  },
  { _id: false, timestamps: true }
);

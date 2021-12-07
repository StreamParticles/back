import mongoose from "mongoose";

import { AudioSchema, ImageSchema, position, TextSchema } from "./style";

export const AlertVariationSchema = new mongoose.Schema({
  name: { type: String, required: false },
  color: { type: String, required: false },
  requiredAmount: { type: Number, required: false, default: 0.01 },
  chances: { type: Number, required: false, default: 1 },
  duration: { type: Number, required: false, default: 10 },
  ...position(),
  audio: {
    type: AudioSchema,
    required: false,
  },
  image: {
    type: ImageSchema,
    required: false,
  },
  text: {
    type: TextSchema,
    required: false,
  },
});

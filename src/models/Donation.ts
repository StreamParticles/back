import { DonationType } from "@streamparticles/lib";
import mongoose, { Model, Schema } from "mongoose";

import paginatePlugin, {
  GlobalQueryHelpers,
} from "#services/mongoose/plugins/paginate";

const DonationSchema = new Schema(
  {
    senderHerotag: String,
    senderErdAdress: {
      type: String,
      required: true,
    },
    receiverUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverHerotag: {
      type: String,
      required: true,
    },
    receiverErdAdress: {
      type: String,
      required: true,
    },
    amount: {
      type: Number, // When encrypted, we will need to use string here
      required: true,
      // get: decryptStringToNumber,
      // set: encryptNumberToString, TO-DO make the things necessary to uncomment those lines!!
    },
    data: String,
    timestamp: { type: Number, required: true },
    isAllowed: { type: Boolean, required: true, default: true },
    isVisible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

DonationSchema.plugin(paginatePlugin);

type DonationMongooseDocument = DonationType & mongoose.Document;

export default mongoose.model<
  DonationMongooseDocument,
  Model<DonationMongooseDocument, GlobalQueryHelpers<DonationMongooseDocument>>
>("Donation", DonationSchema, "donation");

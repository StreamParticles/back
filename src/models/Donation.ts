import { DonationType } from "@streamparticles/lib";
import mongoose, { Model, Schema } from "mongoose";

import paginatePlugin, {
  GlobalQueryHelpers,
} from "#services/mongoose/plugins/paginate";
import {
  decrypt,
  decryptStringToNumber,
  encrypt,
  encryptNumberToString,
} from "#utils/database";

const DonationSchema = new Schema(
  {
    senderHerotag: {
      type: String,
      required: false,
      // get: decrypt,
      // set: encrypt,
    },
    senderErdAdress: {
      type: String,
      required: true,
      // get: decrypt,
      // set: encrypt,
    },
    receiverUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverHerotag: {
      type: String,
      required: true,
      // get: decrypt,
      // set: encrypt,
    },
    receiverErdAdress: {
      type: String,
      required: true,
      // get: decrypt,
      // set: encrypt,
    },
    amount: {
      type: Number, // When encrypted, we will need to use string here
      required: true,
      // get: decryptStringToNumber,
      // set: encryptNumberToString, TO-DO make the things necessary to uncomment those lines!!
    },
    data: {
      type: String,
      required: false,
      // get: decrypt, set: encrypt
    },
    timestamp: { type: Number, required: true },
    isAllowed: { type: Boolean, required: true, default: true },
    isVisible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

DonationSchema.plugin(paginatePlugin);

export type DonationMongooseDocument = DonationType & mongoose.Document;

export default mongoose.model<
  DonationMongooseDocument,
  Model<DonationMongooseDocument, GlobalQueryHelpers<DonationMongooseDocument>>
>("Donation", DonationSchema, "donation");

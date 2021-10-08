import { UserAccountStatus, UserType } from "@streamparticles/lib";
import mongoose, { Model, Query, Schema } from "mongoose";

import { decrypt, encrypt } from "#utils/database";
import { ENV } from "#utils/env";
import { normalizeHerotag } from "#utils/transactions";

import { DonationsDataSchema } from "./schemas/DonationsData";
import { OverlaySchema } from "./schemas/Overlay";

export type UserMongooseDocument = UserType & mongoose.Document;

interface UserModel extends Model<UserMongooseDocument> {
  findByHerotag(
    herotag: string
  ): Query<UserMongooseDocument, UserMongooseDocument>;
  findByErdAddress(
    erdAddress: string
  ): Query<UserMongooseDocument, UserMongooseDocument>;
}

const UserSchema = new Schema<UserMongooseDocument, UserModel>(
  {
    password: { type: String, required: true, get: decrypt, set: encrypt },
    pendingPassword: {
      type: String,
      required: false,
      get: decrypt,
      set: encrypt,
    },
    herotag: {
      type: String,
      required: true,
      validate: (herotag: string) =>
        herotag.endsWith(`${ENV.ELROND_HEROTAG_DOMAIN}`),
    },
    erdAddress: { type: String, required: true }, // TO-DO validate string format
    status: { type: UserAccountStatus, required: true },
    verificationReference: { type: String, required: true },
    passwordEditionVerificationReference: { type: String, required: false },
    verificationStartDate: { type: String, required: true },
    passwordEditionVerificationStartDate: { type: String, required: false },
    integrations: {
      ifttt: {
        eventName: {
          type: String,
          required: false,
          get: decrypt,
          set: encrypt,
        },
        triggerKey: {
          type: String,
          required: false,
          get: decrypt,
          set: encrypt,
        },
        isActive: { type: Boolean, required: false },
      },
      overlays: { type: [OverlaySchema], required: false },
      minimumRequiredAmount: { type: Number, required: false },
      tinyAmountWording: {
        type: {
          ceilAmount: { type: String, required: true },
          wording: { type: String, required: true },
        },
        required: false,
      },
    },
    donationData: { type: DonationsDataSchema, required: false },
    moderation: {
      bannedWords: [{ type: String }],
      bannedAddresses: [{ type: String }],
      vipAddresses: [{ type: String }],
    },
    isStreaming: { type: Boolean, required: false },
    streamingStartDate: { type: Date, required: false },
    referralLink: { type: String, required: false, get: decrypt, set: encrypt },
    herotagQrCodePath: { type: String, required: false },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);

UserSchema.static("findByHerotag", function(herotag: string) {
  return this.findOne({ herotag: normalizeHerotag(herotag) });
});

UserSchema.static("findByErdAddress", function(erdAddress: string) {
  return this.findOne({ erdAddress });
});

export default mongoose.model<UserMongooseDocument, UserModel>(
  "User",
  UserSchema,
  "user"
);

import { UserType } from "@streamparticles/lib";
import mongoose from "mongoose";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";
import factories from "#utils/tests";
import { fakeHex } from "#utils/tests/fake";

import {
  addBannedAddress,
  addBannedWord,
  addVipAddress,
  removeBannedAddress,
  removeBannedWord,
  removeVipAddress,
} from "./index";

describe("Moderation integration test", () => {
  let user: UserType;
  let user2: UserType;

  const address1 = fakeHex();
  const address2 = fakeHex();

  beforeAll(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    user = await factories.user.create();
    user2 = await factories.user.create({
      moderation: {
        bannedAddresses: [address1],
        bannedWords: ["test_remove_word"],
        vipAddresses: [address2],
      },
    });
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  describe("addBannedAddress", () => {
    test("should add unic banned address", async () => {
      await addBannedAddress(user._id, address1);

      const updated = await User.findById(user._id).lean();

      expect(updated?.moderation?.bannedAddresses).toMatchObject([address1]);
    });
  });

  describe("addBannedWord", () => {
    test("should add unic banned word", async () => {
      await addBannedWord(user._id, "test_banned_word");

      const updated = await User.findById(user._id).lean();

      expect(updated?.moderation?.bannedWords).toMatchObject([
        "test_banned_word",
      ]);
    });
  });

  describe("addVipAddress", () => {
    test("should add unic vip address", async () => {
      await addVipAddress(user._id, address2);

      const updated = await User.findById(user._id).lean();

      expect(updated?.moderation?.vipAddresses).toMatchObject([address2]);
    });
  });

  describe("removeBannedAddress", () => {
    test("should remove banned address", async () => {
      await removeBannedAddress(user2._id, address1);

      const updated = await User.findById(user2._id).lean();

      expect(updated?.moderation?.bannedAddresses).toHaveLength(0);
    });
  });

  describe("removeBannedWord", () => {
    test("should remove banned word", async () => {
      await removeBannedWord(user2._id, "test_remove_word");

      const updated = await User.findById(user2._id).lean();

      expect(updated?.moderation?.bannedWords).toHaveLength(0);
    });
  });

  describe("removeVipAddress", () => {
    test("should remove vip address", async () => {
      await removeVipAddress(user2._id, address2);

      const updated = await User.findById(user2._id).lean();

      expect(updated?.moderation?.vipAddresses).toHaveLength(0);
    });
  });
});

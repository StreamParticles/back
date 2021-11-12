import { UserAccountStatus, UserType } from "@streamparticles/lib";
import mongoose from "mongoose";

import User from "#models/User";

jest.mock("#services/elrond");
import * as elrond from "#services/elrond";
import { connectToDatabase } from "#services/mongoose";
import { getHashedPassword } from "#utils/auth";
import factories from "#utils/tests";
import { fakeHex } from "#utils/tests/fake";

import {
  authenticateUser,
  createUserAccount,
  getVerificationReference,
  isProfileVerified,
} from "..";

describe("Auth integration testing", () => {
  beforeAll(async () => {
    await connectToDatabase();

    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();

    mongoose.disconnect();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  describe("createUserAccount", () => {
    describe("when data is ok", () => {
      const HEROTAG_TO_CREATE = "tocreate.elrond";
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      beforeAll(() => {
        mockedElrond.getErdAddress.mockResolvedValue(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );
      });

      it("should create a user with status pending", async () => {
        await createUserAccount({
          herotag: HEROTAG_TO_CREATE,
          password: "test",
          confirm: "test",
        });

        const user = await User.findOne().lean();

        expect(user).not.toBe(null);

        expect((user as UserType).herotag).toEqual("tocreate.elrond");
        expect((user as UserType).status).toEqual(
          UserAccountStatus.PENDING_VERIFICATION
        );

        expect(user).toHaveProperty("password");
        expect(user).toHaveProperty("verificationReference");
        expect(user).toHaveProperty("verificationStartDate");
      });
    });
  });

  describe("authenticateUser", () => {
    describe("when data is ok but herotag is not registered in db", () => {
      it("should throw", () => {
        expect(
          authenticateUser({
            herotag: "notfound.elrond",
            password: "test",
          })
        ).rejects.toThrow("NOT_REGISTERED_HEROTAG");
      });
    });

    describe("when data is ok, herotag is registered in db but password does not match with hash in db", () => {
      let user: UserType;

      beforeAll(async () => {
        user = await factories.user.create();
      });

      it("should throw error INVALID_PASSWORD", () => {
        expect(
          authenticateUser({
            herotag: user.herotag,
            password: "test___",
          })
        ).rejects.toThrow("INVALID_PASSWORD");
      });
    });

    describe("when data is ok, herotag is registered in db, password does match with hash in db but account status is pending", () => {
      let user: UserType;
      const password = "PASSWORD_TEST_8!";

      beforeAll(async () => {
        user = await factories.user.create({
          status: UserAccountStatus.PENDING_VERIFICATION,
          password: getHashedPassword(password),
        });
      });

      it("should throw error ACCOUNT_WITH_VERIFICATION_PENDING", () => {
        expect(
          authenticateUser({
            herotag: user.herotag,
            password,
          })
        ).rejects.toThrow("ACCOUNT_WITH_VERIFICATION_PENDING");
      });
    });

    describe("when data is ok", () => {
      let user: UserType;
      const password = "TESTOUILLE_87?";

      beforeAll(async () => {
        user = await factories.user.create({
          password: getHashedPassword(password),
        });
      });

      it("should resolve user and token data", async () => {
        const result = await authenticateUser({
          herotag: user.herotag,
          password: password,
        });

        expect(result.user).toMatchObject(user);
        expect(result).toHaveProperty("token");
        expect(result.expiresIn).toEqual(172800);
      });
    });
  });

  describe("isProfileVerified", () => {
    describe("when no user is found", () => {
      it("should return false", async () => {
        const result = await isProfileVerified(fakeHex());

        expect(result).toEqual({ isStatusVerified: false });
      });
    });

    describe("when account status is PENDING", () => {
      let user: UserType;

      beforeAll(async () => {
        user = await factories.user.create({
          status: UserAccountStatus.PENDING_VERIFICATION,
        });
      });

      it("should return false", async () => {
        const result = await isProfileVerified(user.erdAddress);

        expect(result).toEqual({ isStatusVerified: false });
      });
    });

    describe("when account status is VERIFIED", () => {
      let user: UserType;

      beforeAll(async () => {
        user = await factories.user.create();
      });

      it("should return true", async () => {
        const result = await isProfileVerified(user.erdAddress);

        expect(result).toEqual({ isStatusVerified: true });
      });
    });
  });

  describe("getVerificationReference", () => {
    describe("when no user is found with this herotag", () => {
      it("should return true", async () => {
        const result = await getVerificationReference(fakeHex());

        expect(result).toEqual({
          accountStatus: null,
          verificationReference: null,
        });
      });
    });

    describe("when user is found with this herotag", () => {
      let user: UserType;

      beforeAll(async () => {
        user = await factories.user.create({
          verificationReference: "TEST__",
          status: UserAccountStatus.PENDING_VERIFICATION,
        });
      });

      it("should return details", async () => {
        const result = await getVerificationReference(user.erdAddress);

        expect(result).toEqual({
          accountStatus: UserAccountStatus.PENDING_VERIFICATION,
          verificationReference: "TEST__",
        });
      });
    });
  });
});

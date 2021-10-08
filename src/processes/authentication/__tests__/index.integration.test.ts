import mongoose from "mongoose";
import sinon, { SinonFakeTimers } from "sinon";

import User from "#models/User";
import { connectToDatabase } from "#services/mongoose";
jest.mock("#utils/transactions", () => {
  const module = jest.requireActual("#utils/transactions");

  return {
    ...module,
    getErdAddressFromHerotag: jest.fn(),
    normalizeHerotag: jest.fn(),
  };
});

import { UserAccountStatus, UserType } from "@streamparticles/lib";

import { getHashedPassword } from "#utils/auth";
import factories from "#utils/tests";
import { fakeHex } from "#utils/tests/fake";
import * as transactions from "#utils/transactions";

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
    describe("when data is not ok", () => {
      it("should throw", async () => {
        expect(createUserAccount({})).rejects.toThrow(
          "MISSING_DATA_FOR_ACCOUNT_CREATION"
        );
      });
    });

    describe("when data is ok", () => {
      const HEROTAG_TO_CREATE = "tocreate.elrond";
      const mockedTransactions = transactions as jest.Mocked<
        typeof transactions
      >;

      beforeAll(() => {
        mockedTransactions.getErdAddressFromHerotag.mockResolvedValue(
          HEROTAG_TO_CREATE
        );

        mockedTransactions.normalizeHerotag.mockReturnValue(HEROTAG_TO_CREATE);
      });

      afterAll(async () => {
        mockedTransactions.getErdAddressFromHerotag.mockClear();
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
    describe("when data is not ok", () => {
      it("should throw", async () => {
        expect(authenticateUser({})).rejects.toThrow(
          "FORM_MISSING_DATA_FOR_AUTHENTICATION"
        );
      });
    });

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

    describe.skip("when data is ok, herotag is registered in db but password does not match with hash in db", () => {
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

    describe.skip("when data is ok, herotag is registered in db, password does match with hash in db but account status is pending", () => {
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

      const mockedTransactions = transactions as jest.Mocked<
        typeof transactions
      >;

      beforeAll(async () => {
        user = await factories.user.create({
          password: getHashedPassword(password),
        });

        mockedTransactions.normalizeHerotag.mockReturnValue(user.herotag);
      });

      afterAll(() => {
        mockedTransactions.getErdAddressFromHerotag.mockClear();
      });

      it("should resolve user and token data", async () => {
        const result = await authenticateUser({
          herotag: user.herotag,
          password: password,
        });

        expect(result.user).toMatchObject(user);
        expect(result).toHaveProperty("token");
        expect(result.expiresIn).toEqual(14400);
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

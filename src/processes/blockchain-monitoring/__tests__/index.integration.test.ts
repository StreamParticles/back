import { getTime, sub } from "date-fns";
import mongoose from "mongoose";

import User from "#models/User";

jest.mock("#services/elrond");
import * as elrond from "#services/elrond";

jest.mock("#services/redis");
import * as redis from "#services/redis";

jest.mock("#utils/poll");
import * as poll from "#utils/poll";

jest.mock("../../blockchain-interaction");
import { ElrondTransaction, UserType } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";

import { connectToDatabase } from "#services/mongoose";
import factories from "#utils/tests";

import {
  balanceHandler,
  monitorBlockChain,
  resumeBlockchainMonitoring,
  toggleBlockchainMonitoring,
} from "../";

// const lastRestart = getTime(sub(new Date(), { days: 1 })) * 0.001;

describe("Maiar integration testing", () => {
  const targetErdAdress = factories.user.build().erdAddress;

  const elrondTransactions: ElrondTransaction[] = [
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
    factories.transaction.build({ receiver: targetErdAdress }),
  ] as ElrondTransaction[];

  beforeAll(async () => {
    await connectToDatabase();

    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();

    mongoose.disconnect();
  });

  describe("handleBalance", () => {
    const handleTransaction = jest.fn();
    const handleBalance = balanceHandler(targetErdAdress, handleTransaction);

    describe("when balance there is no balance returned by elrond", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should not call neither getUpdatedBalance, getLastBalanceSnapShot, setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(0);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when balance there is no balance in redis yet", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      beforeAll(() => {
        mockedElrond.getUpdatedBalance.mockResolvedValue("1000000000000000000");
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue(null);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call getUpdatedBalance, getLastBalanceSnapShot, setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
      });
    });

    describe("when balance is not updated", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
        mockedElrond.getUpdatedBalance.mockResolvedValue("1000000000000000000");
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call neither getUpdatedBalance and getLastBalanceSnapShot, but not setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when balance is updated", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      const updatedAmount = "11000000000000000000";

      const newTransaction = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 1 })) * 0.001,
        status: "success",
        value: "9000000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
        mockedElrond.getUpdatedBalance.mockResolvedValue(updatedAmount);

        mockedRedis.getAlreadyListennedTransactions.mockResolvedValue(
          elrondTransactions.map(({ hash }) => hash)
        );

        mockedElrond.getLastTransactions.mockResolvedValue([newTransaction]);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call getUpdatedBalance, getLastBalanceSnapShot, setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(
          targetErdAdress,
          updatedAmount
        );
      });
    });

    describe("when balance is updated and there is three new transactions", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      const updatedAmount = "6100000000000000000";

      const newTransaction1 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
        status: "success",
        value: "900000000000000000",
      } as ElrondTransaction;

      const newTransaction2 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 2 })) * 0.001,
        status: "success",
        value: "1700000000000000000",
      } as ElrondTransaction;

      const newTransaction3 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 1 })) * 0.001,
        status: "success",
        value: "2300000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
        mockedElrond.getUpdatedBalance.mockResolvedValue(updatedAmount);

        mockedRedis.getAlreadyListennedTransactions.mockResolvedValue(
          elrondTransactions.map(({ hash }) => hash)
        );

        mockedElrond.getLastTransactions.mockResolvedValue([
          newTransaction1,
          newTransaction2,
          newTransaction3,
        ]);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call getUpdatedBalance, getLastBalanceSnapShot and setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(
          targetErdAdress,
          updatedAmount
        );
      });
    });

    describe("when balance is updated, there is one new transaction and three old transactions", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      const updatedAmount = "6100000000000000000";

      const oldTransactions = [
        {
          receiver: targetErdAdress,
          timestamp: getTime(sub(new Date(), { minutes: 15 })) * 0.001,
          status: "success",
          value: "1700000000000000000",
        },
        {
          receiver: targetErdAdress,
          timestamp: getTime(sub(new Date(), { minutes: 17 })) * 0.001,
          status: "success",
          value: "1700000000000000000",
        },
        {
          receiver: targetErdAdress,
          timestamp: getTime(sub(new Date(), { minutes: 20 })) * 0.001,
          status: "success",
          value: "1700000000000000000",
        },
      ] as ElrondTransaction[];

      const newTransaction = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
        status: "success",
        value: "900000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
        mockedElrond.getUpdatedBalance.mockResolvedValue(updatedAmount);

        mockedElrond.getLastTransactions.mockResolvedValue([
          ...oldTransactions,
          newTransaction,
        ]);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should not call neither getLastTransactions, reactToNewTransaction or setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(
          targetErdAdress,
          updatedAmount
        );
      });
    });
  });

  describe("activateBlockchainMonitoring", () => {
    const mockedPoll = poll as jest.Mocked<typeof poll>;

    afterAll(() => mockedPoll.poll.mockClear());
    beforeAll(() => mockedPoll.poll.mockClear());

    test("", async () => {
      const baseUser = factories.user.build();

      await monitorBlockChain(baseUser.erdAddress, baseUser);

      expect(mockedPoll.poll).toHaveBeenCalledTimes(1);
      expect(mockedPoll.poll).toHaveBeenCalledWith(
        expect.any(Function),
        10000,
        expect.any(Function)
      );
    });
  });

  describe("toggleBlockchainMonitoring", () => {
    describe("when no user is found", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;

      afterAll(() => {
        mockedPoll.poll.mockClear();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(
          factories.user.build()._id as Id,
          true
        );

        expect(result).toBe(undefined);

        expect(mockedPoll.poll).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling off", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = await factories.user.create();
      });

      afterAll(async () => {
        mockedPoll.poll.mockClear();

        await User.deleteMany();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(
          createdUser._id as Id,
          false
        );

        expect(result).toMatchObject({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.poll).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling on", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = await factories.user.create();

        mockedElrond.getErdAddress.mockResolvedValue(targetErdAdress);
      });

      afterAll(async () => {
        mockedPoll.poll.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(
          createdUser._id as Id,
          true
        );

        expect(result).toMatchObject({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.poll).toHaveBeenCalledTimes(1);
        expect(mockedPoll.poll).toHaveBeenCalledWith(
          expect.any(Function),
          10000,
          expect.any(Function)
        );
      });
    });
  });

  describe("resumeBlockchainMonitoring", () => {
    describe("when no user is found with isStreaming = true", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;

      afterAll(async () => {
        mockedPoll.poll.mockClear();
      });

      it("should start blockchain monitoring", async () => {
        await resumeBlockchainMonitoring();

        expect(mockedPoll.poll).toHaveBeenCalledTimes(0);
      });
    });

    describe("when two users are found with isStreaming = true", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser1: UserType;
      let createdUser2: UserType;

      beforeAll(async () => {
        createdUser1 = await factories.user.create();
        createdUser2 = await factories.user.create();
      });

      afterAll(async () => {
        mockedPoll.poll.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const results = await resumeBlockchainMonitoring();

        expect(results.sort()).toMatchObject(
          [createdUser1.herotag, createdUser2.herotag].sort()
        );

        expect(mockedPoll.poll).toHaveBeenCalledTimes(2);

        expect(mockedPoll.poll).toHaveBeenCalledWith(
          expect.any(Function),
          10000,
          expect.any(Function)
        );

        expect(mockedPoll.poll).toHaveBeenCalledWith(
          expect.any(Function),
          10000,
          expect.any(Function)
        );
      });
    });
  });
});

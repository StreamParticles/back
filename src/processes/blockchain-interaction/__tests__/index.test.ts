import { reactToNewTransaction } from "../";

jest.mock("#utils/transactions", () => {
  const module = jest.requireActual("#utils/transactions");

  return {
    ...module,
    getHerotagFromErdAddress: jest.fn(),
  };
});
import * as utilTransactions from "#utils/transactions";

jest.mock("../ifttt");
import * as ifttt from "../ifttt";

jest.mock("#daos/donation");
import * as donationDao from "#daos/donation";

jest.mock("../../donationData");
import * as donationData from "../../donationData";

jest.mock("../overlays");

import factories from "#utils/tests";

import * as overlays from "../overlays";

describe("Blockchain interaction unit testing", () => {
  describe("reactToNewTransaction", () => {
    const mockedUtilTransactions = utilTransactions as jest.Mocked<
      typeof utilTransactions
    >;

    const mockedIfttt = ifttt as jest.Mocked<typeof ifttt>;
    const mockedOverlays = overlays as jest.Mocked<typeof overlays>;
    const mockedDonationDao = donationDao as jest.Mocked<typeof donationDao>;
    const mockedDonationData = donationData as jest.Mocked<typeof donationData>;

    beforeAll(() => {
      mockedUtilTransactions.getHerotagFromErdAddress.mockResolvedValue(
        "remdem"
      );
    });

    afterAll(() => {
      mockedUtilTransactions.getHerotagFromErdAddress.mockClear();
    });

    beforeEach(() => {
      mockedOverlays.triggerOverlaysEvent.mockClear();
      mockedIfttt.triggerIftttEvent.mockClear();
      mockedDonationData.incrementDonationGoalSentAmount.mockClear();
      mockedDonationDao.createDonation.mockClear();
    });

    describe("when user has no ifttt particle data and no SE data", () => {
      const transaction = factories.transaction.build({
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "1000000000000000000",
      });

      const user = factories.user.build({
        integrations: {
          ifttt: undefined,
        },
      });

      it("should not call trigger ifttt nor SE", async () => {
        await reactToNewTransaction(transaction, user);

        expect(mockedDonationDao.createDonation).toHaveBeenCalledTimes(1);

        expect(
          mockedDonationData.incrementDonationGoalSentAmount
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedDonationData.incrementDonationGoalSentAmount
        ).toHaveBeenCalledWith(user._id, 1);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user has ifttt activated", () => {
      const transaction = factories.transaction.build({
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "1000000000000000000",
      });

      it("should call only trigger ifttt", async () => {
        const user = factories.user.build({
          integrations: {
            ifttt: {
              eventName: "Test",
              triggerKey: "x2qQHAJF89ljX-IwFjNdjZ8raTicSvQpLQcdxggWooJ7",
              isActive: true,
            },
            overlays: [],
          },
        });

        await reactToNewTransaction(transaction, user);

        expect(mockedDonationDao.createDonation).toHaveBeenCalledTimes(1);

        expect(
          mockedDonationData.incrementDonationGoalSentAmount
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedDonationData.incrementDonationGoalSentAmount
        ).toHaveBeenCalledWith(user._id, 1);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(1);
        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledWith(
          { amount: 1, wordingAmount: "1 eGLD", data: "", herotag: "remdem" },
          user.integrations?.ifttt
        );
      });
    });

    describe("when user has not ifttt activated", () => {
      const transaction = factories.transaction.build({
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "1000000000000000000",
      });

      const user = factories.user.build({
        integrations: {
          ifttt: undefined,
        },
      });

      it("should call only trigger SE", async () => {
        await reactToNewTransaction(transaction, user);

        expect(mockedDonationDao.createDonation).toHaveBeenCalledTimes(1);

        expect(
          mockedDonationData.incrementDonationGoalSentAmount
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedDonationData.incrementDonationGoalSentAmount
        ).toHaveBeenCalledWith(user._id, 1);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(0);

        expect(mockedOverlays.triggerOverlaysEvent).toHaveBeenCalledTimes(1);
        expect(mockedOverlays.triggerOverlaysEvent).toHaveBeenCalledWith(
          { amount: 1, wordingAmount: "1 eGLD", data: "", herotag: "remdem" },
          user
        );
      });
    });

    describe("when transaction has a tiny amount", () => {
      const transaction = factories.transaction.build({
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "10000000000000",
      });

      const user = factories.user.build({
        integrations: {
          ifttt: undefined,
          tinyAmountWording: {
            ceilAmount: 0.01,
            wording: "some eGLD dust",
          },
        },
      });

      it("should replace amount by wording", async () => {
        await reactToNewTransaction(transaction, user);

        expect(mockedDonationDao.createDonation).toHaveBeenCalledTimes(1);

        expect(mockedOverlays.triggerOverlaysEvent).toHaveBeenCalledTimes(1);
        expect(mockedOverlays.triggerOverlaysEvent).toHaveBeenCalledWith(
          {
            amount: 0.00001,
            wordingAmount: "some eGLD dust",
            data: "",
            herotag: "remdem",
          },
          user
        );
      });
    });
  });
});

import { DonationType, UserType } from "@streamparticles/lib";
import { sub } from "date-fns";
import mongoose from "mongoose";
import sinon, { SinonFakeTimers } from "sinon";

import { connectToDatabase } from "#services/mongoose";
import factories from "#utils/tests";

import { getDonationsRecap, getLastDonators, getTopDonators } from "..";

describe("Donations Listings integration tests", () => {
  let clock: SinonFakeTimers;

  beforeAll(async () => {
    await connectToDatabase();

    await mongoose.connection.dropDatabase();

    clock = sinon.useFakeTimers(new Date(2021, 9, 6));
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();

    mongoose.disconnect();

    clock.restore();
  });

  let user1: UserType, user2: UserType;
  const now = new Date();

  beforeAll(async () => {
    user1 = await factories.user.create({
      herotag: "test1.elrond",
      erdAddress:
        "erd19kzxa002kd7jyksc0765zclcr3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    });

    const baseDonation1: Partial<DonationType> = {
      receiverUserId: user1._id,
      receiverHerotag: user1.herotag,
      receiverErdAdress: user1.erdAddress,
      isAllowed: true,
      isVisible: true,
    };

    user2 = await factories.user.create({
      herotag: "test2.elrond",
      erdAddress:
        "erd19kzxa002kd7jyksc0765zclcr3il6h4eaqx82kmnvxurmvp2n7sav9vg8",
    });

    const baseDonation2: Partial<DonationType> = {
      receiverUserId: user2._id,
      receiverHerotag: user2.herotag,
      receiverErdAdress: user2.erdAddress,
      isAllowed: true,
      isVisible: true,
    };

    await Promise.all([
      factories.donation.create({
        ...(baseDonation1 as DonationType),
        senderHerotag: "test3.elrond",
        isVisible: true,
        amount: 1.1,
        data: "I am my aunt's sister's daughter",
        timestamp: sub(now, { months: 7 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3il64easx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation1 as DonationType),
        isVisible: true,
        amount: 1,
        data:
          "The toy brought back fond memories of being lost in the rain forest",
        timestamp: sub(now, { weeks: 1 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3il64eaqx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation1 as DonationType),
        isVisible: true,
        amount: 0.01,
        data: "The lake is a long way from here.",
        timestamp: sub(now, { days: 1, hours: 1 }).getTime(),
        senderErdAdress:
          "erd19kaxa002ks7jyksc0765zclcr3il6h4eaqx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation1 as DonationType),
        amount: 0.6,
        data: "Do you give pocket money to your parents?",
        timestamp: sub(now, { weeks: 1 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3il6h4aqx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation1 as DonationType),
        isVisible: true,
        amount: 0.075,
        data: "Mark your mother's birthday on the calendar.",
        timestamp: sub(now, { weeks: 2 }).getTime(),
        senderErdAdress:
          "erd19kaxa02kd7jyksc0761zclcr3il6h4eaqx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation1 as DonationType),
        isVisible: true,
        senderHerotag: "test3.elrond",
        amount: 0.07702,
        data: "He watched the dancing pigler",
        timestamp: sub(now, { days: 2 }).getTime(),
        senderErdAdress:
          "erd19kaxa002ks7jyksc0765zclcr3il6h4eaqx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation1 as DonationType),
        isVisible: true,
        amount: 0.005967,
        data: "Her scream silenced the rowdy teenagers.",
        timestamp: sub(now, { days: 1 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0265zclcr3il6h4eaqx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation2 as DonationType),
        amount: 0.08647,
        data: "No matter how beautiful the sunset, it saddened her knowing she",
        timestamp: sub(now, { months: 7 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3ilsh4eaqx82kmnvxurmvp2n7sav9vg8",
        senderHerotag: "test4.elrond",
        isVisible: true,
      }),
      factories.donation.create({
        ...(baseDonation2 as DonationType),
        amount: 0.1437,
        data: "Wine goes best with beef or pork",
        timestamp: sub(now, { months: 1 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3sl6h4eaqx82kmnvxurmvp2n7sav9vg8",
      }),
      factories.donation.create({
        ...(baseDonation2 as DonationType),
        amount: 1,
        data: "the purple pig and a green do",
        timestamp: sub(now, { weeks: 1 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3ilsh4eaqx82kmnvxurmvp2n7sav9vg8",
        senderHerotag: "test4.elrond",
        isVisible: true,
      }),
      factories.donation.create({
        ...(baseDonation2 as DonationType),
        amount: 0.000709,
        data: "he is never happy until",
        timestamp: sub(now, { hours: 2 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3ilsh4eaqx82kmnvxurmvp2n7sav9vg8",
        senderHerotag: "test4.elrond",
        isVisible: true,
      }),
      factories.donation.create({
        ...(baseDonation2 as DonationType),
        amount: 0.082,
        data: "The toy brought back fond",
        timestamp: sub(now, { hours: 1 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc0765zclcr3ilsh4eaqx82kmnvxurmvp2n7sav9vg8",
        senderHerotag: "test4.elrond",
        isVisible: true,
      }),
      factories.donation.create({
        ...(baseDonation2 as DonationType),
        amount: 0.008088,
        data: "else could see that the sky",
        timestamp: sub(now, { days: 3 }).getTime(),
        senderErdAdress:
          "erd19kaxa002kd7jyksc076dzclcr3il6h4eaqx82kmnvxurmvp2n7sav9vg8",
      }),
    ]);
  });

  describe("Last Donators", () => {
    describe("without pagination", () => {
      it("should return all last donators", async () => {
        const lastDonators = await getLastDonators(user1.herotag);

        expect(lastDonators).toMatchObject({
          itemsPerPage: 10,
          page: 1,
          totalItems: 7,
          totalPages: 1,
        });
        expect(lastDonators).toHaveProperty("items");

        const { items } = lastDonators;

        expect(items).toHaveLength(7);

        const everyDonationHaveGoodHt = items.every(
          ({ receiverHerotag }) => receiverHerotag === user1.herotag
        );

        const timestamps = items.map(({ timestamp }) => timestamp);

        expect(everyDonationHaveGoodHt).toBe(true);
        expect(timestamps).toEqual(timestamps.sort((a, b) => a - b));
      });
    });

    describe("with pagination", () => {
      it("should return all page 2", async () => {
        const lastDonators = await getLastDonators(user1.herotag, {
          itemsPerPage: 3,
          page: 2,
        });

        expect(lastDonators).toMatchObject({
          itemsPerPage: 3,
          page: 2,
          totalItems: 7,
          totalPages: 3,
        });
        expect(lastDonators).toHaveProperty("items");

        const { items } = lastDonators;

        expect(items).toHaveLength(3);

        // TO-DO check items content
      });
    });
  });

  describe("Top Donators", () => {
    describe("without pagination", () => {
      it("should return sorted top donators", async () => {
        const topDonators = await getTopDonators(user2.herotag);

        expect(topDonators).toMatchObject({
          itemsPerPage: 10,
          page: 1,
          totalItems: 3,
          totalPages: 1,
        });
        expect(topDonators).toHaveProperty("items");

        const { items } = topDonators;

        expect(items).toHaveLength(3);

        const everyDonationHaveGoodHt = items.every(
          ({ receiverHerotag }) => receiverHerotag === user2.herotag
        );

        const totalsDonated = items.map(({ totalDonated }) => totalDonated);

        expect(everyDonationHaveGoodHt).toBe(true);
        expect(totalsDonated).toEqual(totalsDonated.sort((a, b) => a - b));
      });
    });

    describe("with pagination", () => {
      it("should return sorted top donators matching filters", async () => {
        const topDonators = await getTopDonators(user2.herotag, {
          itemsPerPage: 2,
          page: 1,
        });

        expect(topDonators).toMatchObject({
          itemsPerPage: 2,
          page: 1,
          totalItems: 3,
          totalPages: 2,
        });
        expect(topDonators).toHaveProperty("items");

        const { items } = topDonators;

        expect(items).toHaveLength(2);

        // TO-DO check items content
      });
    });
  });

  describe("Donations Recap", () => {
    it("should return all time received donations", async () => {
      const donationRecap = await getDonationsRecap(user1.herotag);

      expect(donationRecap.allTime).toEqual(2.867987);
      expect(donationRecap.lastMonth).toEqual(1.692987);
      expect(donationRecap.lastStream).toEqual(1.692987);
    });
  });
});

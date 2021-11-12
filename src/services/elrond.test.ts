import {
  getErdAddress,
  getLastTransactions,
  getTransactionByHash,
  getUpdatedBalance,
} from "./elrond";

describe("elrond test", () => {
  describe("dns", () => {
    describe("when herotag is found on dns", () => {
      it("should return address data", async () => {
        const address = await getErdAddress("streamparticles.elrond");

        expect(address).toEqual(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );
      });
    });

    describe("when herotag is not found on dns", () => {
      it("throw error", async () => {
        const address = await getErdAddress("streamparticles");

        expect(address).toEqual("");
      });
    });
  });

  describe("getUpdatedBalance", () => {
    describe("when erdAddress is wrong", () => {
      it("should return null", async () => {
        expect(() =>
          getUpdatedBalance(
            "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgs-"
          )
        ).rejects.toThrowError("ERD_ADDRESS_NOT_FOUND");
      });
    });

    describe("when erdAddress is correct", () => {
      it("should return balance", async () => {
        const balance = await getUpdatedBalance(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );

        expect(typeof balance).toBe("string");
      });
    });
  });

  describe("getLastTransactions", () => {
    describe("when erdAddress is wrong", () => {
      it("should return null", async () => {
        const lastTransactions = await getLastTransactions(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgs-"
        );

        expect(lastTransactions).toBeInstanceOf(Array);
      });
    });

    describe("when erdAddress is correct", () => {
      it("should return a transactions array", async () => {
        const lastTransactions = await getLastTransactions(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );

        expect(lastTransactions).toBeInstanceOf(Array);
      });
    });
  });

  describe("getTransactionByHash", () => {
    describe("when hash is wrong", () => {
      it("should return null", async () => {
        expect(() =>
          getTransactionByHash(
            "1d511e0835d8aadca32a3d7e93c2cb2215608cd2810f4b0708aa662ad8f6f67-"
          )
        ).rejects.toThrowError("TRANSACTION_NOT_FOUND");
      });
    });

    describe("when erdAddress is correct", () => {
      it("should return a single transaction", async () => {
        const transaction = await getTransactionByHash(
          "882225915bf805ad2372891af0062cb0390b0c8ebbce303200c206254e73052b"
        );

        expect(transaction).toBeInstanceOf(Object);
      });
    });
  });
});

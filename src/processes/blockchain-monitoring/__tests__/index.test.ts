/* eslint-disable @typescript-eslint/no-var-requires */
import { ElrondTransaction } from "@streamparticles/lib";
import { sub } from "date-fns";

import factories from "#utils/tests";
import { fakeTimestamp } from "#utils/tests/fake";

import { filterNewIncomingTransactions } from "../";

describe("Blockchain monitoring unit testing", () => {
  const targetErdAdress = factories.user.build().erdAddress;

  const elrondTransactions: ElrondTransaction[] = [
    factories.transaction.build(),
    factories.transaction.build({
      receiver: targetErdAdress,
    }),
    factories.transaction.build({
      receiver: targetErdAdress,
    }),
    factories.transaction.build({
      receiver: targetErdAdress,
    }),
  ];

  const hashes = elrondTransactions.map(({ hash }) => hash);

  const lastRestart = fakeTimestamp(sub(new Date(), { days: 1 }));

  describe("filterNewIncomingTransactions", () => {
    describe("when there is no last balance snapshot", () => {
      describe("when at least one filter does not match", () => {
        describe("when receiver address does not match target address", () => {
          it("should not return tx", () => {
            const notMatchingTx = factories.transaction.build({
              hash:
                "bc0577f0d15f9be2fdbab0ee4234a07b72ad2bd4f2e8f2aa484f5d62c3f5971d",
              receiver:
                "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmce9kv",
              timestamp: fakeTimestamp(sub(new Date(), { hours: 1 })),
              status: "success",
            });

            const txs = filterNewIncomingTransactions(
              [notMatchingTx, ...elrondTransactions],
              targetErdAdress,
              factories.user.build(),
              hashes,
              lastRestart
            );
            expect(txs).toHaveLength(0);
          });
        });

        describe("when user hasn't streamingStartDate", () => {
          it("should not return tx", () => {
            const notMatchingTx = factories.transaction.build({
              hash:
                "bc0577f0d15f9be2fdbab0ee4234a07b72ad2bd4f2e8f2aa484f5d62c3f5971d",
              receiver: targetErdAdress,
              timestamp: fakeTimestamp(sub(new Date(), { hours: 1 })),
              status: "success",
            });

            const txs = filterNewIncomingTransactions(
              [notMatchingTx, ...elrondTransactions],
              targetErdAdress,
              factories.user.build({ streamingStartDate: null }),
              hashes,
              lastRestart
            );

            expect(txs).toHaveLength(0);
          });
        });

        describe("when tx timestamp is smaller than user streamingStartDate", () => {
          it("should not return tx", () => {
            const notMatchingTx = factories.transaction.build({
              hash:
                "bc0577f0d15f9be2fdbab0ee4234a07b72ad2bd4f2e8f2aa484f5d62c3f5971d",
              receiver: targetErdAdress,
              timestamp: fakeTimestamp(sub(new Date(), { hours: 6 })),
              status: "success",
            });

            const txs = filterNewIncomingTransactions(
              [notMatchingTx, ...elrondTransactions],
              targetErdAdress,
              factories.user.build({
                streamingStartDate: sub(new Date(), { hours: 4 }),
              }),
              hashes,
              lastRestart
            );

            expect(txs).toHaveLength(0);
          });
        });

        describe("when tx hash has already been listenned", () => {
          it("should not return tx", () => {
            const notMatchingTx = factories.transaction.build({
              hash: elrondTransactions[0].hash,
              receiver: targetErdAdress,
              timestamp: fakeTimestamp(sub(new Date(), { hours: 6 })),
              status: "success",
            });

            const txs = filterNewIncomingTransactions(
              [notMatchingTx, ...elrondTransactions],
              targetErdAdress,
              factories.user.build(),
              hashes,
              lastRestart
            );

            expect(txs).toHaveLength(0);
          });
        });

        describe("when status is failed", () => {
          it("should not return tx", () => {
            const notMatchingTx = factories.transaction.build({
              hash:
                "bc0577f0d15f9be2fdbab0ee4234a07b72ad2bd4f2e8f2aa484f5d62c3f5971d",
              receiver: targetErdAdress,
              timestamp: fakeTimestamp(sub(new Date(), { hours: 3 })),
              status: "failed",
            });

            const txs = filterNewIncomingTransactions(
              [notMatchingTx, ...elrondTransactions],
              targetErdAdress,
              factories.user.build(),
              hashes,
              lastRestart
            );

            expect(txs).toHaveLength(0);
          });
        });
      });

      describe("when receiver address match target address, user has streamingStartDate, tx timestamp is greater or equal to user streamingStartDate, status is success", () => {
        it("should return tx", () => {
          const timestamp = fakeTimestamp(sub(new Date(), { hours: 3 }));
          const matchingTx = factories.transaction.build({
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp,
            status: "success",
          });

          const txs = filterNewIncomingTransactions(
            [matchingTx, ...elrondTransactions],
            targetErdAdress,
            factories.user.build({
              erdAddress: targetErdAdress,
              streamingStartDate: sub(new Date(), { hours: 7 }),
            }),
            hashes,
            lastRestart
          );

          expect(txs).toHaveLength(1);
          expect(txs).toEqual([matchingTx]);
        });
      });

      describe("when many txs match filters", () => {
        it("should return txs", () => {
          const timestamp = fakeTimestamp(sub(new Date(), { hours: 3 }));
          const timestamp2 = fakeTimestamp(sub(new Date(), { hours: 2 }));
          const timestamp3 = fakeTimestamp(sub(new Date(), { hours: 1 }));
          const matchingTx1 = factories.transaction.build({
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc5e666",
            receiver: targetErdAdress,
            timestamp,
            status: "success",
          });
          const matchingTx2 = factories.transaction.build({
            hash:
              "b7334dbf756d24fff81ee49eac98b1be7993345bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp: timestamp2,
            status: "success",
          });
          const matchingTx3 = factories.transaction.build({
            hash:
              "b7334dbf756d24fff81ee49eac98b1be7993345bc8932c7d6c7b914c123bc56766",
            receiver: targetErdAdress,
            timestamp: timestamp3,
            status: "success",
          });

          const txs = filterNewIncomingTransactions(
            [matchingTx1, matchingTx2, matchingTx3, ...elrondTransactions],
            targetErdAdress,
            factories.user.build(),
            hashes,
            lastRestart
          );

          expect(txs).toHaveLength(3);
          expect(txs).toEqual([matchingTx1, matchingTx2, matchingTx3]);
        });
      });
    });
  });
});

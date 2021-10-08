import { ElrondTransaction } from "@streamparticles/lib";

import { fakeHex, fakeShard, fakeTimestamp, fakeValue } from "../fake";
import factories from ".";

export const build = (
  overload?: Partial<ElrondTransaction>
): ElrondTransaction => {
  const user = factories.user.build();
  const base = {
    hash: fakeHex(),
    receiver: user.erdAddress,
    receiverShard: fakeShard(),
    sender: fakeHex(),
    senderShard: fakeShard(),
    status: "success",
    timestamp: fakeTimestamp(),
    value: fakeValue(),
  };

  return {
    ...base,
    ...overload,
  } as ElrondTransaction;
};

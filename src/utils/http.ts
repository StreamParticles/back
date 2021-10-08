import { ErrorKinds } from "@streamparticles/lib";

export const throwHttpError = (kind: ErrorKinds): never => {
  throw new Error(kind);
};

import { ErrorKinds } from "@streamparticles/lib";

export const error = (kind: ErrorKinds): Error => {
  return new Error(kind);
};

export const throwError = (kind: ErrorKinds): never => {
  throw error(kind);
};

import { UserAccountStatus, UserType } from "@streamparticles/lib";

export const isVerified = (user: UserType): boolean => {
  return user.status === UserAccountStatus.VERIFIED;
};

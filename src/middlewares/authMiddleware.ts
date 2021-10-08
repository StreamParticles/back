import { NextFunction, Response } from "express";

import User from "#models/User";
import { jwtPayload } from "#services/jwt";
import { ErrorKinds, UserAccountStatus } from "@streamparticles/lib";
import { AuthenticatedRequest } from "#types_/express";
import { throwHttpError } from "#utils/http";

export const authenticateMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { authorization } = req.headers;

  const token = authorization && authorization.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const payload = jwtPayload(token);

    if (!payload.herotag) throwHttpError(ErrorKinds.INVALID_AUTH_TOKEN);

    const user = await User.findByHerotag(payload.herotag)
      .select({ status: true, herotag: true })
      .orFail(new Error(ErrorKinds.NOT_REGISTERED_HEROTAG))
      .lean();

    if (user?.status === UserAccountStatus.PENDING_VERIFICATION)
      throwHttpError(ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING);

    req.herotag = user.herotag;
    req.userId = user._id;

    next();
  } catch (error) {
    throwHttpError(ErrorKinds.INVALID_AUTH_TOKEN);
  }
};

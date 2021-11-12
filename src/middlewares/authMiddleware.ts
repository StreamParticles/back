import { ErrorKinds } from "@streamparticles/lib";
import { NextFunction, Response } from "express";

import User from "#models/User";
import { jwtPayload } from "#services/jwt";
import { AuthenticatedRequest } from "#types_/express";
import { isVerified } from "#utils/user";

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

    if (!payload.herotag) throw new Error(ErrorKinds.INVALID_AUTH_TOKEN);

    const user = await User.findByHerotag(payload.herotag)
      .select({ status: true, herotag: true })
      .orFail(new Error(ErrorKinds.NOT_REGISTERED_HEROTAG))
      .lean();

    if (!isVerified(user))
      throw new Error(ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING);

    req.herotag = user.herotag;
    req.userId = user._id;

    next();
  } catch (error) {
    throw new Error(ErrorKinds.INVALID_AUTH_TOKEN);
  }
};

export const apiAuthenticateMiddleware = async (
  req: AuthenticatedRequest<{ apiKey: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { apiKey } = req.params;

    if (!apiKey) throw new Error(ErrorKinds.INVALID_REQUEST_PAYLOAD);

    const user = await User.findOne({
      "integrations.apiKey": req.params.apiKey,
    })
      .select({ status: true, herotag: true })
      .orFail(new Error(ErrorKinds.NOT_REGISTERED_HEROTAG))
      .lean();

    if (!isVerified(user))
      throw new Error(ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING);

    req.herotag = user.herotag;
    req.userId = user._id;

    next();
  } catch (error) {
    throw new Error(ErrorKinds.INVALID_AUTH_TOKEN);
  }
};

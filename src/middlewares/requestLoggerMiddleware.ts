import { NextFunction, Response } from "express";

import logger from "#services/logger";
import { AuthenticatedRequest } from "#types_/express";

export const requestLoggerMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  logger.info(`${req.method} ${req.url}`);

  next();
};

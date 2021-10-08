/* eslint-disable @typescript-eslint/ban-ts-comment */
import logger from "#services/logger";
import { NextFunction, Request, Response } from "express";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const error = typeof err === "string" ? new Error(err) : err;

  logger.error({
    ...(!!req.query && { query: req.query }),
    url: req.url,
    error: error.message,
    stack: error.stack,
  });

  //@ts-ignore
  const status = error.status || 500;

  const { message } = error;

  res.status(status).send({ message });
};

export default errorMiddleware;

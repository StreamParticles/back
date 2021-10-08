import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { isEmpty } from "lodash";

import logger from "#services/logger";
import { ErrorKinds } from "@streamparticles/lib";
import { throwHttpError } from "#utils/http";

export const createValidationMiddleware = <Req extends Request<{}, {}, {}, {}>>(
  schema: ObjectSchema
) => {
  return (req: Req, res: Response, next: NextFunction): void => {
    const data = {
      ...(!isEmpty(req.body) && { body: req.body }),
      ...(!isEmpty(req.query) && { query: req.query }),
      ...(!isEmpty(req.params) && { params: req.params }),
    };

    const result = schema.validate(data, { convert: true });

    if (result.error) {
      logger.error(result.error.message);
      throwHttpError(ErrorKinds.INVALID_REQUEST_PAYLOAD);
    }

    return next();
  };
};

import { Request, Response } from "express";
import multer from "multer";
import path, { extname } from "path";

import logger from "#services/logger";
import { ENV } from "#utils/env";

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (!ENV.MEDIAS_FOLDER)
      throw new Error("Can't accept uploads without medias folder defined");

    cb(null, path.resolve(__dirname, ENV.MEDIAS_FOLDER as string));
  },
  filename: function(req, file, cb) {
    cb(
      null,
      [req.params.mediaType, Date.now(), extname(file.originalname)].join("_")
    );
  },
});

const upload = multer({
  storage: storage,
}).array("file", 1);

export const uploadMiddleware = async (
  req: Request,
  res: Response
): Promise<void> => {
  const filename = await new Promise((resolve, reject) => {
    upload(req, res, function(error: unknown) {
      if (error) {
        logger.error("Error uploading media", { error });
        reject(error);
      }

      const [file] = req.files as Express.Multer.File[];

      resolve(file.filename);
    });
  });

  res.send(filename);
};

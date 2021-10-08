import {
  AlertsSetWidget,
  DonationBarWidget,
  UserType,
  WidgetsKinds,
} from "@streamparticles/lib";
import fs from "fs";
import path from "path";

import User from "#models/User";
import logger from "#services/logger";
import { connectToDatabase } from "#services/mongoose";

const cleanMediasFolder = async () => {
  const audios = fs
    .readdirSync(path.join(__dirname, "../../remote/medias/audios"))
    .filter((fileName) => fileName !== ".DS_Store");
  const images = fs
    .readdirSync(path.join(__dirname, "../../remote/medias/images"))
    .filter((fileName) => fileName !== ".DS_Store");

  const users = await User.find()
    .select({ integrations: true })
    .lean();

  audios.forEach((fileName) => {
    const isUsed = users.some((user: UserType) =>
      user.integrations?.overlays?.some(({ widgets }) =>
        widgets.some((widget) => {
          if (widget.kind === WidgetsKinds.ALERTS) {
            return (widget as AlertsSetWidget).variations.some(
              ({ audio }) => audio?.source?.[0]?.name === fileName
            );
          }

          return false;
        })
      )
    );

    if (!isUsed)
      fs.unlinkSync(
        path.join(__dirname, "../../remote/medias/audios", fileName)
      );
  });

  images.forEach((fileName) => {
    const isUsed = users.some((user: UserType) =>
      user.integrations?.overlays?.some(({ widgets }) =>
        widgets.some((widget) => {
          if (widget.kind === WidgetsKinds.ALERTS) {
            return (widget as AlertsSetWidget).variations.some(
              ({ image }) => image?.source?.[0]?.name === fileName
            );
          }

          if (widget.kind === WidgetsKinds.DONATION_BAR) {
            return (
              ((widget as DonationBarWidget).data.cursor?.source?.[0] as any) // TO REMOVE AFTER sp/lib 0.1.18
                ?.name === fileName
            );
          }

          return false;
        })
      )
    );

    if (!isUsed)
      fs.unlinkSync(
        path.join(__dirname, "../../remote/medias/images", fileName)
      );
  });
};

connectToDatabase()
  .then(async () => {
    logger.info("Starting cleanMediasFolder");

    await cleanMediasFolder();

    logger.info("Done cleanMediasFolder");
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => process.exit());

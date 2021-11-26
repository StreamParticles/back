import {
  AlertsSetWidget,
  DonationBarWidget,
  WidgetsKinds,
} from "@streamparticles/lib";
import fs from "fs";
import path from "path";

import Widget from "#models/widgetsModels/Widget";
import logger from "#services/logger";
import { connectToDatabase } from "#services/mongoose";

const cleanMediasFolder = async () => {
  const audios = fs
    .readdirSync(path.join(__dirname, "../../remote/medias/audios"))
    .filter((fileName) => fileName !== ".DS_Store");
  const images = fs
    .readdirSync(path.join(__dirname, "../../remote/medias/images"))
    .filter((fileName) => fileName !== ".DS_Store");

  const widgets = await Widget.find().lean();

  audios.forEach((fileName) => {
    const isUsed = widgets.some((widget) => {
      if (widget.kind === WidgetsKinds.ALERTS) {
        return (widget as AlertsSetWidget).variations.some(
          ({ audio }) => audio?.source?.[0]?.name === fileName
        );
      }

      return false;
    });

    if (!isUsed)
      fs.unlinkSync(
        path.join(__dirname, "../../remote/medias/audios", fileName)
      );
  });

  images.forEach((fileName) => {
    const isUsed = widgets.some((widget) => {
      if (widget.kind === WidgetsKinds.ALERTS) {
        return (widget as AlertsSetWidget).variations.some(
          ({ image }) => image?.source?.[0]?.name === fileName
        );
      }

      if (widget.kind === WidgetsKinds.DONATION_BAR) {
        return (
          (widget as DonationBarWidget).data.cursor?.source?.[0]?.name ===
          fileName
        );
      }

      return false;
    });

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

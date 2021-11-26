/* eslint-disable @typescript-eslint/no-explicit-any */
import { OverlayData, UserType, Widget } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";

import Overlay from "#models/Overlay";
import User from "#models/User";
import WidgetModel from "#models/widgetsModels/Widget";
import logger from "#services/logger";
import { connectToDatabase } from "#services/mongoose";

const createWidget = async (widget: Widget, userId: string): Promise<Id> => {
  const created = await WidgetModel.create({ ...widget, userId });

  return created._id;
};

const createOverlay = async (
  overlay: OverlayData,
  userId: string
): Promise<Id> => {
  const widgetIds = await Promise.all(
    (((overlay?.widgets || []) as unknown) as Widget[]).map((widget) =>
      createWidget(widget, userId)
    )
  );

  const created = await Overlay.create({
    ...overlay,
    widgets: widgetIds,
    userId,
  });

  return created._id;
};

const allocateDataInCollectionsV2 = async () => {
  const users = await User.find().lean();

  await Promise.all(
    users.map(async (user: UserType) => {
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              // New overlay schema
              ...(user.integrations?.overlays && {
                "integrations.overlays": await Promise.all(
                  (((user.integrations.overlays ||
                    []) as unknown) as OverlayData[])?.map((o) =>
                    createOverlay(o, user._id as string)
                  )
                ),
              }),
            },
          },
          { strict: false }
        );

        logger.info("user updated", {
          userId: user._id,
          userHt: user.herotag,
        });
      } catch (error) {
        logger.error("An error occured while updating user", {
          userId: user._id,
          userHt: user.herotag,
        });
      }
    })
  );
};

connectToDatabase()
  .then(async () => {
    logger.info("Starting allocateDataInCollections");

    await allocateDataInCollectionsV2();

    logger.info("Done allocateDataInCollections");
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => process.exit());

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertVariation,
  BarDisplayAnimations,
  DonationBarDisplays,
  DonationBarWidget,
  EnterAnimationKinds,
  ExitAnimationKinds,
  LogoAnimations,
  OverlayData,
  UserAccountStatus,
  UserType,
  WidgetsKinds,
} from "@streamparticles/lib";
import mongoose from "mongoose";

import Overlay from "#models/Overlay";
import User from "#models/User";
import AlertsSetWidget from "#models/widgetsModels/AlertsSetWidget";
import DonationBarWidgetModel from "#models/widgetsModels/DonationBarWidget";
import logger from "#services/logger";
import { connectToDatabase } from "#services/mongoose";
import { ENV } from "#utils/env";

const animationMapper: Record<string, any> = {
  "slide-up-enter": EnterAnimationKinds.SLIDE_UP,
  "slide-down-enter": EnterAnimationKinds.SLIDE_DOWN,
  "slide-left-enter": EnterAnimationKinds.SLIDE_LEFT,
  "slide-right-enter": EnterAnimationKinds.SLIDE_RIGHT,
  "fade-in": EnterAnimationKinds.FADE_IN,
  grow: EnterAnimationKinds.GROW,
  "slide-up-exit": ExitAnimationKinds.SLIDE_UP,
  "slide-down-exit": ExitAnimationKinds.SLIDE_DOWN,
  "slide-left-exit": ExitAnimationKinds.SLIDE_LEFT,
  "slide-right-exit": ExitAnimationKinds.SLIDE_RIGHT,
  "fade-out": ExitAnimationKinds.FADE_OUT,
  shrink: ExitAnimationKinds.SHRINK,
};

const createOverlay = async (overlay: any, userId: string) => {
  const alertsSetWidget =
    overlay?.alerts?.variations?.length &&
    (await AlertsSetWidget.create({
      userId,
      _id: mongoose.Types.ObjectId(),
      isActive: true,
      name: "Alerts set",
      kind: WidgetsKinds.ALERTS,
      variations: overlay?.alerts?.variations.map(
        (variation: any): AlertVariation => {
          return {
            top: variation?.offsetTop,
            left: variation?.offsetLeft,
            duration: variation?.duration,
            chances: variation?.chances,
            requiredAmount: variation?.requiredAmount,
            _id: mongoose.Types.ObjectId(),
            name: variation?.name,
            color: variation?.color,
            ...(variation?.sound?.soundPath && {
              audio: {
                source: [
                  {
                    name: variation?.sound?.soundPath,
                    response: variation?.sound?.soundPath,
                    status: "done",
                    uid: variation?.sound?.soundPath,
                    url: `${ENV.MEDIAS_GATEWAY}/${variation?.sound?.soundPath}`,
                  },
                ],
                delay: variation?.soundDelay,
                offset: variation?.soundOffset,
              },
            }),
            ...(variation?.image?.imagePath && {
              image: {
                source: [
                  {
                    name: variation?.image?.imagePath,
                    response: variation?.image?.imagePath,
                    status: "done",
                    uid: variation?.image?.imagePath,
                    url: `${ENV.MEDIAS_GATEWAY}/${variation?.image?.imagePath}`,
                  },
                ],
                width: variation?.image?.width,
                height: variation?.image?.height,
                top: variation?.offsetTop,
                left: variation?.offsetLeft,
                animation: {
                  enter: {
                    kind:
                      animationMapper[variation?.image?.animation?.enter?.type],
                    duration: variation?.image?.animation?.enter?.duration,
                  },
                  exit: {
                    kind:
                      animationMapper[variation?.image?.animation?.exit?.type],
                    duration: variation?.image?.animation?.exit?.duration,
                  },
                },
              },
            }),
            text: {
              top: variation?.text?.offsetTop,
              left: variation?.text?.offsetLeft,
              content: variation?.text?.content,
              width: variation?.text?.width,
              height: variation?.text?.height,
              fontSize: variation?.text?.size,
              fontFamily: variation?.text?.fontFamily,
              color: variation?.text?.fontColor,
              lineHeight: variation?.text?.lineHeight,
              letterSpacing: variation?.text?.letterSpacing,
              textAlign: variation?.text?.textAlign,
              stroke: {
                width: variation?.text?.stroke?.width,
                color: variation?.text?.stroke?.width,
              },
              animation: {
                enter: {
                  kind:
                    animationMapper[variation?.text?.animation?.enter?.type],
                  duration: variation?.text?.animation?.enter?.duration,
                },
                exit: {
                  kind: animationMapper[variation?.text?.animation?.exit?.type],
                  duration: variation?.text?.animation?.exit?.duration,
                },
              },
            },
          };
        }
      ),
    }));

  const displayKindsMapper: Record<string, DonationBarDisplays> = {
    Horizontal: DonationBarDisplays.HORIZONTAL,
    Vertical: DonationBarDisplays.VERTICAL,
    Circle: DonationBarDisplays.CIRCLE,
    Blur: DonationBarDisplays.BLUR,
  };

  const logoAnimationsMapper: Record<string, LogoAnimations> = {
    none: LogoAnimations.NONE,
    bounce: LogoAnimations.BOUNCE,
    rotate: LogoAnimations.ROTATE,
    blur: LogoAnimations.SHAKE,
  };

  const barAnimationsMapper: Record<string, BarDisplayAnimations> = {
    none: BarDisplayAnimations.NONE,
    bounce: BarDisplayAnimations.BOUNCE,
    lighten: BarDisplayAnimations.LIGHTEN,
    center: BarDisplayAnimations.CENTER,
  };

  const donationBarWidget =
    overlay?.donationBar &&
    (await DonationBarWidgetModel.create({
      userId,
      _id: mongoose.Types.ObjectId(),
      isActive: true,
      name: "Donation bar",
      kind: WidgetsKinds.DONATION_BAR,
      data: {
        _id: mongoose.Types.ObjectId(),
        top: overlay?.donationBar?.offsetTop,
        left: overlay?.donationBar?.offsetLeft,
        display: {
          kind: (displayKindsMapper[
            overlay?.donationBar?.displaySettings?.kind
          ] || DonationBarDisplays.HORIZONTAL) as DonationBarDisplays,
          width: overlay?.donationBar?.displaySettings?.width,
          height: overlay?.donationBar?.displaySettings?.height,
        },
        donationBarItemPosition: {
          top: overlay?.donationBar?.offsetTop,
          left: overlay?.donationBar?.offsetLeft,
          width: overlay?.donationBar?.displaySettings?.width,
          height: overlay?.donationBar?.displaySettings?.height,
        },
        amountDisplay: overlay?.donationBar?.indicationDisplay,
        goalAmount: overlay?.donationBar?.donationGoalAmount?.value,
        ...(overlay?.donationBar?.centerCursorPath && {
          cursor: {
            source: [
              {
                name: overlay?.donationBar?.centerCursorPath,
                response: overlay?.donationBar?.centerCursorPath,
                status: "done",
                uid: overlay?.donationBar?.centerCursorPath,
                url: `${ENV.MEDIAS_GATEWAY}/${overlay?.donationBar?.centerCursorPath}`,
              },
            ],
            scale: overlay?.donationBar?.centerCursorScale,
          },
        }),
        text: {
          top: overlay?.donationBar?.donationBarDescription?.offsetTop,
          left: overlay?.donationBar?.donationBarDescription?.offsetLeft,
          content: overlay?.donationBar?.donationBarDescription?.content,
          width: overlay?.donationBar?.donationBarDescription?.width,
          height: overlay?.donationBar?.donationBarDescription?.height,
          fontSize: overlay?.donationBar?.donationBarDescription?.size,
          fontFamily: overlay?.donationBar?.donationBarDescription?.fontFamily,
          color: overlay?.donationBar?.donationBarDescription?.fontColor,
          lineHeight: overlay?.donationBar?.donationBarDescription?.lineHeight,
          letterSpacing:
            overlay?.donationBar?.donationBarDescription?.letterSpacing,
          textAlign: overlay?.donationBar?.donationBarDescription?.textAlign,
          stroke: {
            width:
              overlay?.donationBar?.text?.donationBarDescription?.stroke?.width,
            color:
              overlay?.donationBar?.text?.donationBarDescription?.stroke?.width,
          },
          animation: {
            enter: {
              kind:
                animationMapper[
                  overlay?.donationBar?.donationBarDescription?.animation?.enter
                    ?.type
                ],
              duration:
                overlay?.donationBar?.donationBarDescription?.animation?.enter
                  ?.duration,
            },
            exit: {
              kind:
                animationMapper[
                  overlay?.donationBar?.donationBarDescription?.animation?.exit
                    ?.type
                ],
              duration:
                overlay?.donationBar?.donationBarDescription?.animation?.exit
                  ?.duration,
            },
          },
        },
        border: {
          color: overlay?.donationBar?.border?.color,
          width: overlay?.donationBar?.border?.width,
          radius: overlay?.donationBar?.border?.radius,
        },
        sentAmount: {
          backgroundColor: overlay?.donationBar?.sentAmountPart?.color,
          textColor: overlay?.donationBar?.sentAmountPart?.textColor,
        },
        leftToSend: {
          backgroundColor: overlay?.donationBar?.amountToSendPart?.color,
          textColor: overlay?.donationBar?.amountToSendPart?.textColor,
        },
        reaction: {
          ...(overlay?.donationBar?.donationReaction?.soundPath && {
            audio: {
              source: [
                {
                  name: overlay?.donationBar?.donationReaction?.soundPath,
                  response: overlay?.donationBar?.donationReaction?.soundPath,
                  status: "done",
                  uid: overlay?.donationBar?.donationReaction?.soundPath,
                  url: `${ENV.MEDIAS_GATEWAY}/${overlay?.donationBar?.donationReaction?.soundPath}`,
                },
              ],
            },
          }),
          duration: overlay?.donationBar?.donationReaction?.duration,
          fillSentAmount: {
            color:
              overlay?.donationBar?.donationReaction?.fillSentAmountPart?.color,
          },
          animateLogo: {
            kind:
              logoAnimationsMapper[
                overlay?.donationBar?.donationReaction?.animateLogo?.kind
              ],
          },
          animateBar: {
            kind:
              barAnimationsMapper[
                overlay?.donationBar?.donationReaction?.animateBarDisplay?.kind
              ],
          },
        },
      },
    } as DonationBarWidget));

  const data = {
    _id: overlay._id as string,
    name: overlay.name as string,
    color: overlay.color as string,
    generatedLink: overlay.generatedLink as string,
    widgets: [alertsSetWidget?._id, donationBarWidget?._id].filter(Boolean),
    userId,
  };

  const created = await Overlay.create(data);

  return created._id;
};

const allocateDataInCollections = async () => {
  const users = await User.find({}, null, { strict: false }).lean();

  await Promise.all(
    users.map(async (user: UserType) => {
      try {
        const status = user.status;

        const statusMapper = {
          0: UserAccountStatus.PENDING_VERIFICATION,
          1: UserAccountStatus.VERIFIED,
          2: UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION,
        };

        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              status:
                statusMapper[(status as unknown) as 0 | 1 | 2] ||
                UserAccountStatus.PENDING_VERIFICATION,
              // We have to update database-encrypted fields that were not in previous version
              ...(user.password && { password: user.password }),
              ...(user.pendingPassword && { password: user.pendingPassword }),
              ...(user.integrations?.ifttt?.eventName && {
                "integrations.ifttt.eventName":
                  user.integrations?.ifttt?.eventName,
              }),
              ...(user.integrations?.ifttt?.triggerKey && {
                "integrations.ifttt.triggerKey":
                  user.integrations?.ifttt?.triggerKey,
              }),
              ...(user.referralLink && {
                referralLink: user.referralLink,
              }),

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

    await allocateDataInCollections();

    logger.info("Done allocateDataInCollections");
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => process.exit());

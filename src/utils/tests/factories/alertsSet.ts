import {
  AlertsSetWidget,
  AlertVariation,
  WidgetsKinds,
} from "@streamparticles/lib";
import faker from "faker";
import mongoose from "mongoose";

import AlertsSetWidgetModel from "#models/widgetsModels/AlertsSetWidget";

import { fakeHexColor, fakeMediaSource } from "../fake";

export const buildVariation = (
  overload?: Partial<AlertVariation>
): AlertVariation => {
  return {
    name: faker.commerce.productName(),
    color: fakeHexColor(),
    requiredAmount: faker.datatype.number(1000) / 1000,
    chances: faker.datatype.number(1000),
    duration: faker.datatype.number(10),
    audio: {
      delay: 0,
      offset: 0,
      source: [fakeMediaSource("audios")],
      ...overload?.audio,
    },
    image: {
      top: 0,
      height: 0,
      left: 0,
      width: 0,
      source: [fakeMediaSource("images")],
      ...overload?.image,
    },
    text: {
      content: faker.lorem.sentences(2),
      fontColor: fakeHexColor(),
      fontSize: faker.datatype.number({ min: 20, max: 50 }),
      ...overload?.text,
    },
    ...overload,
  } as AlertVariation;
};

export const build = (overload?: Partial<AlertsSetWidget>): AlertsSetWidget => {
  return {
    _id: mongoose.Types.ObjectId(),
    kind: WidgetsKinds.ALERTS,
    isActive: true,
    name: faker.commerce.productName(),
    variations: [buildVariation(), buildVariation()],
    userId: mongoose.Types.ObjectId(),
    ...overload,
  };
};

export const create = async (
  overload?: Partial<AlertsSetWidget>
): Promise<AlertsSetWidget> => {
  const widget = (await AlertsSetWidgetModel.create(
    build(overload)
  )) as AlertsSetWidget & mongoose.Document<any, any, AlertsSetWidget>;

  return widget.toObject();
};

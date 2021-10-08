import { MediaSource } from "@streamparticles/lib";
import faker from "faker";

export const fakeHexColor = (): string =>
  `#${faker.datatype.hexaDecimal()}${faker.datatype.hexaDecimal()}${faker.datatype.hexaDecimal()}${faker.datatype.hexaDecimal()}${faker.datatype.hexaDecimal()}${faker.datatype.hexaDecimal()}`;

export const fakeMediaSource = (folder?: string): MediaSource => {
  const filename = faker.system.fileName();

  return {
    name: filename,
    response: filename,
    status: "done",
    uid: faker.datatype.uuid(),
    url: `http://localhost:6666/${folder || "medias"}/${filename}`,
  };
};

export const fakeShard = (): number => faker.datatype.number(2);

export const fakeHex = (): string => faker.datatype.hexaDecimal(64);

export const fakeTimestamp = (date?: Date): number =>
  new Date(date || faker.date.recent()).getTime() * 0.001;

export const fakeValue = (): string =>
  String(faker.datatype.number(99) * 1000000000000000);

export const fakeHerotag = (): string => `${faker.internet.userName()}.elrond`;

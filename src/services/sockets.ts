// https://soyuka.me/mieux-organiser-ses-sockets-avec-express-js/

import { ErrorKinds } from "@streamparticles/lib";
import { Server as HttpServer } from "http";
import Joi from "joi";
import { Server, Socket as Socket_ } from "socket.io";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import socketIoAuth from "socketio-auth";

import User from "#models/User";
import { normalizeHerotag } from "#utils/transactions";
import { isVerified } from "#utils/user";

import logger from "./logger";
import { subscriber } from "./redis";

interface ApiKeySocketData {
  herotag: string;
  apiKey: string;
}

interface OverlayLinkSocketData {
  herotag: string;
  overlayLink: string;
}

type SocketData = ApiKeySocketData | OverlayLinkSocketData;

type Socket = Socket_ & { data?: SocketData };

const isOverlayLinkSocketData = (
  data: SocketData
): data is OverlayLinkSocketData => {
  return !!(data as OverlayLinkSocketData).overlayLink;
};

const apiKeyAuthDataValidator = Joi.object({
  herotag: Joi.string().required(),
  apiKey: Joi.string().required(),
});

const overlayLinkAuthDataValidator = Joi.object({
  herotag: Joi.string().required(),
  overlayLink: Joi.string().required(),
});

interface SocketCallBack {
  (err?: string | null, success?: boolean): void;
}

// Used to authenticate a user connecting to socket through socket API
const apiKeyAuthenticate = async (
  data: ApiKeySocketData,
  callback: SocketCallBack
) => {
  const { error } = apiKeyAuthDataValidator.validate(data);
  if (error) {
    logger.warn(ErrorKinds.INVALID_REQUEST_PAYLOAD, {
      context: "socket connection",
      herotag: data.herotag,
    });

    return callback(ErrorKinds.INVALID_REQUEST_PAYLOAD);
  }

  try {
    const user = await User.findByHerotag(data.herotag)
      .select({ status: true, herotag: true, "integrations.apiKey": true })
      .lean();

    if (!user) {
      logger.warn(ErrorKinds.NOT_REGISTERED_HEROTAG, {
        context: "socket connection",
        herotag: data.herotag,
      });

      return callback(ErrorKinds.NOT_REGISTERED_HEROTAG);
    }

    if (!isVerified(user)) {
      logger.warn(ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING, {
        context: "socket connection",
        herotag: data.herotag,
      });

      return callback(ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING);
    }

    if (user.integrations?.apiKey !== data.apiKey) {
      logger.warn(ErrorKinds.INVALID_API_KEY, {
        context: "socket connection",
        herotag: data.herotag,
      });
    }

    return callback(
      ErrorKinds.INVALID_API_KEY,
      user.integrations?.apiKey === data.apiKey
    );
  } catch (error) {
    return callback(ErrorKinds.INVALID_AUTH_TOKEN);
  }
};

// Used to authenticate a user connecting to socket via streamParticles interface or streamParticles Browser-source
const overlayLinkAuthenticate = async (
  data: OverlayLinkSocketData,
  callback: SocketCallBack
) => {
  const { error } = overlayLinkAuthDataValidator.validate(data);
  if (error) {
    logger.warn(ErrorKinds.INVALID_REQUEST_PAYLOAD, {
      context: "socket connection",
      herotag: data.herotag,
    });

    return callback(ErrorKinds.INVALID_REQUEST_PAYLOAD);
  }

  try {
    const user = await User.findOne({
      herotag: data.herotag,
      "integrations.overlays.generatedLink": data.overlayLink,
    })
      .select({ status: true, herotag: true })
      .lean();

    if (!user) {
      logger.warn(ErrorKinds.NOT_REGISTERED_HEROTAG, {
        context: "socket connection",
        herotag: data.herotag,
      });

      return callback(ErrorKinds.NOT_REGISTERED_HEROTAG);
    }

    if (!isVerified(user)) {
      logger.warn(ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING, {
        context: "socket connection",
        herotag: data.herotag,
      });
    }

    return callback(
      ErrorKinds.ACCOUNT_WITH_VERIFICATION_PENDING,
      isVerified(user)
    );
  } catch (error) {
    logger.warn(ErrorKinds.INVALID_AUTH_TOKEN, {
      context: "socket connection",
      herotag: data.herotag,
    });

    return callback(ErrorKinds.INVALID_AUTH_TOKEN);
  }
};

const authenticate = (
  socket: Socket,
  data: SocketData,
  callback: SocketCallBack
) => {
  socket.data = data;

  return isOverlayLinkSocketData(data)
    ? overlayLinkAuthenticate(data, callback)
    : apiKeyAuthenticate(data, callback);
};

const postAuthenticate = (socket: Socket, data: SocketData) => {
  socket.join(normalizeHerotag(data.herotag));
  logger.info("Socket connection", { herotag: data.herotag });
};

const disconnect = (socket: Socket) => {
  logger.info("Socket disconnected", { herotag: socket.data?.herotag });
};

export const listen = (server: HttpServer): void => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });

  socketIoAuth(io, {
    authenticate,
    postAuthenticate,
    disconnect,
    timeout: "none",
  });

  subscriber.psubscribe("DONATION");
  subscriber.on("pmessage", function(_, channel, stringifiedData) {
    try {
      const { room, ...parsedData } = JSON.parse(stringifiedData);

      io.to(room).emit("donation", parsedData);
    } catch (error) {
      logger.error("Unparsable redis publish data", {
        error,
        channel,
        stringifiedData,
      });
    }
  });
};

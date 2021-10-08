import "module-alias/register";

import http from "http";

import { validateAuthenticationDataFromTransaction } from "#processes/authentication";
import { resumeBlockchainMonitoring } from "#processes/blockchain-monitoring";
import logger from "#services/logger";
import { connectToDatabase } from "#services/mongoose";
import { getLastRestart, setLastRestart } from "#services/redis";
import { listen } from "#services/sockets";
import { ENV } from "#utils/env";

import app from "./app";

connectToDatabase().then(() => {
  const server = http.createServer(app);

  listen(server);

  server.listen(ENV.ENTRYPOINT_API_PORT, async () => {
    logger.info("Start listenning on port", { port: ENV.ENTRYPOINT_API_PORT });

    await setLastRestart();
    const lastRestartTimestamp = await getLastRestart();
    logger.info("Server last restart timestamp saved in Redis", {
      lastRestartTimestamp,
    });

    try {
      validateAuthenticationDataFromTransaction();
    } catch (error) {
      logger.error(
        "An error occured while trying to validateAuthenticationDataFromTransaction",
        { error }
      );
    }

    try {
      resumeBlockchainMonitoring();
    } catch (error) {
      logger.error(
        "An error occured while trying to resumeBlockchainMonitoring",
        { error }
      );
    }
  });
});

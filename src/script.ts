import "module-alias/register";

/* eslint-disable no-console */
import fs from "fs";

import logger from "#services/logger";

if (process.argv[2] && fs.existsSync(`./dist/scripts/${process.argv[2]}.js`)) {
  require(`./scripts/${process.argv[2]}.js`);
} else {
  logger.warn("file not found");
}

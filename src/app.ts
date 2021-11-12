/* eslint-disable @typescript-eslint/ban-ts-comment */
import express from "express";

require("express-async-errors");

import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
//@ts-ignore
import xss from "xss-clean";

import errorMiddleware from "#middlewares/errorMiddleware";
import { requestLoggerMiddleware } from "#middlewares/requestLoggerMiddleware";

import routes from "./api";

const app = express();

// set security HTTP headers /\ CAUTION: Override header below if set after /\
app.use(helmet());
app.use(requestLoggerMiddleware);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000, // limit each IP to 1000 requests per windowMs
});

app.set("trust proxy", 1);
app.use(limiter);

app.use(function(req, res, next) {
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, PUT, OPTIONS, DELETE, GET"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src * data:; script-src 'self' 'unsafe-inline' https://www.youtube.com https://ajax.googleapis.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; frame-src *; media-src data: 'self' https: blob:; frame-ancestors *;"
    // "default-src 'self' https:; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; script-src 'self' 'unsafe-inline' https://www.youtube.com https://ajax.googleapis.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; frame-src *; media-src data: 'self' https: blob:; frame-ancestors *;"
  );
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());

app.use("/api", routes);

app.use(errorMiddleware);

export default app;

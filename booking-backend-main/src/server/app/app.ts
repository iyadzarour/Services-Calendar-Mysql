import express from "express";

import { json, urlencoded } from "body-parser";
import { rateLimiterUsingThirdParty } from "./middlewares/rateLimiter";

import { configure as authApi } from "./user/resource";
import { configure as categoryApi } from "./category/resource";
import { configure as appointmentApi } from "./appointment/resource";
import { configure as contactApi } from "./contact/resource";
import { configure as calendarApi } from "./calendar/resource";
import { configure as scheduleApi } from "./schedule/resource";
import { configure as locationAwareApi } from "./schedule/locationAwareResource";
import { configure as emailApi } from "./email/resource";
import { configure as fileApi } from "./file/resource";

import helmet from "helmet";
import fileUpload from 'express-fileupload';

import admin from 'firebase-admin';

import errorHandler from "./middlewares/errorHandler";
import { getEnv } from "../env";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger/swagger_output.json";
import reminderJob from "./reminderJob";
import dbbackup from "./dbbackup";


const serviceAccount = {
  projectId: getEnv().firebase_project_Id,
  clientEmail: getEnv().firebase_client_email,
  privateKey: getEnv().firebase_private_key,
}

const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

export const app = express();

reminderJob();
dbbackup();

app.use(
  helmet({
    frameguard: { action: "deny" },
  })
);

app.use(cors);
app.use(cookieParser);
app.disable("x-powered-by");
app.use(
  fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 * 100000 },
  })
);

// Firebase is optional - only initialize if credentials are provided
// If not using Firebase, file storage will use local disk storage instead
if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
  try {
    admin.initializeApp({
      // @ts-ignore
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'your-storage-bucket-url',
    });
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed, will use local storage:', error);
  }
} else {
  console.log('Firebase credentials not provided, using local file storage');
}

app.use(json());
app.use(urlencoded({ extended: true }));

app.set("port", process.env.PORT || 11700);

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.use(rateLimiterUsingThirdParty);
if (getEnv().env === "development") {
  app.use("/app/docs-yuop!", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}
app.get("/", (req, res) => {
  res.json({ status: `up` });
});

const appScoped = express.Router();

authApi(appScoped);
categoryApi(appScoped);
appointmentApi(appScoped);
contactApi(appScoped);
calendarApi(appScoped);
scheduleApi(appScoped);
locationAwareApi(appScoped);
emailApi(appScoped);
fileApi(appScoped);

// Use /api prefix to match frontend expectations
app.use(`/api`, appScoped);

app.use(errorHandler);
//

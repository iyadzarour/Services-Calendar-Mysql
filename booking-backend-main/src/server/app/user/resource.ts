import express from "express";
import UserControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";
import { passwordHashHandler } from "../middlewares/authMiddleware";

export const configure = (app: express.Router) => {
  app.post(
    "/auth/signin",
    injectService,
    ValidateSchema.prepare(schemas.signinSchema),
    UserControllers.login
  );
  app.post(
    "/auth/signup",
    injectService,
    ValidateSchema.prepare(schemas.signupSchema),
    passwordHashHandler,
    UserControllers.signupUser
  );
  app.post(
    "/auth/refresh-token",
    injectService,
    ValidateSchema.prepare(schemas.refreshTokenSchema),
    UserControllers.refreshToken
  );
  app.post(
    "/auth/reset-password",
    injectService,
    ValidateSchema.prepare(schemas.resetPasswordSchema),
    passwordHashHandler,
    UserControllers.resetPassword
  );
  app.post(
    "/auth/forgot-password",
    injectService,
    ValidateSchema.prepare(schemas.forgotPasswordSchema),
    UserControllers.forgotPassword
  );
  app.post(
    "/auth/reset-contact-password",
    injectService,
    ValidateSchema.prepare(schemas.resetContactPasswordSchema),
    passwordHashHandler,
    UserControllers.resetContactPassword
  );
  app.post(
    "/user/sign",
    injectService,
    ValidateSchema.prepare(schemas.signValidationSchema),
    passwordHashHandler,
    UserControllers.signUser
  );
};

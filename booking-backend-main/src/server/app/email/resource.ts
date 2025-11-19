import express from "express";
import EmailControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";

export const configure = (app: express.Router) => {
  app.post(
    "/mailer/send",
    injectService,
    ValidateSchema.prepare(schemas.sendEmailSchema),
    EmailControllers.mailerSend
  );
  app.post(
    "/mailer/send_with_contra",
    injectService,
    ValidateSchema.prepare(schemas.emailContraSchema),
    EmailControllers.sendEmailWithConrta
  );
  app.post(
    "/mailer/config",
    injectService,
    ValidateSchema.prepare(schemas.addEmailConfigSchema),
    EmailControllers.addEmailConfig
  );
  app.get(
    "/mailer/config",
    injectService,
    // validateToken,
    // checkAuth,
    EmailControllers.getEmailConfig
  );
  app.put(
    "/mailer/config/:id",
    injectService,
    ValidateSchema.prepare(schemas.updateEmailConfigSchema),
    EmailControllers.updateEmailConfig
  );
  app.delete(
    "/mailer/config/:id",
    injectService,
    EmailControllers.deleteEmailConfig
  );
  app.post(
    "/mailer/template",
    injectService,
    ValidateSchema.prepare(schemas.addEmailTemplateSchema),
    EmailControllers.addEmailTemplate
  );
  app.get(
    "/mailer/template",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getEmailTemplatesSchema, 'query'),
    EmailControllers.getEmailTemplates
  );
  app.put(
    "/mailer/template/:id",
    injectService,
    ValidateSchema.prepare(schemas.updateEmailTemplateSchema),
    EmailControllers.updateEmailTemplate
  );
  app.delete(
    "/mailer/template/:id",
    injectService,
    EmailControllers.deleteEmailTemplate
  );
};

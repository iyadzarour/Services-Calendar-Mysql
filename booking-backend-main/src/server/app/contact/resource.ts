import express from "express";
import ContactsControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";
import { passwordHashHandler } from "../middlewares/authMiddleware";

export const configure = (app: express.Router) => {
  app.post(
    "/contacts",
    injectService,
    ValidateSchema.prepare(schemas.addContactSchema),
    passwordHashHandler,
    ContactsControllers.addContact
  );
  app.get(
    "/contacts",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getContactsSchema, "query"),
    ContactsControllers.getContacts
  );
  app.get(
    "/contacts/:contactId",
    injectService,
    // validateToken,
    // checkAuth,
    ContactsControllers.getContactById
  );
  app.put(
    "/contacts/:contactId",
    injectService,
    ValidateSchema.prepare(schemas.updateContactSchema),
    passwordHashHandler,
    ContactsControllers.updateContact
  );
  app.delete(
    "/contacts/:contactId",
    injectService,
    ContactsControllers.deleteContact
  );
  app.post(
    "/contacts/reset-password/:contactId",
    injectService,
    ValidateSchema.prepare(schemas.resetContactPasswordSchema),
    // validateToken,
    // checkAuth,
    ContactsControllers.sendContactCredentials
  );
  app.post(
    "/contacts-sync",
    injectService,
    ContactsControllers.syncContacts
  );
};

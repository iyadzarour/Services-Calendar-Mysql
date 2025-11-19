import express from "express";
import CalendarsControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
// import { checkAuth, validateToken } from "../middlewares/authMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";
import { passwordHashHandler } from "../middlewares/authMiddleware";

export const configure = (app: express.Router) => {
  app.post(
    "/calendars",
    injectService,
    ValidateSchema.prepare(schemas.addCalendarSchema),
    CalendarsControllers.addCalendar
  );
  app.get(
    "/calendars",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getCalendarsSchema, 'query'),
    CalendarsControllers.getCalendars
  );
  app.get(
    "/calendars/:calendarId",
    injectService,
    // validateToken,
    // checkAuth,
    CalendarsControllers.getCalendarById
  );
  app.put(
    "/calendars/:calendarId",
    injectService,
    ValidateSchema.prepare(schemas.updateCalendarSchema),
    passwordHashHandler,
    CalendarsControllers.updateCalendar
  );
  app.delete(
    "/calendars/:calendarId",
    injectService,
    CalendarsControllers.deleteCalendar
  );
};

import express from "express";
import AppointmentsControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";

export const configure = (app: express.Router) => {
  app.post(
    "/appointments/get_by_date_and_id",
    injectService,
    ValidateSchema.prepare(schemas.getAppointmentsByDateAndCalendarIdSchema),
    AppointmentsControllers.getAppointmentsByDateAndCalenderId
  );
  app.post(
    "/appointments",
    injectService,
    ValidateSchema.prepare(schemas.addAppointmentSchema),
    AppointmentsControllers.addAppointment
  );
  app.get(
    "/appointments",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getAppointmentsSchema, "query"),
    AppointmentsControllers.getAppointments
  );
  app.get(
    "/appointments/contact/:contactId",
    injectService,
    // validateToken,
    // checkAuth,
    AppointmentsControllers.getAppointmentsByContactId
  );
  app.get(
    "/appointments/calendar/:calendarId",
    injectService,
    // validateToken,
    // checkAuth,
    AppointmentsControllers.getAppointmentsByCalendarId
  );
  app.put(
    "/appointments/:categoryId",
    injectService,
    ValidateSchema.prepare(schemas.updateAppointmentSchema),
    AppointmentsControllers.updateAppointment
  );
  app.delete(
    "/appointments/:categoryId",
    injectService,
    AppointmentsControllers.deleteAppointment
  );
  app.get(
    "/appointments/timeslots", 
    injectService,
    ValidateSchema.prepare(schemas.getTimeSlotsSchema, "query"),
    AppointmentsControllers.getTimeSlots
  );
};

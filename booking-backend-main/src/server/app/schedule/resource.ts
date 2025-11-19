import express from "express";
import SchedulesControllers from "./controller";
import { injectService } from "../middlewares/serviceMiddleware";
import ValidateSchema from "../middlewares/validateSchema";
import schemas from "./schemas";

export const configure = (app: express.Router) => {
  app.post(
    "/schedules",
    injectService,
    ValidateSchema.prepare(schemas.addScheduleSchema),
    SchedulesControllers.addSchedule
  );
  app.get(
    "/schedules",
    injectService,
    // validateToken,
    // checkAuth,
    ValidateSchema.prepare(schemas.getSchedulesSchema, "query"),
    SchedulesControllers.getSchedules
  );
  app.put(
    "/schedules/:scheduleId",
    injectService,
    ValidateSchema.prepare(schemas.updateScheduleSchema),
    SchedulesControllers.updateSchedule
  );
  app.delete(
    "/schedules/:scheduleId",
    injectService,
    SchedulesControllers.deleteSchedule
  );
  app.get(
    "/schedules/calendar/:calendarId",
    injectService,
    // validateToken,
    // checkAuth,
    SchedulesControllers.getSchedulesByCalendarId
  );
};

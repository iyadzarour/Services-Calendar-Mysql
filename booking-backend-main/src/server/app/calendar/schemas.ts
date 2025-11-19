import Joi from "joi";
import {
  AppointmentCluster,
  AppointmentDuration,
  AppointmentScheduling,
  AssignmentOfServices,
  CalendarType,
  DescriptionDisplayType,
  InsertAppointmentOption,
} from "../../../database-client";

const getCalendarsSchema = Joi.object().keys({
  search: Joi.string().trim().optional().allow(""),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});

const settingsSchema = Joi.object({
  multiple_occupanc: Joi.boolean().optional(),
  notification_email: Joi.string().optional(),
  notification_email_as_sender: Joi.boolean().optional(),
  sms_notification: Joi.boolean().optional(),
  manual_email_confirmation: Joi.string().optional(),
  manually_confirmation_for_manually_booked_appointments:
    Joi.boolean().optional(),

  limit_maximum_appointment_duration: Joi.boolean().optional(),
  call_waiting_number: Joi.boolean().optional(),
  within_availability_times: Joi.boolean().optional(),
  calendar_group: Joi.string().optional(),
  calendar_type: Joi.string()
    .valid(...Object.values(CalendarType))
    .optional(),
  appointment_cluster: Joi.string()
    .valid(...Object.values(AppointmentCluster))
    .optional(),
  appointment_duration: Joi.string()
    .valid(...Object.values(AppointmentDuration))
    .optional(),
  calendar_order: Joi.number().optional(),
  duration_factor: Joi.number().optional(),
  reference_system: Joi.string().optional(),
  calendar_id: Joi.number().optional(),
}).optional();

const addCalendarSchema = Joi.object().keys({
  employee_name: Joi.string().required(),
  description: Joi.string().optional(),
  show_description: Joi.alternatives().try(
    Joi.string().valid(...Object.values(DescriptionDisplayType)),
    Joi.allow(null, "")
  ).optional(),
  email: Joi.string().email().optional().allow(""),
  password: Joi.string()
    .regex(/[ -~]*[a-z][ -~]*/, {}) // at least 1 lower-case
    .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
    .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
    .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
    .min(10)
    .optional().allow("")
    .options({
      messages: {
        "string.pattern.base":
          "password must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
  }),
  appointment_scheduling: Joi.alternatives().try(
    Joi.string().valid(...Object.values(AppointmentScheduling)),
    Joi.allow(null, "")
  ).optional(),
  employee_image: Joi.string().optional(),
  online_booked: Joi.boolean().optional(),
  advanced_settings: settingsSchema,
  assignment_of_services: Joi.alternatives().try(
    Joi.string().valid(...Object.values(AssignmentOfServices)),
    Joi.allow(null, "")
  ).optional(),
  assignments_services: Joi.array().items(Joi.string()).optional(),
  link_calendar: Joi.boolean().optional(),
  priority_link: Joi.number().optional(),
  skills: Joi.array().items(Joi.object({
    service: Joi.string().required(),
    level: Joi.number().required(),
  })).optional(),
  paired_calendars: Joi.array().items(Joi.string()).optional(),
  insert_appointments: Joi.alternatives().try(
    Joi.string().valid(...Object.values(InsertAppointmentOption)),
    Joi.allow(null, "")
  ).optional(),
  coupling_on_certain_services: Joi.boolean().optional(),
  certain_services: Joi.array().items(Joi.string()).optional(),
  active: Joi.boolean().required(),
});

// For update, make all fields optional since we're only updating specific fields
const updateCalendarSchema = Joi.object().keys({
  employee_name: Joi.string().optional(),
  description: Joi.string().optional(),
  show_description: Joi.alternatives().try(
    Joi.string().valid(...Object.values(DescriptionDisplayType)),
    Joi.allow(null, "")
  ).optional(),
  email: Joi.string().email().optional().allow(""),
  password: Joi.string()
    .regex(/[ -~]*[a-z][ -~]*/, {}) // at least 1 lower-case
    .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
    .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
    .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
    .min(10)
    .optional().allow("")
    .options({
      messages: {
        "string.pattern.base":
          "password must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
  }),
  appointment_scheduling: Joi.alternatives().try(
    Joi.string().valid(...Object.values(AppointmentScheduling)),
    Joi.allow(null, "")
  ).optional(),
  employee_image: Joi.string().optional(),
  online_booked: Joi.boolean().optional(),
  advanced_settings: settingsSchema,
  assignment_of_services: Joi.alternatives().try(
    Joi.string().valid(...Object.values(AssignmentOfServices)),
    Joi.allow(null, "")
  ).optional(),
  assignments_services: Joi.array().items(Joi.string()).optional(),
  link_calendar: Joi.boolean().optional(),
  priority_link: Joi.number().optional(),
  skills: Joi.array().items(Joi.object({
    service: Joi.string().required(),
    level: Joi.number().required(),
  })).optional(),
  paired_calendars: Joi.array().items(Joi.string()).optional(),
  insert_appointments: Joi.alternatives().try(
    Joi.string().valid(...Object.values(InsertAppointmentOption)),
    Joi.allow(null, "")
  ).optional(),
  coupling_on_certain_services: Joi.boolean().optional(),
  certain_services: Joi.array().items(Joi.string()).optional(),
  active: Joi.boolean().optional(),
});

export default {
  getCalendarsSchema,
  addCalendarSchema,
  updateCalendarSchema,
};

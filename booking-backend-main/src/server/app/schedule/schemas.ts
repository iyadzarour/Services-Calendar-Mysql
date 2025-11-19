import Joi from "joi";
import { ScheduleType, WeekDay } from "../../../database-client";

const getSchedulesSchema = Joi.object().keys({
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});

const addScheduleSchema = Joi.object().keys({
  calendar_id: Joi.string().required(),
  working_hours_type: Joi.string()
    .valid(...Object.values(ScheduleType))
    .required(),
  weekday: Joi.when("working_hours_type", {
    is: ScheduleType.Weekly,
    then: Joi.string()
      .valid(...Object.values(WeekDay))
      .required(),
    otherwise: Joi.forbidden(),
  }),
  date_from: Joi.when("working_hours_type", {
    is: ScheduleType.Certain,
    then: Joi.date().iso().required().min(new Date().toISOString().split('T')[0]).messages({
      "date.min": "date_from must be equal to or greater than the current date",
    }),
    otherwise: Joi.forbidden(),
  }),
  date_to: Joi.when("working_hours_type", {
    is: ScheduleType.Certain,
    then: Joi.date().iso().required().min(Joi.ref("date_from")).messages({
      "date.min": "date_to must be after date_from",
    }),
    otherwise: Joi.forbidden(),
  }),
  time_from: Joi.string()
    .regex(/^(0[0-9]|1[0-2]):[0-5][0-9] [APap][Mm]$/)
    .required()
    .messages({
      "string.pattern.base": 'time_from must be in the format "hh:mm AM/PM"',
    }),
  time_to: Joi.string()
    .regex(/^(0[0-9]|1[0-2]):[0-5][0-9] [APap][Mm]$/)
    .required()
    .messages({
      "string.pattern.base": 'time_to must be in the format "hh:mm AM/PM"',
    }),
  reason: Joi.string().optional().allow(''),
  deactivate_working_hours: Joi.boolean().optional(),
  one_time_appointment_link: Joi.string().optional(),
  only_internally: Joi.boolean().optional(),
  restricted_to_services: Joi.array().items(Joi.string()).optional(),
  possible_appointment: Joi.number().optional(),
  active: Joi.boolean().optional(),
});

const updateScheduleSchema = addScheduleSchema;

export default {
  getSchedulesSchema,
  addScheduleSchema,
  updateScheduleSchema,
};

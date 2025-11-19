import Joi from "joi";
import contactSchema from "../contact/schemas";
import { AppointmentStatus } from "../../../database-client";

const getAppointmentsSchema = Joi.object().keys({
  start: Joi.date().iso().required(),
  end: Joi.date().iso().required(),
  search: Joi.string().trim().optional().allow(""),
});

const attachmentSchema = {
  title: Joi.string().allow(""),
  url: Joi.string().allow(""),
};

const getAppointmentsByDateAndCalendarIdSchema = Joi.object().keys({
  calendar_id: Joi.string().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().required()
});

const addAppointmentSchema = Joi.object().keys({
  category_id: Joi.string().required(),
  service_id: Joi.string().required(),
  calendar_id: Joi.string().required(),
  start_date: Joi.date()
    .iso()
    .required()
    .min(new Date(Date.now() - 5 * 60000).toISOString()) // Allow 5 minutes tolerance for clock drift
    .messages({
      "date.min":
        "start_date must be equal to or greater than the current date",
    }),
  end_date: Joi.date().iso().required().min(Joi.ref("start_date")).messages({
    "date.min": "end_date must be after start_date",
  }),
  brand_of_device: Joi.string().optional(),
  model: Joi.string().optional(),
  exhaust_gas_measurement: Joi.boolean().optional(),
  has_maintenance_agreement: Joi.boolean().optional(),
  has_bgas_before: Joi.boolean().optional(),
  year: Joi.string().optional(),
  invoice_number: Joi.number().optional(),
  contract_number: Joi.number().optional(),
  imported_service_name: Joi.string().optional().allow(""),
  imported_service_duration: Joi.string().optional().allow(""),
  imported_service_price: Joi.string().optional().allow(""),
  appointment_status: Joi.string()
  .valid(...Object.values(AppointmentStatus))
  .optional(),
  archived: Joi.boolean().optional(),
  remarks: Joi.string().optional(),
  attachments: Joi.array().items(attachmentSchema),
  employee_remarks: Joi.string().optional().allow(""),
  company_remarks: Joi.string().optional().allow(""),
  created_by: Joi.string().optional().allow(""),
  employee_attachments: Joi.array().items(attachmentSchema),
  selected_devices: Joi.string().optional().allow(""),
  contact: contactSchema.addContactSchema,
});

const updateAppointmentSchema = Joi.object().keys({
  category_id: Joi.string().required(),
  service_id: Joi.string().required(),
  calendar_id: Joi.string().required(),
  start_date: Joi.date()
    .iso()
    .required(),
  end_date: Joi.date().iso().required().min(Joi.ref("start_date")).messages({
    "date.min": "end_date must be after start_date",
  }),
  brand_of_device: Joi.string().optional(),
  model: Joi.string().optional(),
  exhaust_gas_measurement: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number().integer().valid(0, 1),
    Joi.string().valid('0', '1', 'true', 'false')
  ).optional(),
  has_maintenance_agreement: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number().integer().valid(0, 1),
    Joi.string().valid('0', '1', 'true', 'false')
  ).optional(),
  has_bgas_before: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number().integer().valid(0, 1),
    Joi.string().valid('0', '1', 'true', 'false')
  ).optional(),
  year: Joi.string().optional(),
  invoice_number: Joi.number().optional(),
  contract_number: Joi.number().optional(),
  imported_service_name: Joi.string().optional().allow(""),
  imported_service_duration: Joi.string().optional().allow(""),
  imported_service_price: Joi.string().optional().allow(""),
  appointment_status: Joi.string()
  .valid(...Object.values(AppointmentStatus))
  .optional(),
  archived: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number().integer().valid(0, 1),
    Joi.string().valid('0', '1', 'true', 'false')
  ).optional(),
  remarks: Joi.string().optional(),
  attachments: Joi.array().items(attachmentSchema),
  employee_remarks: Joi.string().optional().allow(""),
  company_remarks: Joi.string().optional().allow(""),
  created_by: Joi.string().optional().allow(""),
  employee_attachments: Joi.array().items(attachmentSchema),
  ended_at: Joi.date().iso().optional(),
  control_points: Joi.array().items(Joi.object().keys({ title: Joi.string(), value: Joi.number() })).optional(),
  contact_id: Joi.string().required(),
  updated_by: Joi.string().optional(),
  new_user: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number().integer().valid(0, 1),
    Joi.string().valid('0', '1', 'true', 'false')
  ).optional(),
});

const getTimeSlotsSchema = Joi.object().keys({
  date: Joi.date().iso().required(),
  category_id: Joi.string().optional(),
  service_id: Joi.string().optional(),
});

export default {
  getAppointmentsSchema,
  addAppointmentSchema,
  updateAppointmentSchema,
  getTimeSlotsSchema,
  getAppointmentsByDateAndCalendarIdSchema
};

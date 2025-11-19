import Joi from "joi";
import { DisplayStatus } from "../../../database-client";

const getCategoriesSchema = Joi.object().keys({
  search: Joi.string().trim().optional().allow(""),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});

const attachmentSchema = {
  title: Joi.string().allow(""),
  url: Joi.string().allow(""),
};

const servicesListSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  duration: Joi.number().required(),
  price: Joi.number().required(),
  abbreviation_id: Joi.number().required(),
  attachment: Joi.object(attachmentSchema).optional(),
});

const updatedServicesListSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  duration: Joi.number().required(),
  price: Joi.number().required(),
  abbreviation_id: Joi.number().required(),
  attachment: Joi.object(attachmentSchema).optional(),
});

const settingsSchema = Joi.object({
  sorting_order: Joi.string().optional(),
  show_performance_in_summary: Joi.boolean().optional(),
  show_service_in_email: Joi.boolean().optional(),
  info_display_type: Joi.string().optional(),
  show_performance_on: Joi.string().optional(),
}).required();

const addCategorySchema = Joi.object().keys({
  name: Joi.string().required(),
  category: Joi.string().required(),
  choices: Joi.string().optional(),
  selection_is_optional: Joi.boolean().optional(),
  show_price: Joi.boolean().optional(),
  show_appointment_duration: Joi.boolean().optional(),
  no_columns_of_services: Joi.number().required(),
  full_screen: Joi.boolean().optional(),
  folded: Joi.boolean().optional(),
  online_booking: Joi.boolean().optional(),
  remarks: Joi.string().optional().allow(''),
  unique_id: Joi.number().required(),
  display_status:  Joi.string()
  .valid(...Object.values(DisplayStatus))
  .optional(),
  advanced_settings: settingsSchema,
  services: Joi.array().items(servicesListSchema).required(),
});

const updateCategorySchema = Joi.object().keys({
  name: Joi.string().required(),
  category: Joi.string().required(),
  choices: Joi.string().optional(),
  selection_is_optional: Joi.boolean().optional(),
  show_price: Joi.boolean().optional(),
  show_appointment_duration: Joi.boolean().optional(),
  no_columns_of_services: Joi.number().required(),
  full_screen: Joi.boolean().optional(),
  folded: Joi.boolean().optional(),
  online_booking: Joi.boolean().optional(),
  remarks: Joi.string().optional().allow(''),
  unique_id: Joi.number().required(),
  display_status:  Joi.string()
  .valid(...Object.values(DisplayStatus))
  .optional(),
  advanced_settings: settingsSchema,
  services: Joi.array().items(updatedServicesListSchema).required(),
});

export default {
  getCategoriesSchema,
  addCategorySchema,
  updateCategorySchema,
};

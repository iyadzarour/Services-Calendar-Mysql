import Joi from "joi";
import { EmailTemplateType } from "../../../database-client";

const sendEmailSchema = Joi.object().keys({
  to: Joi.string().email().required(),
  subject: Joi.string().required(),
  text: Joi.string().required(),
});

const addEmailConfigSchema = Joi.object().keys({
  sender: Joi.string().email().required(),
  server: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  port: Joi.number().required(),
  ssl_enabled: Joi.boolean().required(),
});

const updateEmailConfigSchema = Joi.object().keys({
  sender: Joi.string().email().required(),
  server: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  port: Joi.number().required(),
  ssl_enabled: Joi.boolean().required(),
});

const addEmailTemplateSchema = Joi.object().keys({
  type: Joi.string()
    .valid(...Object.values(EmailTemplateType))
    .required(),
  subject: Joi.string().required(),
  template: Joi.string().required(),
  service_id: Joi.string().optional(),
});

const updateEmailTemplateSchema = Joi.object().keys({
  type: Joi.string()
    .valid(...Object.values(EmailTemplateType))
    .required(),
  subject: Joi.string().required(),
  template: Joi.string().required(),
  service_id: Joi.string().optional(),
});

const getEmailTemplatesSchema = Joi.object().keys({
  type: Joi.string()
    .valid(...Object.values(EmailTemplateType))
    .required(),
});

const emailContraSchema = Joi.object().keys({
  selected_devices: Joi.string().required(),
  title: Joi.string().optional().allow(""),
  name: Joi.string().required(),
  street_number: Joi.string().required(),
  year: Joi.string(),
  postal_code: Joi.string().required(),
  device_type: Joi.string().required(),
  address: Joi.string().required(),
  mobile_number: Joi.string().required(),
  email: Joi.string().required(),
  gender: Joi.string().required(),
});


export default {
  sendEmailSchema,
  addEmailConfigSchema,
  updateEmailConfigSchema,
  addEmailTemplateSchema,
  updateEmailTemplateSchema,
  getEmailTemplatesSchema,
  emailContraSchema,
};

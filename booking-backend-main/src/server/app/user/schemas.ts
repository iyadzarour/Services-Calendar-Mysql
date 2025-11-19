import Joi from "joi";
import { UserRole } from "../../../database-client";

const signinSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required().allow(""),
});

const signupSchema = Joi.object().keys({
  password: Joi.string()
    .regex(/[ -~]*[a-z][ -~]*/, {}) // at least 1 lower-case
    .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
    .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
    .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
    .min(10)
    .required()
    .options({
      messages: {
        "string.pattern.base":
          "must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
    }),
  name: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  phone_number: Joi.string().allow(""),
  remarks: Joi.string().allow("").optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),

  channels: Joi.object({
    email: Joi.bool(),
    sms: Joi.bool(),
    push_notification: Joi.bool(),
  }).optional(),

  internal: Joi.object({
    blacklisted: Joi.bool().optional(),
    verified: Joi.bool().optional(),
    verification: Joi.object({
      otp: Joi.string().allow(""),
      otp_generated_at: Joi.date().iso(),
    }).optional(),
  }).optional(),
});

const refreshTokenSchema = Joi.object().keys({
  refreshToken: Joi.string().required().allow(""),
});

const resetPasswordSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  oldPassword: Joi.string().required(),
  password: Joi.string()
    .regex(/[ -~]*[a-z][ -~]*/, {}) // at least 1 lower-case
    .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
    .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
    .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
    .min(10)
    .required()
    .options({
      messages: {
        "string.pattern.base":
          "must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
    }),
});

const forgotPasswordSchema = Joi.object().keys({
  email: Joi.string().email().required(),
});

const resetContactPasswordSchema = Joi.object().keys({
  token: Joi.string().required(),
  password: Joi.string()
    .regex(/[ -~]*[a-z][ -~]*/, {}) // at least 1 lower-case
    .regex(/[ -~]*[A-Z][ -~]*/) // at least 1 upper-case
    .regex(/[ -~]*(?=[ -~])[^0-9a-zA-Z][ -~]*/) // basically: [ -~] && [^0-9a-zA-Z], at least 1 special character
    .regex(/[ -~]*[0-9][ -~]*/) // at least 1 number
    .min(10)
    .required()
    .options({
      messages: {
        "string.pattern.base":
          "must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
    }),
});

const signValidationSchema = Joi.object().keys({
  sign_url: Joi.string().required(),
  email: Joi.string().required(),
  phone_number: Joi.string().required(),
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  location: Joi.string(),
  password: Joi.string().required(),
  address: Joi.string(),
  zip_code: Joi.string(),
  gender: Joi.string().required(),
});

export default {
  signupSchema,
  signinSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  resetContactPasswordSchema,
  signValidationSchema,
};

import Joi from "joi";

const getContactsSchema = Joi.object().keys({
  search: Joi.string().trim().optional().allow(""),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).default(10),
});


const addContactSchema = Joi.object().keys({
  salutation: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  phone_numbber_2: Joi.string().optional().allow(""),
  phone_numbber_3: Joi.string().optional().allow(""),
  contract_link: Joi.string().optional().allow(""),
  email: Joi.string().email().required(),
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
          "must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
  }),
  archived: Joi.boolean().optional(),
  note_on_address: Joi.string().optional().allow(""),
  newsletter: Joi.boolean().optional(),
  categories_permission: Joi.array().items(Joi.string()).optional(),
  remarks: Joi.string().optional().allow(""),
  imported: Joi.boolean().optional(),
  sign_url: Joi.string().optional().allow(""),
});

const updateContactSchema = Joi.object().keys({
  salutation: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.string().required(),
  location: Joi.string().required(),
  telephone: Joi.string().required(),
  phone_numbber_2: Joi.string().optional().allow(""),
  phone_numbber_3: Joi.string().optional().allow(""),
  contract_link: Joi.string().optional().allow(""),
  email: Joi.string().email().required(),
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
          "must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
  }),
  archived: Joi.boolean().optional(),
  note_on_address: Joi.string().optional().allow(""),
  newsletter: Joi.boolean().optional(),
  categories_permission: Joi.array().items(Joi.string()).optional(),
  remarks: Joi.string().optional().allow(""),
  imported: Joi.boolean().optional(),
});

const resetContactPasswordSchema = Joi.object().keys({
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
          "password must contain at least 1 lower-case, 1 upper-case, 1 special character and 1 number",
      },
    }),
})


export default {
  getContactsSchema,
  addContactSchema,
  updateContactSchema,
  resetContactPasswordSchema
};

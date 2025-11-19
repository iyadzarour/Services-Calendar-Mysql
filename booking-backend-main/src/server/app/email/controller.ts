import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import {
  AddEmailConfigRequest,
  AddEmailTemplateRequest,
  Appointment,
  AppointmentStatus,
  Contact,
  EmailConfig,
  EmailTemplate,
  EmailTemplateType,
  SendEmailForm,
} from "../../../database-client/src/Schema";
import nodemailer from "nodemailer";
import { ServiceContainer } from "../clients";
import { decrypt, encrypt } from "../../utils/encryption";
import { uploadCotract } from "../appointment/utils";

class EmailControllers {
  @tryCatchErrorDecorator
  static async addEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to add email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as AddEmailConfigRequest;
    const encryptedPassword = encrypt(form.password);
    const updatedForm = {
      ...form,
      password: encryptedPassword,
    };
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.addEmailConfig(updatedForm);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to get email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.getEmailConfig();

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to update email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as EmailConfig;
    const service = (request as any).service as ServiceContainer;
    const { id } = request.params;
    const encryptedPassword =
      form.password.length < 40 ? encrypt(form.password) : form.password;

    const updatedForm = {
      ...form,
      password: encryptedPassword,
    };

    const data = await service.emailService.updateEmailConfig(id, updatedForm);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteEmailConfig(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to delete email config';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.deleteEmailConfig(
      request.params.id
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }

  @tryCatchErrorDecorator
  static async mailerSend(request: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'endpoit to send emails';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $to: '',
                        $fro: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    try {
      const service = (request as any).service as ServiceContainer;
      const mailConfig = await service.emailService.getEmailConfig();

      if (mailConfig && mailConfig.length) {
        const { sender, server, username, password, port, ssl_enabled } =
          mailConfig[0];

        const form = request.body as SendEmailForm;
        const decryptedPassword = decrypt(password);

        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
          host: server,
          port: port,
          secure: ssl_enabled,
          auth: {
            user: username,
            pass: decryptedPassword,
          },
        });

        // Define email options
        const mailOptions = {
          from: sender,
          to: form.to,
          subject: form.subject,
          html: form.text,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
          status: "success",
          message: "Email sent successfully",
          info,
        });
      } else {
        res.status(200).json({
          status: "faild",
          message: "Email service is not configured",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ status: "faild", message: "Internal server error" });
    }
  }

  @tryCatchErrorDecorator
  static async sendEmailWithConrta(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data = req.body;

    let contractLink = undefined;
    const contact: Contact = {
      first_name: data.name.split(" ")[0],
      last_name: data.name.split(" ")[1] ?? "",
      address: data.street_number,
      zip_code: data.postal_code,
      location: data.address,
      telephone: data.mobile_number,
      email: data.email,
      salutation: data.gender,
      title: data.title,
    }
    const form: Appointment = {
      model: data.device_type,
      year: data.year,
      selected_devices: data.selected_devices,
      category_id: "",
      service_id: "",
      calendar_id: "",
      start_date: "",
      end_date: "",
      contact: contact,
      appointment_status: AppointmentStatus.Confirmed
    }

      contractLink = await uploadCotract(contact, form);
      if (!contractLink) {
        res.status(409).json({
          message: "Something went wrong while saving the contract file",
        });
      } else {
        res.status(200).json({
          status: "success",
          message: "Email sent successfully",
          info: "",
        });
      }
  }

  @tryCatchErrorDecorator
  static async addEmailTemplate(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to add email template';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as AddEmailTemplateRequest;
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.addEmailTemplate(form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getEmailTemplates(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to get email templates';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */

    const service = (request as any).service as ServiceContainer;
    const { type } = request.query as { type: EmailTemplateType };
    const data = await service.emailService.getEmailTemplates(type);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async updateEmailTemplate(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to update email template';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as EmailTemplate;
    const service = (request as any).service as ServiceContainer;
    const { id } = request.params;

    const data = await service.emailService.updateEmailTemplate(id, form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteEmailTemplate(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Email'];

    /*
        #swagger.description = 'Endpoint to delete email template';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.emailService.deleteEmailTemplate(
      request.params.id
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }
}

export default EmailControllers;

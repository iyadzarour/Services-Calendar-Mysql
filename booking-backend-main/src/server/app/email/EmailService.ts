import {
  EmailConfigDao,
  EmailConfig,
  AddEmailConfigRequest,
  EmailTemplateDao,
  EmailTemplate,
  AddEmailTemplateRequest,
  EmailTemplateType,
  SendEmailForm
} from "../../../database-client";
import { decrypt } from "../../utils/encryption";
import { ClientError } from "../../utils/exceptions";
import nodemailer from "nodemailer";
export class EmailService {
  constructor(private emailConfigDao: EmailConfigDao, private emailTemplateDao: EmailTemplateDao) {}

  async addEmailConfig(emailConfig: AddEmailConfigRequest) {
    return this.emailConfigDao
      .addEmailConfig(emailConfig)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getEmailConfig() {
    return this.emailConfigDao
      .getEmailConfig()
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateEmailConfig(id: string, newConfig: EmailConfig) {
    return this.emailConfigDao
      .updateEmailConfig(id, newConfig)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async deleteEmailConfig(id: string) {
    return this.emailConfigDao
      .deleteEmailConfig(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async addEmailTemplate(emailTemplate: AddEmailTemplateRequest) {
    return this.emailTemplateDao
      .addEmailTemplate(emailTemplate)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getEmailTemplates(type: EmailTemplateType) {
    return this.emailTemplateDao
      .getEmailTemplates(type)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateEmailTemplate(id: string, newTemplate: EmailTemplate) {
    return this.emailTemplateDao
      .updateEmailTemplate(id, newTemplate)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async deleteEmailTemplate(id: string) {
    return this.emailTemplateDao
      .deleteEmailTemplate(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(err, 500);
      });
  }

  async getEmailTemplatesByServiceId(id: string) {
    return this.emailTemplateDao
      .getEmailTemplatesByServiceId(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async sendMail(form: SendEmailForm) {
    try {
      const mailConfig = await this.getEmailConfig();

      if (mailConfig && mailConfig.length) {
        const { sender, server, username, password, port, ssl_enabled } =
          mailConfig[0];
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
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
          }
        });

        // Define email options
        const mailOptions = {
          from: sender,
          to: form.to,
          subject: form.subject,
          html: form.text,
          ...{ ...(form.attachments ? { attachments: form.attachments } : {}) },
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        return info;
      } else {
        // Email service not configured - log warning but don't throw error
        console.warn('Email service is not configured. Email not sent to:', form.to);
        return null;
      }
    } catch (err) {
      // Log error but don't throw - email sending should not break the main flow
      console.error('Error sending email:', err);
      console.warn('Email sending failed, but continuing with appointment creation');
      return null;
    }
  }
}

import { EmailTemplate } from "../Schema";

export interface EmailTemplateDao {
  getEmailTemplates(type: string): Promise<EmailTemplate[]>;
  getEmailTemplatesByServiceId(serviceId: string): Promise<EmailTemplate | null>;
  addEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, newTemplate: Partial<EmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string): Promise<EmailTemplate | null>;
}

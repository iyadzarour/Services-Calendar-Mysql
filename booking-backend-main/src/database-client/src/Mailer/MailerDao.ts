import { EmailConfig } from "../Schema";

export interface EmailConfigDao {
  getEmailConfig(): Promise<EmailConfig[]>;
  addEmailConfig(config: Partial<EmailConfig>): Promise<EmailConfig>;
  updateEmailConfig(id: string, newConfig: Partial<EmailConfig>): Promise<EmailConfig>;
  deleteEmailConfig(id: string): Promise<EmailConfig | null>;
}

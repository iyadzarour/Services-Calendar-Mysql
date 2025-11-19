/**
 * EmailTemplateDaoMySql - MySQL Implementation
 * 
 * This DAO implements email template management using MySQL.
 * 
 * Tables used:
 * - email_templates: Email templates for confirmations and cancellations
 * 
 * Note: Maintains exact same interface as EmailTemplateDaoMongo for API compatibility
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { EmailTemplate } from '../Schema';
import { EmailTemplateDao } from './EmailTemplateDao';

export class EmailTemplateDaoMySql implements EmailTemplateDao {
  constructor(private pool: Pool) {}

  /**
   * Get email templates by type
   * @param type Template type (confirmation, cancellation)
   * @returns Array of email templates
   */
  async getEmailTemplates(type: string): Promise<EmailTemplate[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_templates WHERE type = ? ORDER BY created_at DESC',
        [type]
      );
      
      return rows.map(row => this.mapEmailTemplateRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get email template by service ID
   * @param serviceId Service ID
   * @returns Email template or null if not found
   */
  async getEmailTemplatesByServiceId(serviceId: string): Promise<EmailTemplate | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_templates WHERE service_id = ? LIMIT 1',
        [serviceId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapEmailTemplateRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Add a new email template
   * @param template Partial email template object
   * @returns Created email template with generated ID
   */
  async addEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO email_templates (
          type, subject, template, service_id
        ) VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute<ResultSetHeader>(query, [
        template.type,
        template.subject,
        template.template,
        template.service_id || null,
      ]);
      
      // Fetch the created template
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_templates WHERE id = ?',
        [result.insertId]
      );
      
      return this.mapEmailTemplateRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update email template by ID
   * @param id Email template ID
   * @param newTemplate Partial email template object with fields to update
   * @returns Updated email template
   */
  async updateEmailTemplate(
    id: string,
    newTemplate: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    const connection = await this.pool.getConnection();
    
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      if (newTemplate.type !== undefined) {
        updates.push('type = ?');
        params.push(newTemplate.type);
      }
      if (newTemplate.subject !== undefined) {
        updates.push('subject = ?');
        params.push(newTemplate.subject);
      }
      if (newTemplate.template !== undefined) {
        updates.push('template = ?');
        params.push(newTemplate.template);
      }
      if (newTemplate.service_id !== undefined) {
        updates.push('service_id = ?');
        params.push(newTemplate.service_id);
      }
      
      if (updates.length === 0) {
        // No updates, fetch and return existing
        const [rows] = await connection.execute<RowDataPacket[]>(
          'SELECT * FROM email_templates WHERE id = ?',
          [id]
        );
        return this.mapEmailTemplateRow(rows[0]);
      }
      
      const query = `UPDATE email_templates SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);
      
      await connection.execute(query, params);
      
      // Fetch updated template
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_templates WHERE id = ?',
        [id]
      );
      
      return this.mapEmailTemplateRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete email template by ID
   * @param id Email template ID
   * @returns Deleted email template or null if not found
   */
  async deleteEmailTemplate(id: string): Promise<EmailTemplate | null> {
    const connection = await this.pool.getConnection();
    
    try {
      // Fetch template before deletion
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_templates WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const template = this.mapEmailTemplateRow(rows[0]);
      
      await connection.execute('DELETE FROM email_templates WHERE id = ?', [id]);
      
      return template;
    } finally {
      connection.release();
    }
  }

  /**
   * Map MySQL email template row to EmailTemplate interface
   */
  private mapEmailTemplateRow(row: RowDataPacket): EmailTemplate {
    return {
      _id: row.id.toString(),
      type: row.type,
      subject: row.subject,
      template: row.template,
      service_id: row.service_id ? row.service_id.toString() : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

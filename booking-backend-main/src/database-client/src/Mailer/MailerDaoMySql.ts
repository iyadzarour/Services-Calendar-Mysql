/**
 * EmailConfigDaoMySql - MySQL Implementation
 * 
 * This DAO implements email configuration management using MySQL.
 * 
 * Tables used:
 * - email_configs: SMTP email server configuration
 * 
 * Note: Maintains exact same interface as EmailConfigDaoMongo for API compatibility
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { EmailConfig } from '../Schema';
import { EmailConfigDao } from './MailerDao';

export class EmailConfigDaoMySql implements EmailConfigDao {
  constructor(private pool: Pool) {}

  /**
   * Get all email configurations
   * @returns Array of email configs
   */
  async getEmailConfig(): Promise<EmailConfig[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_configs ORDER BY created_at DESC'
      );
      
      return rows.map(row => this.mapEmailConfigRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Add a new email configuration
   * @param config Partial email config object
   * @returns Created email config with generated ID
   */
  async addEmailConfig(config: Partial<EmailConfig>): Promise<EmailConfig> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO email_configs (
          sender, server, username, password, port, ssl_enabled
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      // Convert port to number if it's a string
      const port = typeof config.port === 'string' ? parseInt(config.port, 10) : config.port;
      
      // Validate required fields
      if (!config.sender || !config.server || !config.username || !config.password || !port) {
        throw new Error('Missing required fields: sender, server, username, password, or port');
      }
      
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid port number: ${config.port}`);
      }
      
      const [result] = await connection.execute<ResultSetHeader>(query, [
        config.sender,
        config.server,
        config.username,
        config.password,
        port,
        config.ssl_enabled || false,
      ]);
      
      // Fetch the created config
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_configs WHERE id = ?',
        [result.insertId]
      );
      
      return this.mapEmailConfigRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update email configuration by ID
   * @param id Email config ID
   * @param newConfig Partial email config object with fields to update
   * @returns Updated email config
   */
  async updateEmailConfig(
    id: string,
    newConfig: Partial<EmailConfig>
  ): Promise<EmailConfig> {
    const connection = await this.pool.getConnection();
    
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      if (newConfig.sender !== undefined) {
        updates.push('sender = ?');
        params.push(newConfig.sender);
      }
      if (newConfig.server !== undefined) {
        updates.push('server = ?');
        params.push(newConfig.server);
      }
      if (newConfig.username !== undefined) {
        updates.push('username = ?');
        params.push(newConfig.username);
      }
      if (newConfig.password !== undefined) {
        updates.push('password = ?');
        params.push(newConfig.password);
      }
      if (newConfig.port !== undefined) {
        updates.push('port = ?');
        // Convert port to number if it's a string
        const port = typeof newConfig.port === 'string' ? parseInt(newConfig.port, 10) : newConfig.port;
        if (isNaN(port) || port < 1 || port > 65535) {
          throw new Error(`Invalid port number: ${newConfig.port}`);
        }
        params.push(port);
      }
      if (newConfig.ssl_enabled !== undefined) {
        updates.push('ssl_enabled = ?');
        params.push(newConfig.ssl_enabled);
      }
      
      if (updates.length === 0) {
        // No updates, fetch and return existing
        const [rows] = await connection.execute<RowDataPacket[]>(
          'SELECT * FROM email_configs WHERE id = ?',
          [id]
        );
        return this.mapEmailConfigRow(rows[0]);
      }
      
      const query = `UPDATE email_configs SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);
      
      await connection.execute(query, params);
      
      // Fetch updated config
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_configs WHERE id = ?',
        [id]
      );
      
      return this.mapEmailConfigRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete email configuration by ID
   * @param id Email config ID
   * @returns Deleted email config or null if not found
   */
  async deleteEmailConfig(id: string): Promise<EmailConfig | null> {
    const connection = await this.pool.getConnection();
    
    try {
      // Fetch config before deletion
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM email_configs WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const config = this.mapEmailConfigRow(rows[0]);
      
      await connection.execute('DELETE FROM email_configs WHERE id = ?', [id]);
      
      return config;
    } finally {
      connection.release();
    }
  }

  /**
   * Map MySQL email config row to EmailConfig interface
   */
  private mapEmailConfigRow(row: RowDataPacket): EmailConfig {
    return {
      _id: row.id.toString(),
      sender: row.sender,
      server: row.server,
      username: row.username,
      password: row.password,
      port: row.port,
      ssl_enabled: row.ssl_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

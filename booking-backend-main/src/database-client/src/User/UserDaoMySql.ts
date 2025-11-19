/**
 * UserDaoMySql - MySQL Implementation
 * 
 * This DAO implements user authentication and password reset token management using MySQL.
 * 
 * Tables used:
 * - users: Main user table with authentication and profile data
 * - reset_tokens: Password reset tokens with expiration tracking
 * 
 * Note: Maintains exact same interface as UserDaoMongo for API compatibility
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { ResetToken, User } from '../Schema';
import { UserDao } from './UserDao';

export class UserDaoMySql implements UserDao {
  constructor(private pool: Pool) {}

  /**
   * Add a new user to the database
   * @param user Partial user object with required fields
   * @returns Created user with generated ID
   */
  async addUser(user: Partial<User>): Promise<User> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO users (
          name, email, password, phone_number, remarks, role,
          channels, internal, token, refresh_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const channels = user.channels ? JSON.stringify(user.channels) : null;
      const internal = user.internal ? JSON.stringify(user.internal) : null;
      
      const [result] = await connection.execute<ResultSetHeader>(query, [
        user.name,
        user.email,
        user.password,
        user.phone_number,
        user.remarks || null,
        user.role || 'user',
        channels,
        internal,
        user.token || null,
        user.refreshToken || null,
      ]);
      
      // Fetch the created user
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );
      
      return this.mapUserRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get user by email address
   * @param email User email
   * @returns User object or null if not found
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapUserRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Add a password reset token
   * @param token Reset token string
   * @param email User email
   */
  async addToken(token: string, email: string): Promise<void> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO reset_tokens (token, email)
        VALUES (?, ?)
      `;
      
      await connection.execute(query, [token, email]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get reset token by token string
   * @param token Reset token string
   * @returns ResetToken object or null if not found
   */
  async getToken(token: string): Promise<ResetToken | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM reset_tokens WHERE token = ? LIMIT 1',
        [token]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapResetTokenRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete reset token
   * @param token Reset token string to delete
   */
  async deleteToken(token: string): Promise<void> {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.execute(
        'DELETE FROM reset_tokens WHERE token = ?',
        [token]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Map MySQL user row to User interface
   * Handles JSON parsing and field mapping
   */
  private mapUserRow(row: RowDataPacket): User {
    return {
      _id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: row.password,
      phone_number: row.phone_number,
      remarks: row.remarks,
      role: row.role,
      channels: row.channels ? (typeof row.channels === 'string' ? JSON.parse(row.channels) : row.channels) : {},
      internal: row.internal ? (typeof row.internal === 'string' ? JSON.parse(row.internal) : row.internal) : {},
      token: row.token,
      refreshToken: row.refresh_token,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Map MySQL reset token row to ResetToken interface
   */
  private mapResetTokenRow(row: RowDataPacket): ResetToken {
    return {
      _id: row.id.toString(),
      token: row.token,
      email: row.email,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

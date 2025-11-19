/**
 * CalendarDaoMySql - MySQL Implementation
 * 
 * This DAO implements calendar/employee management using MySQL.
 * 
 * Tables used:
 * - calendars: Employee calendars with scheduling settings and availability
 * 
 * Note: Maintains exact same interface as CalendarDaoMongo for API compatibility
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Calendar } from '../Schema';
import { CalendarDao } from './CalendarDao';

export class CalendarDaoMySql implements CalendarDao {
  constructor(private pool: Pool) {}

  /**
   * Add a new calendar to the database
   * @param calendar Partial calendar object with required fields
   * @returns Created calendar with generated ID
   */
  async addCalendar(calendar: Partial<Calendar>): Promise<Calendar> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO calendars (
          employee_name, description, show_description, appointment_scheduling,
          employee_image, email, password, online_booked, advanced_settings,
          assignment_of_services, assignments_services, link_calendar,
          priority_link, skills, paired_calendars, insert_appointments,
          coupling_on_certain_services, certain_services, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute<ResultSetHeader>(query, [
        calendar.employee_name,
        calendar.description || null,
        calendar.show_description || 'None',
        calendar.appointment_scheduling || null,
        calendar.employee_image || null,
        calendar.email || null,
        calendar.password || null,
        calendar.online_booked || false,
        calendar.advanced_settings ? JSON.stringify(calendar.advanced_settings) : null,
        calendar.assignment_of_services || 'All',
        calendar.assignments_services ? JSON.stringify(calendar.assignments_services) : null,
        calendar.link_calendar || false,
        calendar.priority_link || null,
        calendar.skills ? JSON.stringify(calendar.skills) : null,
        calendar.paired_calendars ? JSON.stringify(calendar.paired_calendars) : null,
        calendar.insert_appointments || null,
        calendar.coupling_on_certain_services || false,
        calendar.certain_services ? JSON.stringify(calendar.certain_services) : null,
        calendar.active !== undefined ? calendar.active : true,
      ]);
      
      // Fetch the created calendar
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM calendars WHERE id = ?',
        [result.insertId]
      );
      
      return this.mapCalendarRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get calendar by ID
   * @param id Calendar ID
   * @returns Calendar object or null if not found
   */
  async getCalendarById(id: string): Promise<Calendar | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM calendars WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapCalendarRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get calendar by email
   * @param email Calendar email
   * @returns Calendar object or null if not found
   */
  async getCalendarByEmail(email: string): Promise<Calendar | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM calendars WHERE email = ? LIMIT 1',
        [email]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapCalendarRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get calendars by array of IDs
   * @param ids Array of calendar IDs
   * @returns Array of calendars
   */
  async getCalendarsByIds(ids: string[]): Promise<Calendar[]> {
    if (ids.length === 0) {
      return [];
    }
    
    const connection = await this.pool.getConnection();
    
    try {
      const placeholders = ids.map(() => '?').join(',');
      const query = `SELECT * FROM calendars WHERE id IN (${placeholders})`;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, ids);
      
      return rows.map(row => this.mapCalendarRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get active calendars by array of IDs
   * @param ids Array of calendar IDs
   * @returns Array of active calendars
   */
  async getActiveCalendarsByIds(ids: string[]): Promise<Calendar[]> {
    if (ids.length === 0) {
      return [];
    }
    
    const connection = await this.pool.getConnection();
    
    try {
      const placeholders = ids.map(() => '?').join(',');
      const query = `SELECT * FROM calendars WHERE id IN (${placeholders}) AND active = true`;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, ids);
      
      return rows.map(row => this.mapCalendarRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get paginated calendars with optional search
   * @param page Page number (1-indexed)
   * @param limit Items per page
   * @param search Optional search term
   * @returns Array of calendars
   */
  async getCalendars(
    page: number,
    limit: number,
    search?: string
  ): Promise<Calendar[]> {
    const connection = await this.pool.getConnection();
    
    try {
      let query = 'SELECT * FROM calendars';
      const params: any[] = [];
      
      if (search) {
        const searchPattern = `%${search}%`;
        query += ' WHERE (employee_name LIKE ? OR email LIKE ? OR description LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, limit * (page - 1));
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      
      return rows.map(row => this.mapCalendarRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of calendars with optional search (additional method for pagination)
   * @param search Optional search term
   * @returns Total count
   */
  async getCalendarsCount(search?: string): Promise<number> {
    const connection = await this.pool.getConnection();
    
    try {
      let query = 'SELECT COUNT(*) as count FROM calendars';
      const params: any[] = [];
      
      if (search) {
        const searchPattern = `%${search}%`;
        query += ' WHERE (employee_name LIKE ? OR email LIKE ? OR description LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
      }
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  /**
   * Update calendar by ID
   * @param id Calendar ID
   * @param newCalendar Partial calendar object with fields to update
   * @returns Updated calendar
   */
  async updateCalendar(id: string, newCalendar: Partial<Calendar>): Promise<Calendar> {
    const connection = await this.pool.getConnection();
    
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Build dynamic update query
      if (newCalendar.employee_name !== undefined) {
        updates.push('employee_name = ?');
        params.push(newCalendar.employee_name);
      }
      if (newCalendar.description !== undefined) {
        updates.push('description = ?');
        params.push(newCalendar.description);
      }
      if (newCalendar.show_description !== undefined) {
        updates.push('show_description = ?');
        params.push(newCalendar.show_description);
      }
      if (newCalendar.appointment_scheduling !== undefined) {
        updates.push('appointment_scheduling = ?');
        params.push(newCalendar.appointment_scheduling);
      }
      if (newCalendar.employee_image !== undefined) {
        updates.push('employee_image = ?');
        params.push(newCalendar.employee_image);
      }
      if (newCalendar.email !== undefined) {
        updates.push('email = ?');
        params.push(newCalendar.email);
      }
      if (newCalendar.password !== undefined) {
        updates.push('password = ?');
        params.push(newCalendar.password);
      }
      if (newCalendar.online_booked !== undefined) {
        updates.push('online_booked = ?');
        params.push(newCalendar.online_booked);
      }
      if (newCalendar.advanced_settings !== undefined) {
        updates.push('advanced_settings = ?');
        params.push(JSON.stringify(newCalendar.advanced_settings));
      }
      if (newCalendar.assignment_of_services !== undefined) {
        updates.push('assignment_of_services = ?');
        params.push(newCalendar.assignment_of_services);
      }
      if (newCalendar.assignments_services !== undefined) {
        updates.push('assignments_services = ?');
        params.push(JSON.stringify(newCalendar.assignments_services));
      }
      if (newCalendar.link_calendar !== undefined) {
        updates.push('link_calendar = ?');
        params.push(newCalendar.link_calendar);
      }
      if (newCalendar.priority_link !== undefined) {
        updates.push('priority_link = ?');
        params.push(newCalendar.priority_link);
      }
      if (newCalendar.skills !== undefined) {
        updates.push('skills = ?');
        params.push(JSON.stringify(newCalendar.skills));
      }
      if (newCalendar.paired_calendars !== undefined) {
        updates.push('paired_calendars = ?');
        params.push(JSON.stringify(newCalendar.paired_calendars));
      }
      if (newCalendar.insert_appointments !== undefined) {
        updates.push('insert_appointments = ?');
        params.push(newCalendar.insert_appointments);
      }
      if (newCalendar.coupling_on_certain_services !== undefined) {
        updates.push('coupling_on_certain_services = ?');
        params.push(newCalendar.coupling_on_certain_services);
      }
      if (newCalendar.certain_services !== undefined) {
        updates.push('certain_services = ?');
        params.push(JSON.stringify(newCalendar.certain_services));
      }
      if (newCalendar.active !== undefined) {
        updates.push('active = ?');
        params.push(newCalendar.active);
      }
      
      if (updates.length === 0) {
        return this.getCalendarById(id) as Promise<Calendar>;
      }
      
      const query = `UPDATE calendars SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);
      
      await connection.execute(query, params);
      
      const updated = await this.getCalendarById(id);
      return updated as Calendar;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete calendar by ID
   * @param id Calendar ID
   * @returns Deleted calendar or null if not found
   */
  async deleteCalendar(id: string): Promise<Calendar | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const calendar = await this.getCalendarById(id);
      
      if (!calendar) {
        return null;
      }
      
      await connection.execute('DELETE FROM calendars WHERE id = ?', [id]);
      
      return calendar;
    } finally {
      connection.release();
    }
  }

  /**
   * Map MySQL calendar row to Calendar interface
   * Handles JSON parsing and field mapping
   */
  private mapCalendarRow(row: RowDataPacket): Calendar {
    return {
      _id: row.id.toString(),
      employee_name: row.employee_name,
      description: row.description,
      show_description: row.show_description,
      appointment_scheduling: row.appointment_scheduling,
      employee_image: row.employee_image,
      email: row.email,
      password: row.password,
      online_booked: row.online_booked,
      advanced_settings: this.parseJSON(row.advanced_settings),
      assignment_of_services: row.assignment_of_services,
      assignments_services: this.parseJSON(row.assignments_services),
      link_calendar: row.link_calendar,
      priority_link: row.priority_link,
      skills: this.parseJSON(row.skills),
      paired_calendars: this.parseJSON(row.paired_calendars),
      insert_appointments: row.insert_appointments,
      coupling_on_certain_services: row.coupling_on_certain_services,
      certain_services: this.parseJSON(row.certain_services),
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Parse JSON field safely
   */
  private parseJSON(value: any): any {
    if (!value) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
}

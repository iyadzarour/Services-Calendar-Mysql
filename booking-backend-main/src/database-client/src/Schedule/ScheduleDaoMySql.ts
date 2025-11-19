/**
 * ScheduleDaoMySql - MySQL Implementation
 * 
 * This DAO implements schedule/working hours management using MySQL.
 * 
 * Tables used:
 * - schedules: Working hours and availability schedules for calendars
 * - calendars: Referenced for extended schedule queries
 * 
 * Note: Maintains exact same interface as ScheduleDaoMongo for API compatibility
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { ExtendedSchedule, Schedule, ScheduleType, WeekDay } from '../Schema';
import { ScheduleDao } from './ScheduleDao';

export class ScheduleDaoMySql implements ScheduleDao {
  constructor(private pool: Pool) {}

  /**
   * Add a new schedule
   * @param schedule Partial schedule object with required fields
   * @returns Created schedule with generated ID
   */
  async addSchedule(schedule: Partial<Schedule>): Promise<Schedule> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO schedules (
          calendar_id, working_hours_type, weekday, date_from, date_to,
          time_from, time_to, reason, deactivate_working_hours,
          one_time_appointment_link, only_internally, restricted_to_services,
          possible_appointment, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute<ResultSetHeader>(query, [
        schedule.calendar_id,
        schedule.working_hours_type,
        schedule.weekday || null,
        schedule.date_from || null,
        schedule.date_to || null,
        schedule.time_from,
        schedule.time_to,
        schedule.reason || null,
        schedule.deactivate_working_hours || false,
        schedule.one_time_appointment_link || null,
        schedule.only_internally || false,
        schedule.restricted_to_services ? JSON.stringify(schedule.restricted_to_services) : null,
        schedule.possible_appointment || null,
        schedule.active !== undefined ? schedule.active : true,
      ]);
      
      // Fetch the created schedule
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM schedules WHERE id = ?',
        [result.insertId]
      );
      
      return this.mapScheduleRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get schedule by ID
   * @param id Schedule ID
   * @returns Schedule object or null if not found
   */
  async getScheduleById(id: string): Promise<Schedule | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM schedules WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapScheduleRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get paginated schedules
   * @param page Page number (1-indexed)
   * @param limit Items per page
   * @param search Optional search term (not used in original implementation)
   * @returns Array of schedules
   */
  async getSchedules(
    page: number,
    limit: number,
    search?: string
  ): Promise<Schedule[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = 'SELECT * FROM schedules ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const [rows] = await connection.execute<RowDataPacket[]>(
        query,
        [limit, limit * (page - 1)]
      );
      
      return rows.map(row => this.mapScheduleRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of schedules (additional method for pagination)
   * @returns Total count
   */
  async getSchedulesCount(): Promise<number> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM schedules'
      );
      
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  /**
   * Update schedule by ID
   * @param id Schedule ID
   * @param newSchedule Partial schedule object with fields to update
   * @returns Updated schedule
   */
  async updateSchedule(id: string, newSchedule: Partial<Schedule>): Promise<Schedule> {
    const connection = await this.pool.getConnection();
    
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      if (newSchedule.calendar_id !== undefined) {
        updates.push('calendar_id = ?');
        params.push(newSchedule.calendar_id);
      }
      if (newSchedule.working_hours_type !== undefined) {
        updates.push('working_hours_type = ?');
        params.push(newSchedule.working_hours_type);
      }
      if (newSchedule.weekday !== undefined) {
        updates.push('weekday = ?');
        params.push(newSchedule.weekday);
      }
      if (newSchedule.date_from !== undefined) {
        updates.push('date_from = ?');
        params.push(newSchedule.date_from);
      }
      if (newSchedule.date_to !== undefined) {
        updates.push('date_to = ?');
        params.push(newSchedule.date_to);
      }
      if (newSchedule.time_from !== undefined) {
        updates.push('time_from = ?');
        params.push(newSchedule.time_from);
      }
      if (newSchedule.time_to !== undefined) {
        updates.push('time_to = ?');
        params.push(newSchedule.time_to);
      }
      if (newSchedule.reason !== undefined) {
        updates.push('reason = ?');
        params.push(newSchedule.reason);
      }
      if (newSchedule.deactivate_working_hours !== undefined) {
        updates.push('deactivate_working_hours = ?');
        params.push(newSchedule.deactivate_working_hours);
      }
      if (newSchedule.one_time_appointment_link !== undefined) {
        updates.push('one_time_appointment_link = ?');
        params.push(newSchedule.one_time_appointment_link);
      }
      if (newSchedule.only_internally !== undefined) {
        updates.push('only_internally = ?');
        params.push(newSchedule.only_internally);
      }
      if (newSchedule.restricted_to_services !== undefined) {
        updates.push('restricted_to_services = ?');
        params.push(JSON.stringify(newSchedule.restricted_to_services));
      }
      if (newSchedule.possible_appointment !== undefined) {
        updates.push('possible_appointment = ?');
        params.push(newSchedule.possible_appointment);
      }
      if (newSchedule.active !== undefined) {
        updates.push('active = ?');
        params.push(newSchedule.active);
      }
      
      if (updates.length === 0) {
        return this.getScheduleById(id) as Promise<Schedule>;
      }
      
      const query = `UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);
      
      await connection.execute(query, params);
      
      const updated = await this.getScheduleById(id);
      return updated as Schedule;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete schedule by ID
   * @param id Schedule ID
   * @returns Deleted schedule or null if not found
   */
  async deleteSchedule(id: string): Promise<Schedule | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const schedule = await this.getScheduleById(id);
      
      if (!schedule) {
        return null;
      }
      
      await connection.execute('DELETE FROM schedules WHERE id = ?', [id]);
      
      return schedule;
    } finally {
      connection.release();
    }
  }

  /**
   * Get schedules by date with calendar information (extended)
   * Matches schedules that are either weekly for the given weekday or certain dates that include the date
   * @param date Date to check
   * @returns Array of extended schedules with calendar info
   */
  async getScheduleByDate(date: Date): Promise<ExtendedSchedule[]> {
    const connection = await this.pool.getConnection();
    
    try {
      // Get weekday name from date
      const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' }) as WeekDay;
      
      const query = `
        SELECT 
          s.id as _id,
          s.time_from,
          s.time_to,
          s.calendar_id,
          s.working_hours_type,
          s.restricted_to_services,
          s.weekday,
          c.employee_name,
          c.active,
          c.assignments_services
        FROM schedules s
        INNER JOIN calendars c ON s.calendar_id = c.id
        WHERE c.active = true
        AND (
          (s.working_hours_type = ? AND s.weekday = ?)
          OR
          (s.working_hours_type = ? AND s.date_from <= ? AND s.date_to >= ?)
        )
      `;
      
      const dateStr = date.toISOString().split('T')[0];
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [
        ScheduleType.Weekly,
        weekdayName,
        ScheduleType.Certain,
        dateStr,
        dateStr,
      ]);
      
      return rows.map(row => this.mapExtendedScheduleRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get schedules by calendar ID
   * @param calendarId Calendar ID
   * @returns Array of schedules for the calendar
   */
  async getSchedulesByCalendarId(calendarId: string): Promise<Schedule[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM schedules WHERE calendar_id = ? ORDER BY created_at DESC',
        [calendarId]
      );
      
      return rows.map(row => this.mapScheduleRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Map MySQL schedule row to Schedule interface
   */
  private mapScheduleRow(row: RowDataPacket): Schedule {
    return {
      _id: row.id.toString(),
      calendar_id: row.calendar_id.toString(),
      working_hours_type: row.working_hours_type,
      weekday: row.weekday,
      date_from: row.date_from,
      date_to: row.date_to,
      time_from: row.time_from,
      time_to: row.time_to,
      reason: row.reason,
      deactivate_working_hours: row.deactivate_working_hours,
      one_time_appointment_link: row.one_time_appointment_link,
      only_internally: row.only_internally,
      restricted_to_services: this.parseJSON(row.restricted_to_services),
      possible_appointment: row.possible_appointment,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Map MySQL extended schedule row to ExtendedSchedule interface
   */
  private mapExtendedScheduleRow(row: RowDataPacket): ExtendedSchedule {
    return {
      _id: row._id.toString(),
      calendar_id: row.calendar_id.toString(),
      time_from: row.time_from,
      time_to: row.time_to,
      working_hours_type: row.working_hours_type,
      restricted_to_services: this.parseJSON(row.restricted_to_services),
      weekday: row.weekday,
      employee_name: row.employee_name,
      assignments_services: this.parseJSON(row.assignments_services) || [],
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

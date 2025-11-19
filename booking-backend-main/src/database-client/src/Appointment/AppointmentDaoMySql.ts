/**
 * AppointmentDaoMySql - MySQL Implementation
 * 
 * This DAO implements appointment/booking management using MySQL.
 * 
 * Tables used:
 * - appointments: Main appointment records with scheduling and device information
 * - contacts: Referenced for appointment contact information
 * 
 * Note: Maintains exact same interface as AppointmentDao for API compatibility
 * Additional methods (getAppointmentsByDateCalendarIdId, getAppointmentsByCalendarIdId) 
 * are included for service layer compatibility
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { AddAppointmentRequest, Appointment } from '../Schema';
import { AppointmentDao } from './AppointmentDao';
import moment from 'moment';

export class AppointmentDaoMySql implements AppointmentDao {
  constructor(private pool: Pool) {}

  /**
   * Add a new appointment
   * @param appointment Appointment request object
   * @returns Created appointment with generated ID
   */
  async addAppointment(appointment: AddAppointmentRequest): Promise<Appointment> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO appointments (
          category_id, service_id, calendar_id, contact_id, new_user,
          start_date, end_date, brand_of_device, model, selected_devices,
          exhaust_gas_measurement, has_maintenance_agreement, has_bgas_before,
          year, invoice_number, contract_number, imported_service_name,
          imported_service_duration, imported_service_price, appointment_status,
          archived, updated_by, attachments, remarks, employee_attachments,
          employee_remarks, company_remarks, created_by, ended_at, control_points
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Validate required fields
      if (!appointment.category_id || !appointment.service_id || !appointment.calendar_id || !appointment.contact_id) {
        const missing = [];
        if (!appointment.category_id) missing.push('category_id');
        if (!appointment.service_id) missing.push('service_id');
        if (!appointment.calendar_id) missing.push('calendar_id');
        if (!appointment.contact_id) missing.push('contact_id');
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }
      
      if (!appointment.start_date || !appointment.end_date) {
        const missing = [];
        if (!appointment.start_date) missing.push('start_date');
        if (!appointment.end_date) missing.push('end_date');
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }
      
      // Convert string IDs to integers for MySQL
      const categoryId = typeof appointment.category_id === 'string' ? parseInt(appointment.category_id, 10) : appointment.category_id;
      const serviceId = typeof appointment.service_id === 'string' ? parseInt(appointment.service_id, 10) : appointment.service_id;
      const calendarId = typeof appointment.calendar_id === 'string' ? parseInt(appointment.calendar_id, 10) : appointment.calendar_id;
      const contactId = typeof appointment.contact_id === 'string' ? parseInt(appointment.contact_id, 10) : appointment.contact_id;
      
      if (isNaN(categoryId) || isNaN(serviceId) || isNaN(calendarId) || isNaN(contactId)) {
        throw new Error(`Invalid ID format: category_id=${appointment.category_id}, service_id=${appointment.service_id}, calendar_id=${appointment.calendar_id}, contact_id=${appointment.contact_id}`);
      }

      const values = [
        categoryId,
        serviceId,
        calendarId,
        contactId,
        appointment.new_user ?? false,
        appointment.start_date ?? null,
        appointment.end_date ?? null,
        appointment.brand_of_device ?? null,
        appointment.model ?? null,
        appointment.selected_devices ?? null,
        appointment.exhaust_gas_measurement ?? false,
        appointment.has_maintenance_agreement ?? false,
        appointment.has_bgas_before ?? false,
        appointment.year ?? null,
        appointment.invoice_number ?? null,
        appointment.contract_number ?? null,
        appointment.imported_service_name ?? null,
        appointment.imported_service_duration ?? null,
        appointment.imported_service_price ?? null,
        appointment.appointment_status ?? 'Confirmed',
        appointment.archived ?? false,
        appointment.updated_by ?? null,
        appointment.attachments ? JSON.stringify(appointment.attachments) : null,
        appointment.remarks ?? null,
        appointment.employee_attachments ? JSON.stringify(appointment.employee_attachments) : null,
        appointment.employee_remarks ?? null,
        appointment.company_remarks ?? null,
        appointment.created_by ?? null,
        appointment.ended_at ?? null,
        appointment.control_points ? JSON.stringify(appointment.control_points) : null,
      ];
      
      // Ensure all values are defined (no undefined values)
      const cleanedValues = values.map(v => v === undefined ? null : v);
      
      // Validate query parameters
      const columnsMatch = query.match(/INSERT INTO appointments\s*\(([^)]+)\)/);
      const columnsList = columnsMatch?.[1] || '';
      const columnsCount = columnsList.split(',').map(c => c.trim()).filter(c => c).length;
      const placeholdersCount = (query.match(/\?/g) || []).length;
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('INSERT Appointment Debug:');
        console.log('Columns:', columnsList.split(',').map(c => c.trim()));
        console.log('Columns count:', columnsCount);
        console.log('Placeholders count:', placeholdersCount);
        console.log('Values count:', cleanedValues.length);
        console.log('Values:', cleanedValues.map((v, i) => `${i + 1}. ${v}`));
      }
      
      if (cleanedValues.length !== columnsCount || cleanedValues.length !== placeholdersCount) {
        const errorMsg = `Column/Value count mismatch: columns=${columnsCount}, placeholders=${placeholdersCount}, values=${cleanedValues.length}`;
        console.error(errorMsg);
        console.error('Columns:', columnsList.split(',').map(c => c.trim()));
        console.error('Values:', cleanedValues);
        throw new Error(errorMsg);
      }
      
      try {
        const [result] = await connection.execute<ResultSetHeader>(query, cleanedValues);
        
        // Fetch the created appointment with contact
        const created = await this.getAppointmentById(result.insertId.toString());
        if (!created) {
          throw new Error('Failed to fetch created appointment');
        }
        return created as Appointment;
      } catch (error: any) {
        console.error('Error executing INSERT query:', error.message);
        throw error;
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Get appointment by ID with contact information
   * @param id Appointment ID
   * @returns Appointment object with contact or null if not found
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        SELECT 
          a.*,
          c.id as contact_id,
          c.salutation as contact_salutation,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.address as contact_address,
          c.zip_code as contact_zip_code,
          c.location as contact_location,
          c.telephone as contact_telephone,
          c.phone_numbber_2 as contact_phone_numbber_2,
          c.phone_numbber_3 as contact_phone_numbber_3,
          c.email as contact_email,
          c.password as contact_password,
          c.archived as contact_archived,
          c.contract_link as contact_contract_link,
          c.title as contact_title,
          c.sign_url as contact_sign_url,
          c.note_on_address as contact_note_on_address,
          c.newsletter as contact_newsletter,
          c.categories_permission as contact_categories_permission,
          c.remarks as contact_remarks,
          c.imported as contact_imported,
          c.created_at as contact_created_at,
          c.updated_at as contact_updated_at
        FROM appointments a
        INNER JOIN contacts c ON a.contact_id = c.id
        WHERE a.id = ?
        LIMIT 1
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapAppointmentWithContact(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get appointments within date range
   * @param start Start date string
   * @param end End date string
   * @returns Array of appointments with contact information
   */
  async getAppointments(start: string, end: string): Promise<Appointment[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        SELECT 
          a.*,
          c.id as contact_id,
          c.salutation as contact_salutation,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.address as contact_address,
          c.zip_code as contact_zip_code,
          c.location as contact_location,
          c.telephone as contact_telephone,
          c.phone_numbber_2 as contact_phone_numbber_2,
          c.phone_numbber_3 as contact_phone_numbber_3,
          c.email as contact_email,
          c.password as contact_password,
          c.archived as contact_archived,
          c.contract_link as contact_contract_link,
          c.title as contact_title,
          c.sign_url as contact_sign_url,
          c.note_on_address as contact_note_on_address,
          c.newsletter as contact_newsletter,
          c.categories_permission as contact_categories_permission,
          c.remarks as contact_remarks,
          c.imported as contact_imported,
          c.created_at as contact_created_at,
          c.updated_at as contact_updated_at
        FROM appointments a
        INNER JOIN contacts c ON a.contact_id = c.id
        WHERE a.start_date >= ? AND a.end_date <= ?
        ORDER BY a.start_date
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [start, end]);
      
      return rows.map(row => this.mapAppointmentWithContact(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get appointments by contact ID
   * @param contactId Contact ID
   * @returns Array of appointments for the contact
   */
  async getAppointmentsByContactId(contactId: string): Promise<Appointment[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        SELECT 
          a.*,
          c.id as contact_id,
          c.salutation as contact_salutation,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.address as contact_address,
          c.zip_code as contact_zip_code,
          c.location as contact_location,
          c.telephone as contact_telephone,
          c.phone_numbber_2 as contact_phone_numbber_2,
          c.phone_numbber_3 as contact_phone_numbber_3,
          c.email as contact_email,
          c.password as contact_password,
          c.archived as contact_archived,
          c.contract_link as contact_contract_link,
          c.title as contact_title,
          c.sign_url as contact_sign_url,
          c.note_on_address as contact_note_on_address,
          c.newsletter as contact_newsletter,
          c.categories_permission as contact_categories_permission,
          c.remarks as contact_remarks,
          c.imported as contact_imported,
          c.created_at as contact_created_at,
          c.updated_at as contact_updated_at
        FROM appointments a
        INNER JOIN contacts c ON a.contact_id = c.id
        WHERE a.contact_id = ?
        ORDER BY a.start_date DESC
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [contactId]);
      
      return rows.map(row => this.mapAppointmentWithContact(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get appointments by calendar ID and date range (additional method for service layer)
   * @param calendar_id Calendar ID
   * @param start Start date string
   * @param end End date string
   * @returns Array of appointments
   */
  async getAppointmentsByDateCalendarIdId(
    calendar_id: string,
    start: string,
    end: string
  ): Promise<Appointment[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        SELECT 
          a.*,
          c.id as contact_id,
          c.salutation as contact_salutation,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.address as contact_address,
          c.zip_code as contact_zip_code,
          c.location as contact_location,
          c.telephone as contact_telephone,
          c.phone_numbber_2 as contact_phone_numbber_2,
          c.phone_numbber_3 as contact_phone_numbber_3,
          c.email as contact_email,
          c.password as contact_password,
          c.archived as contact_archived,
          c.contract_link as contact_contract_link,
          c.title as contact_title,
          c.sign_url as contact_sign_url,
          c.note_on_address as contact_note_on_address,
          c.newsletter as contact_newsletter,
          c.categories_permission as contact_categories_permission,
          c.remarks as contact_remarks,
          c.imported as contact_imported,
          c.created_at as contact_created_at,
          c.updated_at as contact_updated_at
        FROM appointments a
        INNER JOIN contacts c ON a.contact_id = c.id
        WHERE a.calendar_id = ? AND a.start_date >= ? AND a.end_date <= ?
        ORDER BY a.start_date
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [calendar_id, start, end]);
      
      return rows.map(row => this.mapAppointmentWithContact(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get appointments by calendar ID (additional method for service layer)
   * @param calendarId Calendar ID
   * @returns Array of appointments
   */
  async getAppointmentsByCalendarIdId(calendarId: string): Promise<Appointment[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        SELECT 
          a.*,
          c.id as contact_id,
          c.salutation as contact_salutation,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.address as contact_address,
          c.zip_code as contact_zip_code,
          c.location as contact_location,
          c.telephone as contact_telephone,
          c.phone_numbber_2 as contact_phone_numbber_2,
          c.phone_numbber_3 as contact_phone_numbber_3,
          c.email as contact_email,
          c.password as contact_password,
          c.archived as contact_archived,
          c.contract_link as contact_contract_link,
          c.title as contact_title,
          c.sign_url as contact_sign_url,
          c.note_on_address as contact_note_on_address,
          c.newsletter as contact_newsletter,
          c.categories_permission as contact_categories_permission,
          c.remarks as contact_remarks,
          c.imported as contact_imported,
          c.created_at as contact_created_at,
          c.updated_at as contact_updated_at
        FROM appointments a
        INNER JOIN contacts c ON a.contact_id = c.id
        WHERE a.calendar_id = ?
        ORDER BY a.start_date DESC
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [calendarId]);
      
      return rows.map(row => this.mapAppointmentWithContact(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Update appointment by ID
   * @param id Appointment ID
   * @param newAppointment Appointment request object with fields to update
   * @returns Updated appointment
   */
  async updateAppointment(
    id: string,
    newAppointment: AddAppointmentRequest
  ): Promise<Appointment> {
    const connection = await this.pool.getConnection();
    
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      if (newAppointment.category_id !== undefined) {
        updates.push('category_id = ?');
        params.push(newAppointment.category_id);
      }
      if (newAppointment.service_id !== undefined) {
        updates.push('service_id = ?');
        params.push(newAppointment.service_id);
      }
      if (newAppointment.calendar_id !== undefined) {
        updates.push('calendar_id = ?');
        params.push(newAppointment.calendar_id);
      }
      if (newAppointment.contact_id !== undefined) {
        updates.push('contact_id = ?');
        params.push(newAppointment.contact_id);
      }
      if (newAppointment.new_user !== undefined) {
        updates.push('new_user = ?');
        params.push(newAppointment.new_user);
      }
      if (newAppointment.start_date !== undefined) {
        updates.push('start_date = ?');
        params.push(newAppointment.start_date);
      }
      if (newAppointment.end_date !== undefined) {
        updates.push('end_date = ?');
        params.push(newAppointment.end_date);
      }
      if (newAppointment.brand_of_device !== undefined) {
        updates.push('brand_of_device = ?');
        params.push(newAppointment.brand_of_device);
      }
      if (newAppointment.model !== undefined) {
        updates.push('model = ?');
        params.push(newAppointment.model);
      }
      if (newAppointment.selected_devices !== undefined) {
        updates.push('selected_devices = ?');
        params.push(newAppointment.selected_devices);
      }
      if (newAppointment.exhaust_gas_measurement !== undefined) {
        updates.push('exhaust_gas_measurement = ?');
        params.push(newAppointment.exhaust_gas_measurement);
      }
      if (newAppointment.has_maintenance_agreement !== undefined) {
        updates.push('has_maintenance_agreement = ?');
        params.push(newAppointment.has_maintenance_agreement);
      }
      if (newAppointment.has_bgas_before !== undefined) {
        updates.push('has_bgas_before = ?');
        params.push(newAppointment.has_bgas_before);
      }
      if (newAppointment.year !== undefined) {
        updates.push('year = ?');
        params.push(newAppointment.year);
      }
      if (newAppointment.invoice_number !== undefined) {
        updates.push('invoice_number = ?');
        params.push(newAppointment.invoice_number);
      }
      if (newAppointment.contract_number !== undefined) {
        updates.push('contract_number = ?');
        params.push(newAppointment.contract_number);
      }
      if (newAppointment.imported_service_name !== undefined) {
        updates.push('imported_service_name = ?');
        params.push(newAppointment.imported_service_name);
      }
      if (newAppointment.imported_service_duration !== undefined) {
        updates.push('imported_service_duration = ?');
        params.push(newAppointment.imported_service_duration);
      }
      if (newAppointment.imported_service_price !== undefined) {
        updates.push('imported_service_price = ?');
        params.push(newAppointment.imported_service_price);
      }
      if (newAppointment.appointment_status !== undefined) {
        updates.push('appointment_status = ?');
        params.push(newAppointment.appointment_status);
      }
      if (newAppointment.archived !== undefined) {
        updates.push('archived = ?');
        params.push(newAppointment.archived);
      }
      if (newAppointment.updated_by !== undefined) {
        updates.push('updated_by = ?');
        params.push(newAppointment.updated_by);
      }
      if (newAppointment.attachments !== undefined) {
        updates.push('attachments = ?');
        params.push(JSON.stringify(newAppointment.attachments));
      }
      if (newAppointment.remarks !== undefined) {
        updates.push('remarks = ?');
        params.push(newAppointment.remarks);
      }
      if (newAppointment.employee_attachments !== undefined) {
        updates.push('employee_attachments = ?');
        params.push(JSON.stringify(newAppointment.employee_attachments));
      }
      if (newAppointment.employee_remarks !== undefined) {
        updates.push('employee_remarks = ?');
        params.push(newAppointment.employee_remarks);
      }
      if (newAppointment.company_remarks !== undefined) {
        updates.push('company_remarks = ?');
        params.push(newAppointment.company_remarks);
      }
      if (newAppointment.created_by !== undefined) {
        updates.push('created_by = ?');
        params.push(newAppointment.created_by);
      }
      if (newAppointment.ended_at !== undefined) {
        updates.push('ended_at = ?');
        params.push(newAppointment.ended_at);
      }
      if (newAppointment.control_points !== undefined) {
        updates.push('control_points = ?');
        params.push(JSON.stringify(newAppointment.control_points));
      }
      
      if (updates.length === 0) {
        return this.getAppointmentById(id) as Promise<Appointment>;
      }
      
      const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);
      
      await connection.execute(query, params);
      
      const updated = await this.getAppointmentById(id);
      return updated as Appointment;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete appointment by ID
   * @param id Appointment ID
   * @returns Deleted appointment or null if not found
   */
  async deleteAppointment(id: string): Promise<Appointment | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const appointment = await this.getAppointmentById(id);
      
      if (!appointment) {
        return null;
      }
      
      await connection.execute('DELETE FROM appointments WHERE id = ?', [id]);
      
      return appointment;
    } finally {
      connection.release();
    }
  }

  /**
   * Get appointments due for reminder (tomorrow's appointments)
   * @returns Array of appointments with contact information
   */
  async getDueReminderAppointments(): Promise<Appointment[]> {
    const connection = await this.pool.getConnection();
    
    try {
      const today = moment().startOf('day');
      const tomorrow = moment().add(1, 'days').startOf('day');
      
      const query = `
        SELECT 
          a.*,
          c.id as contact_id,
          c.salutation as contact_salutation,
          c.first_name as contact_first_name,
          c.last_name as contact_last_name,
          c.address as contact_address,
          c.zip_code as contact_zip_code,
          c.location as contact_location,
          c.telephone as contact_telephone,
          c.phone_numbber_2 as contact_phone_numbber_2,
          c.phone_numbber_3 as contact_phone_numbber_3,
          c.email as contact_email,
          c.password as contact_password,
          c.archived as contact_archived,
          c.contract_link as contact_contract_link,
          c.title as contact_title,
          c.sign_url as contact_sign_url,
          c.note_on_address as contact_note_on_address,
          c.newsletter as contact_newsletter,
          c.categories_permission as contact_categories_permission,
          c.remarks as contact_remarks,
          c.imported as contact_imported,
          c.created_at as contact_created_at,
          c.updated_at as contact_updated_at
        FROM appointments a
        INNER JOIN contacts c ON a.contact_id = c.id
        WHERE DAY(a.start_date) = ? 
          AND MONTH(a.start_date) = ? 
          AND YEAR(a.start_date) != ?
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [
        tomorrow.date(),
        tomorrow.month() + 1,
        today.year(),
      ]);
      
      return rows.map(row => this.mapAppointmentWithContact(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Map appointment row with contact data to Appointment interface
   */
  private mapAppointmentWithContact(row: RowDataPacket): Appointment {
    return {
      _id: row.id.toString(),
      category_id: row.category_id.toString(),
      service_id: row.service_id.toString(),
      calendar_id: row.calendar_id.toString(),
      contact_id: row.contact_id.toString(),
      new_user: row.new_user,
      start_date: row.start_date,
      end_date: row.end_date,
      brand_of_device: row.brand_of_device,
      model: row.model,
      selected_devices: row.selected_devices,
      exhaust_gas_measurement: row.exhaust_gas_measurement,
      has_maintenance_agreement: row.has_maintenance_agreement,
      has_bgas_before: row.has_bgas_before,
      year: row.year,
      invoice_number: row.invoice_number,
      contract_number: row.contract_number,
      imported_service_name: row.imported_service_name,
      imported_service_duration: row.imported_service_duration,
      imported_service_price: row.imported_service_price,
      appointment_status: row.appointment_status,
      archived: row.archived,
      updated_by: row.updated_by,
      attachments: this.parseJSON(row.attachments),
      remarks: row.remarks,
      employee_attachments: this.parseJSON(row.employee_attachments),
      employee_remarks: row.employee_remarks,
      company_remarks: row.company_remarks,
      created_by: row.created_by,
      ended_at: row.ended_at,
      control_points: this.parseJSON(row.control_points),
      contact: {
        _id: row.contact_id.toString(),
        salutation: row.contact_salutation,
        first_name: row.contact_first_name,
        last_name: row.contact_last_name,
        address: row.contact_address,
        zip_code: row.contact_zip_code,
        location: row.contact_location,
        telephone: row.contact_telephone,
        phone_numbber_2: row.contact_phone_numbber_2,
        phone_numbber_3: row.contact_phone_numbber_3,
        email: row.contact_email,
        password: row.contact_password,
        archived: row.contact_archived,
        contract_link: row.contact_contract_link,
        title: row.contact_title,
        sign_url: row.contact_sign_url,
        note_on_address: row.contact_note_on_address,
        newsletter: row.contact_newsletter,
        categories_permission: this.parseJSON(row.contact_categories_permission),
        remarks: row.contact_remarks,
        imported: row.contact_imported,
        createdAt: row.contact_created_at,
        updatedAt: row.contact_updated_at,
      },
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

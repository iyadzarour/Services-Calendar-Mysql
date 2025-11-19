/**
 * ContactDaoMySql - MySQL Implementation
 * 
 * This DAO implements contact/customer management using MySQL.
 * 
 * Tables used:
 * - contacts: Customer contact information and preferences
 * 
 * Note: Maintains exact same interface as ContactDaoMongo for API compatibility
 * Additional methods (getContactByEmail, getContactsCount) are included for service layer compatibility
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Contact } from '../Schema';
import { ContactDao } from './ContactDao';

export class ContactDaoMySql implements ContactDao {
  constructor(private pool: Pool) {}

  /**
   * Add a new contact to the database
   * @param contact Partial contact object with required fields
   * @returns Created contact with generated ID
   */
  async addContact(contact: Partial<Contact>): Promise<Contact> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        INSERT INTO contacts (
          salutation, first_name, last_name, address, zip_code, location,
          telephone, phone_numbber_2, phone_numbber_3, email, password,
          archived, contract_link, title, sign_url, note_on_address,
          newsletter, categories_permission, remarks, district, lat, lng, imported
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const categoriesPermission = contact.categories_permission 
        ? JSON.stringify(contact.categories_permission) 
        : null;
      
      // Validate query parameters
      const columnsMatch = query.match(/INSERT INTO contacts\s*\(([^)]+)\)/);
      const columnsList = columnsMatch?.[1] || '';
      const columnsCount = columnsList.split(',').map(c => c.trim()).filter(c => c).length;
      const placeholdersCount = (query.match(/\?/g) || []).length;
      
      const values = [
        contact.salutation ?? null,
        contact.first_name ?? null,
        contact.last_name ?? null,
        contact.address ?? null,
        contact.zip_code ?? null,
        contact.location ?? null,
        contact.telephone ?? null,
        contact.phone_numbber_2 ?? null,
        contact.phone_numbber_3 ?? null,
        contact.email ?? null,
        contact.password ?? null,
        contact.archived ?? false,
        contact.contract_link ?? null,
        contact.title ?? null,
        contact.sign_url ?? null,
        contact.note_on_address ?? null,
        contact.newsletter ?? false,
        categoriesPermission,
        contact.remarks ?? null,
        contact.district ?? null,
        contact.lat ?? null,
        contact.lng ?? null,
        contact.imported ?? false,
      ];
      
      // Ensure all values are defined (no undefined values)
      const cleanedValues = values.map(v => v === undefined ? null : v);
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('INSERT Contact Debug:');
        console.log('Columns:', columnsList.split(',').map(c => c.trim()));
        console.log('Columns count:', columnsCount);
        console.log('Placeholders count:', placeholdersCount);
        console.log('Values count:', cleanedValues.length);
      }
      
      if (cleanedValues.length !== columnsCount || cleanedValues.length !== placeholdersCount) {
        const errorMsg = `Column/Value count mismatch: columns=${columnsCount}, placeholders=${placeholdersCount}, values=${cleanedValues.length}`;
        console.error(errorMsg);
        console.error('Columns:', columnsList.split(',').map(c => c.trim()));
        console.error('Values:', cleanedValues);
        throw new Error(errorMsg);
      }
      
      const [result] = await connection.execute<ResultSetHeader>(query, cleanedValues);
      
      // Fetch the created contact
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE id = ?',
        [result.insertId]
      );
      
      return this.mapContactRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get contact by ID
   * @param id Contact ID
   * @returns Contact object or null if not found
   */
  async getContactById(id: string): Promise<Contact | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapContactRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get contact by email (additional method for service layer)
   * @param email Contact email
   * @returns Contact object or null if not found
   */
  async getContactByEmail(email: string): Promise<Contact | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM contacts WHERE email = ? LIMIT 1',
        [email]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapContactRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get paginated contacts with optional search
   * @param page Page number (1-indexed)
   * @param limit Items per page
   * @param search Optional search term
   * @returns Array of contacts
   */
  async getContacts(
    page: number,
    limit: number,
    search?: string
  ): Promise<Contact[]> {
    const connection = await this.pool.getConnection();
    
    try {
      let query = 'SELECT * FROM contacts';
      const params: any[] = [];
      
      if (search) {
        const searchPattern = `%${search}%`;
        
        const conditions = [
          'first_name LIKE ?',
          'last_name LIKE ?',
          'telephone LIKE ?',
          'phone_numbber_2 LIKE ?',
          'phone_numbber_3 LIKE ?',
          'email LIKE ?',
          'note_on_address LIKE ?',
          'remarks LIKE ?',
        ];
        
        query += ' WHERE (' + conditions.join(' OR ') + ')';
        
        // Add search pattern for each condition
        for (let i = 0; i < conditions.length; i++) {
          params.push(searchPattern);
        }
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, limit * (page - 1));
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      
      return rows.map(row => this.mapContactRow(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get contacts with their appointments (JOIN operation)
   * @returns Array of contacts with appointments
   */
  async getContactsWithAppointments(): Promise<any> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        SELECT 
          c.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              '_id', a.id,
              'start_date', a.start_date,
              'end_date', a.end_date,
              'appointment_status', a.appointment_status
            )
          ) as appointments
        FROM contacts c
        LEFT JOIN appointments a ON c.id = a.contact_id
        GROUP BY c.id
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query);
      
      return rows.map(row => ({
        ...this.mapContactRow(row),
        appointments: row.appointments ? JSON.parse(row.appointments) : []
      }));
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of contacts with optional search (additional method for pagination)
   * @param search Optional search term
   * @returns Total count
   */
  async getContactsCount(search?: string): Promise<number> {
    const connection = await this.pool.getConnection();
    
    try {
      let query = 'SELECT COUNT(*) as count FROM contacts';
      const params: any[] = [];
      
      if (search) {
        const searchPattern = `%${search}%`;
        
        const conditions = [
          'first_name LIKE ?',
          'last_name LIKE ?',
          'telephone LIKE ?',
          'phone_numbber_2 LIKE ?',
          'phone_numbber_3 LIKE ?',
          'email LIKE ?',
          'note_on_address LIKE ?',
          'remarks LIKE ?',
        ];
        
        query += ' WHERE (' + conditions.join(' OR ') + ')';
        
        for (let i = 0; i < conditions.length; i++) {
          params.push(searchPattern);
        }
      }
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  /**
   * Update contact by ID
   * @param id Contact ID
   * @param newContact Partial contact object with fields to update
   * @returns Updated contact
   */
  async updateContact(id: string, newContact: Partial<Contact>): Promise<Contact> {
    const connection = await this.pool.getConnection();
    
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Build dynamic update query
      if (newContact.salutation !== undefined) {
        updates.push('salutation = ?');
        params.push(newContact.salutation);
      }
      if (newContact.first_name !== undefined) {
        updates.push('first_name = ?');
        params.push(newContact.first_name);
      }
      if (newContact.last_name !== undefined) {
        updates.push('last_name = ?');
        params.push(newContact.last_name);
      }
      if (newContact.address !== undefined) {
        updates.push('address = ?');
        params.push(newContact.address);
      }
      if (newContact.zip_code !== undefined) {
        updates.push('zip_code = ?');
        params.push(newContact.zip_code);
      }
      if (newContact.location !== undefined) {
        updates.push('location = ?');
        params.push(newContact.location);
      }
      if (newContact.telephone !== undefined) {
        updates.push('telephone = ?');
        params.push(newContact.telephone);
      }
      if (newContact.phone_numbber_2 !== undefined) {
        updates.push('phone_numbber_2 = ?');
        params.push(newContact.phone_numbber_2);
      }
      if (newContact.phone_numbber_3 !== undefined) {
        updates.push('phone_numbber_3 = ?');
        params.push(newContact.phone_numbber_3);
      }
      if (newContact.email !== undefined) {
        updates.push('email = ?');
        params.push(newContact.email);
      }
      if (newContact.password !== undefined) {
        updates.push('password = ?');
        params.push(newContact.password);
      }
      if (newContact.archived !== undefined) {
        updates.push('archived = ?');
        params.push(newContact.archived);
      }
      if (newContact.contract_link !== undefined) {
        updates.push('contract_link = ?');
        params.push(newContact.contract_link);
      }
      if (newContact.title !== undefined) {
        updates.push('title = ?');
        params.push(newContact.title);
      }
      if (newContact.sign_url !== undefined) {
        updates.push('sign_url = ?');
        params.push(newContact.sign_url);
      }
      if (newContact.note_on_address !== undefined) {
        updates.push('note_on_address = ?');
        params.push(newContact.note_on_address);
      }
      if (newContact.newsletter !== undefined) {
        updates.push('newsletter = ?');
        params.push(newContact.newsletter);
      }
      if (newContact.categories_permission !== undefined) {
        updates.push('categories_permission = ?');
        params.push(JSON.stringify(newContact.categories_permission));
      }
      if (newContact.remarks !== undefined) {
        updates.push('remarks = ?');
        params.push(newContact.remarks);
      }
      if (newContact.district !== undefined) {
        updates.push('district = ?');
        params.push(newContact.district);
      }
      if (newContact.lat !== undefined) {
        updates.push('lat = ?');
        params.push(newContact.lat);
      }
      if (newContact.lng !== undefined) {
        updates.push('lng = ?');
        params.push(newContact.lng);
      }
      if (newContact.imported !== undefined) {
        updates.push('imported = ?');
        params.push(newContact.imported);
      }
      
      if (updates.length === 0) {
        // No updates, just return existing contact
        return this.getContactById(id) as Promise<Contact>;
      }
      
      const query = `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);
      
      await connection.execute(query, params);
      
      // Fetch updated contact
      const updated = await this.getContactById(id);
      return updated as Contact;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete contact by ID
   * @param id Contact ID
   * @returns Deleted contact or null if not found
   */
  async deleteContact(id: string): Promise<Contact | null> {
    const connection = await this.pool.getConnection();
    
    try {
      // Fetch contact before deletion
      const contact = await this.getContactById(id);
      
      if (!contact) {
        return null;
      }
      
      await connection.execute('DELETE FROM contacts WHERE id = ?', [id]);
      
      return contact;
    } finally {
      connection.release();
    }
  }

  /**
   * Map MySQL contact row to Contact interface
   * Handles JSON parsing and field mapping
   */
  private mapContactRow(row: RowDataPacket): Contact {
    return {
      _id: row.id.toString(),
      salutation: row.salutation,
      first_name: row.first_name,
      last_name: row.last_name,
      address: row.address,
      zip_code: row.zip_code,
      location: row.location,
      telephone: row.telephone,
      phone_numbber_2: row.phone_numbber_2,
      phone_numbber_3: row.phone_numbber_3,
      email: row.email,
      password: row.password,
      archived: row.archived,
      contract_link: row.contract_link,
      title: row.title,
      sign_url: row.sign_url,
      note_on_address: row.note_on_address,
      newsletter: row.newsletter,
      categories_permission: row.categories_permission 
        ? (typeof row.categories_permission === 'string' 
          ? JSON.parse(row.categories_permission) 
          : row.categories_permission)
        : [],
      remarks: row.remarks,
      district: row.district,
      lat: row.lat,
      lng: row.lng,
      imported: row.imported,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * CategoryDaoMySql - MySQL Implementation
 * 
 * This DAO implements category and service management using MySQL.
 * 
 * Tables used:
 * - categories: Service categories with settings
 * - services: Individual services within categories (separate table, was nested in MongoDB)
 * 
 * Note: In MongoDB, services were nested arrays within categories.
 * In MySQL, services are in a separate table with foreign key to categories.
 * The DAO handles this difference internally to maintain the same interface.
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Category, ExtendedService, Service } from '../Schema';
import { CategoryDao } from './CategoryDao';
import { isValidNumber } from '../utils';

export class CategoryDaoMySql implements CategoryDao {
  constructor(private pool: Pool) {}

  /**
   * Add a new category with its services
   * @param category Partial category object with services array
   * @returns Created category with generated ID
   */
  async addCategory(category: Partial<Category>): Promise<Category> {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert category
      const categoryQuery = `
        INSERT INTO categories (
          name, category, choices, selection_is_optional, show_price,
          show_appointment_duration, no_columns_of_services, full_screen,
          folded, online_booking, remarks, unique_id, display_status,
          advanced_settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [categoryResult] = await connection.execute<ResultSetHeader>(categoryQuery, [
        category.name,
        category.category,
        category.choices,
        category.selection_is_optional || false,
        category.show_price || false,
        category.show_appointment_duration || false,
        category.no_columns_of_services || 1,
        category.full_screen || false,
        category.folded || false,
        category.online_booking || false,
        category.remarks || '',
        category.unique_id,
        category.display_status || 'show',
        category.advanced_settings ? JSON.stringify(category.advanced_settings) : null,
      ]);
      
      const categoryId = categoryResult.insertId;
      
      // Insert services if provided
      if (category.services && category.services.length > 0) {
        const serviceQuery = `
          INSERT INTO services (
            category_id, name, description, duration, price,
            abbreviation_id, attachment
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const service of category.services) {
          await connection.execute(serviceQuery, [
            categoryId,
            service.name,
            service.description,
            service.duration,
            service.price,
            service.abbreviation_id,
            service.attachment ? JSON.stringify(service.attachment) : null,
          ]);
        }
      }
      
      await connection.commit();
      
      // Fetch the created category with services
      const result = await this.getCategoryById(categoryId.toString());
      return result as Category;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get category by ID with its services
   * @param id Category ID
   * @returns Category object with services array or null if not found
   */
  async getCategoryById(id: string): Promise<Category | null> {
    const connection = await this.pool.getConnection();
    
    try {
      // Get category
      const [categoryRows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM categories WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (categoryRows.length === 0) {
        return null;
      }
      
      // Get services for this category
      const [serviceRows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM services WHERE category_id = ? ORDER BY id',
        [id]
      );
      
      return this.mapCategoryWithServices(categoryRows[0], serviceRows);
    } finally {
      connection.release();
    }
  }

  /**
   * Get a specific service by category ID and service ID
   * @param categoryId Category ID
   * @param serviceId Service ID
   * @returns Service object or null if not found
   */
  async getServiceByCategoryIdAndServiceId(
    categoryId: string,
    serviceId: string
  ): Promise<Service | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM services WHERE category_id = ? AND id = ? LIMIT 1',
        [categoryId, serviceId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapServiceRow(rows[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get paginated categories with optional search
   * @param page Page number (1-indexed)
   * @param limit Items per page
   * @param search Optional search term
   * @returns Array of categories with services
   */
  async getCategories(
    page: number,
    limit: number,
    search?: string
  ): Promise<Category[]> {
    const connection = await this.pool.getConnection();
    
    try {
      let categoryQuery = 'SELECT DISTINCT c.* FROM categories c';
      const params: any[] = [];
      
      if (search) {
        const isValidNo = isValidNumber(search);
        const searchPattern = `%${search}%`;
        
        // Join with services for searching in service fields
        categoryQuery += ' LEFT JOIN services s ON c.id = s.category_id';
        categoryQuery += ' WHERE (c.name LIKE ?';
        params.push(searchPattern);
        
        if (isValidNo) {
          categoryQuery += ' OR c.unique_id = ?';
          params.push(Number(search));
        }
        
        categoryQuery += ' OR s.name LIKE ? OR s.description LIKE ?';
        params.push(searchPattern, searchPattern);
        
        if (isValidNo) {
          categoryQuery += ' OR s.abbreviation_id = ?';
          params.push(Number(search));
        }
        
        categoryQuery += ')';
      }
      
      categoryQuery += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, limit * (page - 1));
      
      const [categoryRows] = await connection.execute<RowDataPacket[]>(categoryQuery, params);
      
      // Fetch services for all categories
      const categories: Category[] = [];
      for (const categoryRow of categoryRows) {
        const [serviceRows] = await connection.execute<RowDataPacket[]>(
          'SELECT * FROM services WHERE category_id = ? ORDER BY id',
          [categoryRow.id]
        );
        
        categories.push(this.mapCategoryWithServices(categoryRow, serviceRows));
      }
      
      return categories;
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of categories (additional method for pagination)
   * @param search Optional search term
   * @returns Total count
   */
  async getCategoriesCount(search?: string): Promise<number> {
    const connection = await this.pool.getConnection();
    
    try {
      let query = 'SELECT COUNT(DISTINCT c.id) as count FROM categories c';
      const params: any[] = [];
      
      if (search) {
        const isValidNo = isValidNumber(search);
        const searchPattern = `%${search}%`;
        
        query += ' LEFT JOIN services s ON c.id = s.category_id';
        query += ' WHERE (c.name LIKE ?';
        params.push(searchPattern);
        
        if (isValidNo) {
          query += ' OR c.unique_id = ?';
          params.push(Number(search));
        }
        
        query += ' OR s.name LIKE ? OR s.description LIKE ?';
        params.push(searchPattern, searchPattern);
        
        if (isValidNo) {
          query += ' OR s.abbreviation_id = ?';
          params.push(Number(search));
        }
        
        query += ')';
      }
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  /**
   * Update category and its services
   * @param id Category ID
   * @param newCategory Partial category object with fields to update
   * @returns Updated category
   */
  async updateCategory(id: string, newCategory: Partial<Category>): Promise<Category> {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const updates: string[] = [];
      const params: any[] = [];
      
      // Build dynamic update query for category
      if (newCategory.name !== undefined) {
        updates.push('name = ?');
        params.push(newCategory.name);
      }
      if (newCategory.category !== undefined) {
        updates.push('category = ?');
        params.push(newCategory.category);
      }
      if (newCategory.choices !== undefined) {
        updates.push('choices = ?');
        params.push(newCategory.choices);
      }
      if (newCategory.selection_is_optional !== undefined) {
        updates.push('selection_is_optional = ?');
        params.push(newCategory.selection_is_optional);
      }
      if (newCategory.show_price !== undefined) {
        updates.push('show_price = ?');
        params.push(newCategory.show_price);
      }
      if (newCategory.show_appointment_duration !== undefined) {
        updates.push('show_appointment_duration = ?');
        params.push(newCategory.show_appointment_duration);
      }
      if (newCategory.no_columns_of_services !== undefined) {
        updates.push('no_columns_of_services = ?');
        params.push(newCategory.no_columns_of_services);
      }
      if (newCategory.full_screen !== undefined) {
        updates.push('full_screen = ?');
        params.push(newCategory.full_screen);
      }
      if (newCategory.folded !== undefined) {
        updates.push('folded = ?');
        params.push(newCategory.folded);
      }
      if (newCategory.online_booking !== undefined) {
        updates.push('online_booking = ?');
        params.push(newCategory.online_booking);
      }
      if (newCategory.remarks !== undefined) {
        updates.push('remarks = ?');
        params.push(newCategory.remarks);
      }
      if (newCategory.unique_id !== undefined) {
        updates.push('unique_id = ?');
        params.push(newCategory.unique_id);
      }
      if (newCategory.display_status !== undefined) {
        updates.push('display_status = ?');
        params.push(newCategory.display_status);
      }
      if (newCategory.advanced_settings !== undefined) {
        updates.push('advanced_settings = ?');
        params.push(JSON.stringify(newCategory.advanced_settings));
      }
      
      if (updates.length > 0) {
        const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
        params.push(id);
        await connection.execute(query, params);
      }
      
      // Update services if provided
      if (newCategory.services !== undefined) {
        // Delete existing services
        await connection.execute('DELETE FROM services WHERE category_id = ?', [id]);
        
        // Insert new services
        if (newCategory.services.length > 0) {
          const serviceQuery = `
            INSERT INTO services (
              category_id, name, description, duration, price,
              abbreviation_id, attachment
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          for (const service of newCategory.services) {
            await connection.execute(serviceQuery, [
              id,
              service.name,
              service.description,
              service.duration,
              service.price,
              service.abbreviation_id,
              service.attachment ? JSON.stringify(service.attachment) : null,
            ]);
          }
        }
      }
      
      await connection.commit();
      
      const updated = await this.getCategoryById(id);
      return updated as Category;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete category and its services
   * @param id Category ID
   * @returns Deleted category or null if not found
   */
  async deleteCategory(id: string): Promise<Category | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const category = await this.getCategoryById(id);
      
      if (!category) {
        return null;
      }
      
      // Services will be deleted automatically due to CASCADE foreign key
      await connection.execute('DELETE FROM categories WHERE id = ?', [id]);
      
      return category;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all services across all categories with category_id
   * @returns Array of extended services with category_id
   */
  async getServices(): Promise<ExtendedService[] | null> {
    const connection = await this.pool.getConnection();
    
    try {
      const query = `
        SELECT 
          s.*,
          s.category_id as category_id
        FROM services s
        ORDER BY s.category_id, s.id
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query);
      
      return rows.map(row => ({
        _id: row.id.toString(),
        category_id: row.category_id.toString(),
        name: row.name,
        description: row.description,
        duration: row.duration,
        price: row.price,
        abbreviation_id: row.abbreviation_id,
        attachment: this.parseJSON(row.attachment),
      }));
    } finally {
      connection.release();
    }
  }

  /**
   * Map category row with services to Category interface
   */
  private mapCategoryWithServices(categoryRow: RowDataPacket, serviceRows: RowDataPacket[]): Category {
    return {
      _id: categoryRow.id.toString(),
      name: categoryRow.name,
      category: categoryRow.category,
      choices: categoryRow.choices,
      selection_is_optional: categoryRow.selection_is_optional,
      show_price: categoryRow.show_price,
      show_appointment_duration: categoryRow.show_appointment_duration,
      no_columns_of_services: categoryRow.no_columns_of_services,
      full_screen: categoryRow.full_screen,
      folded: categoryRow.folded,
      online_booking: categoryRow.online_booking,
      remarks: categoryRow.remarks,
      unique_id: categoryRow.unique_id,
      display_status: categoryRow.display_status,
      advanced_settings: this.parseJSON(categoryRow.advanced_settings),
      services: serviceRows.map(row => this.mapServiceRow(row)),
      createdAt: categoryRow.created_at,
      updatedAt: categoryRow.updated_at,
    };
  }

  /**
   * Map service row to Service interface
   */
  private mapServiceRow(row: RowDataPacket): Service {
    return {
      _id: row.id.toString(),
      name: row.name,
      description: row.description,
      duration: row.duration,
      price: parseFloat(row.price),
      abbreviation_id: row.abbreviation_id,
      attachment: this.parseJSON(row.attachment),
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

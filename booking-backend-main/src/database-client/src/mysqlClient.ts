/**
 * MySQL Client Connection Module
 * 
 * This module provides a connection pool to MySQL database using mysql2.
 * Configuration is loaded from env.json file via getEnv() function.
 * 
 * MySQL Configuration in env.json:
 * - mysqlHost: MySQL server host
 * - mysqlPort: MySQL server port (default: 3306)
 * - mysqlUser: MySQL username
 * - mysqlPassword: MySQL password
 * - mysqlDatabase: MySQL database name
 * 
 * Falls back to environment variables if env.json is not available:
 * - MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 */

import mysql from 'mysql2/promise';

interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Load MySQL configuration from env.json or environment variables
const getMySQLConfig = (): MySQLConfig => {
  // Try to use env.json first via getEnv()
  try {
    // Dynamic import to avoid circular dependency issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getEnv } = require('../../server/env');
    const env = getEnv();
    if (env && (env.mysqlHost || env.mysqlUser || env.mysqlDatabase)) {
      return {
        host: env.mysqlHost || process.env.MYSQL_HOST || 'localhost',
        port: Number.parseInt(env.mysqlPort || process.env.MYSQL_PORT || '3306', 10),
        user: env.mysqlUser || process.env.MYSQL_USER || 'root',
        password: env.mysqlPassword || process.env.MYSQL_PASSWORD || '',
        database: env.mysqlDatabase || process.env.MYSQL_DATABASE || 'booking_db',
      };
    }
  } catch (error) {
    // Fallback to environment variables if env.json is not available
    // This is expected in some configurations
    console.warn('Could not load env.json, using environment variables:', error);
  }
  
  // Fallback to environment variables
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number.parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'booking_db',
  };
};

// Create connection pool
let pool: mysql.Pool | null = null;
let poolInitialized = false;

/**
 * Get MySQL connection pool
 * Creates a new pool if one doesn't exist
 * Optimized for performance with proper connection pooling
 * 
 * @returns MySQL connection pool
 */
export const getMySQLPool = (): mysql.Pool => {
  if (!pool || !poolInitialized) {
    const config = getMySQLConfig();
    
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 20, // Increased for better performance
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      // Performance optimizations
      multipleStatements: false, // Security: prevent SQL injection via multiple statements
      dateStrings: false, // Return dates as Date objects
      supportBigNumbers: true,
      bigNumberStrings: false,
      // Connection timeout
      connectTimeout: 10000, // 10 seconds
    });

    // Handle pool errors
    pool.on('connection', (connection) => {
      connection.on('error', (err) => {
        console.error('MySQL connection error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.warn('MySQL connection lost, pool will create new connection');
        }
      });
    });

    // Test connection on pool creation
    pool.getConnection()
      .then((connection) => {
        console.info(`MySQL connection pool created successfully (${config.host}:${config.port}/${config.database})`);
        connection.release();
        poolInitialized = true;
      })
      .catch((err) => {
        console.error('Failed to create MySQL connection pool:', err);
        pool = null;
        poolInitialized = false;
        throw new Error(`MySQL connection failed: ${err.message}`);
      });
  }

  return pool;
};

/**
 * Close MySQL connection pool
 * Should be called when application shuts down
 * Gracefully closes all connections
 */
export const closeMySQLPool = async (): Promise<void> => {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      poolInitialized = false;
      console.info('MySQL connection pool closed gracefully');
    } catch (error) {
      console.error('Error closing MySQL connection pool:', error);
      pool = null;
      poolInitialized = false;
    }
  }
};

/**
 * Health check for MySQL connection pool
 * @returns Promise<boolean> - true if pool is healthy
 */
export const checkMySQLHealth = async (): Promise<boolean> => {
  try {
    const currentPool = getMySQLPool();
    const connection = await currentPool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL health check failed:', error);
    return false;
  }
};

/**
 * Helper function to convert MySQL row to object with _id field
 * Maps 'id' to '_id' to maintain compatibility with existing interfaces
 * 
 * @param row MySQL row result
 * @returns Object with _id field
 */
export const mapRowToDocument = <T>(row: any): T => {
  if (!row) return row;
  
  const { id, created_at, updated_at, ...rest } = row;
  
  return {
    _id: id ? id.toString() : undefined,
    ...rest,
    createdAt: created_at,
    updatedAt: updated_at,
  } as T;
};

/**
 * Helper function to convert array of MySQL rows to documents
 * 
 * @param rows Array of MySQL row results
 * @returns Array of objects with _id field
 */
export const mapRowsToDocuments = <T>(rows: any[]): T[] => {
  return rows.map(row => mapRowToDocument<T>(row));
};

/**
 * Helper function to parse JSON fields from MySQL
 * MySQL returns JSON as strings in some cases
 * 
 * @param value JSON value from MySQL
 * @returns Parsed JSON or original value
 */
export const parseJSON = (value: any): any => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

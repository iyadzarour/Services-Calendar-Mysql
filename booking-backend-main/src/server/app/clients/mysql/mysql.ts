/**
 * MySQL Connection Module for Server
 * 
 * This module provides MySQL connection pool for the application.
 * It uses the shared MySQL client from the database-client module.
 */

import { getMySQLPool } from '../../../../database-client/src/mysqlClient';
import { Pool } from 'mysql2/promise';

/**
 * Get MySQL connection pool
 * This function wraps the database-client getMySQLPool for server use
 * 
 * @returns MySQL connection pool
 */
export const getMySQL = (): Pool => {
  return getMySQLPool();
};

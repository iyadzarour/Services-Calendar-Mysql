/**
 * Check JOIN between appointments and contacts
 */

import { getMySQLPool, closeMySQLPool } from '../src/database-client/src/mysqlClient';

const pool = getMySQLPool();

async function checkJoin(): Promise<void> {
  try {
    const start = '2025-11-01T00:00:00.000Z';
    const end = '2025-11-30T23:59:59.999Z';
    
    console.log('🔍 التحقق من JOIN بين appointments و contacts:\n');
    console.log(`Start: ${start}`);
    console.log(`End: ${end}\n`);

    // Check with INNER JOIN (current query)
    const [innerJoinRows] = await pool.execute(`
      SELECT a.id, a.start_date, a.end_date, a.contact_id, c.id as contact_exists
      FROM appointments a
      INNER JOIN contacts c ON a.contact_id = c.id
      WHERE a.start_date >= ? AND a.end_date <= ?
      ORDER BY a.start_date
    `, [start, end]) as any[];

    console.log(`✅ INNER JOIN - عدد المواعيد: ${innerJoinRows.length}\n`);

    // Check with LEFT JOIN to see if any appointments are missing contacts
    const [leftJoinRows] = await pool.execute(`
      SELECT a.id, a.start_date, a.end_date, a.contact_id, c.id as contact_exists
      FROM appointments a
      LEFT JOIN contacts c ON a.contact_id = c.id
      WHERE a.start_date >= ? AND a.end_date <= ?
      ORDER BY a.start_date
    `, [start, end]) as any[];

    console.log(`✅ LEFT JOIN - عدد المواعيد: ${leftJoinRows.length}\n`);

    // Check for appointments without contacts
    const missingContacts = leftJoinRows.filter((row: any) => !row.contact_exists);
    if (missingContacts.length > 0) {
      console.log(`❌ المواعيد بدون contacts: ${missingContacts.length}`);
      missingContacts.forEach((row: any) => {
        console.log(`  Appointment ID: ${row.id}, Contact ID: ${row.contact_id}`);
      });
    } else {
      console.log('✅ جميع المواعيد لها contacts');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await closeMySQLPool();
  }
}

checkJoin();


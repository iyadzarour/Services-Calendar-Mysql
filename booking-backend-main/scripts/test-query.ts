/**
 * Test the appointments query
 */

import { getMySQLPool, closeMySQLPool } from '../src/database-client/src/mysqlClient';

const pool = getMySQLPool();

async function testQuery(): Promise<void> {
  try {
    // Test with November 2025 range (like Frontend sends)
    const start = '2025-11-01T00:00:00.000Z';
    const end = '2025-11-30T23:59:59.999Z';
    
    console.log('🔍 اختبار الاستعلام مع نطاق نوفمبر 2025:');
    console.log(`  Start: ${start}`);
    console.log(`  End: ${end}\n`);

    // Also test with single day range (November 21)
    const dayStart = '2025-11-21T00:00:00.000Z';
    const dayEnd = '2025-11-21T23:59:59.999Z';
    
    console.log('🔍 اختبار الاستعلام مع يوم 21 نوفمبر فقط:');
    console.log(`  Start: ${dayStart}`);
    console.log(`  End: ${dayEnd}\n`);

    const [dayRows] = await pool.execute(`
      SELECT id, start_date, end_date, calendar_id
      FROM appointments 
      WHERE start_date >= ? AND end_date <= ?
      ORDER BY start_date
    `, [dayStart, dayEnd]) as any[];

    console.log(`✅ عدد المواعيد في 21 نوفمبر: ${dayRows.length}\n`);
    
    dayRows.forEach((row: any) => {
      console.log(`ID: ${row.id}`);
      console.log(`  Start: ${new Date(row.start_date).toLocaleString('ar-EG')}`);
      console.log(`  End: ${new Date(row.end_date).toLocaleString('ar-EG')}`);
      console.log(`  Calendar: ${row.calendar_id}`);
      console.log('');
    });

    console.log('\n' + '='.repeat(50) + '\n');

    const [rows] = await pool.execute(`
      SELECT id, start_date, end_date, calendar_id
      FROM appointments 
      WHERE start_date >= ? AND end_date <= ?
      ORDER BY start_date
    `, [start, end]) as any[];

    console.log(`✅ عدد المواعيد: ${rows.length}\n`);
    
    rows.forEach((row: any) => {
      console.log(`ID: ${row.id}`);
      console.log(`  Start: ${new Date(row.start_date).toLocaleString('ar-EG')}`);
      console.log(`  End: ${new Date(row.end_date).toLocaleString('ar-EG')}`);
      console.log(`  Calendar: ${row.calendar_id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await closeMySQLPool();
  }
}

testQuery();


/**
 * Script to check appointments in database
 */

import { getMySQLPool, closeMySQLPool } from '../src/database-client/src/mysqlClient';

const pool = getMySQLPool();

async function checkAppointments(): Promise<void> {
  try {
    const [rows] = await pool.execute(`
      SELECT id, start_date, end_date, calendar_id, contact_id, appointment_status
      FROM appointments 
      ORDER BY start_date
    `) as any[];

    console.log(`\n📅 عدد المواعيد: ${rows.length}\n`);
    
    if (rows.length === 0) {
      console.log('لا توجد مواعيد في قاعدة البيانات');
      return;
    }

    rows.forEach((row: any) => {
      console.log(`ID: ${row.id}`);
      console.log(`  Start: ${new Date(row.start_date).toLocaleString('ar-EG')}`);
      console.log(`  End: ${new Date(row.end_date).toLocaleString('ar-EG')}`);
      console.log(`  Calendar ID: ${row.calendar_id}`);
      console.log(`  Status: ${row.appointment_status}`);
      console.log('');
    });

    // Check for November 21, 2025
    const nov21Start = new Date('2025-11-21T00:00:00.000Z').toISOString();
    const nov21End = new Date('2025-11-21T23:59:59.999Z').toISOString();
    
    console.log(`\n🔍 البحث عن مواعيد في 21 نوفمبر 2025:`);
    console.log(`  من: ${nov21Start}`);
    console.log(`  إلى: ${nov21End}\n`);

    const [matchingRows] = await pool.execute(`
      SELECT id, start_date, end_date, calendar_id
      FROM appointments 
      WHERE start_date >= ? AND end_date <= ?
      ORDER BY start_date
    `, [nov21Start, nov21End]) as any[];

    console.log(`✅ المواعيد التي تطابق الاستعلام الحالي (start_date >= start AND end_date <= end): ${matchingRows.length}`);
    
    const [overlappingRows] = await pool.execute(`
      SELECT id, start_date, end_date, calendar_id
      FROM appointments 
      WHERE start_date < ? AND end_date > ?
      ORDER BY start_date
    `, [nov21End, nov21Start]) as any[];

    console.log(`✅ المواعيد التي تتداخل مع اليوم (start_date < end AND end_date > start): ${overlappingRows.length}\n`);

    if (overlappingRows.length > 0) {
      console.log('المواعيد المتداخلة:');
      overlappingRows.forEach((row: any) => {
        console.log(`  - ID: ${row.id}, Start: ${new Date(row.start_date).toLocaleString('ar-EG')}, End: ${new Date(row.end_date).toLocaleString('ar-EG')}`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await closeMySQLPool();
  }
}

checkAppointments();


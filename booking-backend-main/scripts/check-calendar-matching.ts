/**
 * Check if calendar_id in appointments matches _id in calendars
 */

import { getMySQLPool, closeMySQLPool } from '../src/database-client/src/mysqlClient';

const pool = getMySQLPool();

async function checkMatching(): Promise<void> {
  try {
    // Get all appointments
    const [appointments] = await pool.execute(`
      SELECT id, calendar_id, start_date, end_date
      FROM appointments 
      ORDER BY start_date
    `) as any[];

    // Get all calendars
    const [calendars] = await pool.execute(`
      SELECT id, employee_name
      FROM calendars 
      ORDER BY id
    `) as any[];

    console.log('\n📅 المواعيد:');
    appointments.forEach((apt: any) => {
      console.log(`  Appointment ID: ${apt.id}, Calendar ID: ${apt.calendar_id}, Start: ${new Date(apt.start_date).toLocaleDateString('ar-EG')}`);
    });

    console.log('\n👥 الموظفين:');
    calendars.forEach((cal: any) => {
      console.log(`  Calendar ID: ${cal.id}, Name: ${cal.employee_name}`);
    });

    console.log('\n🔍 التحقق من المطابقة:');
    appointments.forEach((apt: any) => {
      const calendar = calendars.find((cal: any) => cal.id === apt.calendar_id);
      if (calendar) {
        console.log(`  ✅ Appointment ${apt.id} -> Calendar ${apt.calendar_id} (${calendar.employee_name})`);
      } else {
        console.log(`  ❌ Appointment ${apt.id} -> Calendar ${apt.calendar_id} (NOT FOUND!)`);
      }
    });

    // Check for appointments on Nov 21
    const nov21Start = new Date('2025-11-21T00:00:00.000Z');
    const nov21End = new Date('2025-11-21T23:59:59.999Z');
    
    const [nov21Appointments] = await pool.execute(`
      SELECT id, calendar_id, start_date, end_date
      FROM appointments 
      WHERE start_date >= ? AND end_date <= ?
      ORDER BY start_date
    `, [nov21Start.toISOString(), nov21End.toISOString()]) as any[];

    console.log('\n📋 المواعيد في 21 نوفمبر:');
    nov21Appointments.forEach((apt: any) => {
      const calendar = calendars.find((cal: any) => cal.id === apt.calendar_id);
      console.log(`  Appointment ID: ${apt.id}`);
      console.log(`    Calendar ID (from DB): ${apt.calendar_id}`);
      console.log(`    Calendar ID (as string): "${apt.calendar_id.toString()}"`);
      console.log(`    Calendar Name: ${calendar?.employee_name || 'NOT FOUND'}`);
      console.log(`    Start: ${new Date(apt.start_date).toLocaleString('ar-EG')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await closeMySQLPool();
  }
}

checkMatching();


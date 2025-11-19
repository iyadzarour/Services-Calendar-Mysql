/**
 * Script to delete all data from MySQL database and add dummy data
 * ثم التحقق من إضافة البيانات بشكل صحيح
 */

import { getMySQLPool, closeMySQLPool } from '../src/database-client/src/mysqlClient';

const pool = getMySQLPool();

/**
 * Delete all data from all tables (respecting foreign key constraints)
 */
async function deleteAllData(): Promise<void> {
  console.log('🗑️  بدء حذف البيانات من قاعدة البيانات...\n');

  try {
    // Disable foreign key checks temporarily
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Delete in order (respecting foreign key dependencies)
    const tables = [
      'appointments',
      'schedules',
      'services',
      'categories',
      'calendars',
      'contacts',
      'reset_tokens',
      'users',
      'email_templates',
      'email_configs',
    ];

    for (const table of tables) {
      const [result] = await pool.execute(`DELETE FROM ${table}`);
      const affectedRows = (result as any).affectedRows || 0;
      console.log(`✓ تم حذف ${affectedRows} صف من جدول ${table}`);
    }

    // Reset auto-increment counters
    for (const table of tables) {
      await pool.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    }

    // Re-enable foreign key checks
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ تم حذف جميع البيانات بنجاح!\n');
  } catch (error) {
    console.error('❌ خطأ في حذف البيانات:', error);
    throw error;
  }
}

/**
 * Insert dummy data into all tables
 */
async function insertDummyData(): Promise<void> {
  console.log('📝 بدء إضافة البيانات الوهمية...\n');

  try {
    // 1. Insert Users
    console.log('إضافة المستخدمين...');
    await pool.execute(`
      INSERT INTO users (name, email, password, phone_number, role, channels, internal, remarks) VALUES
      ('مدير النظام', 'admin@example.com', '$2b$10$Ds14gLwwKdYzHv.qQv6GzOzXLZqbTO3zjndh1gmM3j03zhKDYN/Qu', '+436641234567', 'admin', 
       '{"email": true, "sms": true, "push_notification": true}', 
       '{"blacklisted": false, "verified": true}', 
       'مدير النظام الرئيسي'),
      ('سكرتارية', 'secretary@example.com', '$2b$10$tYUa3W.sUBO1C3n/nmLJ/e8yQNSl/mUNnquopHhhomiwfyqErKe5m', '+436641234568', 'secretaria',
       '{"email": true, "sms": true, "push_notification": false}',
       '{"blacklisted": false, "verified": true}',
       'سكرتارية المكتب'),
      ('موظف 1', 'employee1@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', '+436641234569', 'employee',
       '{"email": true, "sms": false, "push_notification": false}',
       '{"blacklisted": false, "verified": true}',
       'موظف فني 1'),
      ('موظف 2', 'employee2@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', '+436641234570', 'employee',
       '{"email": true, "sms": false, "push_notification": false}',
       '{"blacklisted": false, "verified": true}',
       'موظف فني 2'),
      ('مستخدم عادي', 'user@example.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', '+436641234571', 'user',
       '{"email": true, "sms": false, "push_notification": false}',
       '{"blacklisted": false, "verified": false}',
       'مستخدم عادي')
    `);
    console.log('✓ تم إضافة 5 مستخدمين');

    // 2. Insert Calendars (Employees)
    console.log('إضافة الموظفين/التقويمات...');
    await pool.execute(`
      INSERT INTO calendars (employee_name, description, email, password, online_booked, active, assignment_of_services, show_description) VALUES
      ('محمد أحمد', 'فني صيانة متخصص في أجهزة التكييف', 'mohamed@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', true, true, 'All', 'Text'),
      ('علي حسن', 'فني صيانة متخصص في أجهزة التدفئة', 'ali@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', true, true, 'All', 'Tooltip'),
      ('فاطمة خالد', 'فني صيانة متخصص في الأجهزة الكهربائية', 'fatima@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', true, true, 'All', 'None'),
      ('خالد محمد', 'فني صيانة عام', 'khaled@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', false, true, 'All', 'Text')
    `);
    console.log('✓ تم إضافة 4 موظفين');

    // 3. Insert Contacts
    console.log('إضافة العملاء/جهات الاتصال...');
    await pool.execute(`
      INSERT INTO contacts (salutation, first_name, last_name, address, zip_code, location, telephone, email, password, district, archived, newsletter) VALUES
      ('Herr', 'أحمد', 'محمد', 'شارع النصر 10', '1010', 'فيينا', '+436641234001', 'ahmed@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 1, false, true),
      ('Frau', 'سارة', 'أحمد', 'شارع الجمهورية 25', '1020', 'فيينا', '+436641234002', 'sara@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 2, false, true),
      ('Herr', 'محمد', 'علي', 'شارع الشهداء 50', '1030', 'فيينا', '+436641234003', 'mohamed.customer@email.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 3, false, false),
      ('Frau', 'فاطمة', 'خالد', 'شارع الحرية 75', '1040', 'فيينا', '+436641234004', 'fatima@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 1, false, true),
      ('Herr', 'عمر', 'يوسف', 'شارع السلام 100', '1050', 'فيينا', '+436641234005', 'omar@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 2, false, false),
      ('Frau', 'ليلى', 'محمد', 'شارع الاستقلال 150', '1060', 'فيينا', '+436641234006', 'leila@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 3, false, true),
      ('Herr', 'يوسف', 'أحمد', 'شارع الكرامة 200', '1070', 'فيينا', '+436641234007', 'youssef@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 1, false, false),
      ('Frau', 'نور', 'علي', 'شارع الوحدة 250', '1080', 'فيينا', '+436641234008', 'noor@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 2, false, true),
      ('Herr', 'حسن', 'محمد', 'شارع الفجر 300', '1090', 'فيينا', '+436641234009', 'hasan@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 3, false, false),
      ('Frau', 'ريم', 'خالد', 'شارع الأمل 350', '1100', 'فيينا', '+436641234010', 'reem@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 1, false, true)
    `);
    console.log('✓ تم إضافة 10 عملاء');

    // 4. Insert Categories
    console.log('إضافة الفئات...');
    await pool.execute(`
      INSERT INTO categories (name, category, choices, selection_is_optional, show_price, show_appointment_duration, no_columns_of_services, full_screen, folded, online_booking, remarks, unique_id, display_status) VALUES
      ('صيانة التكييف', 'Maintenance', 'Single', false, true, true, 1, false, false, true, 'خدمات صيانة أجهزة التكييف', 1, 'show'),
      ('صيانة التدفئة', 'Maintenance', 'Single', false, true, true, 1, false, false, true, 'خدمات صيانة أجهزة التدفئة', 2, 'show'),
      ('صيانة الأجهزة الكهربائية', 'Maintenance', 'Multiple', true, true, true, 2, false, false, true, 'خدمات صيانة الأجهزة الكهربائية', 3, 'show'),
      ('تركيب الأجهزة', 'Installation', 'Single', false, true, true, 1, false, false, true, 'خدمات تركيب الأجهزة', 4, 'show'),
      ('فحص دوري', 'Inspection', 'Single', false, false, true, 1, false, false, true, 'فحص دوري للأجهزة', 5, 'show')
    `);
    console.log('✓ تم إضافة 5 فئات');

    // 5. Insert Services
    console.log('إضافة الخدمات...');
    await pool.execute(`
      INSERT INTO services (category_id, name, description, duration, price, abbreviation_id) VALUES
      (1, 'صيانة دورية للتكييف', 'صيانة دورية شاملة لوحدة التكييف', 60, 150.00, 101),
      (1, 'تنظيف فلتر التكييف', 'تنظيف وفحص فلتر التكييف', 30, 80.00, 102),
      (1, 'إصلاح عطل في التكييف', 'تشخيص وإصلاح الأعطال', 90, 200.00, 103),
      (2, 'صيانة دورية للتدفئة', 'صيانة دورية شاملة لنظام التدفئة', 60, 150.00, 201),
      (2, 'تنظيف المرجل', 'تنظيف وفحص مرجل التدفئة', 45, 120.00, 202),
      (2, 'إصلاح عطل في التدفئة', 'تشخيص وإصلاح الأعطال', 90, 220.00, 203),
      (3, 'صيانة الغسالة', 'صيانة وفحص الغسالة', 60, 100.00, 301),
      (3, 'صيانة الثلاجة', 'صيانة وفحص الثلاجة', 60, 120.00, 302),
      (3, 'صيانة الميكروويف', 'صيانة وفحص الميكروويف', 30, 80.00, 303),
      (3, 'صيانة الفرن', 'صيانة وفحص الفرن', 45, 110.00, 304),
      (4, 'تركيب تكييف', 'تركيب وحدة تكييف جديدة', 120, 300.00, 401),
      (4, 'تركيب نظام تدفئة', 'تركيب نظام تدفئة جديد', 180, 500.00, 402),
      (4, 'تركيب جهاز كهربائي', 'تركيب أي جهاز كهربائي', 60, 150.00, 403),
      (5, 'فحص شامل', 'فحص شامل لجميع الأجهزة', 120, 200.00, 501),
      (5, 'فحص دوري سريع', 'فحص سريع للأجهزة الرئيسية', 60, 100.00, 502)
    `);
    console.log('✓ تم إضافة 15 خدمة');

    // 6. Insert Schedules
    console.log('إضافة جداول العمل...');
    await pool.execute(`
      INSERT INTO schedules (calendar_id, working_hours_type, weekday, time_from, time_to, active) VALUES
      (1, 'weekly', 'Monday', '08:00', '17:00', true),
      (1, 'weekly', 'Tuesday', '08:00', '17:00', true),
      (1, 'weekly', 'Wednesday', '08:00', '17:00', true),
      (1, 'weekly', 'Thursday', '08:00', '17:00', true),
      (1, 'weekly', 'Friday', '08:00', '13:00', true),
      (2, 'weekly', 'Monday', '09:00', '18:00', true),
      (2, 'weekly', 'Tuesday', '09:00', '18:00', true),
      (2, 'weekly', 'Wednesday', '09:00', '18:00', true),
      (2, 'weekly', 'Thursday', '09:00', '18:00', true),
      (2, 'weekly', 'Friday', '09:00', '14:00', true),
      (2, 'weekly', 'Saturday', '09:00', '13:00', true),
      (3, 'weekly', 'Monday', '08:00', '16:00', true),
      (3, 'weekly', 'Tuesday', '08:00', '16:00', true),
      (3, 'weekly', 'Wednesday', '08:00', '16:00', true),
      (3, 'weekly', 'Thursday', '08:00', '16:00', true),
      (3, 'weekly', 'Friday', '08:00', '12:00', true),
      (4, 'weekly', 'Monday', '07:00', '15:00', true),
      (4, 'weekly', 'Tuesday', '07:00', '15:00', true),
      (4, 'weekly', 'Wednesday', '07:00', '15:00', true),
      (4, 'weekly', 'Thursday', '07:00', '15:00', true),
      (4, 'weekly', 'Friday', '07:00', '12:00', true)
    `);
    console.log('✓ تم إضافة 21 جدول عمل');

    // 7. Insert Appointments
    console.log('إضافة المواعيد...');
    await pool.execute(`
      INSERT INTO appointments (category_id, service_id, calendar_id, contact_id, start_date, end_date, appointment_status, brand_of_device, model, year, archived) VALUES
      (1, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 60 MINUTE, 'Confirmed', 'Samsung', 'AC-2024', '2024', false),
      (2, 4, 2, 2, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 60 MINUTE, 'Confirmed', 'Bosch', 'Heater-3000', '2023', false),
      (3, 7, 3, 3, DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 60 MINUTE, 'Confirmed', 'LG', 'Washer-WM4000', '2022', false),
      (1, 2, 1, 4, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 30 MINUTE, 'Confirmed', 'Mitsubishi', 'AC-MSR-1', '2024', false),
      (5, 14, 4, 5, DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 60 MINUTE, 'Confirmed', NULL, NULL, NULL, false),
      (4, 11, 2, 6, DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 120 MINUTE, 'Confirmed', 'Daikin', 'AC-DK-5000', '2024', false),
      (3, 8, 3, 7, DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY) + INTERVAL 60 MINUTE, 'Confirmed', 'Siemens', 'Fridge-SI-300', '2023', false),
      (2, 5, 1, 8, DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(NOW(), INTERVAL 9 DAY) + INTERVAL 45 MINUTE, 'Confirmed', 'Viessmann', 'Boiler-VT-200', '2022', false)
    `);
    console.log('✓ تم إضافة 8 مواعيد');

    console.log('\n✅ تم إضافة جميع البيانات الوهمية بنجاح!\n');
  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
    throw error;
  }
}

/**
 * Verify that data was added correctly
 */
async function verifyData(): Promise<void> {
  console.log('🔍 التحقق من البيانات...\n');

  try {
    const tables = [
      { name: 'users', expected: 5 },
      { name: 'calendars', expected: 4 },
      { name: 'contacts', expected: 10 },
      { name: 'categories', expected: 5 },
      { name: 'services', expected: 15 },
      { name: 'schedules', expected: 21 },
      { name: 'appointments', expected: 8 },
    ];

    let allCorrect = true;

    for (const table of tables) {
      const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table.name}`);
      const count = (rows as any[])[0].count;

      if (count === table.expected) {
        console.log(`✅ ${table.name}: ${count} صف (متوقع: ${table.expected})`);
      } else {
        console.log(`❌ ${table.name}: ${count} صف (متوقع: ${table.expected})`);
        allCorrect = false;
      }
    }

    // Check some sample data
    console.log('\n📋 عينة من البيانات:\n');

    // Sample users
    const [users] = await pool.execute('SELECT id, name, email, role FROM users LIMIT 3');
    console.log('المستخدمون:');
    (users as any[]).forEach((user: any) => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Sample contacts
    const [contacts] = await pool.execute('SELECT id, first_name, last_name, email FROM contacts LIMIT 3');
    console.log('\nالعملاء:');
    (contacts as any[]).forEach((contact: any) => {
      console.log(`  - ${contact.first_name} ${contact.last_name} (${contact.email})`);
    });

    // Sample categories
    const [categories] = await pool.execute('SELECT id, name, unique_id FROM categories');
    console.log('\nالفئات:');
    (categories as any[]).forEach((category: any) => {
      console.log(`  - ${category.name} (ID: ${category.id}, Unique ID: ${category.unique_id})`);
    });

    // Sample services
    const [services] = await pool.execute(`
      SELECT s.id, s.name, s.price, c.name as category_name 
      FROM services s 
      JOIN categories c ON s.category_id = c.id 
      LIMIT 5
    `);
    console.log('\nالخدمات:');
    (services as any[]).forEach((service: any) => {
      console.log(`  - ${service.name} (${service.category_name}) - ${service.price} €`);
    });

    // Sample appointments
    const [appointments] = await pool.execute(`
      SELECT a.id, a.start_date, a.appointment_status, 
             c.name as category_name, s.name as service_name,
             cal.employee_name, con.first_name, con.last_name
      FROM appointments a
      JOIN categories c ON a.category_id = c.id
      JOIN services s ON a.service_id = s.id
      JOIN calendars cal ON a.calendar_id = cal.id
      JOIN contacts con ON a.contact_id = con.id
      LIMIT 3
    `);
    console.log('\nالمواعيد:');
    (appointments as any[]).forEach((apt: any) => {
      const date = new Date(apt.start_date).toLocaleString('ar-EG');
      console.log(`  - ${date}: ${apt.service_name} - ${apt.employee_name} - ${apt.first_name} ${apt.last_name} (${apt.appointment_status})`);
    });

    console.log('\n' + '='.repeat(50));
    if (allCorrect) {
      console.log('✅ جميع البيانات تم إضافتها بشكل صحيح!');
    } else {
      console.log('⚠️  بعض البيانات غير متطابقة مع المتوقع');
    }
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('❌ خطأ في التحقق من البيانات:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 بدء عملية إعادة تعيين قاعدة البيانات...\n');
    console.log('='.repeat(50) + '\n');

    // Step 1: Delete all data
    await deleteAllData();

    // Step 2: Insert dummy data
    await insertDummyData();

    // Step 3: Verify data
    await verifyData();

    console.log('✅ اكتملت العملية بنجاح!\n');
  } catch (error) {
    console.error('\n❌ فشلت العملية:', error);
    process.exit(1);
  } finally {
    await closeMySQLPool();
  }
}

// Run the script
main();


-- =====================================================
-- Seed Data for Booking Database
-- This script adds sample data for testing
-- Run this after mysql_schema.sql
-- =====================================================

USE booking_db;

-- Clear existing data (optional - uncomment if you want to reset)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE appointments;
-- TRUNCATE TABLE schedules;
-- TRUNCATE TABLE services;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE calendars;
-- TRUNCATE TABLE contacts;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS - مستخدمين
-- =====================================================
-- Password: admin123 (bcrypt hash)
INSERT INTO users (name, email, password, phone_number, role, channels, internal, remarks) VALUES
('مدير النظام', 'admin@example.com', '$2b$10$Ds14gLwwKdYzHv.qQv6GzOzXLZqbTO3zjndh1gmM3j03zhKDYN/Qu', '+436641234567', 'admin', 
 '{"email": true, "sms": true, "push_notification": true}', 
 '{"blacklisted": false, "verified": true}', 
 'مدير النظام الرئيسي'),

-- Password: secret123
('سكرتارية', 'secretary@example.com', '$2b$10$tYUa3W.sUBO1C3n/nmLJ/e8yQNSl/mUNnquopHhhomiwfyqErKe5m', '+436641234568', 'secretaria',
 '{"email": true, "sms": true, "push_notification": false}',
 '{"blacklisted": false, "verified": true}',
 'سكرتارية المكتب'),

-- Password: emp123
('موظف 1', 'employee1@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', '+436641234569', 'employee',
 '{"email": true, "sms": false, "push_notification": false}',
 '{"blacklisted": false, "verified": true}',
 'موظف فني 1'),

-- Password: emp123
('موظف 2', 'employee2@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', '+436641234570', 'employee',
 '{"email": true, "sms": false, "push_notification": false}',
 '{"blacklisted": false, "verified": true}',
 'موظف فني 2'),

-- Password: user123
('مستخدم عادي', 'user@example.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', '+436641234571', 'user',
 '{"email": true, "sms": false, "push_notification": false}',
 '{"blacklisted": false, "verified": false}',
 'مستخدم عادي');

-- =====================================================
-- 2. CALENDARS (Employees) - الموظفين/التقويمات
-- =====================================================
INSERT INTO calendars (employee_name, description, email, password, online_booked, active, assignment_of_services, show_description) VALUES
('محمد أحمد', 'فني صيانة متخصص في أجهزة التكييف', 'mohamed@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', true, true, 'All', 'Text'),
('علي حسن', 'فني صيانة متخصص في أجهزة التدفئة', 'ali@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', true, true, 'All', 'Tooltip'),
('فاطمة خالد', 'فني صيانة متخصص في الأجهزة الكهربائية', 'fatima@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', true, true, 'All', 'None'),
('خالد محمد', 'فني صيانة عام', 'khaled@example.com', '$2b$10$m4tpVR8bS2xf8StF2Wp6P.RJsrOn36otKQ4iKiEuL7pvIG3FqaHFu', false, true, 'All', 'Text');

-- =====================================================
-- 3. CONTACTS - العملاء/جهات الاتصال
-- =====================================================
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
('Frau', 'ريم', 'خالد', 'شارع الأمل 350', '1100', 'فيينا', '+436641234010', 'reem@customer.com', '$2b$10$t4XACTSNpQxEILs7L4XNkO5KHrSvnzsylQsksvXQ3UZauaQv6L62e', 1, false, true);

-- =====================================================
-- 4. CATEGORIES - الفئات
-- =====================================================
INSERT INTO categories (name, category, choices, selection_is_optional, show_price, show_appointment_duration, no_columns_of_services, full_screen, folded, online_booking, remarks, unique_id, display_status) VALUES
('صيانة التكييف', 'Maintenance', 'Single', false, true, true, 1, false, false, true, 'خدمات صيانة أجهزة التكييف', 1, 'show'),
('صيانة التدفئة', 'Maintenance', 'Single', false, true, true, 1, false, false, true, 'خدمات صيانة أجهزة التدفئة', 2, 'show'),
('صيانة الأجهزة الكهربائية', 'Maintenance', 'Multiple', true, true, true, 2, false, false, true, 'خدمات صيانة الأجهزة الكهربائية', 3, 'show'),
('تركيب الأجهزة', 'Installation', 'Single', false, true, true, 1, false, false, true, 'خدمات تركيب الأجهزة', 4, 'show'),
('فحص دوري', 'Inspection', 'Single', false, false, true, 1, false, false, true, 'فحص دوري للأجهزة', 5, 'show');

-- =====================================================
-- 5. SERVICES - الخدمات
-- =====================================================
INSERT INTO services (category_id, name, description, duration, price, abbreviation_id) VALUES
-- Services for Category 1 (صيانة التكييف)
(1, 'صيانة دورية للتكييف', 'صيانة دورية شاملة لوحدة التكييف', 60, 150.00, 101),
(1, 'تنظيف فلتر التكييف', 'تنظيف وفحص فلتر التكييف', 30, 80.00, 102),
(1, 'إصلاح عطل في التكييف', 'تشخيص وإصلاح الأعطال', 90, 200.00, 103),

-- Services for Category 2 (صيانة التدفئة)
(2, 'صيانة دورية للتدفئة', 'صيانة دورية شاملة لنظام التدفئة', 60, 150.00, 201),
(2, 'تنظيف المرجل', 'تنظيف وفحص مرجل التدفئة', 45, 120.00, 202),
(2, 'إصلاح عطل في التدفئة', 'تشخيص وإصلاح الأعطال', 90, 220.00, 203),

-- Services for Category 3 (صيانة الأجهزة الكهربائية)
(3, 'صيانة الغسالة', 'صيانة وفحص الغسالة', 60, 100.00, 301),
(3, 'صيانة الثلاجة', 'صيانة وفحص الثلاجة', 60, 120.00, 302),
(3, 'صيانة الميكروويف', 'صيانة وفحص الميكروويف', 30, 80.00, 303),
(3, 'صيانة الفرن', 'صيانة وفحص الفرن', 45, 110.00, 304),

-- Services for Category 4 (تركيب الأجهزة)
(4, 'تركيب تكييف', 'تركيب وحدة تكييف جديدة', 120, 300.00, 401),
(4, 'تركيب نظام تدفئة', 'تركيب نظام تدفئة جديد', 180, 500.00, 402),
(4, 'تركيب جهاز كهربائي', 'تركيب أي جهاز كهربائي', 60, 150.00, 403),

-- Services for Category 5 (فحص دوري)
(5, 'فحص شامل', 'فحص شامل لجميع الأجهزة', 120, 200.00, 501),
(5, 'فحص دوري سريع', 'فحص سريع للأجهزة الرئيسية', 60, 100.00, 502);

-- =====================================================
-- 6. SCHEDULES - جداول العمل
-- =====================================================
-- Weekly schedules for Calendar 1 (محمد أحمد)
INSERT INTO schedules (calendar_id, working_hours_type, weekday, time_from, time_to, active) VALUES
(1, 'weekly', 'Monday', '08:00', '17:00', true),
(1, 'weekly', 'Tuesday', '08:00', '17:00', true),
(1, 'weekly', 'Wednesday', '08:00', '17:00', true),
(1, 'weekly', 'Thursday', '08:00', '17:00', true),
(1, 'weekly', 'Friday', '08:00', '13:00', true),

-- Weekly schedules for Calendar 2 (علي حسن)
(2, 'weekly', 'Monday', '09:00', '18:00', true),
(2, 'weekly', 'Tuesday', '09:00', '18:00', true),
(2, 'weekly', 'Wednesday', '09:00', '18:00', true),
(2, 'weekly', 'Thursday', '09:00', '18:00', true),
(2, 'weekly', 'Friday', '09:00', '14:00', true),
(2, 'weekly', 'Saturday', '09:00', '13:00', true),

-- Weekly schedules for Calendar 3 (فاطمة خالد)
(3, 'weekly', 'Monday', '08:00', '16:00', true),
(3, 'weekly', 'Tuesday', '08:00', '16:00', true),
(3, 'weekly', 'Wednesday', '08:00', '16:00', true),
(3, 'weekly', 'Thursday', '08:00', '16:00', true),
(3, 'weekly', 'Friday', '08:00', '12:00', true),

-- Weekly schedules for Calendar 4 (خالد محمد)
(4, 'weekly', 'Monday', '07:00', '15:00', true),
(4, 'weekly', 'Tuesday', '07:00', '15:00', true),
(4, 'weekly', 'Wednesday', '07:00', '15:00', true),
(4, 'weekly', 'Thursday', '07:00', '15:00', true),
(4, 'weekly', 'Friday', '07:00', '12:00', true);

-- =====================================================
-- 7. APPOINTMENTS - المواعيد (اختياري - لاختبار النظام)
-- =====================================================
-- Sample appointments for next week
INSERT INTO appointments (category_id, service_id, calendar_id, contact_id, start_date, end_date, appointment_status, brand_of_device, model, year, archived) VALUES
(1, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 60 MINUTE, 'Confirmed', 'Samsung', 'AC-2024', '2024', false),
(2, 4, 2, 2, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 60 MINUTE, 'Confirmed', 'Bosch', 'Heater-3000', '2023', false),
(3, 7, 3, 3, DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 60 MINUTE, 'Confirmed', 'LG', 'Washer-WM4000', '2022', false),
(1, 2, 1, 4, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 30 MINUTE, 'Confirmed', 'Mitsubishi', 'AC-MSR-1', '2024', false),
(5, 14, 4, 5, DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 60 MINUTE, 'Confirmed', NULL, NULL, NULL, false);

-- =====================================================
-- 8. EMAIL CONFIG - إعدادات البريد الإلكتروني (اختياري)
-- =====================================================
-- Uncomment and fill with your email server details if needed
-- INSERT INTO email_configs (sender, server, username, password, port, ssl_enabled) VALUES
-- ('noreply@example.com', 'smtp.gmail.com', 'your-email@gmail.com', 'your-app-password', 587, true);

-- =====================================================
-- Summary
-- =====================================================
-- Created:
-- - 5 Users (1 admin, 1 secretary, 2 employees, 1 user)
-- - 4 Calendars (Employees)
-- - 10 Contacts (Customers)
-- - 5 Categories
-- - 14 Services
-- - 22 Schedules (Working hours)
-- - 5 Appointments (Sample)
-- 
-- Passwords:
-- - admin: admin123
-- - secretary: secret123
-- - employees: emp123
-- - users/customers: user123
-- =====================================================


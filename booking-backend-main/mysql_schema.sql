-- =====================================================
-- MySQL Schema for Booking Backend Migration
-- Generated from MongoDB/Mongoose schemas
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    remarks TEXT,
    role ENUM('admin', 'user', 'secretaria', 'employee') NOT NULL DEFAULT 'user',
    channels JSON COMMENT 'Communication channel flags: {email, sms, push_notification}',
    internal JSON COMMENT 'Internal flags: {blacklisted, verified, verification: {otp, otp_generated_at}}',
    token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reset tokens table
CREATE TABLE IF NOT EXISTS reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token (token(255)),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salutation VARCHAR(50) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    phone_numbber_2 VARCHAR(50),
    phone_numbber_3 VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    archived BOOLEAN DEFAULT FALSE,
    contract_link TEXT,
    title VARCHAR(255),
    sign_url TEXT,
    note_on_address TEXT,
    newsletter BOOLEAN DEFAULT FALSE,
    categories_permission JSON COMMENT 'Array of category IDs',
    remarks TEXT,
    district INT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    imported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_archived (archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    choices VARCHAR(255) NOT NULL,
    selection_is_optional BOOLEAN DEFAULT FALSE,
    show_price BOOLEAN DEFAULT FALSE,
    show_appointment_duration BOOLEAN DEFAULT FALSE,
    no_columns_of_services INT DEFAULT 1,
    full_screen BOOLEAN DEFAULT FALSE,
    folded BOOLEAN DEFAULT FALSE,
    online_booking BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    unique_id INT NOT NULL UNIQUE,
    display_status ENUM('show', 'hide') DEFAULT 'show',
    advanced_settings JSON COMMENT 'CategorySettings object',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_unique_id (unique_id),
    INDEX idx_display_status (display_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table (nested in Category in MongoDB, separate table in MySQL)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    price DECIMAL(10, 2) NOT NULL,
    abbreviation_id INT NOT NULL,
    attachment JSON COMMENT 'Attachment object: {title, url}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendars table
CREATE TABLE IF NOT EXISTS calendars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    description TEXT,
    show_description ENUM('None', 'Text', 'Tooltip') DEFAULT 'None',
    appointment_scheduling VARCHAR(50),
    employee_image TEXT,
    email VARCHAR(255),
    password VARCHAR(255),
    online_booked BOOLEAN DEFAULT FALSE,
    advanced_settings JSON COMMENT 'CalendarAdvancedSettings object',
    assignment_of_services ENUM('All', 'Certain') DEFAULT 'All',
    assignments_services JSON COMMENT 'Array of service IDs',
    link_calendar BOOLEAN DEFAULT FALSE,
    priority_link INT,
    skills JSON COMMENT 'Array of {service, level} objects',
    paired_calendars JSON COMMENT 'Array of calendar IDs',
    insert_appointments VARCHAR(50),
    coupling_on_certain_services BOOLEAN DEFAULT FALSE,
    certain_services JSON COMMENT 'Array of service IDs',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calendar_id INT NOT NULL,
    working_hours_type ENUM('weekly', 'certain') NOT NULL,
    weekday ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    date_from DATE,
    date_to DATE,
    time_from VARCHAR(10) NOT NULL,
    time_to VARCHAR(10) NOT NULL,
    reason TEXT,
    deactivate_working_hours BOOLEAN DEFAULT FALSE,
    one_time_appointment_link TEXT,
    only_internally BOOLEAN DEFAULT FALSE,
    restricted_to_services JSON COMMENT 'Array of service IDs',
    possible_appointment INT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_calendar_id (calendar_id),
    INDEX idx_working_hours_type (working_hours_type),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    service_id INT NOT NULL,
    calendar_id INT NOT NULL,
    contact_id INT NOT NULL,
    new_user BOOLEAN DEFAULT FALSE,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    brand_of_device VARCHAR(255),
    model VARCHAR(255),
    selected_devices VARCHAR(255),
    exhaust_gas_measurement BOOLEAN DEFAULT FALSE,
    has_maintenance_agreement BOOLEAN DEFAULT FALSE,
    has_bgas_before BOOLEAN DEFAULT FALSE,
    year VARCHAR(10),
    invoice_number INT,
    contract_number INT,
    imported_service_name VARCHAR(255),
    imported_service_duration VARCHAR(50),
    imported_service_price VARCHAR(50),
    appointment_status ENUM('Confirmed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
    archived BOOLEAN DEFAULT FALSE,
    updated_by VARCHAR(255),
    attachments JSON COMMENT 'Array of Attachment objects',
    remarks TEXT,
    employee_attachments JSON COMMENT 'Array of Attachment objects',
    employee_remarks TEXT,
    company_remarks TEXT,
    created_by VARCHAR(255),
    ended_at DATETIME,
    control_points JSON COMMENT 'Array of ControlPoints objects: {title, value}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contact_id (contact_id),
    INDEX idx_category_id (category_id),
    INDEX idx_service_id (service_id),
    INDEX idx_calendar_id (calendar_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_appointment_status (appointment_status),
    INDEX idx_archived (archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email configurations table
CREATE TABLE IF NOT EXISTS email_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    server VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    ssl_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('cancellation', 'confirmation') NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template TEXT NOT NULL,
    service_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_service_id (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Notes:
-- 1. All _id fields from MongoDB are mapped to auto-increment INT id
-- 2. JSON columns are used for nested objects and arrays to minimize schema changes
-- 3. Foreign key constraints are added where relationships exist
-- 4. Indexes are created on frequently queried fields
-- 5. ENUM types match the TypeScript enum definitions
-- 6. Timestamps (created_at, updated_at) auto-manage themselves
-- =====================================================

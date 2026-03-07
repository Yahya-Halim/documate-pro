-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS GetExpenseStats;
DROP PROCEDURE IF EXISTS GetDriverExpenseSummary;
DROP PROCEDURE IF EXISTS GetDocumentTypeStats;

-- Users table - Fixed TIMESTAMP issue
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'driver') NOT NULL DEFAULT 'driver',
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Tags table for document types
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Main expenses table - Fixed TIMESTAMP issue
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    -- Common fields
    rc_number VARCHAR(100),
    load_number VARCHAR(100),
    dispatcher VARCHAR(255),
    broker_shipper TEXT,
    pickup_address TEXT,
    pickup_datetime DATETIME,
    dropoff_address TEXT,
    dropoff_datetime DATETIME,
    miles DECIMAL(10,2),
    dh_miles DECIMAL(10,2),
    total_miles DECIMAL(10,2),
    amount DECIMAL(10,2),
    document_name VARCHAR(255),
    
    -- RC specific fields
    rate_per_mile DECIMAL(10,2),
    
    -- BOL specific fields
    bol_number VARCHAR(100),
    
    -- Dispatcher specific fields
    dispatcher_company VARCHAR(255),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    rc_amount DECIMAL(10,2),
    dispatcher_percentage DECIMAL(5,2),
    dispatcher_amount DECIMAL(10,2),
    
    -- Fuel specific fields
    receipt_number VARCHAR(100),
    receipt_date DATE,
    
    -- Invoice specific fields
    invoice_number VARCHAR(100),
    quickpay_percentage DECIMAL(5,2),
    amount_received DECIMAL(10,2),
    
    -- RLP specific fields
    rlp_number VARCHAR(100),
    date_received DATE,
    
    -- Metadata
    driver_id VARCHAR(50) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_username VARCHAR(50) NOT NULL,
    description TEXT,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type) REFERENCES tags(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_driver_id (driver_id),
    INDEX idx_document_type (document_type),
    INDEX idx_pickup_datetime (pickup_datetime),
    INDEX idx_amount (amount),
    INDEX idx_rc_number (rc_number),
    INDEX idx_load_number (load_number),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_created_at (created_at)
);

-- Insert only the 7 specified document types
INSERT IGNORE INTO tags (id, name, color, icon) VALUES
('rc', 'RC', '#dc3545', 'fa-file-contract'),
('bol', 'BOL', '#fd7e14', 'fa-file-invoice'),
('pod', 'POD', '#28a745', 'fa-file-signature'),
('dispatcher', 'Dispatcher', '#17a2b8', 'fa-headset'),
('fuel', 'Fuel', '#6f42c1', 'fa-gas-pump'),
('invoice', 'Invoice', '#e83e8c', 'fa-file-invoice-dollar'),
('rlp', 'RLP', '#6610f2', 'fa-file-alt');

-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT IGNORE INTO users (id, username, password, role, name) VALUES
('admin-001', 'admin', 'admin123', 'admin', 'Fleet Manager');

-- Create view for expense reports
CREATE OR REPLACE VIEW expense_summary AS
SELECT 
    e.id,
    e.title,
    e.document_type,
    t.name as document_type_name,
    t.color as document_type_color,
    e.rc_number,
    e.load_number,
    e.dispatcher,
    e.broker_shipper,
    e.pickup_address,
    e.pickup_datetime,
    e.dropoff_address,
    e.dropoff_datetime,
    e.miles,
    e.dh_miles,
    e.total_miles,
    e.amount,
    e.document_name,
    e.rate_per_mile,
    e.bol_number,
    e.dispatcher_company,
    e.phone_number,
    e.email,
    e.rc_amount,
    e.dispatcher_percentage,
    e.dispatcher_amount,
    e.receipt_number,
    e.receipt_date,
    e.invoice_number,
    e.quickpay_percentage,
    e.amount_received,
    e.rlp_number,
    e.date_received,
    e.driver_id,
    e.driver_name,
    e.driver_username,
    e.description,
    e.receipt_url,
    e.created_at,
    u.role as driver_role
FROM expenses e
JOIN users u ON e.driver_id = u.id
LEFT JOIN tags t ON e.document_type = t.id;

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE GetExpenseStats(
    IN start_date DATE, 
    IN end_date DATE,
    IN driver_id_filter VARCHAR(50),
    IN document_type_filter VARCHAR(50)
)
BEGIN
    SELECT 
        COUNT(*) as total_expenses,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as average_amount,
        COALESCE(MIN(amount), 0) as min_amount,
        COALESCE(MAX(amount), 0) as max_amount,
        COUNT(DISTINCT driver_id) as unique_drivers
    FROM expenses 
    WHERE DATE(pickup_datetime) BETWEEN start_date AND end_date
    AND (driver_id_filter IS NULL OR driver_id = driver_id_filter)
    AND (document_type_filter IS NULL OR document_type = document_type_filter);
END //

CREATE PROCEDURE GetDriverExpenseSummary(IN driver_id_param VARCHAR(50))
BEGIN
    SELECT 
        u.id,
        u.name,
        u.username,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(AVG(e.amount), 0) as average_amount,
        MIN(e.pickup_datetime) as first_trip_date,
        MAX(e.pickup_datetime) as last_trip_date,
        COALESCE(SUM(CASE WHEN e.pickup_datetime >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN e.amount ELSE 0 END), 0) as last_30_days_total
    FROM users u
    LEFT JOIN expenses e ON u.id = e.driver_id
    WHERE u.id = driver_id_param
    GROUP BY u.id, u.name, u.username;
END //

CREATE PROCEDURE GetDocumentTypeStats(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        t.id,
        t.name,
        t.color,
        COUNT(e.id) as document_count,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(SUM(e.rc_amount), 0) as total_rc_amount,
        COALESCE(SUM(e.dispatcher_amount), 0) as total_dispatcher_amount,
        COALESCE(SUM(e.amount_received), 0) as total_amount_received
    FROM tags t
    LEFT JOIN expenses e ON t.id = e.document_type 
        AND DATE(e.pickup_datetime) BETWEEN start_date AND end_date
    GROUP BY t.id, t.name, t.color
    ORDER BY document_count DESC;
END //

-- Stored procedure to get documents by type
CREATE PROCEDURE GetDocumentsByType(
    IN doc_type VARCHAR(50),
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    IF doc_type = 'rc' THEN
        SELECT id, title, rc_number, load_number, dispatcher, broker_shipper,
               pickup_address, pickup_datetime, dropoff_address, dropoff_datetime,
               miles, dh_miles, total_miles, rate_per_mile, amount, document_name,
               driver_name, created_at
        FROM expenses 
        WHERE document_type = 'rc'
        AND DATE(pickup_datetime) BETWEEN start_date AND end_date;
        
    ELSEIF doc_type = 'bol' THEN
        SELECT id, title, bol_number, rc_number, load_number, dispatcher, broker_shipper,
               pickup_address, pickup_datetime, dropoff_address, dropoff_datetime,
               miles, dh_miles, document_name, driver_name, created_at
        FROM expenses 
        WHERE document_type = 'bol'
        AND DATE(pickup_datetime) BETWEEN start_date AND end_date;
        
    ELSEIF doc_type = 'pod' THEN
        SELECT id, title, rc_number, load_number, dispatcher, broker_shipper,
               pickup_address, pickup_datetime, dropoff_address, dropoff_datetime,
               miles, document_name, driver_name, created_at
        FROM expenses 
        WHERE document_type = 'pod'
        AND DATE(pickup_datetime) BETWEEN start_date AND end_date;
        
    ELSEIF doc_type = 'dispatcher' THEN
        SELECT id, title, dispatcher_company, phone_number, email, rc_number, load_number,
               broker_shipper, pickup_address, pickup_datetime, dropoff_address, dropoff_datetime,
               rc_amount, dispatcher_percentage, dispatcher_amount, driver_name, created_at
        FROM expenses 
        WHERE document_type = 'dispatcher'
        AND DATE(pickup_datetime) BETWEEN start_date AND end_date;
        
    ELSEIF doc_type = 'fuel' THEN
        SELECT id, title, receipt_number, receipt_date, amount, rc_number, load_number,
               pickup_address, pickup_datetime, dropoff_address, dropoff_datetime,
               rc_amount, driver_name, created_at
        FROM expenses 
        WHERE document_type = 'fuel'
        AND DATE(pickup_datetime) BETWEEN start_date AND end_date;
        
    ELSEIF doc_type = 'invoice' THEN
        SELECT id, title, invoice_number, rc_number, load_number, dispatcher, broker_shipper,
               pickup_address as pickup, dropoff_address as dropoff,
               miles, dh_miles, total_miles, amount as amount_rc, 
               quickpay_percentage, amount_received, driver_name, created_at
        FROM expenses 
        WHERE document_type = 'invoice'
        AND DATE(pickup_datetime) BETWEEN start_date AND end_date;
        
    ELSEIF doc_type = 'rlp' THEN
        SELECT id, title, rlp_number, date_received, invoice_number, rc_number, load_number,
               dispatcher, broker_shipper, total_miles, amount as amount_rc,
               quickpay_percentage, amount_received, driver_name, created_at
        FROM expenses 
        WHERE document_type = 'rlp'
        AND DATE(pickup_datetime) BETWEEN start_date AND end_date;
    END IF;
END //

DELIMITER ;

-- Show created tables
SHOW TABLES;

-- Display setup completion message
SELECT 'Database setup completed successfully with 7 document types!' as status;
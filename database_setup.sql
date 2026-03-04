-- Truck Driver Expense Management System Database Setup
-- Host: sql5.freesqldatabase.com
-- Database: sql5818473
-- User: sql5818473
-- Port: 3306

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'driver') NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    INDEX idx_name (name)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    driver_id VARCHAR(50) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_username VARCHAR(50) NOT NULL,
    tags LONGTEXT,
    receipt LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_driver_id (driver_id),
    INDEX idx_date (date),
    INDEX idx_amount (amount),
    INDEX idx_created_at (created_at)
);

-- Insert default tags
INSERT IGNORE INTO tags (id, name, color, icon) VALUES
('fuel', 'Fuel', '#ef4444', 'fa-gas-pump'),
('maintenance', 'Maintenance', '#f59e0b', 'fa-wrench'),
('food', 'Food & Meals', '#10b981', 'fa-utensils'),
('lodging', 'Lodging', '#6366f1', 'fa-bed'),
('tolls', 'Tolls & Fees', '#8b5cf6', 'fa-road'),
('insurance', 'Insurance', '#ec4899', 'fa-shield-alt'),
('supplies', 'Supplies', '#14b8a6', 'fa-box'),
('other', 'Other', '#6b7280', 'fa-ellipsis-h');

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (id, username, password, role, name, created_at) VALUES
('admin-001', 'admin', 'admin123', 'admin', 'Fleet Manager', NOW());

-- Create view for expense reports
CREATE OR REPLACE VIEW expense_summary AS
SELECT 
    e.id,
    e.title,
    e.amount,
    e.date,
    e.description,
    e.driver_id,
    e.driver_name,
    e.driver_username,
    e.tags,
    e.receipt,
    e.created_at,
    u.role as driver_role
FROM expenses e
JOIN users u ON e.driver_id = u.id;

-- Create stored procedure for expense statistics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetExpenseStats(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount
    FROM expenses 
    WHERE date BETWEEN start_date AND end_date;
END //

DELIMITER ;

-- Create stored procedure for driver expense summary
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetDriverExpenseSummary(IN driver_id_param VARCHAR(50))
BEGIN
    SELECT 
        u.id,
        u.name,
        u.username,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(AVG(e.amount), 0) as average_amount,
        MIN(e.date) as first_expense_date,
        MAX(e.date) as last_expense_date
    FROM users u
    LEFT JOIN expenses e ON u.id = e.driver_id
    WHERE u.id = driver_id_param
    GROUP BY u.id, u.name, u.username;
END //

DELIMITER ;

-- Show created tables
SHOW TABLES;

-- Display setup completion message
SELECT 'Database setup completed successfully!' as status;

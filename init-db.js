import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'documate_pro.db');
const db = new Database(DB_PATH);

console.log('Creating tables...');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'driver',
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create tags table
db.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create expenses table
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    rc_number TEXT,
    load_number TEXT,
    dispatcher TEXT,
    broker_shipper TEXT,
    pickup_address TEXT,
    pickup_datetime TEXT,
    dropoff_address TEXT,
    dropoff_datetime TEXT,
    miles REAL,
    dh_miles REAL,
    total_miles REAL,
    amount REAL,
    document_name TEXT,
    rate_per_mile REAL,
    bol_number TEXT,
    dispatcher_company TEXT,
    phone_number TEXT,
    email TEXT,
    rc_amount REAL,
    dispatcher_percentage REAL,
    dispatcher_amount REAL,
    receipt_number TEXT,
    receipt_date TEXT,
    invoice_number TEXT,
    quickpay_percentage REAL,
    amount_received REAL,
    rlp_number TEXT,
    date_received TEXT,
    driver_id TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_username TEXT NOT NULL,
    description TEXT,
    receipt_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Inserting initial data...');

// Insert document types
const insertTags = db.prepare(`
  INSERT OR IGNORE INTO tags (id, name, color, icon) VALUES (?, ?, ?, ?)
`);

const tags = [
  ['rc', 'RC', '#dc3545', 'file-contract'],
  ['bol', 'BOL', '#fd7e14', 'file-invoice'],
  ['pod', 'POD', '#28a745', 'file-signature'],
  ['dispatcher', 'Dispatcher', '#17a2b8', 'headset'],
  ['fuel', 'Fuel', '#6f42c1', 'gas-pump'],
  ['invoice', 'Invoice', '#e83e8c', 'file-invoice-dollar'],
  ['rlp', 'RLP', '#6610f2', 'file-alt']
];

tags.forEach(tag => insertTags.run(tag));

// Insert admin user
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, username, password, role, name) VALUES (?, ?, ?, ?, ?)
`);
insertUser.run('admin-001', 'admin', 'admin123', 'admin', 'Fleet Manager');

console.log('Creating indexes...');

// Create indexes
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_expenses_driver_id ON expenses(driver_id)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_document_type ON expenses(document_type)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_pickup_datetime ON expenses(pickup_datetime)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_amount ON expenses(amount)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_rc_number ON expenses(rc_number)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_load_number ON expenses(load_number)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_invoice_number ON expenses(invoice_number)',
  'CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
  'CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)'
];

indexes.forEach(index => db.exec(index));

// Verify data was inserted
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get();

console.log(`✅ Database initialized successfully!`);
console.log(`📊 Users: ${userCount.count}, Tags: ${tagCount.count}`);

db.close();

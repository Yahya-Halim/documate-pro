import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// SQLite database file path
const DB_PATH = path.join(process.cwd(), 'documate_pro.db');

let db: Database.Database | null = null;

export async function initializeDatabase(): Promise<void> {
  try {
    // Open database connection
    db = new Database(DB_PATH);
    
    console.log('✅ SQLite database connected successfully');

    // Read and execute SQLite setup script
    const sqlPath = path.join(process.cwd(), 'sqlite_setup.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Enable foreign keys in SQLite
      db.exec('PRAGMA foreign_keys = ON');

      // Execute SQL in batches
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        const cleanStatement = statement.trim();
        if (cleanStatement && !cleanStatement.startsWith('--') && !cleanStatement.startsWith('/*')) {
          try {
            db!.exec(cleanStatement);
          } catch (error) {
            console.warn('Warning executing statement:', cleanStatement.substring(0, 100) + '...', error);
          }
        }
      }
    }

    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    // Test query
    const result = db!.prepare('SELECT 1 as test').get();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// Export types for database entities (same as before)
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'driver';
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  title: string;
  document_type: string;
  rc_number?: string;
  load_number?: string;
  dispatcher?: string;
  broker_shipper?: string;
  pickup_address?: string;
  pickup_datetime?: string;
  dropoff_address?: string;
  dropoff_datetime?: string;
  miles?: number;
  dh_miles?: number;
  total_miles?: number;
  amount?: number;
  document_name?: string;
  rate_per_mile?: number;
  bol_number?: string;
  dispatcher_company?: string;
  phone_number?: string;
  email?: string;
  rc_amount?: number;
  dispatcher_percentage?: number;
  dispatcher_amount?: number;
  receipt_number?: string;
  receipt_date?: string;
  invoice_number?: string;
  quickpay_percentage?: number;
  amount_received?: number;
  rlp_number?: string;
  date_received?: string;
  driver_id: string;
  driver_name: string;
  driver_username: string;
  description?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to convert row to object
export function rowToExpense(row: any): Expense {
  return {
    id: row.id,
    title: row.title,
    document_type: row.document_type,
    rc_number: row.rc_number,
    load_number: row.load_number,
    dispatcher: row.dispatcher,
    broker_shipper: row.broker_shipper,
    pickup_address: row.pickup_address,
    pickup_datetime: row.pickup_datetime,
    dropoff_address: row.dropoff_address,
    dropoff_datetime: row.dropoff_datetime,
    miles: row.miles,
    dh_miles: row.dh_miles,
    total_miles: row.total_miles,
    amount: row.amount,
    document_name: row.document_name,
    rate_per_mile: row.rate_per_mile,
    bol_number: row.bol_number,
    dispatcher_company: row.dispatcher_company,
    phone_number: row.phone_number,
    email: row.email,
    rc_amount: row.rc_amount,
    dispatcher_percentage: row.dispatcher_percentage,
    dispatcher_amount: row.dispatcher_amount,
    receipt_number: row.receipt_number,
    receipt_date: row.receipt_date,
    invoice_number: row.invoice_number,
    quickpay_percentage: row.quickpay_percentage,
    amount_received: row.amount_received,
    rlp_number: row.rlp_number,
    date_received: row.date_received,
    driver_id: row.driver_id,
    driver_name: row.driver_name,
    driver_username: row.driver_username,
    description: row.description,
    receipt_url: row.receipt_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool, { testConnection, initializeDatabase } from './lib/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, JPEG are allowed.'));
    }
  }
});

// Routes

// Get all documents (expenses)
app.get('/api/documents', async (req, res) => {
  try {
    const { driver_id, document_type, start_date, end_date, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT e.*, t.name as document_type_name, t.color as document_type_color
      FROM expenses e
      LEFT JOIN tags t ON e.document_type = t.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (driver_id) {
      query += ' AND e.driver_id = ?';
      params.push(driver_id);
    }
    
    if (document_type) {
      query += ' AND e.document_type = ?';
      params.push(document_type);
    }
    
    if (start_date) {
      query += ' AND DATE(e.pickup_datetime) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(e.pickup_datetime) <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT e.*, t.name as document_type_name, t.color as document_type_color
      FROM expenses e
      LEFT JOIN tags t ON e.document_type = t.id
      WHERE e.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create new document
app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    const {
      title,
      document_type,
      driver_id,
      driver_name,
      driver_username,
      description,
      // RC specific
      rc_number,
      load_number,
      dispatcher,
      broker_shipper,
      pickup_address,
      pickup_datetime,
      dropoff_address,
      dropoff_datetime,
      miles,
      dh_miles,
      total_miles,
      amount,
      rate_per_mile,
      // BOL specific
      bol_number,
      // Dispatcher specific
      dispatcher_company,
      phone_number,
      email,
      rc_amount,
      dispatcher_percentage,
      dispatcher_amount,
      // Fuel specific
      receipt_number,
      receipt_date,
      // Invoice specific
      invoice_number,
      quickpay_percentage,
      amount_received,
      // RLP specific
      rlp_number,
      date_received
    } = req.body;

    const document_id = 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const receipt_url = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO expenses (
        id, title, document_type, rc_number, load_number, dispatcher, broker_shipper,
        pickup_address, pickup_datetime, dropoff_address, dropoff_datetime,
        miles, dh_miles, total_miles, amount, document_name, rate_per_mile,
        bol_number, dispatcher_company, phone_number, email, rc_amount,
        dispatcher_percentage, dispatcher_amount, receipt_number, receipt_date,
        invoice_number, quickpay_percentage, amount_received, rlp_number,
        date_received, driver_id, driver_name, driver_username, description,
        receipt_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)
    `;

    const params = [
      document_id, title, document_type, rc_number, load_number, dispatcher, broker_shipper,
      pickup_address, pickup_datetime, dropoff_address, dropoff_datetime,
      miles, dh_miles, total_miles, amount, req.file?.originalname, rate_per_mile,
      bol_number, dispatcher_company, phone_number, email, rc_amount,
      dispatcher_percentage, dispatcher_amount, receipt_number, receipt_date,
      invoice_number, quickpay_percentage, amount_received, rlp_number,
      date_received, driver_id, driver_name, driver_username, description,
      receipt_url
    ];

    await pool.execute(query, params);
    
    const [newDoc] = await pool.execute('SELECT * FROM expenses WHERE id = ?', [document_id]);
    res.status(201).json(Array.isArray(newDoc) ? newDoc[0] : null);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Update document
app.put('/api/documents/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If new file uploaded, update receipt_url
    if (req.file) {
      updates.receipt_url = `/uploads/${req.file.filename}`;
      updates.document_name = req.file.originalname;
    }
    
    updates.updated_at = new Date();
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const query = `UPDATE expenses SET ${fields} WHERE id = ?`;
    values.push(id);
    
    await pool.execute(query, values);
    
    const [updatedDoc] = await pool.execute('SELECT * FROM expenses WHERE id = ?', [id]);
    res.json(Array.isArray(updatedDoc) ? updatedDoc[0] : null);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document info to delete associated file
    const [doc] = await pool.execute('SELECT receipt_url FROM expenses WHERE id = ?', [id]);
    if (Array.isArray(doc) && doc.length > 0 && doc[0].receipt_url) {
      const filePath = path.join(__dirname, doc[0].receipt_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get document types (tags)
app.get('/api/document-types', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tags ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching document types:', error);
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});

// Get users
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, username, name, role, created_at FROM users';
    const params: any[] = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY name';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({ 
      status: 'ok', 
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Health check failed' });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

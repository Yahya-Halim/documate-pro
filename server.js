const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Database configuration
const DB_CONFIG = {
    host: 'sql5.freesqldatabase.com',
    database: 'sql5818473',
    user: 'sql5818473',
    password: 'rh5QWTcKd6',
    port: 3306
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database connection
let db;

async function connectDB() {
    try {
        db = await mysql.createConnection(DB_CONFIG);
        console.log('Connected to MySQL database successfully!');
        return db;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

// Initialize database connection
connectDB();

// API Routes

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user
app.post('/api/users', async (req, res) => {
    try {
        const { id, username, password, role, name, createdAt } = req.body;
        await db.execute(
            'INSERT INTO users (id, username, password, role, name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, username, password, role, name, createdAt]
        );
        res.json({ success: true, id });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM expenses ORDER BY created_at DESC');
        // Parse JSON fields for each expense
        const expenses = rows.map(expense => ({
            ...expense,
            tags: expense.tags ? JSON.parse(expense.tags) : [],
            receipt: expense.receipt ? JSON.parse(expense.receipt) : null
        }));
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Create expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { id, title, amount, date, description, driverId, driverName, driverUsername, tags, receipt, createdAt } = req.body;
        await db.execute(
            'INSERT INTO expenses (id, title, amount, date, description, driver_id, driver_name, driver_username, tags, receipt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, amount, date, description, driverId, driverName, driverUsername, JSON.stringify(tags), JSON.stringify(receipt), createdAt]
        );
        res.json({ success: true, id });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM expenses WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Get all tags
app.get('/api/tags', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM tags ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// Create tag
app.post('/api/tags', async (req, res) => {
    try {
        const { id, name, color, icon } = req.body;
        await db.execute(
            'INSERT INTO tags (id, name, color, icon) VALUES (?, ?, ?, ?)',
            [id, name, color, icon]
        );
        res.json({ success: true, id });
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: DB_CONFIG.database,
        timestamp: new Date().toISOString()
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database: ${DB_CONFIG.database} at ${DB_CONFIG.host}:${DB_CONFIG.port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (db) {
        await db.end();
    }
    process.exit(0);
});

# Documate Pro - Complete Setup Guide

This guide will help you set up and run the complete Documate Pro application with SQLite database.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database (Local Version)
```bash
node init-db.js
```

### 3. Start Application

**Local Version (SQLite):**
```bash
npm start
```

**Cloud Version (GitHub):**
```bash
npm run deploy
```

Or run them separately:

**Terminal 1 - Backend Server:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Access Points

- **Frontend Application**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## Default Login

The database is pre-configured with an admin user:
- **Username**: admin
- **Password**: admin123

## Features

### Document Types Supported
1. **RC** (Rate Confirmation)
2. **BOL** (Bill of Lading)
3. **POD** (Proof of Delivery)
4. **Dispatcher** (Dispatcher Information)
5. **Fuel** (Fuel Receipts)
6. **Invoice** (Invoice Documents)
7. **RLP** (Rate Lock Proposal)

### Key Functionality
- 📄 Upload and manage documents
- 🏷️ Organize by document types
- 🔍 Search and filter documents
- 📊 Track expenses and mileage
- 👥 Multi-user support (admin/driver roles)
- 📱 Responsive design
- 🗄️ SQLite database for local storage

## File Upload

- Supported formats: PDF, PNG, JPG, JPEG
- Maximum file size: 10MB
- Files are stored in the `uploads/` directory

## API Endpoints

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Document Types
- `GET /api/document-types` - Get all document types

### Users
- `GET /api/users` - Get all users

### Health
- `GET /api/health` - Check API and database status

## Database

The application uses SQLite for local data storage:
- **Database file**: `documate_pro.db`
- **Location**: Project root directory
- **Backup**: Simply copy the `.db` file to backup all data

### Database Schema
- `users` - User accounts and roles
- `tags` - Document types/categories
- `expenses` - Document records with metadata

## Development

### Project Structure
```
documate-pro/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API clients
│   └── pages/         # Page components
├── server-sqlite.ts   # Express backend server
├── init-db.js         # Database initialization script
├── sqlite_setup.sql   # SQL schema
└── uploads/           # File upload directory
```

### Scripts
- `npm run dev` - Start frontend only
- `npm run server:dev` - Start backend only
- `npm start` - Start both frontend and backend
- `node init-db.js` - Initialize/reset database
- `npm run build` - Build for production

### Environment Variables
The `.env` file contains:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## Troubleshooting

### Database Issues
1. Delete `documate_pro.db` and run `node init-db.js`
2. Check file permissions for the project directory
3. Ensure no other process is using the database file

### Port Conflicts
- Frontend port: 8080 (configurable in vite.config.ts)
- Backend port: 3001 (configurable in .env)

### File Upload Issues
1. Check `uploads/` directory permissions
2. Verify file size limits in `.env`
3. Ensure supported file formats

### Common Issues
- **Server won't start**: Check if ports 3001/8080 are available
- **Database errors**: Re-run `node init-db.js`
- **File upload fails**: Check uploads directory permissions

## Production Deployment

For production deployment:

1. Set proper environment variables
2. Configure file storage (AWS S3, etc.)
3. Set up reverse proxy (Nginx)
4. Enable HTTPS
5. Configure proper authentication
6. Set up database backups

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify database connection: `curl http://localhost:3001/api/health`
3. Ensure all dependencies are installed
4. Check file permissions for uploads directory

---

**Note**: This application is designed for trucking and logistics document management, specifically tailored for fleet operations and expense tracking. The SQLite database makes it easy to run locally without requiring external database services.

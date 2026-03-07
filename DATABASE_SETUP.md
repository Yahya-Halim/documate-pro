# Documate Pro - Local Database Setup Guide

This guide will help you set up a local MySQL database and run the complete Documate Pro application.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL Server** (v8.0 or higher)
3. **Git** (for cloning)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MySQL Database

#### Option A: Using XAMPP/MAMP/WAMP (Recommended for Windows)
1. Install XAMPP from https://www.apachefriends.org/
2. Start MySQL and Apache from the XAMPP Control Panel
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create a new database named `documate_pro`
5. Import the `database_setup.sql` file

#### Option B: Using MySQL Command Line
1. Install MySQL Server
2. Start MySQL service
3. Run the setup script:
```bash
mysql -u root -p < database_setup.sql
```

### 3. Configure Environment

The `.env` file is already configured for local development:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=documate_pro
```

If your MySQL setup uses different credentials, update the `.env` file accordingly.

### 4. Initialize Database

```bash
npm run setup-db
```

### 5. Start the Application

Run both the frontend and backend server concurrently:

```bash
npm start
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

- **Frontend Application**: http://localhost:5173
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

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL server is running
2. Check credentials in `.env` file
3. Verify database `documate_pro` exists
4. Test connection: `npm run setup-db`

### Port Conflicts
- Frontend port: 5173 (configurable in vite.config.ts)
- Backend port: 3001 (configurable in .env)

### File Upload Issues
1. Check `uploads/` directory permissions
2. Verify file size limits in `.env`
3. Ensure supported file formats

## Development

### Project Structure
```
documate-pro/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API clients
│   └── pages/         # Page components
├── server.ts          # Express backend server
├── database_setup.sql # Database schema
└── uploads/           # File upload directory
```

### Scripts
- `npm run dev` - Start frontend only
- `npm run server:dev` - Start backend only
- `npm start` - Start both frontend and backend
- `npm run setup-db` - Initialize database
- `npm run build` - Build for production

## Production Deployment

For production deployment:

1. Set proper environment variables
2. Use a production database
3. Configure file storage (AWS S3, etc.)
4. Set up reverse proxy (Nginx)
5. Enable HTTPS
6. Configure proper authentication

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify database connection
3. Ensure all dependencies are installed
4. Check file permissions for uploads directory

---

**Note**: This application is designed for trucking and logistics document management, specifically tailored for fleet operations and expense tracking.

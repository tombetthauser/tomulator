# Generic CRUD Application

A simple, generic CRUD (Create, Read, Update, Delete) application built with Bun, Postgres (via Neon), React, and HTML tables.

## Features

- **Dynamic Table Selection**: Dropdown to select from all tables in the database
- **Editable Rows**: All table values are editable by default (except ID and timestamps)
- **Add New Rows**: Easy addition of new rows with a button click
- **Delete Rows**: Remove rows with confirmation dialog
- **Real-time Updates**: Changes are immediately reflected in the database
- **Responsive Design**: Clean, modern UI with HTML tables
- **Table Creation**: Create new database tables with custom columns and data types
- **Navigation**: Easy navigation between database management and table creation
- **Table Deletion**: Safely delete entire tables with confirmation dialogs

## Tech Stack

- **Backend**: Bun + Express.js
- **Database**: PostgreSQL (via Neon)
- **Frontend**: React + TypeScript
- **Table Component**: HTML tables with inline editing
- **Database Driver**: pg (node-postgres)

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- A Neon PostgreSQL database (or any PostgreSQL database)
- Node.js (for some dependencies)

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Database Setup

1. **Create a Neon Database** (if you don't have one):
   - Go to [neon.tech](https://neon.tech)
   - Sign up and create a new project
   - Copy your connection string

2. **Set Environment Variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your database connection string:
   ```
   DATABASE_URL=postgresql://username:password@ep-xxxxx-xx-xx.region.aws.neon.tech/database
   ```

3. **Initialize Database Schema**:
   - Connect to your database using a PostgreSQL client (psql, pgAdmin, etc.)
   - Run the SQL commands from `src/database/schema.sql`

### 3. Build the Application

```bash
bun run build
```

### 4. Start the Server

```bash
bun run start
```

The application will be available at `http://localhost:3000`

### 5. Development Mode (Recommended)

For development with automatic rebuilding and restarting:

```bash
# Option 1: Use the development script (recommended)
./dev.sh

# Option 2: Manual development mode
bun run dev:full
```

**What happens automatically:**
- ✅ Frontend rebuilds when you change React components
- ✅ Backend restarts when you change server code  
- ✅ Hot reloading in the browser
- ✅ No manual restarting needed!

**Development Scripts:**
- `bun run dev:full` - Start both frontend and backend with auto-restart
- `bun run dev:client` - Start only frontend with hot reloading
- `bun run dev:server` - Start only backend with auto-restart

## Available Scripts

```bash
# Development
bun run dev:full      # Start both frontend and backend with auto-restart
bun run dev:client    # Start only frontend with hot reloading  
bun run dev:server    # Start only backend with auto-restart
./dev.sh              # Development script with setup checks

# Building
bun run build         # Build frontend for production
bun run build:server  # Build backend for production

# Production
bun run start         # Start development server
bun run start:prod    # Start production server from dist/
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── SimpleCrudApp.tsx    # Main React component
│   │   └── NewTableCreator.tsx  # Table creation component
│   ├── database/
│   │   ├── connection.ts         # Database connection
│   │   ├── queries.ts           # Database queries
│   │   └── schema.sql           # Database schema
│   ├── index.tsx                # React entry point
│   ├── index.html               # HTML template
│   └── server.ts                # Express server
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Database Schema

The application works with your actual database tables:

### Users Table
- `id` (Primary Key)
- `unique_user_string` (Unique identifier)

### Curator Dialog Table
- `id` (Primary Key)
- `dialog_line` (Dialog content)
- `context_description` (Context information)
- `is_deleted` (Soft delete flag)

### Degradations Table
- `id` (Primary Key)
- `start_index` (Start position)
- `end_index` (End position)
- `user_id` (Foreign Key to Users)
- `created_at` (Timestamp)

### Donations Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `nametag` (Donor identifier)
- `donated_string` (Donation message)
- `created_at` (Timestamp)

### Pixel Dust Table
- `id` (Primary Key)
- `x` (X coordinate)
- `y` (Y coordinate)

## API Endpoints

- `GET /api/tables` - Get all tables
- `GET /api/tables/:tableName/schema` - Get table schema
- `GET /api/tables/:tableName/data` - Get table data
- `POST /api/tables/:tableName/rows` - Insert new row
- `PUT /api/tables/:tableName/rows/:id` - Update row
- `DELETE /api/tables/:tableName/rows/:id` - Delete row
- `POST /api/tables/create` - Create new table
- `DELETE /api/tables/:tableName` - Delete table

## Table Creation Feature

The application now includes a powerful table creation feature that allows you to:

- **Create Custom Tables**: Design tables with any number of columns
- **Flexible Data Types**: Support for all major PostgreSQL data types including:
  - Numeric: INTEGER, BIGINT, SERIAL, NUMERIC, DECIMAL, REAL
  - Text: TEXT, VARCHAR, CHAR
  - Date/Time: TIMESTAMP, DATE, TIME
  - Boolean: BOOLEAN
  - JSON: JSON, JSONB
  - UUID: UUID
- **Column Constraints**: Set primary keys, nullable constraints, and default values
- **Auto-increment**: Automatic ID generation for primary key columns
- **Built-in Timestamps**: Automatic `created_at` column for all new tables

### How to Use

1. Click the **"+ Create New Table"** button from the main database manager
2. Enter a table name (must start with a letter or underscore)
3. Add columns with your desired data types and constraints
4. Set primary key and nullable constraints as needed
5. Submit to create the table in your database
6. The new table will immediately appear in your table selection dropdown

### Best Practices

- Always include a primary key column (usually an ID)
- Use SERIAL for auto-incrementing primary keys
- Consider adding an `is_deleted` column for soft delete functionality
- VARCHAR and CHAR columns require specifying a length
- Primary key columns cannot be nullable

## Table Deletion Feature

The application now includes a safe table deletion feature that allows you to:

- **Delete Entire Tables**: Remove tables and all their data permanently
- **Confirmation Dialog**: Multiple warning levels to prevent accidental deletion
- **Cascade Deletion**: Removes all associated data, indexes, and constraints
- **State Management**: Automatically updates the UI after table deletion

### How to Use

1. Select a table from the dropdown in the main database manager
2. Click the **"🗑️ Delete Table"** button in the Table Data controls section
3. Review the detailed warning message in the confirmation modal
4. Confirm the deletion by clicking **"Yes, Delete Table Permanently"**
5. The table will be permanently removed from the database

### Safety Features

- **Multiple Warning Levels**: Clear warnings about permanent data loss
- **Confirmation Required**: Must explicitly confirm the deletion action
- **Detailed Information**: Shows exactly what will be deleted
- **Disabled During Operation**: Button is disabled while deletion is in progress

### ⚠️ Important Notes

- **Permanent Action**: Table deletion cannot be undone
- **All Data Lost**: All rows, indexes, and constraints are permanently removed
- **Use with Caution**: Only delete tables when you're absolutely certain
- **Backup Recommended**: Consider backing up important data before deletion

## Usage

1. **Select a Table**: Use the dropdown to choose which table to work with
2. **View Data**: The selected table data is displayed in an HTML table
3. **Edit Cells**: Click on any cell (except ID) to edit values
4. **Add Rows**: Click "Add New Row" to insert a new row
5. **Delete Rows**: Click the red X button in the Actions column to delete a row
6. **Basic Functionality**: Clean, simple table interface with full CRUD operations

## Customization

- **Add New Tables**: Simply create new tables in your database - they'll automatically appear in the dropdown
- **Modify Schema**: Update the database schema and the application will adapt automatically
- **Styling**: Modify the inline styles in `CrudApp.tsx` or add CSS files

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify your `DATABASE_URL` in `.env`
   - Ensure your database is accessible
   - Check if SSL is required for your database

2. **Build Errors**:
   - Make sure all dependencies are installed: `bun install`
   - Check TypeScript configuration in `tsconfig.json`

3. **Runtime Errors**:
   - Check browser console for JavaScript errors
   - Verify server logs for backend errors
   - Ensure database schema is properly initialized

### Getting Help

- Check the browser's developer console for error messages
- Verify database connectivity
- Ensure all environment variables are set correctly

## License

This project is open source and available under the MIT License.

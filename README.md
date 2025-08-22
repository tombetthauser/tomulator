# Generic CRUD Application

A simple, generic CRUD (Create, Read, Update, Delete) application built with Bun, Postgres (via Neon), React, and HTML tables.

## Features

- **Dynamic Table Selection**: Dropdown to select from all tables in the database
- **Editable Rows**: All table values are editable by default (except ID and timestamps)
- **Add New Rows**: Easy addition of new rows with a button click
- **Delete Rows**: Remove rows with confirmation dialog
- **Real-time Updates**: Changes are immediately reflected in the database
- **Responsive Design**: Clean, modern UI with HTML tables

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

### 5. Development Mode (Optional)

For development with hot reloading:

```bash
bun run dev
```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── CrudApp.tsx          # Main React component
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

# Quick Start Guide

Get your Generic CRUD Application running in 5 minutes!

## 🚀 Quick Setup

### 1. Run the Setup Script
```bash
./setup.sh
```

This will:
- Install all dependencies
- Create your `.env` file
- Build the application

### 2. Configure Your Database
Edit the `.env` file with your Neon database connection string:
```
DATABASE_URL=postgresql://username:password@ep-xxxxx-xx-xx.region.aws.neon.tech/database
```

### 3. Initialize Database
Connect to your database and run:
```sql
-- Copy and paste the contents of src/database/schema.sql
```

### 4. Start the Application
```bash
bun run start
```

### 5. Open Your Browser
Navigate to `http://localhost:3000`

## 🎯 What You'll See

- A dropdown to select from your database tables
- Editable HTML tables for each table
- Add/Edit/Delete functionality for all rows
- Automatic schema detection

## 🔧 Troubleshooting

**Database Connection Issues?**
- Check your `.env` file
- Verify your Neon database is running
- Ensure SSL settings are correct

**Build Errors?**
- Make sure Bun is installed: `curl -fsSL https://bun.sh/install | bash`
- Run `bun install` again

**Still Stuck?**
Check the full [README.md](README.md) for detailed instructions.

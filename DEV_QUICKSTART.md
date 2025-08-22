# 🚀 Development Quick Start

## One Command to Start Everything

```bash
./dev.sh
```

This will:
- ✅ Check your environment setup
- ✅ Install dependencies if needed
- ✅ Build the application
- ✅ Start both frontend and backend with auto-restart

## Manual Development Commands

```bash
# Start both frontend and backend with auto-restart
bun run dev:full

# Start only frontend (hot reloading)
bun run dev:client

# Start only backend (auto-restart)
bun run dev:server
```

## What Happens Automatically

- **Frontend Changes**: Automatically rebuilds and hot reloads in browser
- **Backend Changes**: Automatically restarts the server
- **Database Changes**: No restart needed, just refresh browser
- **Configuration Changes**: May require restart (Ctrl+C then run again)

## Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api
- **Database**: Configured in `.env` file

## Stopping Development

Press `Ctrl+C` in the terminal to stop all servers.

## Troubleshooting

- **Port already in use**: The server will automatically try the next available port
- **Build errors**: Check the terminal output for TypeScript/React errors
- **Database connection**: Ensure your `.env` file has the correct `DATABASE_URL`

## File Watching

The system watches these file types for changes:
- `.ts` - TypeScript files
- `.tsx` - React components
- `.js` - JavaScript files
- `.json` - Configuration files

Changes to these files will trigger automatic rebuilding/restarting.

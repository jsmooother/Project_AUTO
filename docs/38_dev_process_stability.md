# Development Process Management

This document explains how to manage development servers reliably and recover from stuck processes.

## Quick Start

**Always use these commands:**
```bash
pnpm dev:up      # Start all services
pnpm dev:down    # Stop all services
pnpm dev:reset   # Stop, clean cache, and restart
```

## How It Works

### Process Management

The dev scripts use **PID files** stored in `.dev/pids/` to track running processes:
- `.dev/pids/api.pid` - API server (port 3001)
- `.dev/pids/web.pid` - Web server (port 3000)
- `.dev/pids/worker.pid` - Worker process

**Benefits:**
- Prevents duplicate processes (checks before starting)
- Precise process killing (only kills our processes)
- Port-based fallback if PID files are missing

### Startup Process (`pnpm dev:up`)

1. **Checks for existing processes:**
   - Reads PID files and verifies processes are still running
   - Checks if ports 3000/3001 are in use
   - Exits with error if conflicts found

2. **Starts Docker services:**
   - `docker compose up -d` (Postgres + Redis)

3. **Starts Node services:**
   - API server (port 3001)
   - Worker process
   - Web server (port 3000)

4. **Saves PID files:**
   - Writes process IDs to `.dev/pids/*.pid`

### Shutdown Process (`pnpm dev:down`)

1. **Kills processes from PID files:**
   - Reads each PID file
   - Sends SIGTERM, then SIGKILL if needed
   - Removes PID files

2. **Port-based fallback:**
   - Checks ports 3000/3001 for remaining processes
   - **Only kills node/tsx/next processes** (safety check)
   - Prevents killing unrelated services

3. **Stops Docker:**
   - `docker compose down`

## Checking What's Running

### Check Ports

```bash
# Check port 3000 (Web)
lsof -i:3000

# Check port 3001 (API)
lsof -i:3001

# Check all ports
lsof -i -P | grep LISTEN
```

### Check PID Files

```bash
# List PID files
ls -la .dev/pids/

# Check if a process is still running
cat .dev/pids/api.pid
ps -p $(cat .dev/pids/api.pid)
```

### Check Processes

```bash
# Find all node processes
ps aux | grep node

# Find specific service
ps aux | grep "tsx watch.*api"
ps aux | grep "next dev"
```

## Recovery from Stuck Processes

### Scenario 1: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Option 1: Use dev:down (recommended)
pnpm dev:down

# Option 2: Manual kill by port
lsof -ti:3000 | xargs kill -9

# Option 3: Manual kill by PID file
kill -9 $(cat .dev/pids/web.pid)
rm .dev/pids/web.pid
```

### Scenario 2: PID File Exists But Process Is Dead

**Error:** `API is already running (PID: 12345)` but process doesn't exist

**Solution:**
```bash
# Remove stale PID file
rm .dev/pids/api.pid

# Or use dev:down to clean all
pnpm dev:down
```

### Scenario 3: Processes Won't Die

**Symptoms:** `pnpm dev:down` doesn't stop processes

**Solution:**
```bash
# Force kill by port (only kills node processes)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or kill all node processes (use with caution)
pkill -9 node

# Then clean up
rm -rf .dev/pids/*
pnpm dev:down
```

### Scenario 4: Docker Services Stuck

**Symptoms:** Docker containers won't stop

**Solution:**
```bash
# Force stop Docker containers
docker compose down --remove-orphans

# Or kill specific containers
docker kill project-auto-postgres project-auto-redis
docker compose down
```

### Scenario 5: Complete Reset

**When:** Everything is broken, ports stuck, processes won't die

**Solution:**
```bash
# Nuclear option (use with caution)
pkill -9 node
docker compose down --remove-orphans
rm -rf .dev/pids/*
rm -rf apps/web/.next
pnpm dev:up
```

## Troubleshooting

### "Port X is already in use" but no process found

This can happen if:
1. Process just died but port is in TIME_WAIT state
2. Another service is using the port

**Check:**
```bash
# See what's using the port
lsof -i:3000
netstat -an | grep 3000

# Wait a few seconds and try again
sleep 5
pnpm dev:up
```

### Processes start but immediately die

**Check logs:**
```bash
tail -f /tmp/project-auto-api.log
tail -f /tmp/project-auto-web.log
tail -f /tmp/project-auto-worker.log
```

**Common causes:**
- Missing environment variables
- Database not running
- Port conflicts
- Syntax errors in code

### "Cannot find module" errors

**Solution:**
```bash
# Reinstall dependencies
pnpm install

# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## Best Practices

1. **Always use `pnpm dev:down` before stopping work**
   - Ensures clean shutdown
   - Saves PID files for next session

2. **Use `pnpm dev:reset` when things feel weird**
   - Cleans Next.js cache
   - Fresh start

3. **Check logs if services won't start**
   - `/tmp/project-auto-*.log` files

4. **Don't manually kill processes unless necessary**
   - Let the scripts handle it
   - Manual kills can leave stale PID files

5. **Commit `.dev/pids/` to `.gitignore`**
   - PID files are local-only
   - Should not be committed

## Architecture

```
.dev/
└── pids/
    ├── api.pid      # API server PID
    ├── web.pid      # Web server PID
    └── worker.pid   # Worker process PID
```

**Note:** `.dev/pids/` is gitignored and should not be committed.

## Related Documentation

- [Local Development Setup](./18_local_dev_setup.md)
- [Docker Setup](./20_local_dev_postgres_redis.md)
- [README](../README.md) - Quick start guide

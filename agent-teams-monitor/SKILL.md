---
name: agent-teams-monitor
description: Real-time web dashboard for monitoring Claude Agent Teams activity. Use when users need to monitor agent teams, track team tasks and messages, visualize agent activity, or control running agents. Triggers on requests like "monitor my agent teams", "create a dashboard for agent teams", "track agent teams logs", or "visualize agent teams activity".
---

# Agent Teams Monitor

Set up a full-stack web dashboard to monitor Claude Agent Teams in real-time.

## Quick Start

### 1. Copy the Project Template

Copy the complete project template to the user's desired location:

```bash
cp -r assets/project-template /path/to/destination
cd /path/to/destination
```

### 2. Run Setup Script

Install all dependencies using the provided setup script:

```bash
bash scripts/setup.sh /path/to/destination
```

Or manually:

```bash
cd /path/to/destination
npm run install:all
```

### 3. Start the Dashboard

Development mode (hot reload):

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:3001` (API + WebSocket)
- Frontend on `http://localhost:5173` (with proxy to backend)

Production mode (optimized build):

```bash
npm run preview
```

This builds the frontend and serves everything from port 3001.

## What Gets Monitored

The dashboard reads from `~/.claude/` and displays:

- **Teams**: All discovered teams from `~/.claude/teams/`
- **Members**: Team members with roles, models, and status
- **Tasks**: Task lists from `~/.claude/tasks/{team}/`
- **Messages**: Agent inbox messages from `~/.claude/teams/{team}/inboxes/`
- **Debug Logs**: Session logs from `~/.claude/debug/`

## Features

### Three-Column Layout

- **Teams Panel** (collapsible): Search and select teams
- **Members Panel** (collapsible): View team members with status indicators
- **Details Panel**: View member overview, tasks, and messages

### Agent Status Indicators

- 🟢 **Active**: Has in-progress tasks or recent activity (last 5 min)
- 🟡 **Idle**: Has tasks but no recent activity
- ⚫ **Offline**: No assigned tasks

### Agent Control

Control agents directly from the dashboard:

- **▶️ Resume/Play**: Start or resume agent
- **⏸️ Pause**: Pause agent execution
- **⏻ Shutdown**: Request agent shutdown

These controls work by writing messages to agent inbox files at `~/.claude/teams/{team}/inboxes/{agent}.json`.

### Real-time Updates

WebSocket-powered live updates when:
- Team configurations change
- Tasks are created or updated
- New messages arrive
- Debug logs are written

## Architecture

See [ARCHITECTURE.md](references/ARCHITECTURE.md) for detailed system design.

**Tech Stack:**
- Backend: Node.js + Express + WebSocket + chokidar (file watching)
- Frontend: React + Vite + TailwindCSS v4
- Data Source: `~/.claude/` file system

**Key Components:**

```
backend/
├── server.js         # Express + WebSocket + file watcher
├── routes.js         # REST API endpoints
├── log-reader.js     # Reads ~/.claude/ data
├── file-watcher.js   # Real-time file change detection
└── agent-controller.js # Agent control via inbox files

frontend/
├── App.jsx           # Three-column layout
├── hooks/
│   ├── useDashboard.js  # Data fetching
│   └── useWebSocket.js  # Real-time updates
└── components/
    ├── TeamList.jsx
    ├── MemberList.jsx
    └── MemberDetail.jsx
```

## API Reference

See [api-reference.md](references/api-reference.md) for complete API documentation.

**Key Endpoints:**

- `GET /api/teams` - List all teams
- `GET /api/teams/:name/tasks` - Get team tasks
- `GET /api/teams/:name/messages` - Get team messages
- `POST /api/teams/:name/agents/:agent/shutdown` - Shutdown agent
- `POST /api/teams/:name/agents/:agent/control` - Pause/resume agent
- `ws://localhost:3001/ws` - WebSocket for real-time updates

## Customization

### Changing Ports

Edit `backend/src/server.js`:

```javascript
const PORT = process.env.PORT || 3001
```

Edit `frontend/vite.config.js`:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': { target: 'http://localhost:3001' }
  }
}
```

### Styling

The dashboard uses TailwindCSS v4. Customize colors in `frontend/src/index.css`:

```css
@theme {
  --color-primary: #4f46e5; /* Indigo */
  --color-secondary: #8b5cf6; /* Purple */
}
```

### Agent Status Logic

Modify status detection in `frontend/src/components/MemberList.jsx`:

```javascript
function getAgentStatus(memberName, tasks, events) {
  const hasActiveTasks = tasks.some(t =>
    t.owner === memberName && t.status === 'in_progress'
  )

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const recentActivity = events.some(e => {
    const eventTime = new Date(e.timestamp).getTime()
    return eventTime > fiveMinutesAgo && (
      e.data?.agentName === memberName ||
      e.data?.from === memberName
    )
  })

  if (hasActiveTasks || recentActivity) return 'active'
  return tasks.some(t => t.owner === memberName) ? 'idle' : 'offline'
}
```

## Troubleshooting

### Port Already in Use

Kill existing processes:

```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### WebSocket Connection Errors

Ensure `vite.config.js` has `changeOrigin: true`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  },
  '/ws': {
    target: 'ws://localhost:3001',
    ws: true,
    changeOrigin: true
  }
}
```

### No Teams Showing

Verify `~/.claude/teams/` directory exists and contains team config files:

```bash
ls -la ~/.claude/teams/
```

## Resources

- **assets/project-template**: Complete dashboard application
- **scripts/setup.sh**: Automated dependency installation
- **references/ARCHITECTURE.md**: Detailed system architecture
- **references/api-reference.md**: Complete API documentation

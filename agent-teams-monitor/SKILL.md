---
name: agent-teams-monitor
description: Real-time web dashboard for monitoring Claude Agent Teams activity. Use when users need to monitor agent teams, track team tasks and messages, visualize agent activity, or control running agents. Triggers on requests like "monitor my agent teams", "create a dashboard for agent teams", "track agent teams logs", or "visualize agent teams activity".
---

# Agent Teams Log Monitor

A real-time web dashboard for monitoring Claude Agent Teams activity. Features a modern, light-themed interface with intuitive three-column navigation for exploring teams, members, and detailed activity logs.

## Features

- **Modern Light Theme** -- Clean, professional design with gradient accents
- **Team Search** -- Search teams by name or description with instant filtering
- **Collapsible Columns** -- Teams and Members panels can be collapsed to save space
- **Smart Status Indicators** -- Real-time agent status (Active/Idle/Offline)
- **Agent Control** -- Control agents directly from the dashboard (pause/resume/shutdown)
- **Member Activity Dashboard** -- View each member's tasks, messages, and statistics
- **Smart Task Cards** -- Color-coded status indicators with detailed information
- **Structured Message Display** -- Intelligently formatted messages (task assignments, approvals, etc.)
- **Activity Overview** -- Statistics and recent activity for each team member
- **Real-time Updates** -- WebSocket-powered live updates when files change
- **Responsive Design** -- Optimized for modern browsers

## User Interface

### Three-Column Layout with Collapsible Panels

The interface features three side-by-side columns with collapsible panels:

```
Expanded View:
┌─────────────┬─────────────┬──────────────────────┐
│   Teams ←   │  Members ←  │   Member Details     │
│             │             │                      │
│  [Search]   │  Active     │  ┌─ Overview         │
│             │  Idle       │  ├─ Tasks            │
│  • Team A   │  Offline    │  └─ Messages         │
│  • Team B → │  Alice      │                      │
│  • Team C   │  Bob        │  [Member content]    │
└─────────────┴─────────────┴──────────────────────┘

Collapsed View with Shortcuts:
┌──┬─────────────┬──────────────────────┐
│→ │  Members ←  │   Member Details     │
│  │             │                      │
│AG│  Active     │  ┌─ Overview         │
│TO│  Idle       │  ├─ Tasks            │
│LO│  Alice      │  └─ Messages         │
│  │  Bob        │                      │
└──┴─────────────┴──────────────────────┘
  ↑
  2-letter abbreviations for quick access
```

**Column 1: Teams List** (Always visible, collapsible)
   - Click the collapse button (←) to minimize to icon bar
   - Search teams by name or description
   - View team stats (members, tasks, messages)
   - Click to load members in Column 2

**Column 2: Members List** (Appears when team selected, collapsible)
   - Click the collapse button (←) to minimize
   - Shows team name header
   - **Real-time status indicators**:
     - **Active**: Has in-progress tasks or recent activity (last 5 min)
     - **Idle**: Has tasks but no recent activity
     - **Offline**: No assigned tasks
   - Lists all team members with roles
   - Click to load member details in Column 3

**Column 3: Member Details** (Appears when member selected)
   - **Status Control**: View and manually override agent status
     - **Active**: Has in-progress tasks or recent activity (last 5 min)
     - **Idle**: Has tasks but no recent activity
     - **Offline**: No assigned tasks
     - Auto-detection by default (based on tasks and activity)
     - Manual override available with dropdown menu
     - "Manual" badge shows when manually set
     - Quick reset to auto-detection
   - **Overview Tab**: Statistics + recent activity
   - **Tasks Tab**: All tasks with formatted cards
   - **Messages Tab**: Intelligently formatted messages
     - Task assignments with details
     - Shutdown requests/responses
     - Plan approvals
     - Task status updates
     - Plain text messages
   - **Config Tab**: Full member configuration (prompt, cwd, backendType, etc.)

### Navigation Features

- **Collapsible Panels**: Save screen space by collapsing Teams or Members columns
- **Collapsed Shortcuts**: When collapsed, panels show 2-letter abbreviations for quick switching
- **Smooth Transitions**: Animated expand/collapse with 300ms duration
- **Auto-expand**: Members panel automatically expands when selecting a team
- **Lightweight Design**: Minimal borders, subtle colors, reduced padding for cleaner look

## Prerequisites

- Node.js v18+ (tested with v22)
- npm

## Quick Start

### 1. Copy the Project Template

```bash
cp -r assets/project-template /path/to/destination
cd /path/to/destination
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Start the Dashboard

Development mode (backend on :3001, frontend on :5173 with proxy):
```bash
npm run dev
```

Production mode (build frontend, serve everything from :3001):
```bash
npm run preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install dependencies for both backend and frontend |
| `npm run dev` | Start both backend and frontend in development mode |
| `npm run dev:backend` | Start only the backend (port 3001, with file watching) |
| `npm run dev:frontend` | Start only the frontend dev server (port 5173, proxies to backend) |
| `npm run build` | Build the frontend for production |
| `npm run start` | Start the backend server (serves built frontend in production) |
| `npm run preview` | Build frontend and start backend (full production mode) |

## Architecture

```
agent-teams-monitor/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── server.js     # Express + WebSocket + file watcher setup
│   │   ├── routes.js     # REST API route definitions
│   │   ├── log-reader.js # File system reader for ~/.claude/ data
│   │   └── file-watcher.js # Real-time file change detection
│   └── package.json
├── frontend/             # React + Vite + TailwindCSS dashboard
│   ├── src/
│   │   ├── App.jsx       # Main layout with three-column design
│   │   ├── hooks/
│   │   │   ├── useDashboard.js # Data fetching and state management
│   │   │   └── useWebSocket.js # Real-time WebSocket updates
│   │   └── components/
│   │       ├── Header.jsx      # Header with connection status
│   │       ├── TeamList.jsx    # Teams list with search
│   │       ├── MemberList.jsx  # Team members with status
│   │       └── MemberDetail.jsx # Member details with tabs (Overview/Tasks/Messages/Config)
│   └── package.json
├── package.json          # Root scripts for running both services
└── ARCHITECTURE.md       # Detailed system design document
```

See [ARCHITECTURE.md](references/ARCHITECTURE.md) for detailed system design.

## API Reference

All endpoints are prefixed with `/api`.

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/status` | Health check with summary stats |
| `GET` | `/api/teams` | List all discovered teams |
| `GET` | `/api/teams/:name` | Team detail (members, config) |
| `GET` | `/api/teams/:name/tasks` | List tasks for a team |
| `GET` | `/api/teams/:name/tasks/:id` | Single task detail |
| `GET` | `/api/teams/:name/messages` | All inbox messages for a team |
| `GET` | `/api/teams/:name/messages/:agent` | Specific agent's inbox |
| `GET` | `/api/debug/sessions` | List debug session files |
| `GET` | `/api/debug/sessions/:id` | Debug log content |
| `GET` | `/api/debug/sessions/:id/tail` | Last N lines of debug log |
| `GET` | `/api/dashboard` | Aggregated data (teams + tasks + messages) |
| `GET` | `/api/events` | Server-Sent Events stream |

### WebSocket

Connect to `ws://localhost:3001/ws` for real-time updates.

**Server events:**
- `team:config` / `team:updated` -- Team configuration changed
- `team:inbox` / `message:new` -- New agent message
- `task:update` / `task:updated` -- Task status changed
- `debug:update` / `debug:line` -- New debug log output

**Client commands:**
```json
{ "type": "subscribe", "channels": ["team:my-team", "tasks:my-team"] }
{ "type": "unsubscribe", "channels": ["team:my-team"] }
{ "type": "watch_debug", "sessionId": "uuid-here" }
{ "type": "unwatch_debug", "sessionId": "uuid-here" }
```

See [api-reference.md](references/api-reference.md) for complete API documentation.

## Data Sources

The dashboard reads from `~/.claude/`:

| Path | Content |
|------|---------|
| `teams/{name}/config.json` | Team configuration and member list (including prompt, cwd, backendType) |
| `teams/{name}/inboxes/{agent}.json` | Agent message inbox |
| `tasks/{name}/{id}.json` | Task definitions with status and dependencies |
| `debug/{session-id}.txt` | Timestamped debug log output |

### Team Config Data Model

```json
{
  "name": "family-order-system",
  "description": "家庭版点餐工具开发团队",
  "createdAt": 1771181548614,
  "leadAgentId": "team-lead@family-order-system",
  "leadSessionId": "uuid-here",
  "members": [
    {
      "agentId": "pm@family-order-system",
      "name": "pm",
      "agentType": "general-purpose",
      "model": "claude-opus-4-6",
      "prompt": "你是家庭版点餐工具的产品经理...",
      "color": "blue",
      "planModeRequired": false,
      "joinedAt": 1771181565938,
      "tmuxPaneId": "in-process",
      "cwd": "/Users/lixinjun/project",
      "subscriptions": [],
      "backendType": "in-process"
    }
  ]
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |

The frontend dev server runs on port 5173 and proxies `/api` and `/ws` to the backend. In production, the backend serves the frontend build directly.

## Troubleshooting

### Port Already in Use

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

- **assets/project-template**: Complete dashboard application (copy this to start)
- **references/ARCHITECTURE.md**: Detailed system architecture
- **references/api-reference.md**: Complete API documentation
- **scripts/setup.sh**: Automated dependency installation

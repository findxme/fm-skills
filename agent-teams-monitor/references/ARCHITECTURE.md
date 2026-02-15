# Agent Teams Log Monitoring Dashboard - System Architecture

## 1. Data Source Analysis

### Log File Locations

All Agent Teams data lives under `~/.claude/`:

| Path | Description | Format |
|------|-------------|--------|
| `~/.claude/teams/{team-name}/config.json` | Team configuration: name, members, models, roles | JSON |
| `~/.claude/teams/{team-name}/inboxes/{agent-name}.json` | Message inbox per agent: inter-agent messages | JSON array |
| `~/.claude/tasks/{team-name}/{id}.json` | Task definitions: subject, description, status, blocks/blockedBy | JSON |
| `~/.claude/tasks/{team-name}/.lock` | Lock file for task concurrency | Empty file |
| `~/.claude/debug/{session-id}.txt` | Debug/session logs: timestamped log lines | Plain text |
| `~/.claude/todos/{agent-id}.json` | Per-agent todo lists | JSON |
| `~/.claude/history.jsonl` | Global command/prompt history | JSON Lines |

### Data Models (from file analysis)

#### Team Config (`config.json`)
```json
{
  "name": "string",
  "description": "string",
  "createdAt": "number (epoch ms)",
  "leadAgentId": "string (agentId@teamName)",
  "leadSessionId": "string (UUID)",
  "members": [
    {
      "agentId": "string (name@teamName)",
      "name": "string",
      "agentType": "team-lead | general-purpose",
      "model": "string (e.g. claude-opus-4-6)",
      "prompt": "string (optional, agent instructions)",
      "color": "string (optional)",
      "planModeRequired": "boolean",
      "joinedAt": "number (epoch ms)",
      "tmuxPaneId": "string",
      "cwd": "string (working directory)",
      "subscriptions": "array",
      "backendType": "in-process | tmux (optional)",
      "isActive": "boolean (optional)"
    }
  ]
}
```

#### Task (`{id}.json`)
```json
{
  "id": "string",
  "subject": "string",
  "description": "string",
  "activeForm": "string (present-tense verb phrase)",
  "owner": "string (agent name, optional)",
  "status": "pending | in_progress | completed",
  "blocks": ["string (task IDs)"],
  "blockedBy": ["string (task IDs)"],
  "metadata": { "_internal": true }
}
```

#### Inbox Message (`inboxes/{agent}.json`)
```json
[
  {
    "from": "string (agent name)",
    "text": "string (may be JSON-encoded structured message)",
    "timestamp": "string (ISO 8601)",
    "color": "string (optional)",
    "read": "boolean"
  }
]
```

Structured message types within `text` field (JSON-encoded):
- `task_assignment` - task assignment notification
- `mode_set_request` - mode change request (plan, acceptEdits, default)
- `shutdown_request` / `shutdown_response` - agent lifecycle
- Plain text messages

#### Debug Log (`debug/{session-id}.txt`)
```
2026-02-15T16:14:38.403Z [DEBUG] [init] configureGlobalMTLS starting
2026-02-15T16:14:38.404Z [ERROR] MCP server "11" Connection failed: spawn Npc ENOENT
```
Format: `{ISO timestamp} [{LEVEL}] [{component}] {message}`
Levels: DEBUG, ERROR, INFO, WARN

---

## 2. Tech Stack

### Backend
- **Runtime**: Node.js v22 (already installed)
- **Framework**: Express.js
- **File watching**: `chokidar` (cross-platform fs watcher)
- **WebSocket**: `ws` library (native WebSocket server)
- **Utilities**: `glob` for file discovery

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS v4
- **State management**: React hooks + context (lightweight, no Redux needed)
- **WebSocket client**: Native browser WebSocket API
- **Icons**: Lucide React

### Real-time Strategy
- **WebSocket** for bidirectional real-time communication
- Backend watches file system changes and pushes updates to connected clients
- Client subscribes to specific teams/tasks for filtered updates

---

## 3. API Design

### REST Endpoints

#### Teams
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/teams` | List all teams |
| `GET` | `/api/teams/:teamName` | Get team config (members, description) |
| `GET` | `/api/teams/:teamName/messages` | Get all inbox messages for a team |
| `GET` | `/api/teams/:teamName/messages/:agentName` | Get inbox for specific agent |

#### Tasks
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/teams/:teamName/tasks` | List all tasks for a team |
| `GET` | `/api/teams/:teamName/tasks/:taskId` | Get specific task details |

#### Debug Logs
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/debug/sessions` | List all debug session files |
| `GET` | `/api/debug/sessions/:sessionId` | Get debug log content (with pagination) |
| `GET` | `/api/debug/sessions/:sessionId/tail` | Get last N lines of a debug log |

#### System
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/status` | Health check + summary stats |

### WebSocket Events

Connection: `ws://localhost:3001/ws`

#### Server -> Client Events
```json
{ "type": "team:updated", "team": "team-name", "data": { ... } }
{ "type": "task:updated", "team": "team-name", "taskId": "1", "data": { ... } }
{ "type": "message:new", "team": "team-name", "agent": "agent-name", "data": { ... } }
{ "type": "debug:line", "sessionId": "uuid", "line": "..." }
```

#### Client -> Server Events
```json
{ "type": "subscribe", "channels": ["team:agent-log-monitor", "tasks:agent-log-monitor"] }
{ "type": "unsubscribe", "channels": ["team:agent-log-monitor"] }
```

---

## 4. Project Structure

```
agents-225ea54532/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js          # Entry point, Express + WS setup
│   │   ├── routes/
│   │   │   ├── teams.js       # /api/teams routes
│   │   │   ├── tasks.js       # /api/teams/:team/tasks routes
│   │   │   └── debug.js       # /api/debug routes
│   │   ├── services/
│   │   │   ├── fileWatcher.js # chokidar-based file system watcher
│   │   │   ├── teamService.js # Read/parse team configs
│   │   │   ├── taskService.js # Read/parse task files
│   │   │   └── debugService.js# Read/parse debug logs
│   │   └── ws/
│   │       └── handler.js     # WebSocket connection + event handler
│   └── .env                   # CLAUDE_DIR path config
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx        # Team list + navigation
│   │   │   ├── TeamOverview.jsx    # Team summary with members
│   │   │   ├── TaskBoard.jsx       # Task list with status/deps
│   │   │   ├── MessageFeed.jsx     # Agent message timeline
│   │   │   ├── DebugLogViewer.jsx  # Scrollable log viewer
│   │   │   ├── AgentCard.jsx       # Individual agent info
│   │   │   └── StatusBadge.jsx     # Status indicators
│   │   └── utils/
│   │       └── api.js             # REST API client
│   └── public/
└── ARCHITECTURE.md
```

---

## 5. UI/UX Layout

### Page Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Agent Teams Monitor"              [Status] [Settings]  │
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│ Sidebar  │  Main Content Area                                    │
│          │                                                       │
│ Teams:   │  ┌─────────────────────────────────────────────────┐  │
│ ● team-1 │  │  Team Overview                                  │  │
│ ○ team-2 │  │  Name / Description / Created                   │  │
│ ○ team-3 │  │  Members: [AgentCard] [AgentCard] [AgentCard]   │  │
│          │  └─────────────────────────────────────────────────┘  │
│ ──────── │                                                       │
│          │  ┌──────────────────┐  ┌────────────────────────────┐ │
│ Filters: │  │  Task Board      │  │  Message Feed              │ │
│ Status   │  │  ┌────────────┐  │  │  [timestamp] agent: msg    │ │
│ Agent    │  │  │ Task #1    │  │  │  [timestamp] agent: msg    │ │
│ Search   │  │  │ ● active   │  │  │  [timestamp] agent: msg    │ │
│          │  │  │ blocks: 2,3│  │  │                            │ │
│          │  │  └────────────┘  │  │                            │ │
│          │  │  ┌────────────┐  │  │                            │ │
│          │  │  │ Task #2    │  │  │                            │ │
│          │  │  │ ○ pending  │  │  │                            │ │
│          │  │  │ blocked: 1 │  │  │                            │ │
│          │  │  └────────────┘  │  │                            │ │
│          │  └──────────────────┘  └────────────────────────────┘ │
│          │                                                       │
│          │  ┌─────────────────────────────────────────────────┐  │
│          │  │  Debug Log Viewer                [auto-scroll]  │  │
│          │  │  2026-02-15T16:14:38 [DEBUG] init starting      │  │
│          │  │  2026-02-15T16:14:38 [ERROR] MCP failed         │  │
│          │  │  ...                                             │  │
│          │  └─────────────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────────────┘
```

### Key UI Features

1. **Sidebar** - List of discovered teams with active/inactive indicators
2. **Team Overview** - Shows team name, description, member cards with roles, models, and status colors
3. **Task Board** - Visual task list showing dependencies (blocks/blockedBy), status badges (pending/in_progress/completed), and owner assignments
4. **Message Feed** - Real-time chronological message stream from agent inboxes, with color coding by agent
5. **Debug Log Viewer** - Tail-style log viewer with auto-scroll, level filtering (DEBUG/ERROR/INFO/WARN), and text search
6. **Status Indicators** - WebSocket connection status, last update timestamp, file watcher health

### Color Scheme
- Agent colors from config (blue, green, yellow, etc.)
- Status: pending=gray, in_progress=amber, completed=green
- Log levels: DEBUG=gray, INFO=blue, WARN=amber, ERROR=red
- Dark theme with light theme toggle

---

## 6. Configuration

### Environment Variables (Backend)
```
PORT=3001
WS_PORT=3001          # Same server, upgrade path
CLAUDE_DIR=~/.claude   # Base directory for all data
POLL_INTERVAL=1000     # Fallback polling interval (ms)
```

### Vite Proxy (Frontend Dev)
```js
// vite.config.js
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': { target: 'ws://localhost:3001', ws: true }
    }
  }
}
```

---

## 7. Key Technical Decisions

1. **WebSocket over SSE**: Chosen for bidirectional communication (subscribe/unsubscribe to channels), lower overhead for high-frequency debug log streaming
2. **chokidar over fs.watch**: More reliable cross-platform file watching, handles edge cases with macOS FSEvents
3. **No database**: Read directly from Claude's JSON files on disk - the source of truth is the file system itself
4. **Express over Fastify/Koa**: Familiar, well-documented, sufficient for this use case
5. **Single WebSocket endpoint**: Multiplex different event types over one connection with channel-based subscriptions
6. **Pagination for debug logs**: Debug files can be multi-MB; stream/paginate rather than loading entirely

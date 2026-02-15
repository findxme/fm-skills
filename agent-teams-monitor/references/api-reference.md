# API Reference

This document provides detailed information about the backend REST API and WebSocket interface.

## REST API Endpoints

All endpoints are prefixed with `/api`.

### Status & Health

#### `GET /api/status`
Health check with summary statistics.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1708056789000,
  "paths": { "teams": "...", "tasks": "...", "debug": "..." },
  "teamCount": 3,
  "teams": ["team-a", "team-b", "team-c"]
}
```

### Teams

#### `GET /api/teams`
List all discovered teams.

**Response:**
```json
[
  {
    "name": "my-team",
    "memberCount": 3,
    "taskCount": 5,
    "description": "Team description"
  }
]
```

#### `GET /api/teams/:teamName`
Get team details including members and configuration.

**Response:**
```json
{
  "name": "my-team",
  "description": "Team description",
  "members": [
    {
      "name": "agent-1",
      "agentId": "uuid",
      "agentType": "general-purpose",
      "model": "claude-sonnet-4.5"
    }
  ],
  "leadSessionId": "uuid"
}
```

### Tasks

#### `GET /api/teams/:teamName/tasks`
List all tasks for a team.

**Response:**
```json
[
  {
    "id": "1",
    "subject": "Task title",
    "description": "Task description",
    "status": "in_progress",
    "owner": "agent-1",
    "blockedBy": []
  }
]
```

#### `GET /api/teams/:teamName/tasks/:taskId`
Get a specific task by ID.

**Response:**
```json
{
  "id": "1",
  "subject": "Task title",
  "description": "Task description",
  "status": "completed",
  "owner": "agent-1",
  "blockedBy": []
}
```

### Messages

#### `GET /api/teams/:teamName/messages`
List all inbox messages for all agents in a team.

**Response:**
```json
{
  "agent-1": [
    {
      "from": "team-lead",
      "to": "agent-1",
      "text": "Message content",
      "timestamp": "2026-02-15T12:00:00Z"
    }
  ]
}
```

#### `GET /api/teams/:teamName/messages/:agentName`
Get inbox messages for a specific agent.

**Response:**
```json
[
  {
    "from": "team-lead",
    "text": "Message content",
    "timestamp": "2026-02-15T12:00:00Z",
    "read": false
  }
]
```

### Agent Control

#### `POST /api/teams/:teamName/agents/:agentName/message`
Send a custom message to an agent's inbox.

**Request Body:**
```json
{
  "message": {
    "text": "Your message here"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to agent"
}
```

#### `POST /api/teams/:teamName/agents/:agentName/shutdown`
Send a shutdown request to an agent.

**Response:**
```json
{
  "success": true,
  "message": "Shutdown request sent to agent"
}
```

#### `POST /api/teams/:teamName/agents/:agentName/control`
Control agent execution (pause/resume/restart).

**Request Body:**
```json
{
  "action": "pause"  // or "resume" or "restart"
}
```

**Response:**
```json
{
  "success": true,
  "message": "pause request sent to agent"
}
```

### Debug Logs

#### `GET /api/debug/sessions`
List all debug session files.

**Response:**
```json
[
  {
    "sessionId": "uuid",
    "path": "/path/to/debug/file.txt",
    "size": 12345,
    "modified": 1708056789000
  }
]
```

#### `GET /api/debug/sessions/:sessionId?lines=N`
Get debug log content.

**Query Parameters:**
- `lines` (optional): Number of lines to retrieve (default: 500)

**Response:**
```json
{
  "sessionId": "uuid",
  "lines": [
    "[2026-02-15T12:00:00Z] Log message"
  ]
}
```

#### `GET /api/debug/sessions/:sessionId/tail?lines=N`
Get last N lines of debug log.

**Query Parameters:**
- `lines` (optional): Number of lines to retrieve (default: 50)

### Dashboard Aggregation

#### `GET /api/dashboard`
Get aggregated dashboard data (teams + tasks + messages).

**Response:**
```json
[
  {
    "name": "my-team",
    "members": [...],
    "tasks": [...],
    "messageCount": 5,
    "leadSessionId": "uuid"
  }
]
```

## WebSocket Interface

Connect to `ws://localhost:3001/ws` for real-time updates.

### Server Events

**Team events:**
- `team:config` - Team configuration changed
- `team:updated` - Team configuration updated
- `team:inbox` - Team inbox updated

**Message events:**
- `message:new` - New message received

**Task events:**
- `task:update` - Task status changed
- `task:updated` - Task updated

**Debug events:**
- `debug:update` - Debug log updated
- `debug:line` - New debug log line

### Client Commands

**Subscribe to channels:**
```json
{
  "type": "subscribe",
  "channels": ["team:my-team", "tasks:my-team"]
}
```

**Unsubscribe from channels:**
```json
{
  "type": "unsubscribe",
  "channels": ["team:my-team"]
}
```

**Watch debug session:**
```json
{
  "type": "watch_debug",
  "sessionId": "uuid-here"
}
```

**Unwatch debug session:**
```json
{
  "type": "unwatch_debug",
  "sessionId": "uuid-here"
}
```

## Data Sources

The backend reads from `~/.claude/`:

| Path | Content |
|------|---------|
| `teams/{name}/config.json` | Team configuration and member list |
| `teams/{name}/inboxes/{agent}.json` | Agent message inbox |
| `tasks/{name}/{id}.json` | Task definitions with status and dependencies |
| `debug/{session-id}.txt` | Timestamped debug log output |

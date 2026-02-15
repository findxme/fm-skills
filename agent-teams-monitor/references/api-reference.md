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

### Dashboard Aggregation

#### `GET /api/dashboard`
Get aggregated dashboard data (teams + tasks + messages).

**Response:**
```json
[
  {
    "name": "my-team",
    "description": "Team description",
    "createdAt": 1771181548614,
    "leadAgentId": "team-lead@my-team",
    "leadSessionId": "uuid-here",
    "members": [
      {
        "agentId": "pm@my-team",
        "name": "pm",
        "agentType": "general-purpose",
        "model": "claude-opus-4-6",
        "prompt": "Product manager prompt...",
        "color": "blue",
        "planModeRequired": false,
        "joinedAt": 1771181565938,
        "tmuxPaneId": "in-process",
        "cwd": "/Users/path/to/project",
        "subscriptions": [],
        "backendType": "in-process"
      }
    ],
    "memberCount": 4,
    "tasks": [],
    "messageCount": 0
  }
]
```

### Teams

#### `GET /api/teams`
List all discovered teams with summary info.

**Response:**
```json
[
  {
    "name": "my-team",
    "description": "Team description",
    "createdAt": 1771181548614,
    "leadAgentId": "team-lead@my-team",
    "leadSessionId": "uuid-here",
    "members": [...],
    "memberCount": 4
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
  "createdAt": 1771181548614,
  "leadAgentId": "team-lead@my-team",
  "leadSessionId": "uuid-here",
  "members": [
    {
      "agentId": "pm@my-team",
      "name": "pm",
      "agentType": "general-purpose",
      "model": "claude-opus-4-6",
      "color": "blue",
      "joinedAt": 1771181565938,
      "cwd": "/Users/path/to/project",
      "backendType": "in-process",
      "prompt": "Product manager prompt...",
      "tmuxPaneId": "in-process",
      "subscriptions": [],
      "planModeRequired": false
    }
  ]
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
    "activeForm": "Working on task",
    "owner": "agent-1",
    "status": "in_progress",
    "blocks": [],
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
  "activeForm": "Working on task",
  "owner": "agent-1",
  "status": "completed",
  "blocks": [],
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
      "timestamp": "2026-02-15T12:00:00Z",
      "summary": "Brief summary"
    }
  ],
  "agent-2": [...]
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
    "summary": "Brief summary",
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
Control agent execution (pause/resume).

**Request Body:**
```json
{
  "action": "pause"  // or "resume"
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
    "size": 12345,
    "modifiedAt": 1708056789000
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
  "totalLines": 1000,
  "lines": ["[2026-02-15T12:00:00Z] Log message"],
  "truncated": true
}
```

#### `GET /api/debug/sessions/:sessionId/tail?lines=N`
Get last N lines of debug log.

**Query Parameters:**
- `lines` (optional): Number of lines to retrieve (default: 50)

**Response:**
```json
{
  "sessionId": "uuid",
  "lines": ["[2026-02-15T12:00:00Z] Log message"]
}
```

### Server-Sent Events

#### `GET /api/events`
Server-Sent Events stream for real-time updates.

**Event Types:**
- `team:updated` - Team configuration changed
- `task:updated` - Task status changed
- `message:new` - New message received
- `debug:line` - New debug log line

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

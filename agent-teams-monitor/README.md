# Agent Teams Monitor

A real-time web dashboard for monitoring Claude Agent Teams activity.

## Features

- **Real-time Dashboard** - Monitor teams, members, tasks, and messages
- **Three-Column Layout** - Teams | Members | Member Details
- **Config Tab** - View full member configuration (prompt, cwd, backendType, etc.)
- **Agent Control** - Pause, resume, or shutdown agents
- **WebSocket Updates** - Live data refresh

## Quick Start

```bash
# Copy the project template
cp -r assets/project-template /path/to/destination
cd /path/to/destination

# Install dependencies
npm run install:all

# Start development server
npm run dev
```

Access at http://localhost:5173

## Resources

- [SKILL.md](SKILL.md) - Full skill documentation
- [references/ARCHITECTURE.md](references/ARCHITECTURE.md) - System architecture
- [references/api-reference.md](references/api-reference.md) - API documentation

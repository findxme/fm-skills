# FM Skills

A collection of Claude skills for various domains and tasks.

## Available Skills

### agent-teams-monitor

Real-time web dashboard for monitoring Claude Agent Teams activity.

**Features:**
- Monitor teams, members, tasks, and messages
- Three-column layout: Teams | Members | Member Details
- Config tab showing prompt, cwd, backendType
- Agent control (pause/resume/shutdown)

**Install:**
```bash
cp -r agent-teams-monitor/assets/project-template /path/to/destination
cd /path/to/destination
npm run install:all
npm run dev
```

**Docs:** [agent-teams-monitor/README.md](agent-teams-monitor/README.md)

---

## Skill Structure

Each skill follows this structure:

```
skill-name/
├── SKILL.md           # Main documentation
├── README.md         # Quick reference
├── references/       # Detailed docs (API, architecture)
├── scripts/          # Setup scripts
└── assets/           # Project templates, configs
```

## Adding New Skills

1. Create skill folder with SKILL.md
2. Add README.md with quick start
3. Include project templates in assets/
4. Add setup scripts in scripts/

## License

MIT

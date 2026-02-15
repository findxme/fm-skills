# fm-skills

我的 Claude Code Skills 集合。

## Skills 列表

<!-- SKILLS_LIST_START -->
| Skill | 描述 |
|-------|------|
| [agent-teams-monitor](./agent-teams-monitor) | 实时 Web 仪表板，用于监控 Claude Agent Teams 活动 |
<!-- SKILLS_LIST_END -->

---

## 安装 Skills

从本仓库安装：
```bash
npx skills add findxme/fm-skills@<skill-name> -g -y
```

例如安装 agent-teams-monitor：
```bash
npx skills add findxme/fm-skills@agent-teams-monitor -g -y
```

## 添加新 Skill

在对应目录添加新 skill：
```
fm-skills/
├── README.md
├── agent-teams-monitor/
│   ├── SKILL.md
│   └── ...
└── new-skill/
    ├── SKILL.md
    └── ...
```

添加后更新本 README 的表格即可。

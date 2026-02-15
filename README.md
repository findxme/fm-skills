# fm-skills

我的 Claude Code Skills 集合。

## Skills 列表

### agent-teams-monitor

实时 Web 仪表板，用于监控 Claude Agent Teams 活动。

**功能：**
- 实时监控团队、成员、任务和消息
- 可视化 Agent 活动状态（在线/空闲/离线）
- 支持控制 Agent（暂停/恢复/关闭）
- WebSocket 实时更新
- 三列布局：团队列表 → 成员列表 → 详情面板

**快速开始：**
```bash
cd agent-teams-monitor
cp -r assets/project-template /path/to/destination
cd /path/to/destination
npm run install:all
npm run dev
```

**访问：**
- 前端：http://localhost:5173
- 后端 API：http://localhost:3001

---

## 安装 Skills

从本仓库安装：
```bash
npx skills add findxme/fm-skills@agent-teams-monitor -g -y
```

## 添加新 Skill

在对应目录添加新 skill：
```
fm-skills/
├── agent-teams-monitor/
│   ├── SKILL.md
│   ├── assets/
│   ├── references/
│   └── scripts/
└── new-skill/
    ├── SKILL.md
    └── ...
```

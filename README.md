# FM Skills

Claude 技能集合，用于各种领域和任务。

## 可用技能

| 技能名称 | 描述 | 安装命令 |
|---------|------|---------|
| [agent-teams-monitor](./agent-teams-monitor) | Claude Agent Teams 实时监控仪表板 | `npx skills add findxme/fm-skills@agent-teams-monitor` |

## 安装技能

```bash
# 安装指定技能
npx skills add findxme/fm-skills@<skill-name>

# 示例：安装 agent-teams-monitor
npx skills add findxme/fm-skills@agent-teams-monitor
```

## 技能列表

### agent-teams-monitor

Claude Agent Teams 实时监控仪表板。

**功能特性：**
- 监控团队、成员、任务和消息
- 三栏布局：团队列表 | 成员列表 | 成员详情
- 配置标签页显示 prompt、cwd、backendType 等
- 代理控制（暂停/恢复/关闭）
- WebSocket 实时更新

**使用方式：**

```bash
# 复制项目模板
cp -r $(claude config get SKILLS_DIR)/agent-teams-monitor/assets/project-template /path/to/destination
cd /path/to/destination

# 安装依赖
npm run install:all

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看仪表板。

**文档：**
- [README.md](agent-teams-monitor/README.md) - 快速开始
- [agent-teams-monitor/SKILL.md](agent-teams-monitor/SKILL.md) - 完整文档
- [agent-teams-monitor/references/ARCHITECTURE.md](agent-teams-monitor/references/ARCHITECTURE.md) - 系统架构
- [agent-teams-monitor/references/api-reference.md](agent-teams-monitor/references/api-reference.md) - API 文档

---

## 技能结构

每个技能遵循以下结构：

```
skill-name/
├── SKILL.md           # 主文档（Claude 触发）
├── README.md         # 快速参考（中文说明）
├── references/       # 详细文档（架构、API）
├── scripts/          # 安装脚本
└── assets/           # 项目模板
```

## 添加新技能

1. 创建技能文件夹，包含 SKILL.md
2. 添加 README.md（中文快速开始）
3. 在 assets/ 中包含项目模板
4. 在 scripts/ 中添加安装脚本
5. 更新本 README.md 添加技能说明

## License

MIT

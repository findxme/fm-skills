# Agent Teams Monitor

Claude Agent Teams 实时监控仪表板。

## 功能特性

- **实时仪表板** - 监控团队、成员、任务和消息
- **三栏布局** - 团队列表 | 成员列表 | 成员详情
- **配置标签页** - 显示 prompt、cwd、backendType 等完整配置
- **代理控制** - 暂停、恢复或关闭代理
- **WebSocket 更新** - 实时数据刷新

## 快速开始

```bash
# 复制项目模板
cp -r assets/project-template /path/to/destination
cd /path/to/destination

# 安装依赖
npm run install:all

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看仪表板。

## 相关资源

- [SKILL.md](SKILL.md) - 完整文档（英文）
- [references/ARCHITECTURE.md](references/ARCHITECTURE.md) - 系统架构
- [references/api-reference.md](references/api-reference.md) - API 文档

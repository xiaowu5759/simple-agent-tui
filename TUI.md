# TUI (Terminal User Interface) Architecture

基于 unblessed 实现的现代化 TUI 界面，参考 OpenCode 架构设计。

## 架构概览

```
src/tui/
├── app.ts              # TUI 主应用程序
├── theme.ts            # 主题管理系统
├── index.ts            # 模块导出
└── components/         # 可复用组件
    ├── status-panel.ts   # 状态显示面板
    ├── help-panel.ts     # 帮助对话框
    └── index.ts        # 组件导出
```

## 核心模块

### TUIApplication (app.ts)
主应用类，负责：
- 初始化 unblessed 屏幕
- 创建布局（header、sidebar、messages、input、footer）
- 管理消息输入和显示
- 处理键盘事件
- 集成 Agent 对话系统

### ThemeManager (theme.ts)
主题管理系统，支持：
- 多种预设主题（default、dark、dracula、nord、tokyonight）
- 主题切换和循环
- 颜色方案管理

## 组件库

### StatusPanel
实时状态显示组件：
- 就绪状态
- 思考中状态
- 错误提示
- 进度条

### HelpPanel
快捷键帮助对话框：
- 快捷键列表
- 动态添加快捷键
- 键盘导航支持

## 快捷键

| 快捷键 | 功能 |
|---------|------|
| Ctrl+C | 退出应用 |
| Ctrl+L | 清除历史 |
| Enter | 发送消息 |
| Ctrl+T | 切换主题 |
| Ctrl+H | 显示帮助 |
| Esc | 关闭对话框 |

## 使用示例

```typescript
import { TUIApplication } from './tui';

const app = new TUIApplication({
  title: '🤖 AI Agent TUI',
});

app.start();
```

## 扩展指南

### 添加新组件

1. 在 `src/tui/components/` 创建新组件文件
2. 继承或组合 unblessed 基础组件
3. 实现必要的生命周期方法
4. 在 `components/index.ts` 中导出

### 添加新主题

在 `theme.ts` 的 `initializeThemes()` 中添加：

```typescript
this.themes.set('mytheme', {
  name: 'mytheme',
  colors: {
    fg: '#f8f8f2',
    bg: '#282a36',
    headerBg: '#44475a',
    footerBg: '#44475a',
    borderColor: '#bd93f9',
    scrollbarFg: '#bd93f9',
    scrollbarBg: '#282a36',
  },
});
```

## 技术特性

- ✅ 响应式布局
- ✅ 主题系统
- ✅ 键盘快捷键
- ✅ 鼠标支持
- ✅ 滚动条
- ✅ 实时状态更新
- ✅ 消息历史管理
- ✅ 错误处理

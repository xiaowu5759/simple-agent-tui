# TUI Demo

这是一个演示如何使用 AI Agent TUI 界面的示例。

## 运行方式

确保你已经配置好 `.env` 文件，然后运行：

```bash
# 使用 ts-node 直接运行
ts-node src/tui-demo.ts

# 或者先编译再运行
npm run build
node dist/tui-demo.js
```

## 功能演示

在 TUI 界面中，你可以：

1. **发送消息**：在输入框中输入问题，按 Enter 发送
2. **查看响应**：Agent 的响应会实时显示在消息列表中
3. **使用工具**：Agent 可以自动调用 Calculator 和 Weather 工具
4. **切换主题**：按 Ctrl+T 在不同主题间切换
5. **查看帮助**：按 Ctrl+H 显示快捷键帮助
6. **清空历史**：按 Ctrl+L 清空对话历史
7. **退出应用**：按 Ctrl+C 退出

## 示例问题

试试这些问题来测试 Agent 的工具调用能力：

- "What is 15 * 23?"
- "Calculate 100 + 200"
- "What's the weather in Tokyo?"
- "Calculate the square root of 144"
- "What is 2^10?"

## 界面说明

- **顶部**：应用标题
- **左侧边栏**：快捷键提示和可用工具列表
- **中间区域**：对话消息历史
- **底部输入框**：输入你的问题
- **底部状态栏**：操作提示

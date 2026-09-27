import { setRuntime } from '@unblessed/core';
import { NodeRuntime, Screen, Box, Textarea, List } from '@unblessed/node';
import { Agent } from '../agent';
import { createLLM } from '../llm';
import { CalculatorTool, WeatherTool } from '../tools';
import { loadConfig } from '../config/config';
import { ThemeManager } from './theme';
import { createSilentLogger, type LogCallback } from '../utils/logger';

setRuntime(new NodeRuntime());

export interface TUIConfig {
  width?: number | string;
  height?: number | string;
  title?: string;
}

export class TUIApplication {
  private screen: Screen;
  private theme: ThemeManager;
  private agent: Agent;
  private messageList: List;
  private inputArea: Textarea;
  private header: Box;
  private footer: Box;
  private sidebar: Box;
  private messages: Array<{ role: string; content: string }> = [];
  private listItems: string[] = [];
  private pendingLogs: Array<{ level: string; message: string; meta: unknown[] }> = [];
  private isLayoutReady: boolean = false;

  constructor(config: TUIConfig = {}) {
    this.screen = new Screen({
      smartCSR: true,
      title: config.title || 'AI Agent TUI',
    });

    this.theme = new ThemeManager();
    this.createLayout();
    this.initializeAgent();
    this.setupEventHandlers();
    this.flushPendingLogs();
  }

  private initializeAgent(): void {
    const config = loadConfig();
    const silentLogger = createSilentLogger((level, message, meta) => {
      this.displayLog(level, message, meta);
    });
    
    const llm = createLLM({
      ...config.llm,
      logger: silentLogger as any,
    });

    this.agent = new Agent(llm, {
      systemPrompt: 'You are a helpful assistant that can use tools to answer questions.',
      logger: silentLogger as any,
    });

    this.agent.addTool(new CalculatorTool());
    this.agent.addTool(new WeatherTool());
  }

  private createLayout(): void {
    const theme = this.theme.getCurrentTheme();

    this.header = new Box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '{center}{bold}🤖 AI Agent TUI{/bold}{/center}',
      tags: true,
      style: {
        fg: 'white',
        bg: theme.colors.headerBg,
      },
    });

    this.sidebar = new Box({
      parent: this.screen,
      top: 3,
      left: 0,
      width: 25,
      height: '100%-6',
      border: { type: 'line' },
      label: ' Info ',
      style: {
        border: { fg: theme.colors.borderColor },
        fg: theme.colors.fg,
      },
      content: [
        '',
        ' {bold}Shortcuts{/bold}',
        '─────────────',
        ' Ctrl+C: Quit',
        ' Ctrl+L: Clear',
        ' Enter: Send',
        '',
        ' {bold}Tools{/bold}',
        '─────────────',
        ' • Calculator',
        ' • Weather',
      ].join('\n'),
      tags: true,
    });

    this.messageList = new List({
      parent: this.screen,
      top: 3,
      left: 25,
      width: '100%-25',
      height: '100%-8',
      border: { type: 'line' },
      label: ' Messages ',
      style: {
        border: { fg: theme.colors.borderColor },
        fg: theme.colors.fg,
      },
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      mouse: true,
      scrollbar: {
        ch: '│',
        style: { fg: theme.colors.scrollbarFg, bg: theme.colors.scrollbarBg },
      },
    });
    
    this.listItems = ['{center}Welcome to AI Agent TUI!{/center}'];
    this.messageList.setItems(this.listItems);

    this.inputArea = new Textarea({
      parent: this.screen,
      bottom: 3,
      left: 25,
      width: '100%-25',
      height: 3,
      border: { type: 'line' },
      label: ' Input ',
      style: {
        border: { fg: theme.colors.borderColor },
        fg: theme.colors.fg,
      },
      inputOnFocus: true,
      keys: true,
      mouse: true,
    });

    this.footer = new Box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '{center}Press Ctrl+C to quit | Enter to send message{/center}',
      tags: true,
        style: {
        fg: 'white',
        bg: theme.colors.footerBg,
      },
    });
  }

  private setupEventHandlers(): void {
    this.inputArea.key('enter', async () => {
      const input = this.inputArea.getValue();
      if (input.trim()) {
        await this.handleUserInput(input.trim());
        this.inputArea.clearValue();
        this.inputArea.focus();
      }
    });

    this.screen.key(['C-c'], () => {
      this.destroy();
      process.exit(0);
    });

    this.screen.key('C-l', () => {
      this.agent.clearHistory();
      this.messages = [];
      this.listItems = ['{center}History cleared{/center}'];
      this.messageList.clearItems();
      this.messageList.pushItem('{center}History cleared{/center}');
      this.screen.render();
    });
  }

  private async handleUserInput(input: string): Promise<void> {
    this.addMessage('user', input);
    
    const thinkingMsg = this.addMessage('assistant', 'Thinking...');
    
    try {
      const response = await this.agent.run(input);
      this.updateLastMessage(response);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.updateLastMessage(`Error: ${errorMsg}`);
    }
  }

  private addMessage(role: string, content: string): string {
    const message = {
      role,
      content,
    };
    this.messages.push(message);
    
    const prefix = role === 'user' ? '👤 You' : '🤖 Assistant';
    const displayContent = this.truncateContent(content, 50);
    this.listItems.push(`${prefix}: ${displayContent}`);
    this.messageList.setItems(this.listItems);
    
    this.screen.render();
    return prefix;
  }

  private updateLastMessage(content: string): void {
    if (this.messages.length > 0) {
      this.messages[this.messages.length - 1].content = content;
      
      const prefix = this.messages[this.messages.length - 1].role === 'user' ? '👤 You' : '🤖 Assistant';
      const displayContent = this.truncateContent(content, 50);
      this.listItems[this.listItems.length - 1] = `${prefix}: ${displayContent}`;
      
      this.messageList.setItems(this.listItems);
      this.screen.render();
    }
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  private displayLog(level: string, message: string, meta: unknown[]): void {
    if (!this.isLayoutReady) {
      this.pendingLogs.push({ level, message, meta });
      return;
    }

    let formatted: string | undefined;
    
    if (message.includes('LLM Response')) {
      formatted = `{magenta-fg}{bold}{=repeat(50)}{/bold}{/magenta-fg}`;
    } else if (message.includes('Assistant message')) {
      formatted = `{cyan-fg}Assistant message`;
    } else if (message.includes('Tool calls detected')) {
      formatted = `{yellow-fg}Tool calls detected`;
    } else if (message.includes('Executing Tool')) {
      const toolName = message.match(/Tool: (\w+)/)?.[1] || 'unknown';
      formatted = `{yellow-fg}Executing: {bold}${toolName}{/bold}{/yellow-fg}`;
    } else if (message.includes('Tool arguments')) {
      formatted = `{yellow-fg}Arguments: ${JSON.stringify(meta[0] || {})}`;
    } else if (message.includes('Tool Result')) {
      formatted = `{green-fg}Tool result received`;
    } else if (message.includes('Result:')) {
      const result = message.replace('Result: ', '');
      formatted = `{green-fg}${this.truncateContent(result, 80)}`;
    } else if (message.includes('Agent starting')) {
      formatted = `{blue-fg}{bold}Agent starting...{/bold}`;
    } else if (message.includes('User input')) {
      const input = message.match(/User input: (.+)/)?.[1] || '';
      formatted = `{cyan-fg}{bold}You:{/bold} ${input}`;
    } else if (message.includes('Agent finished')) {
      formatted = `{green-fg}{bold}Agent finished{/bold}`;
    } else if (message.includes('Iteration')) {
      const iteration = message.match(/Iteration (\d+)/)?.[1] || '?';
      formatted = `{blue-fg}Iteration ${iteration}`;
    } else if (message.includes('Error')) {
      formatted = `{red-fg}${message}`;
    } else if (message.includes('Max iterations')) {
      formatted = `{yellow-fg}${message}`;
    }
    
    if (formatted) {
      this.listItems.push(formatted);
      this.messageList.setItems(this.listItems);
      this.screen.render();
    }
  }

  private flushPendingLogs(): void {
    this.isLayoutReady = true;
    for (const log of this.pendingLogs) {
      this.displayLog(log.level, log.message, log.meta);
    }
    this.pendingLogs = [];
  }

  public start(): void {
    this.inputArea.focus();
    this.screen.render();
  }

  public destroy(): void {
    this.screen.destroy();
  }
}

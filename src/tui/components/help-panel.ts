import { Box, List } from '@unblessed/node';

export interface Shortcut {
  key: string;
  description: string;
}

export class HelpPanel {
  private box: Box;
  private list: List;
  private shortcuts: Shortcut[] = [
    { key: 'Ctrl+C', description: 'Quit application' },
    { key: 'Ctrl+L', description: 'Clear history' },
    { key: 'Enter', description: 'Send message' },
    { key: 'Ctrl+T', description: 'Cycle themes' },
    { key: 'Ctrl+H', description: 'Show this help' },
    { key: 'Esc', description: 'Close dialogs' },
  ];

  constructor(parent: any) {
    this.box = new Box({
      parent,
      width: '80%',
      height: '60%',
      top: 'center',
      left: 'center',
      border: { type: 'line' },
      label: ' Help ',
      style: {
        border: { fg: 'cyan' },
      },
      tags: true,
    });

    this.list = new List({
      parent: this.box,
      top: 1,
      left: 2,
      width: '100%-4',
      height: '100%-4',
      style: {
        fg: 'white',
      },
      items: this.formatShortcuts(),
      keys: true,
      mouse: true,
    });

    this.setupEvents();
  }

  private formatShortcuts(): string[] {
    return this.shortcuts.map(
      (shortcut) => 
        `{bold}{center}${shortcut.key.padEnd(20)}{/bold}{center} - ${shortcut.description}`
    );
  }

  private setupEvents(): void {
    this.list.key(['escape', 'q'], () => {
      this.hide();
    });

    this.list.on('select', () => {
      this.hide();
    });
  }

  public addShortcut(key: string, description: string): void {
    this.shortcuts.push({ key, description });
    this.list.setItems(this.formatShortcuts());
  }

  public show(): void {
    this.box.show();
    this.box.focus();
    this.list.focus();
  }

  public hide(): void {
    this.box.hide();
  }

  public toggle(): void {
    if (this.box.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public destroy(): void {
    this.box.destroy();
  }
}

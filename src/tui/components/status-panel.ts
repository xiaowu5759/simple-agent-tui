import { Box } from '@unblessed/node';

export class StatusPanel {
  private box: Box;
  private status: string = 'Ready';

  constructor(parent: any) {
    this.box = new Box({
      parent,
      width: '100%',
      height: 1,
      tags: true,
    });
    this.update();
  }

  public setStatus(status: string): void {
    this.status = status;
    this.update();
  }

  public showThinking(): void {
    this.setStatus('🤔 Thinking...');
  }

  public showReady(): void {
    this.setStatus('✓ Ready');
  }

  public showError(message: string): void {
    this.setStatus(`✗ Error: ${message}`);
  }

  public showProgress(current: number, total: number): void {
    const percent = Math.round((current / total) * 100);
    const bar = this.createProgressBar(percent);
    this.setStatus(`${bar} ${percent}%`);
  }

  private update(): void {
    this.box.setContent(
      `{bold}${this.status}{/bold}`
    );
  }

  private createProgressBar(percent: number): string {
    const width = 20;
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  public destroy(): void {
    this.box.destroy();
  }
}

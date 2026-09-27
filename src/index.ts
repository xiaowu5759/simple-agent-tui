import * as dotenv from 'dotenv';
import { TUIApplication } from './tui';

dotenv.config();

async function main() {
  const app = new TUIApplication({
    title: '🤖 AI Agent TUI',
  });

  app.start();
}

main().catch((error) => {
  console.error('Failed to start TUI:', error);
  process.exit(1);
});

import * as dotenv from 'dotenv';
import { TUIApplication } from './tui';

dotenv.config();

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 AI Agent TUI Demo');
  console.log('='.repeat(60));
  console.log('');
  console.log('Available commands:');
  console.log('  - Ctrl+C: Quit');
  console.log('  - Ctrl+L: Clear history');
  console.log('  - Ctrl+T: Cycle themes');
  console.log('  - Ctrl+H: Show help');
  console.log('  - Enter: Send message');
  console.log('');
  console.log('Starting TUI...');

  try {
    const app = new TUIApplication({
      title: '🤖 AI Agent TUI Demo',
    });

    app.start();
  } catch (error) {
    console.error('');
    console.error('❌ Failed to start TUI:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure you are running in a terminal');
    console.error('2. Check that .env file is configured');
    console.error('3. Verify LLM_API_KEY is set in .env');
    console.error('4. Ensure @unblessed/node is installed');
    console.error('');
    process.exit(1);
  }
}

main();

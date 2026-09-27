import { NodeRuntime, Screen, Box } from '@unblessed/node';
import { setRuntime } from '@unblessed/core';

setRuntime(new NodeRuntime());

const screen = new Screen({
  smartCSR: true,
  title: 'Test Screen',
});

const box = new Box({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Test Box',
  border: { type: 'line' },
});

screen.key(['q', 'escape', 'C-c'], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();

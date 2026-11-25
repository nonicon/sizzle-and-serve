// Keyboard and mouse input, kept apart from the game rules. The world reads
// a plain snapshot each step: which way the chef should walk, whether E was
// just pressed, whether E is held, and where the mouse clicked.
export function createInput(canvas) {
  const keys = new Set();
  let interactPressed = false;
  let interactHeld = false;
  let pausePressed = false;
  let click = null;
  let anyKeyPressed = false;

  const MOVE_KEYS = {
    ArrowUp: [0, -1], KeyW: [0, -1],
    ArrowDown: [0, 1], KeyS: [0, 1],
    ArrowLeft: [-1, 0], KeyA: [-1, 0],
    ArrowRight: [1, 0], KeyD: [1, 0],
  };

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (!event.repeat) {
      anyKeyPressed = true;
      if (event.code === 'KeyE' || event.code === 'Space') {
        interactPressed = true;
        interactHeld = true;
      }
      if (event.code === 'KeyP' || event.code === 'Escape') pausePressed = true;
    }
    keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
    if (event.code === 'KeyE' || event.code === 'Space') interactHeld = false;
  });
  window.addEventListener('blur', () => {
    keys.clear();
    interactHeld = false;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    click = {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
    anyKeyPressed = true;
  });

  return {
    // A fresh snapshot for this step; `pressed` flags clear after one read.
    snapshot() {
      let dx = 0;
      let dy = 0;
      for (const code of keys) {
        const move = MOVE_KEYS[code];
        if (move) { dx += move[0]; dy += move[1]; }
      }
      const out = {
        dx, dy,
        interactPressed,
        interactHeld,
        pausePressed,
        click,
        anyKeyPressed,
      };
      interactPressed = false;
      pausePressed = false;
      click = null;
      anyKeyPressed = false;
      return out;
    },
    // Feed a synthetic snapshot (used by the screenshot autopilot).
    inject(fake) {
      interactPressed = interactPressed || fake.interactPressed;
      if (fake.interactHeld !== undefined) interactHeld = fake.interactHeld;
      if (fake.click) click = fake.click;
      if (fake.keys) for (const code of fake.keys) keys.add(code);
      if (fake.releaseKeys) for (const code of fake.releaseKeys) keys.delete(code);
    },
  };
}

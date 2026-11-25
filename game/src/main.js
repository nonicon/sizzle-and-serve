// Sizzle & Serve — entry point. Runs the game loop in a browser, or stages
// one screenshot scene when the page is opened with ?shot=start|play|serve|end.
import { VIEW } from './config.js';
import { createWorld } from './world.js';
import { render } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '7');

const world = createWorld(seed);
const input = createInput(canvas);
const audio = createAudio();

const SOUND_FOR_EVENT = {
  pickup: () => audio.pickup(),
  place: () => audio.place(),
  chop: () => audio.chop(),
  chopDone: () => { audio.chop(); audio.ding(); },
  sizzle: () => audio.sizzleStart(),
  served: () => audio.served(),
  error: () => audio.error(),
  burnt: () => audio.burnt(),
  tick: () => audio.tick(),
  gameover: () => { audio.stopMusic(); audio.gameOver(); },
  start: () => audio.startMusic(),
};

function playEvents(events) {
  for (const event of events) {
    const play = SOUND_FOR_EVENT[event];
    if (play) play();
  }
}

function announce(state) {
  if (!statusEl) return;
  statusEl.textContent = `Sizzle and Serve. Coins ${state.coins}. Served ${state.served}. ${Math.ceil(state.timeLeft)} seconds left in the shift.`;
}

if (shotName) {
  // Screenshot mode: stage the scene, draw one frame, and stop. No sound.
  stageShot(shotName, world);
  render(ctx, world.state, 1.6, null);
  document.title = `Sizzle & Serve — ${shotName}`;
} else {
  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyM') {
      const muted = audio.toggleMute();
      if (statusEl) statusEl.textContent = muted ? 'Sound off.' : 'Sound on.';
    }
    audio.unlock();
  });
  window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

  let last = performance.now();
  let announcedAt = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const snapshot = input.snapshot();
    const events = world.step(dt, snapshot);
    playEvents(events);
    render(ctx, world.state, now / 1000, world.nearestStation());
    if (now - announcedAt > 5000) {
      announcedAt = now;
      announce(world.state);
    }
    requestAnimationFrame(frame);
  }
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  requestAnimationFrame(frame);
}

// Sizzle & Serve — the kitchen rules. The world owns the chef, the tickets,
// the grill, the chopping board and the plates, and nothing else: it never
// draws and never touches the network. A step takes a fixed dt and an input
// snapshot and returns the sound events that step caused.
import {
  CHEF, STATIONS, WALK, SHIFT_SECONDS, MAX_TICKETS, FIRST_ORDER_AT,
  SPAWN_EVERY_START, SPAWN_EVERY_END, PATIENCE_START, PATIENCE_END,
  CHOP_SECONDS, GRILL_PERFECT_FROM, GRILL_PERFECT_TO, GRILL_SECONDS,
  GRILL_SLOTS, PLATE_SLOTS, COIN_BASE, COIN_PER_TOPPING, TIP_MAX,
  COMBO_STEP, COMBO_MAX, STARS, INGREDIENTS, RECIPES, CUSTOMER_NAMES,
} from './config.js';
import { makeRandom } from './random.js';

let ticketId = 0;

function stationCenter(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}

function circleHitsRect(x, y, radius, rect) {
  const nearX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - nearX;
  const dy = y - nearY;
  return dx * dx + dy * dy < radius * radius;
}

function plateMatches(plateItems, recipeItems) {
  if (plateItems.length !== recipeItems.length) return false;
  const wanted = {};
  for (const kind of recipeItems) wanted[kind] = (wanted[kind] || 0) + 1;
  for (const item of plateItems) {
    if (!wanted[item.kind]) return false;
    if (item.kind === 'patty' && item.state !== 'cooked') return false;
    if (INGREDIENTS[item.kind].needsChop && item.state !== 'chopped') return false;
    wanted[item.kind] -= 1;
  }
  return true;
}

function ticketFor(recipe, customer, patience) {
  return {
    id: ticketId += 1,
    recipe,
    customer,
    patience,
    maxPatience: patience,
    state: 'waiting',
    flash: 0,
  };
}

export function createWorld(seed = 1) {
  const rng = makeRandom(seed);
  const state = freshState();

  function freshState() {
    return {
      screen: 'title',
      paused: false,
      timeLeft: SHIFT_SECONDS,
      elapsed: 0,
      coins: 0,
      served: 0,
      lost: 0,
      combo: 0,
      bestCombo: 0,
      stars: 0,
      chef: { x: 640, y: 640, facing: 1, walkPhase: 0, moving: false },
      holding: null,
      moveTarget: null,
      grill: Array.from({ length: GRILL_SLOTS }, () => ({ item: null, progress: 0 })),
      board: { item: null, progress: 0 },
      plates: Array.from({ length: PLATE_SLOTS }, () => ({ items: [] })),
      tickets: [],
      particles: [],
      floats: [],
      shake: 0,
      nextOrderIn: FIRST_ORDER_AT,
      chopping: false,
      grillBurntNotified: [false, false],
    };
  }

  function reset() {
    const keep = freshState();
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, keep);
  }

  function startShift() {
    reset();
    state.screen = 'play';
    spawnTicket();
  }

  function spawnTicket() {
    if (state.tickets.length >= MAX_TICKETS) return;
    const available = RECIPES.filter((r) => r.minAt <= state.elapsed);
    const total = available.reduce((sum, r) => sum + r.weight, 0);
    let roll = rng.next() * total;
    let recipe = available[0];
    for (const candidate of available) {
      roll -= candidate.weight;
      if (roll <= 0) { recipe = candidate; break; }
    }
    const progress = Math.min(1, state.elapsed / SHIFT_SECONDS);
    const patience = PATIENCE_START + (PATIENCE_END - PATIENCE_START) * progress;
    const customer = rng.pick(CUSTOMER_NAMES);
    state.tickets.push(ticketFor(recipe, customer, patience));
  }

  function addFloat(x, y, text, color) {
    state.floats.push({ x, y, text, color, life: 1.4 });
  }

  function burst(x, y, color, count, speed = 90) {
    for (let i = 0; i < count; i += 1) {
      const angle = rng.next() * Math.PI * 2;
      const v = speed * (0.4 + rng.next() * 0.8);
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * v, vy: Math.sin(angle) * v - 40,
        life: 0.5 + rng.next() * 0.4, maxLife: 0.9,
        color, size: 2 + rng.next() * 3,
      });
    }
  }

  function nearestStation() {
    let best = null;
    let bestDistance = CHEF.reach;
    for (const station of STATIONS) {
      const c = stationCenter(station);
      const dx = state.chef.x - c.x;
      const dy = state.chef.y - c.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDistance) { bestDistance = d; best = station; }
    }
    return best;
  }

  function freeGrillSlot() {
    return state.grill.findIndex((slot) => slot.item === null);
  }

  function grillSlotWithPatty() {
    let best = -1;
    let bestProgress = -1;
    state.grill.forEach((slot, i) => {
      if (slot.item && slot.progress > bestProgress) { bestProgress = slot.progress; best = i; }
    });
    return best;
  }

  function plateThatTakes(item) {
    for (const plate of state.plates) {
      const count = plate.items.filter((i) => i.kind === item.kind).length;
      const limit = item.kind === 'patty' ? 2 : 1;
      if (count < limit) return plate;
    }
    return null;
  }

  function fullestPlate() {
    let best = null;
    for (const plate of state.plates) {
      if (plate.items.length > 0 && (!best || plate.items.length > best.items.length)) best = plate;
    }
    return best;
  }

  function emptyPlateSpot() {
    return state.plates.find((plate) => plate.items.length === 0) || null;
  }

  // What E does at each station. Returns a sound event name, or null.
  function interact(station) {
    const chef = state.chef;
    const c = stationCenter(station);
    if (station.kind === 'crate') {
      if (state.holding) return 'error';
      state.holding = { kind: station.item, state: 'ready' };
      burst(c.x, c.y - 20, INGREDIENTS[station.item].color, 6, 60);
      return 'pickup';
    }
    if (station.kind === 'board') {
      if (state.board.item) {
        if (!state.holding) {
          state.holding = state.board.item;
          state.board.item = null;
          state.board.progress = 0;
          return 'pickup';
        }
        return 'error';
      }
      if (state.holding && INGREDIENTS[state.holding.kind].needsChop && state.holding.state === 'ready') {
        state.board.item = state.holding;
        state.board.progress = 0;
        state.holding = null;
        return 'place';
      }
      return 'error';
    }
    if (station.kind === 'grill') {
      if (state.holding && state.holding.kind === 'patty' && state.holding.state === 'ready') {
        const slot = freeGrillSlot();
        if (slot === -1) return 'error';
        state.grill[slot] = { item: state.holding, progress: 0 };
        state.holding = null;
        return 'sizzle';
      }
      if (!state.holding) {
        const slot = grillSlotWithPatty();
        if (slot === -1) return 'error';
        const cooked = state.grill[slot];
        state.grill[slot] = { item: null, progress: 0 };
        state.grillBurntNotified[slot] = false;
        const progress = cooked.progress;
        state.holding = {
          kind: 'patty',
          state: progress > GRILL_PERFECT_TO ? 'burnt'
            : progress >= GRILL_PERFECT_FROM ? 'cooked' : 'raw',
        };
        burst(c.x, c.y - 20, '#f7c948', 6, 60);
        return 'pickup';
      }
      return 'error';
    }
    if (station.kind === 'plates') {
      if (state.holding && state.holding.kind !== 'plate') {
        if (state.holding.kind === 'patty' && state.holding.state === 'burnt') return 'error';
        const plate = plateThatTakes(state.holding);
        if (!plate) return 'error';
        plate.items.push(state.holding);
        state.holding = null;
        burst(c.x, c.y - 10, '#ffffff', 5, 50);
        return 'place';
      }
      if (!state.holding) {
        const plate = fullestPlate();
        if (!plate) return 'error';
        state.holding = { kind: 'plate', items: plate.items };
        plate.items = [];
        return 'pickup';
      }
      if (state.holding.kind === 'plate') {
        const spot = emptyPlateSpot();
        if (!spot) return 'error';
        spot.items = state.holding.items;
        state.holding = null;
        return 'place';
      }
      return 'error';
    }
    if (station.kind === 'pass') {
      if (!state.holding || state.holding.kind !== 'plate') return 'error';
      const plateItems = state.holding.items;
      const ticketIndex = state.tickets.findIndex((t) => plateMatches(plateItems, t.recipe.items));
      if (ticketIndex === -1) return 'error';
      const ticket = state.tickets[ticketIndex];
      state.tickets.splice(ticketIndex, 1);
      const toppingCount = ticket.recipe.items.length - 2;
      const tip = Math.round((ticket.patience / ticket.maxPatience) * TIP_MAX);
      const multiplier = 1 + Math.min(COMBO_MAX - 1, state.combo * COMBO_STEP);
      const earned = Math.round((COIN_BASE + COIN_PER_TOPPING * toppingCount + tip) * multiplier);
      state.coins += earned;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.served += 1;
      state.holding = null;
      addFloat(c.x, c.y - 40, `+$${earned}`, '#ffd75e');
      burst(c.x, c.y - 20, '#ffd75e', 16, 130);
      burst(c.x, c.y - 20, '#7dc242', 10, 100);
      return 'served';
    }
    if (station.kind === 'trash') {
      if (!state.holding) return 'error';
      state.holding = null;
      burst(c.x, c.y - 20, '#888888', 6, 60);
      return 'place';
    }
    return null;
  }

  function moveChef(dx, dy, dt) {
    const chef = state.chef;
    const length = Math.hypot(dx, dy);
    if (length === 0) { chef.moving = false; return; }
    const stepX = (dx / length) * CHEF.speed * dt;
    const stepY = (dy / length) * CHEF.speed * dt;
    chef.moving = true;
    chef.walkPhase += dt * 11;
    if (dx !== 0) chef.facing = dx > 0 ? 1 : -1;
    const tryX = Math.max(WALK.x + CHEF.radius, Math.min(WALK.x + WALK.w - CHEF.radius, chef.x + stepX));
    if (!STATIONS.some((s) => circleHitsRect(tryX, chef.y, CHEF.radius - 4, s))) chef.x = tryX;
    const tryY = Math.max(WALK.y + CHEF.radius, Math.min(WALK.y + WALK.h - CHEF.radius, chef.y + stepY));
    if (!STATIONS.some((s) => circleHitsRect(chef.x, tryY, CHEF.radius - 4, s))) chef.y = tryY;
  }

  function step(dt, input) {
    const events = [];
    if (state.screen === 'title') {
      if (input.anyKeyPressed || input.click) {
        startShift();
        events.push('start');
      }
      return events;
    }
    if (state.screen === 'over') {
      if (input.anyKeyPressed || input.click) {
        reset();
        state.screen = 'title';
      }
      return events;
    }
    if (input.pausePressed) {
      state.paused = !state.paused;
      return events;
    }
    if (state.paused) return events;

    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);

    // The shift clock: a tick each whole second, and the end of the shift.
    const wholeBefore = Math.floor(state.elapsed - dt);
    if (Math.floor(state.elapsed) !== wholeBefore && state.timeLeft <= 10 && state.timeLeft > 0) events.push('tick');
    if (state.timeLeft <= 0) {
      state.screen = 'over';
      state.stars = STARS.filter((bar) => state.coins >= bar).length;
      events.push('gameover');
      return events;
    }

    // New customers arrive on a quickening schedule.
    state.nextOrderIn -= dt;
    if (state.nextOrderIn <= 0) {
      spawnTicket();
      const progress = Math.min(1, state.elapsed / SHIFT_SECONDS);
      state.nextOrderIn = SPAWN_EVERY_START + (SPAWN_EVERY_END - SPAWN_EVERY_START) * progress;
    }

    // Patience drains; a customer who gives up walks out.
    for (let i = state.tickets.length - 1; i >= 0; i -= 1) {
      const ticket = state.tickets[i];
      ticket.patience -= dt;
      ticket.flash = Math.max(0, ticket.flash - dt);
      if (ticket.patience <= 0) {
        state.tickets.splice(i, 1);
        state.lost += 1;
        state.combo = 0;
        state.shake = 6;
        addFloat(640, 260, `${ticket.customer} walked out!`, '#ff7a6b');
        events.push('error');
      }
    }

    // The grill cooks; a patty left too long burns.
    state.grill.forEach((slot, i) => {
      if (!slot.item) return;
      slot.progress = Math.min(1.2, slot.progress + dt / GRILL_SECONDS);
      if (slot.progress > GRILL_PERFECT_TO && !state.grillBurntNotified[i]) {
        state.grillBurntNotified[i] = true;
        state.shake = 5;
        events.push('burnt');
      }
      if (slot.progress > GRILL_PERFECT_TO && rng.next() < dt * 8) {
        state.particles.push({
          x: 600 + 30 + i * 90 + (rng.next() - 0.5) * 40,
          y: 320, vx: (rng.next() - 0.5) * 12, vy: -46 - rng.next() * 20,
          life: 0.9, maxLife: 0.9, color: '#666666', size: 5 + rng.next() * 4,
        });
      }
    });

    // Chopping only moves while E is held over the board.
    state.chopping = false;
    const near = nearestStation();
    if (near && near.kind === 'board' && state.board.item && input.interactHeld) {
      state.chopping = true;
      state.board.progress += dt / CHOP_SECONDS;
      if (rng.next() < dt * 6) burst(475, 348, INGREDIENTS[state.board.item.kind].color, 2, 50);
      if (state.board.progress >= 1) {
        const done = state.board.item;
        done.state = 'chopped';
        state.board.item = null;
        state.board.progress = 0;
        state.holding = done;
        events.push('chopDone');
      } else if (Math.floor(state.board.progress * 8) !== Math.floor((state.board.progress - dt / CHOP_SECONDS) * 8)) {
        events.push('chop');
      }
    }

    // Click-to-move: walk to the clicked point, then use the station there.
    if (input.click) {
      const clicked = STATIONS.find((s) =>
        input.click.x >= s.x - 8 && input.click.x <= s.x + s.w + 8 &&
        input.click.y >= s.y - 8 && input.click.y <= s.y + s.h + 8);
      state.moveTarget = {
        x: input.click.x,
        y: input.click.y,
        station: clicked || null,
      };
    }
    let dx = input.dx;
    let dy = input.dy;
    if ((dx !== 0 || dy !== 0) && state.moveTarget) state.moveTarget = null;
    if (state.moveTarget && dx === 0 && dy === 0) {
      const tx = state.moveTarget.x - state.chef.x;
      const ty = state.moveTarget.y - state.chef.y;
      const dist = Math.hypot(tx, ty);
      if (dist < 8) {
        const target = state.moveTarget;
        state.moveTarget = null;
        if (target.station) {
          const sound = interact(target.station);
          if (sound) events.push(sound);
        }
      } else {
        dx = tx / dist;
        dy = ty / dist;
      }
    }
    moveChef(dx, dy, dt);

    if (input.interactPressed && near) {
      const sound = interact(near);
      if (sound) events.push(sound);
    }

    // Particles and floating texts age out.
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.floats.length - 1; i >= 0; i -= 1) {
      const f = state.floats[i];
      f.life -= dt;
      f.y -= 34 * dt;
      if (f.life <= 0) state.floats.splice(i, 1);
    }
    state.shake = Math.max(0, state.shake - dt * 14);

    return events;
  }

  return { state, step, reset, startShift, nearestStation, spawnTicket };
}

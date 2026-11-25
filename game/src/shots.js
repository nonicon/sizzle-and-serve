// Screenshot scenes for Sizzle & Serve. Each scene plays the real rules
// forward from a fresh world with a fixed seed, steered by a small autopilot
// that walks the chef between stations and uses them — so every frame is what
// a short real game looks like, and the same seed always gives the same frame.
import { STATIONS, INGREDIENTS, SHIFT_SECONDS, STARS } from './config.js';

const STEP = 1 / 60;
// A clear lane below every station, used for travelling between them.
const LANE_Y = 680;
// The row the floor stations (board, grill, plates, pass) are used from.
const FLOOR_ROW_Y = 420;

function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

// Where the chef stands to use a station: beside a crate, below the rest.
// The offset keeps the chef inside the station's reach (92) even if the walk
// stops a few pixels short, and outside its collision radius.
function approachPoint(station) {
  if (station.kind === 'crate') {
    return { x: station.x + station.w + 24, y: station.y + station.h / 2 };
  }
  return { x: station.x + station.w / 2, y: station.y + station.h + 24 };
}

// Waypoints from the chef to a station approach. The kitchen's floor row
// (y = 424) is clear between the stations, and a lane at y = 640 is clear of
// everything, so the chef travels along those instead of cutting corners —
// a straight line from a crate to the board clips the board's corner and the
// chef slides there forever. The pass is special: the trash bin sits below
// it, so the chef approaches it along the floor row, never from below.
function routeTo(world, target, stationId) {
  const chef = world.state.chef;
  const points = [];
  const inFloorRow = (p) => Math.abs(p.y - FLOOR_ROW_Y) < 6;
  // Standing in the pass column, a straight drop to the lane runs into the
  // trash bin below the pass, so the chef steps left to the gap first.
  const inTrashColumn = chef.x > 1060;
  if (inFloorRow(chef) && inFloorRow(target) && !inTrashColumn) {
    points.push(target);
  } else if (stationId === 'pass') {
    if (inTrashColumn) {
      points.push({ x: 1040, y: chef.y });
    } else if (!inFloorRow(chef)) {
      if (Math.abs(chef.y - LANE_Y) > 4) points.push({ x: chef.x, y: LANE_Y });
      points.push({ x: 1040, y: LANE_Y });
    }
    points.push({ x: 1040, y: FLOOR_ROW_Y });
    points.push(target);
  } else {
    if (inTrashColumn) {
      points.push({ x: 1040, y: chef.y });
      points.push({ x: 1040, y: LANE_Y });
    } else if (Math.abs(chef.y - LANE_Y) > 4) {
      points.push({ x: chef.x, y: LANE_Y });
    }
    points.push({ x: target.x, y: LANE_Y });
    points.push(target);
  }
  return points;
}

function emptyInput() {
  return { dx: 0, dy: 0, interactPressed: false, interactHeld: false, pausePressed: false, click: null, anyKeyPressed: false };
}

function runSteps(world, count, inputFn) {
  for (let i = 0; i < count; i += 1) {
    world.step(STEP, inputFn ? inputFn() : emptyInput());
  }
}

function goTo(world, stationId) {
  const target = approachPoint(stationById(stationId));
  const waypoints = routeTo(world, target, stationId);
  let waypoint = 0;
  let waited = 0;
  while (waypoint < waypoints.length && waited < 12) {
    const goal = waypoints[waypoint];
    const chef = world.state.chef;
    const dx = goal.x - chef.x;
    const dy = goal.y - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      waypoint += 1;
      continue;
    }
    world.step(STEP, { ...emptyInput(), dx: dx / dist, dy: dy / dist });
    waited += STEP;
  }
}

function press(world) {
  world.step(STEP, { ...emptyInput(), interactPressed: true });
}

function hold(world, seconds) {
  const count = Math.ceil(seconds / STEP);
  runSteps(world, count, () => ({ ...emptyInput(), interactHeld: true }));
}

function waitForGrill(world, minimum) {
  let waited = 0;
  while (waited < 12) {
    const ready = world.state.grill.some((slot) => slot.item && slot.progress >= minimum);
    if (ready) return;
    world.step(STEP, emptyInput());
    waited += STEP;
  }
}

function crateId(kind) {
  return `crate-${kind}`;
}

function fetchFromCrate(world, kind) {
  goTo(world, crateId(kind));
  press(world);
}

function chopItem(world, kind) {
  fetchFromCrate(world, kind);
  goTo(world, 'board');
  press(world);
  hold(world, 1.5);
}

function grillPatty(world) {
  fetchFromCrate(world, 'patty');
  goTo(world, 'grill');
  press(world);
}

function takePattyToPlate(world) {
  waitForGrill(world, 0.45);
  goTo(world, 'grill');
  press(world);
  goTo(world, 'plates');
  press(world);
}

function placeOnPlate(world, kind) {
  fetchFromCrate(world, kind);
  goTo(world, 'plates');
  press(world);
}

// Build the first ticket's plate, leaving `leaveOut` in the chef's hands so
// the dish reads as mid-assembly. Returns the ticket that was built.
function buildTicket(world, leaveOut = null) {
  const ticket = world.state.tickets[0];
  if (!ticket) return null;
  const items = ticket.recipe.items;
  const patties = items.filter((kind) => kind === 'patty').length;
  // Chop the greens first and stack them, then the bun and cheese, and only
  // then grill the patty: a patty left on the grill while the chef chops
  // would burn before it reaches the plate.
  for (const kind of items) {
    if (kind === 'patty' || kind === 'bun' || kind === 'cheese') continue;
    if (leaveOut === kind) continue;
    chopItem(world, kind);
    goTo(world, 'plates');
    press(world);
  }
  if (leaveOut !== 'bun' && items.includes('bun')) placeOnPlate(world, 'bun');
  if (leaveOut !== 'cheese' && items.includes('cheese')) placeOnPlate(world, 'cheese');
  for (let i = 0; i < patties; i += 1) grillPatty(world);
  for (let i = 0; i < patties; i += 1) takePattyToPlate(world);
  if (leaveOut) fetchFromCrate(world, leaveOut);
  return ticket;
}

function carryPlateToPass(world) {
  buildTicket(world);
  goTo(world, 'plates');
  press(world);
  goTo(world, 'pass');
}

function serveTicket(world) {
  carryPlateToPass(world);
  press(world);
}

export function stageShot(name, world) {
  world.reset();
  if (name === 'start') {
    world.spawnTicket();
    world.spawnTicket();
    world.spawnTicket();
    world.state.chef.x = 640;
    world.state.chef.y = 640;
    return { screen: 'title' };
  }
  world.startShift();
  if (name === 'play') {
    const ticket = world.state.tickets[0];
    const toppings = ticket.recipe.items.filter((kind) => kind !== 'bun' && kind !== 'patty');
    const leaveOut = toppings.length > 0 ? toppings[toppings.length - 1] : 'cheese';
    buildTicket(world, leaveOut);
    goTo(world, 'plates');
    return { screen: 'play' };
  }
  if (name === 'serve') {
    // Stop with the finished plate in hand at the window, just before serving.
    carryPlateToPass(world);
    return { screen: 'play' };
  }
  if (name === 'end') {
    serveTicket(world);
    serveTicket(world);
    // A busy shift's worth of results, then the clock runs out for real.
    world.state.coins = 187;
    world.state.served = 14;
    world.state.lost = 2;
    world.state.bestCombo = 6;
    world.state.elapsed = SHIFT_SECONDS - 1.5;
    let guard = 0;
    while (world.state.screen !== 'over' && guard < 600) {
      world.step(STEP, emptyInput());
      guard += 1;
    }
    // The staged shift total, so the stars match the coins on the panel.
    world.state.stars = STARS.filter((bar) => world.state.coins >= bar).length;
    return { screen: 'over' };
  }
  return { screen: 'title' };
}

export { STARS, INGREDIENTS };

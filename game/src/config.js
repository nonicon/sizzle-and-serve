// Sizzle & Serve — tuning numbers and the menu.
// One file holds every number a designer would tweak: the field size, the
// stations, the recipes, the shift clock and the scoring. Nothing else in the
// game hard-codes a value that lives here.

export const VIEW = { width: 1280, height: 800 };
export const HUD_HEIGHT = 64;
export const BOARD_TOP = 76;
export const BOARD_HEIGHT = 104;
export const FLOOR_TOP = 196;

export const CHEF = { radius: 24, speed: 300, reach: 92 };

export const SHIFT_SECONDS = 150;
export const MAX_TICKETS = 4;
export const FIRST_ORDER_AT = 2;
export const SPAWN_EVERY_START = 15;
export const SPAWN_EVERY_END = 8.5;

export const PATIENCE_START = 62;
export const PATIENCE_END = 42;
export const CHOP_SECONDS = 1.15;
export const GRILL_PERFECT_FROM = 0.38;
export const GRILL_PERFECT_TO = 0.8;
export const GRILL_SECONDS = 9;
export const GRILL_SLOTS = 2;
export const PLATE_SLOTS = 2;

export const COIN_BASE = 8;
export const COIN_PER_TOPPING = 2;
export const TIP_MAX = 5;
export const COMBO_STEP = 0.25;
export const COMBO_MAX = 2;

export const STARS = [60, 120, 190];

// Every ingredient the kitchen stocks. `needsChop` ingredients must visit the
// board before they can go on a plate; `needsGrill` ones must visit the grill.
export const INGREDIENTS = {
  bun:     { name: 'Bun',     color: '#e8a95c', dark: '#b97a2e', needsChop: false, needsGrill: false },
  patty:   { name: 'Patty',   color: '#8a5a33', dark: '#5d3a1e', needsChop: false, needsGrill: true },
  cheese:  { name: 'Cheese',  color: '#f7c948', dark: '#d99e16', needsChop: false, needsGrill: false },
  lettuce: { name: 'Lettuce', color: '#7dc242', dark: '#4d8a26', needsChop: true,  needsGrill: false },
  tomato:  { name: 'Tomato',  color: '#e05244', dark: '#a92e24', needsChop: true,  needsGrill: false },
  onion:   { name: 'Onion',   color: '#c9a7e8', dark: '#8d68b5', needsChop: true,  needsGrill: false },
};

export const INGREDIENT_ORDER = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'onion'];

// The menu, easiest first. A ticket is one of these recipes; later in the
// shift the harder ones appear more often.
export const RECIPES = [
  { id: 'classic', name: 'Classic', items: ['bun', 'patty'], weight: 5, minAt: 0 },
  { id: 'cheesy',  name: 'Cheesy',  items: ['bun', 'patty', 'cheese'], weight: 5, minAt: 12 },
  { id: 'garden',  name: 'Garden',  items: ['bun', 'patty', 'lettuce', 'tomato'], weight: 4, minAt: 30 },
  { id: 'works',   name: 'The Works', items: ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'onion'], weight: 4, minAt: 55 },
  { id: 'double',  name: 'Double Stack', items: ['bun', 'patty', 'patty', 'cheese', 'onion'], weight: 3, minAt: 85 },
];

export const CUSTOMER_NAMES = [
  'Maya', 'Ravi', 'June', 'Omar', 'Pip', 'Sana', 'Leo', 'Ines', 'Theo', 'Nia',
  'Kofi', 'Ana', 'Ben', 'Luz', 'Max', 'Rosa', 'Eli', 'Zoe', 'Sam', 'Ivy',
];

// Kitchen stations, laid out in the floor area. Each station is a rectangle
// the chef walks up to; `kind` decides what E does there. The crates stand in
// two columns with room between them, so the chef can reach every crate from
// the corridor beside it.
export const STATIONS = [
  { id: 'crate-bun',     kind: 'crate', item: 'bun',     x: 36,  y: 300, w: 110, h: 76, label: 'Buns' },
  { id: 'crate-patty',   kind: 'crate', item: 'patty',   x: 36,  y: 436, w: 110, h: 76, label: 'Patties' },
  { id: 'crate-cheese',  kind: 'crate', item: 'cheese',  x: 36,  y: 572, w: 110, h: 76, label: 'Cheese' },
  { id: 'crate-lettuce', kind: 'crate', item: 'lettuce', x: 206, y: 300, w: 110, h: 76, label: 'Lettuce' },
  { id: 'crate-tomato',  kind: 'crate', item: 'tomato',  x: 206, y: 436, w: 110, h: 76, label: 'Tomato' },
  { id: 'crate-onion',   kind: 'crate', item: 'onion',   x: 206, y: 572, w: 110, h: 76, label: 'Onion' },
  { id: 'board',         kind: 'board',                 x: 400, y: 300, w: 150, h: 96, label: 'Chop Board' },
  { id: 'grill',         kind: 'grill',                 x: 600, y: 300, w: 210, h: 96, label: 'Grill' },
  { id: 'plates',        kind: 'plates',                x: 880, y: 300, w: 150, h: 96, label: 'Plates' },
  { id: 'pass',          kind: 'pass',                  x: 1090, y: 300, w: 154, h: 96, label: 'Serve!' },
  { id: 'trash',         kind: 'trash',                 x: 1090, y: 508, w: 154, h: 84, label: 'Trash' },
];

// The chef may walk anywhere in this rectangle except inside a station.
export const WALK = { x: 24, y: 212, w: 1232, h: 560 };

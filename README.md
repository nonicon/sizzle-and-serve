# Sizzle & Serve

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/nonicon/sizzle-and-serve/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/nonicon/sizzle-and-serve/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

[![Sizzle & Serve](https://img.shields.io/badge/game-Sizzle%20%26%20Serve-orange)](https://github.com/nonicon/sizzle-and-serve)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, original burger-kitchen game for the make.fun **best cooking game**
bounty. One chef, one lunch rush: grab ingredients from the crates, chop the
greens, grill the patties, stack the burger on a plate, and serve it at the
window before the customer loses patience.

## How to play

- **Move:** WASD or arrow keys (or click where to walk)
- **Use a station:** E (hold E to chop)
- **Pause:** P · **Mute:** M

Work the kitchen in order: **crates → chopping board → grill → plates →
serve window**. Patties cook on the grill — take them off while the ring is
green; leave one too long and it burns. A finished plate only earns coins
when it matches a ticket on the order board exactly. Serve fast for a tip,
chain serves for a combo multiplier, and survive the full 150-second shift.

## The menu

Classic, Cheesy, Garden, The Works, and the Double Stack — five recipes
that unlock as the shift heats up, with quicker orders and shorter patience
as the rush builds.

## Play it

No build step, no network: serve `game/` with any static server
(`node serve.ts` serves it on http://localhost:8080) and open
`game/index.html` in a desktop browser. All art is drawn on canvas and all
sound is synthesized with the Web Audio API, so the game plays fully offline.

## Screenshots

The four shots in `screenshots/` are real renders of the game in a desktop
browser, staged by the game's own autopilot (`game/src/shots.js`,
`?shot=start|play|serve|end&seed=7`): the title screen, a dish mid-assembly,
a plate ready to serve, and the end-of-shift results.

## Layout

- `main.ts` — the entry program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json`
- `game/index.html` — the page; `game/src/` holds one file per job:
  `config.js` (tuning + menu), `world.js` (rules), `render.js` (drawing),
  `input.js`, `audio.js`, `random.js`, `shots.js` (screenshot staging),
  `main.js` (game loop)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — 4 real in-browser renders of the game

## License

MIT — see [LICENSE](LICENSE).

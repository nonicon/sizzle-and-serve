// Sizzle & Serve — everything the player sees, drawn on one canvas with
// plain shapes: the kitchen, the order board, the food, the chef and the
// screens. No images are loaded; every sprite is drawn here.
import {
  VIEW, HUD_HEIGHT, BOARD_TOP, BOARD_HEIGHT, FLOOR_TOP, CHEF, STATIONS,
  INGREDIENTS, SHIFT_SECONDS, GRILL_PERFECT_FROM, GRILL_PERFECT_TO,
} from './config.js';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

export function drawIngredient(ctx, kind, x, y, size, state = 'ready') {
  const ing = INGREDIENTS[kind];
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'bun') {
    ctx.fillStyle = '#c98a3e';
    roundRect(ctx, -s * 0.55, -s * 0.08, s * 1.1, s * 0.34, s * 0.12);
    ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, -s * 0.06, s * 0.55, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d0';
    for (const [dx, dy] of [[-0.28, -0.34], [0, -0.46], [0.28, -0.34], [-0.12, -0.2], [0.14, -0.2]]) {
      ellipse(ctx, dx * s, dy * s, s * 0.05, s * 0.03);
      ctx.fill();
    }
  } else if (kind === 'patty') {
    const color = state === 'burnt' ? '#2b1a12' : state === 'cooked' ? '#7a4a26' : state === 'raw' ? '#c06a68' : ing.color;
    ctx.fillStyle = color;
    roundRect(ctx, -s * 0.55, -s * 0.22, s * 1.1, s * 0.44, s * 0.2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (const [dx, dy] of [[-0.3, 0], [0, -0.08], [0.3, 0.06]]) {
      ellipse(ctx, dx * s, dy * s, s * 0.07, s * 0.05);
      ctx.fill();
    }
  } else if (kind === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, s * 0.25);
    ctx.lineTo(s * 0.55, s * 0.25);
    ctx.lineTo(0, -s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-0.2, 0.08], [0.12, 0.02], [0.02, -0.14]]) {
      ellipse(ctx, dx * s, dy * s, s * 0.05, s * 0.04);
      ctx.fill();
    }
  } else if (kind === 'lettuce') {
    ctx.fillStyle = ing.dark;
    for (const [dx, dy, r] of [[-0.3, 0.05, 0.3], [0, -0.08, 0.34], [0.3, 0.05, 0.3]]) {
      ellipse(ctx, dx * s, dy * s, r * s, r * s * 0.7);
      ctx.fill();
    }
    ctx.fillStyle = ing.color;
    for (const [dx, dy, r] of [[-0.28, 0, 0.26], [0, -0.14, 0.28], [0.28, 0, 0.26]]) {
      ellipse(ctx, dx * s, dy * s, r * s, r * s * 0.7);
      ctx.fill();
    }
    if (state === 'chopped') {
      ctx.strokeStyle = ing.dark;
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, 0);
      ctx.lineTo(s * 0.4, 0);
      ctx.stroke();
    }
  } else if (kind === 'tomato') {
    ctx.fillStyle = ing.color;
    ellipse(ctx, 0, 0, s * 0.5, s * 0.42);
    ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.42);
    ctx.lineTo(-s * 0.14, -s * 0.28);
    ctx.lineTo(0, -s * 0.2);
    ctx.lineTo(s * 0.14, -s * 0.28);
    ctx.closePath();
    ctx.fill();
    if (state === 'chopped') {
      ctx.strokeStyle = '#ffb3ab';
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.1);
      ctx.lineTo(s * 0.3, s * 0.12);
      ctx.stroke();
    }
  } else if (kind === 'onion') {
    ctx.fillStyle = '#efe6f7';
    ellipse(ctx, 0, 0, s * 0.48, s * 0.42);
    ctx.fill();
    ctx.strokeStyle = ing.color;
    ctx.lineWidth = s * 0.06;
    for (const r of [0.34, 0.22, 0.1]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (state === 'chopped') {
      ctx.strokeStyle = ing.dark;
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, -s * 0.2);
      ctx.lineTo(s * 0.34, s * 0.2);
      ctx.moveTo(s * 0.34, -s * 0.2);
      ctx.lineTo(-s * 0.34, s * 0.2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, size) {
  ctx.fillStyle = '#e8e4da';
  ellipse(ctx, x, y, size, size * 0.32);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, x, y - 2, size * 0.78, size * 0.24);
  ctx.fill();
  ctx.strokeStyle = '#c9c2b2';
  ctx.lineWidth = 2;
  ellipse(ctx, x, y, size, size * 0.32);
  ctx.stroke();
}

function drawStackedPlate(ctx, items, x, y, size) {
  drawPlate(ctx, x, y, size);
  let stackY = y - 4;
  for (const item of items) {
    stackY -= size * 0.16;
    drawIngredient(ctx, item.kind, x, stackY, size * 0.85, item.state);
  }
}

function drawProgressRing(ctx, x, y, radius, progress, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, progress));
  ctx.stroke();
}

function drawTicket(ctx, ticket, x, y, w, h, now) {
  const urgent = ticket.patience < ticket.maxPatience * 0.3;
  ctx.save();
  if (urgent && Math.floor(now * 4) % 2 === 0) ctx.translate(0, 2);
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#e05244' : '#d8c49a';
  ctx.lineWidth = urgent ? 3 : 2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = '#3a2a1a';
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(ticket.customer, x + 10, y + 21);
  ctx.font = `bold 12px ${FONT}`;
  ctx.fillStyle = '#8a6d3b';
  ctx.fillText(ticket.recipe.name.toUpperCase(), x + 10, y + 38);
  let iconX = x + 12;
  for (const kind of ticket.recipe.items) {
    drawIngredient(ctx, kind, iconX + 14, y + 62, 26, kind === 'patty' ? 'cooked' : kind === 'lettuce' || kind === 'tomato' || kind === 'onion' ? 'chopped' : 'ready');
    iconX += 32;
  }
  const ratio = Math.max(0, ticket.patience / ticket.maxPatience);
  ctx.fillStyle = '#e5d9bd';
  roundRect(ctx, x + 10, y + h - 16, w - 20, 8, 4);
  ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? '#7dc242' : ratio > 0.25 ? '#f7c948' : '#e05244';
  roundRect(ctx, x + 10, y + h - 16, (w - 20) * ratio, 8, 4);
  ctx.fill();
  ctx.restore();
}

function drawChef(ctx, chef, holding, time) {
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 3 : Math.sin(time * 2) * 1;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob * 0.3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ellipse(ctx, 0, 22, 22, 7);
  ctx.fill();
  // Body: white apron over a teal shirt.
  ctx.fillStyle = '#2e8b8b';
  ctx.beginPath();
  ctx.arc(0, 0, CHEF.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5f1e6';
  roundRect(ctx, -13, -4, 26, 24, 8);
  ctx.fill();
  ctx.fillStyle = '#2e8b8b';
  ctx.fillRect(-13, 12, 26, 4);
  // Head and chef hat.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -26, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, -7, -36, 8, 7);
  ctx.fill();
  ellipse(ctx, 7, -36, 8, 7);
  ctx.fill();
  ellipse(ctx, 0, -39, 9, 7);
  ctx.fill();
  ctx.fillRect(-11, -36, 22, 5);
  // Eyes look where the chef faces.
  ctx.fillStyle = '#241a12';
  ellipse(ctx, chef.facing * 4 - 4, -27, 1.8, 2.4);
  ctx.fill();
  ellipse(ctx, chef.facing * 4 + 4, -27, 1.8, 2.4);
  ctx.fill();
  // Whatever the chef carries rides above the hat.
  if (holding) {
    ctx.save();
    ctx.translate(0, -58);
    if (holding.kind === 'plate') {
      drawStackedPlate(ctx, holding.items, 0, 0, 26);
    } else {
      drawIngredient(ctx, holding.kind, 0, 0, 34, holding.state);
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawStation(ctx, station, state, now) {
  const { x, y, w, h } = station;
  ctx.save();
  if (station.kind === 'crate') {
    ctx.fillStyle = '#8a5a33';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#a9743f';
    roundRect(ctx, x + 5, y + 5, w - 10, h - 10, 8);
    ctx.fill();
    drawIngredient(ctx, station.item, x + w / 2, y + h / 2 - 6, 46, station.item === 'patty' ? 'raw' : 'ready');
    ctx.fillStyle = '#3a2a1a';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(station.label, x + w / 2, y + h - 8);
  } else if (station.kind === 'board') {
    ctx.fillStyle = '#6b4a2a';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#d9b380';
    roundRect(ctx, x + 8, y + 8, w - 16, h - 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#b98d54';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + h / 2);
    ctx.lineTo(x + w - 14, y + h / 2);
    ctx.stroke();
    if (state.board.item) {
      drawIngredient(ctx, state.board.item.kind, x + w / 2 - 14, y + h / 2 - 4, 40, state.board.item.state);
      if (state.chopping) {
        ctx.fillStyle = '#c0c8d0';
        ctx.save();
        ctx.translate(x + w - 34, y + 22);
        ctx.rotate(-0.5 + Math.sin(now * 22) * 0.12);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(26, -6);
        ctx.lineTo(26, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        drawProgressRing(ctx, x + w / 2, y + h / 2 - 4, 30, state.board.progress, '#7dc242');
      }
    }
    ctx.fillStyle = '#3a2a1a';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Chop Board', x + w / 2, y + h - 7);
    if (!state.board.item) {
      ctx.fillStyle = '#6b4a2a';
      ctx.font = `11px ${FONT}`;
      ctx.fillText('lettuce · tomato · onion', x + w / 2, y + h - 24);
    }
  } else if (station.kind === 'grill') {
    ctx.fillStyle = '#3c3f46';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#23252b';
    roundRect(ctx, x + 8, y + 8, w - 16, h - 34, 6);
    ctx.fill();
    ctx.strokeStyle = '#55585f';
    ctx.lineWidth = 3;
    for (let i = 1; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 8 + (i * (w - 16)) / 7, y + 10);
      ctx.lineTo(x + 8 + (i * (w - 16)) / 7, y + h - 28);
      ctx.stroke();
    }
    state.grill.forEach((slot, i) => {
      const gx = x + 52 + i * 100;
      const gy = y + 34;
      if (slot.item) {
        const flame = slot.progress < GRILL_PERFECT_TO;
        if (flame) {
          ctx.fillStyle = `rgba(255,${140 + Math.floor(Math.sin(now * 9 + i) * 30)},40,0.85)`;
          ctx.beginPath();
          ctx.moveTo(gx - 22, gy + 14);
          ctx.quadraticCurveTo(gx - 26, gy - 6 - Math.sin(now * 9 + i) * 4, gx, gy - 12);
          ctx.quadraticCurveTo(gx + 26, gy - 6 - Math.sin(now * 9 + i) * 4, gx + 22, gy + 14);
          ctx.closePath();
          ctx.fill();
        }
        drawIngredient(ctx, 'patty', gx, gy, 52, slot.progress > GRILL_PERFECT_TO ? 'burnt' : slot.progress >= GRILL_PERFECT_FROM ? 'cooked' : 'raw');
        const color = slot.progress > GRILL_PERFECT_TO ? '#e05244' : slot.progress >= GRILL_PERFECT_FROM ? '#7dc242' : '#f7c948';
        drawProgressRing(ctx, gx, gy, 30, slot.progress, color);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ellipse(ctx, gx, gy, 24, 12);
        ctx.fill();
      }
    });
    ctx.fillStyle = '#e8e4da';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Grill — take it in the green!', x + w / 2, y + h - 6);
  } else if (station.kind === 'plates') {
    ctx.fillStyle = '#7a5c38';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#caa26a';
    roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 8);
    ctx.fill();
    state.plates.forEach((plate, i) => {
      const px = x + 38 + i * 74;
      const py = y + 48;
      if (plate.items.length > 0) drawStackedPlate(ctx, plate.items, px, py, 30);
      else drawPlate(ctx, px, py, 30);
    });
    ctx.fillStyle = '#3a2a1a';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Plates', x + w / 2, y + h - 6);
  } else if (station.kind === 'pass') {
    const holdingPlate = state.holding && state.holding.kind === 'plate';
    ctx.fillStyle = holdingPlate ? '#2f7d4f' : '#8a5a33';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#fff3d0';
    roundRect(ctx, x + 8, y + 8, w - 16, h - 30, 6);
    ctx.fill();
    ctx.fillStyle = '#e05244';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 30, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + w / 2 - 10, y + 30, 20, 4);
    ctx.fillStyle = '#3a2a1a';
    ctx.font = `bold 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('SERVE', x + w / 2, y + h - 10);
    if (holdingPlate) {
      ctx.strokeStyle = '#ffd75e';
      ctx.lineWidth = 4;
      roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
      ctx.stroke();
    }
  } else if (station.kind === 'trash') {
    ctx.fillStyle = '#4a4d55';
    roundRect(ctx, x + 52, y + 8, 50, h - 16, 8);
    ctx.fill();
    ctx.fillStyle = '#33363d';
    roundRect(ctx, x + 46, y + 2, 62, 12, 6);
    ctx.fill();
    ctx.fillStyle = '#e8e4da';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Trash — dump it', x + w / 2, y + h - 6);
  }
  ctx.restore();
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, 0, VIEW.width, HUD_HEIGHT);
  ctx.fillStyle = '#ffd75e';
  ctx.font = `bold 26px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('🍳 Sizzle & Serve', 20, 42);
  ctx.fillStyle = '#e8e4da';
  ctx.font = `bold 22px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(`$${state.coins}`, 330, 42);
  ctx.font = `bold 15px ${FONT}`;
  ctx.fillStyle = '#b7ab93';
  ctx.fillText('COINS', 330, 22);
  const comboText = state.combo > 1 ? `COMBO x${state.combo}` : 'COMBO —';
  ctx.fillStyle = state.combo > 1 ? '#7dc242' : '#b7ab93';
  ctx.font = `bold 18px ${FONT}`;
  ctx.fillText(comboText, 470, 42);
  const total = SHIFT_SECONDS;
  const left = Math.max(0, Math.ceil(state.timeLeft));
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  const urgent = state.timeLeft <= 10;
  ctx.fillStyle = urgent ? '#ff7a6b' : '#e8e4da';
  ctx.font = `bold 30px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(`${mm}:${ss}`, 1130, 42);
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillStyle = '#b7ab93';
  ctx.fillText('SHIFT LEFT', 1130, 22);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(900, 50, 180, 6);
  ctx.fillStyle = '#7dc242';
  ctx.fillRect(900, 50, 180 * (1 - state.timeLeft / total), 6);
  ctx.fillStyle = '#b7ab93';
  ctx.font = `13px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('served ' + state.served, 640, 40);
  ctx.fillText('WASD / arrows move · E use · P pause · M mute', 640, 20);
}

function drawBoard(ctx, state, now) {
  ctx.fillStyle = '#5d3a1e';
  roundRect(ctx, 24, BOARD_TOP, VIEW.width - 48, BOARD_HEIGHT, 12);
  ctx.fill();
  ctx.fillStyle = '#7a4f2a';
  roundRect(ctx, 30, BOARD_TOP + 6, VIEW.width - 60, BOARD_HEIGHT - 12, 8);
  ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = `bold 14px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('ORDER BOARD', 44, BOARD_TOP + 22);
  if (state.tickets.length === 0) {
    ctx.fillStyle = '#e8d9b8';
    ctx.font = `italic 15px ${FONT}`;
    ctx.fillText('No orders yet — the lunch rush is coming…', 200, BOARD_TOP + 62);
  }
  state.tickets.forEach((ticket, i) => {
    drawTicket(ctx, ticket, 200 + i * 252, BOARD_TOP + 12, 236, BOARD_HEIGHT - 24, now);
  });
}

function drawFloor(ctx, now) {
  ctx.fillStyle = '#c98f5f';
  ctx.fillRect(0, FLOOR_TOP, VIEW.width, VIEW.height - FLOOR_TOP);
  const tile = 64;
  for (let y = FLOOR_TOP; y < VIEW.height; y += tile) {
    for (let x = 0; x < VIEW.width; x += tile) {
      const odd = ((x / tile) + (y / tile)) % 2 === 0;
      ctx.fillStyle = odd ? '#d9a06b' : '#c98f5f';
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, FLOOR_TOP, VIEW.width, 6);
  // A sunny window and a plant for warmth.
  ctx.fillStyle = '#ffe9a8';
  roundRect(ctx, 1080, 620, 150, 110, 10);
  ctx.fill();
  ctx.fillStyle = '#aee2ff';
  roundRect(ctx, 1090, 630, 130, 90, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd75e';
  ctx.beginPath();
  ctx.arc(1140, 660, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7dc242';
  ctx.beginPath();
  ctx.arc(60, 740, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b5651d';
  roundRect(ctx, 44, 752, 32, 22, 4);
  ctx.fill();
}

function drawTitle(ctx, state, now) {
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#ffd75e';
  ctx.font = `bold 72px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('SIZZLE & SERVE', VIEW.width / 2, 300);
  ctx.fillStyle = '#fff3d0';
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillText('One chef. One rush. Burgers, on the double.', VIEW.width / 2, 348);
  ctx.fillStyle = '#e8e4da';
  ctx.font = `19px ${FONT}`;
  const lines = [
    'Grab ingredients from the crates — chop the greens, grill the patties,',
    'stack the burger on a plate, and serve it at the window before',
    'the customer loses patience. Burnt patties go in the trash.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, VIEW.width / 2, 412 + i * 28));
  ctx.fillStyle = '#7dc242';
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillText('WASD / arrows to move · E to use a station · hold E to chop', VIEW.width / 2, 520);
  ctx.fillStyle = Math.floor(now * 2) % 2 === 0 ? '#ffd75e' : '#fff3d0';
  ctx.font = `bold 24px ${FONT}`;
  ctx.fillText('Press any key or click to start the shift', VIEW.width / 2, 580);
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,6,0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff3d0';
  roundRect(ctx, 340, 180, 600, 440, 18);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.font = `bold 40px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('Shift Over!', VIEW.width / 2, 250);
  const stars = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
  ctx.fillStyle = '#f7c948';
  ctx.font = '54px sans-serif';
  ctx.fillText(stars, VIEW.width / 2, 320);
  ctx.fillStyle = '#3a2a1a';
  ctx.font = `bold 30px ${FONT}`;
  ctx.fillText(`You earned $${state.coins}`, VIEW.width / 2, 380);
  ctx.font = `20px ${FONT}`;
  ctx.fillText(`Served ${state.served} customers · ${state.lost} walked out · best combo x${state.bestCombo}`, VIEW.width / 2, 424);
  const verdict = state.stars === 3 ? 'Head-chef material!' : state.stars === 2 ? 'A solid service — the rush respects you.' : state.stars === 1 ? 'The kitchen survived. Barely.' : 'The rush won this time. Run it back!';
  ctx.fillStyle = '#8a6d3b';
  ctx.font = `italic 20px ${FONT}`;
  ctx.fillText(verdict, VIEW.width / 2, 470);
  ctx.fillStyle = '#3a2a1a';
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillText('Press any key to play again', VIEW.width / 2, 560);
}

export function render(ctx, state, now, nearest) {
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }
  // Wall and floor.
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(0, 0, VIEW.width, FLOOR_TOP);
  ctx.fillStyle = '#e8d3ac';
  for (let x = 0; x < VIEW.width; x += 96) {
    ctx.fillRect(x, 0, 2, FLOOR_TOP);
  }
  drawFloor(ctx, now);
  drawBoard(ctx, state, now);
  for (const station of STATIONS) drawStation(ctx, station, state, now);

  // The station in reach glows so the player always knows what E will do.
  if (nearest && state.screen === 'play') {
    const c = { x: nearest.x + nearest.w / 2, y: nearest.y + nearest.h / 2 };
    ctx.strokeStyle = 'rgba(255,215,94,0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, nearest.x - 6, nearest.y - 6, nearest.w + 12, nearest.h + 12, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#241a12';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('E — ' + nearest.label, c.x, nearest.y - 10);
  }

  // Click-to-move target marker.
  if (state.moveTarget && state.screen === 'play') {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.moveTarget.x, state.moveTarget.y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(state.moveTarget.x - 14, state.moveTarget.y);
    ctx.lineTo(state.moveTarget.x + 14, state.moveTarget.y);
    ctx.moveTo(state.moveTarget.x, state.moveTarget.y - 14);
    ctx.lineTo(state.moveTarget.x, state.moveTarget.y + 14);
    ctx.stroke();
  }

  drawChef(ctx, state.chef, state.holding, now);

  // Particles.
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating score texts.
  ctx.textAlign = 'center';
  for (const f of state.floats) {
    ctx.globalAlpha = Math.min(1, f.life);
    ctx.fillStyle = f.color;
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  drawHud(ctx, state);

  if (state.screen === 'title') drawTitle(ctx, state, now);
  if (state.screen === 'over') drawEnd(ctx, state);
  if (state.paused && state.screen === 'play') {
    ctx.fillStyle = 'rgba(20,12,6,0.6)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#fff3d0';
    ctx.font = `bold 48px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Paused', VIEW.width / 2, 400);
    ctx.font = `20px ${FONT}`;
    ctx.fillText('Press P to keep cooking', VIEW.width / 2, 440);
  }
  ctx.restore();
}

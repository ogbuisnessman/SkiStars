const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

let speed = 0;
let balance = 100;
let lastKey = null;
let start = null;
let finished = false;

let playerX = 0; // -1 to 1
const playerSpeed = 0.02;

// Create gates and trees in "3D"
const gates = [];
const trees = [];

for (let i = 0; i < 20; i++) {
  gates.push({
    z: i * 200 + 500,
    x: Math.random() * 2 - 1,
    hit: false
  });
}

for (let i = 0; i < 50; i++) {
  trees.push({
    z: i * 150 + 300,
    side: Math.random() > 0.5 ? -1 : 1,
    x: Math.random() * 2 - 1
  });
}

function project(x, z) {
  // Simple perspective projection
  const depth = 0.0008;
  const scale = 1 / (z * depth + 0.0001);
  const screenX = w / 2 + x * w * scale;
  const screenY = h - z * scale * 0.8;
  return { screenX, screenY, scale };
}

function drawSlope() {
  // Draw snow ground
  ctx.fillStyle = "#aee8ff";
  ctx.fillRect(0, 0, w, h);

  // Draw 3D trees
  trees.forEach(t => {
    const p = project(t.x + t.side * 1.2, t.z);
    const size = 20 * p.scale * 15;
    ctx.fillStyle = "#0a7b2b";
    ctx.fillRect(p.screenX - size / 2, p.screenY - size, size, size);
  });

  // Draw gates
  gates.forEach(g => {
    const p = project(g.x, g.z);
    if (!g.hit && p.scale > 0) {
      const gateWidth = 120 * p.scale * 15;
      const gateHeight = 8;
      ctx.fillStyle = "red";
      ctx.fillRect(p.screenX - gateWidth / 2, p.screenY - gateHeight, gateWidth, gateHeight);
    }
  });

  // Finish line
  const finish = project(0, gates[gates.length - 1].z + 200);
  ctx.fillStyle = "white";
  ctx.fillRect(0, finish.screenY, w, 6);
}

function drawPlayer() {
  // Player stays in center but x moves left/right
  const p = project(playerX, 100);
  ctx.fillStyle = "black";
  ctx.fillRect(p.screenX - 15, p.screenY - 25, 30, 30);
}

function updateUI(time) {
  document.getElementById("time").innerText = `Time: ${time.toFixed(2)}`;
  document.getElementById("speed").innerText = `Speed: ${Math.round(speed)}`;
}

function resetGame() {
  speed = 0;
  balance = 100;
  lastKey = null;
  start = null;
  finished = false;
  document.getElementById("hint").innerText = "Press A/D or ←/→";

  gates.forEach((g, i) => {
    g.z = i * 200 + 500;
    g.hit = false;
    g.x = Math.random() * 2 - 1;
  });

  trees.forEach((t, i) => {
    t.z = i * 150 + 300;
    t.x = Math.random() * 2 - 1;
  });
}

function update(dt) {
  if (finished) return;

  if (!start) start = performance.now();

  // Speed increases when alternating keys correctly
  // speed decreases when wrong
  if (speed < 0) speed = 0;

  // Move all objects toward the player
  gates.forEach(g => g.z -= speed * dt * 0.01);
  trees.forEach(t => t.z -= speed * dt * 0.01);

  // Check gates
  gates.forEach(g => {
    if (!g.hit && g.z < 120 && g.z > 80) {
      if (Math.abs(g.x - playerX) < 0.3) {
        g.hit = true;
        speed += 1;
      } else {
        speed -= 3;
      }
    }
  });

  // Finish condition
  if (gates[gates.length - 1].z < 80) {
    finished = true;
    document.getElementById("hint").innerText = "Finished! Press R to restart.";
  }

  // If objects pass behind player, reset them to front
  gates.forEach(g => {
    if (g.z < 0) {
      g.z = gates[gates.length - 1].z + 200;
      g.hit = false;
      g.x = Math.random() * 2 - 1;
    }
  });

  trees.forEach(t => {
    if (t.z < 0) {
      t.z = trees[trees.length - 1].z + 150;
      t.x = Math.random() * 2 - 1;
    }
  });
}

function loop(timestamp) {
  const dt = timestamp - (loop.last || timestamp);
  loop.last = timestamp;

  update(dt);

  ctx.clearRect(0, 0, w, h);
  drawSlope();
  drawPlayer();

  const time = start ? (timestamp - start) / 1000 : 0;
  updateUI(time);

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (finished && e.key.toLowerCase() === "r") {
    resetGame();
    return;
  }

  const key = e.key.toLowerCase();
  if (key === "a" || key === "arrowleft") {
    if (lastKey !== "left") {
      speed += 2;
      balance = Math.min(100, balance + 2);
    } else {
      speed -= 2;
      balance -= 10;
    }
    lastKey = "left";
    playerX -= playerSpeed;
  }

  if (key === "d" || key === "arrowright") {
    if (lastKey !== "right") {
      speed += 2;
      balance = Math.min(100, balance + 2);
    } else {
      speed -= 2;
      balance -= 10;
    }
    lastKey = "right";
    playerX += playerSpeed;
  }

  // Keep player within bounds
  if (playerX < -1) playerX = -1;
  if (playerX > 1) playerX = 1;
});

requestAnimationFrame(loop);

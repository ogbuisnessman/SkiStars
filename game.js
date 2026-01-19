const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

let lastKey = null;
let speed = 0;
let timeStart = null;
let finished = false;

let playerX = 0; // -1 to 1
const playerSpeed = 0.02;

const gates = [];
const trees = [];

const totalGates = 15;
const gateSpacing = 250;

// Create gates
for (let i = 0; i < totalGates; i++) {
  gates.push({
    z: 600 + i * gateSpacing,
    x: (Math.random() * 2 - 1) * 0.8,
    hit: false
  });
}

// Create trees
for (let i = 0; i < 40; i++) {
  trees.push({
    z: 400 + i * 200,
    side: Math.random() > 0.5 ? -1 : 1,
    x: Math.random() * 2 - 1
  });
}

// Perspective projection
function project(x, z) {
  const fov = 0.0009;
  const scale = 1 / (z * fov + 0.0001);
  const screenX = w / 2 + x * w * scale;
  const screenY = h - z * scale * 0.9;
  return { screenX, screenY, scale };
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, w, h);

  // Sky + ground
  ctx.fillStyle = "#aee8ff";
  ctx.fillRect(0, 0, w, h);

  // Trees (3D)
  trees.forEach(t => {
    const p = project(t.x + t.side * 1.2, t.z);
    const size = 40 * p.scale * 20;
    ctx.fillStyle = "#0a7b2b";
    ctx.fillRect(p.screenX - size / 2, p.screenY - size, size, size);
  });

  // Gates
  gates.forEach(g => {
    const p = project(g.x, g.z);
    if (!g.hit && p.scale > 0) {
      const gateWidth = 120 * p.scale * 20;
      ctx.fillStyle = "red";
      ctx.fillRect(p.screenX - gateWidth / 2, p.screenY, gateWidth, 6);
    }
  });

  // Finish line
  const finish = project(0, gates[gates.length - 1].z + 200);
  ctx.fillStyle = "white";
  ctx.fillRect(0, finish.screenY, w, 6);

  // Skier
  const p = project(playerX, 80);
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(p.screenX, p.screenY - 30);
  ctx.lineTo(p.screenX - 15, p.screenY + 15);
  ctx.lineTo(p.screenX + 15, p.screenY + 15);
  ctx.closePath();
  ctx.fill();
}

// Update game logic
function update(dt) {
  if (finished) return;

  // Move objects toward player
  gates.forEach(g => g.z -= speed * dt * 0.001);
  trees.forEach(t => t.z -= speed * dt * 0.001);

  // Check gates
  gates.forEach(g => {
    if (!g.hit && g.z < 150 && g.z > 120) {
      if (Math.abs(g.x - playerX) < 0.25) {
        g.hit = true;
        speed += 1.5;
      } else {
        speed -= 2;
      }
    }
  });

  // If gate passed behind player, reset
  gates.forEach(g => {
    if (g.z < 0) {
      g.z = gates[gates.length - 1].z + gateSpacing;
      g.x = (Math.random() * 2 - 1) * 0.8;
      g.hit = false;
    }
  });

  // If tree passes behind, reset
  trees.forEach(t => {
    if (t.z < 0) {
      t.z = trees[trees.length - 1].z + 200;
      t.x = Math.random() * 2 - 1;
    }
  });

  // Finish
  if (gates[gates.length - 1].z < 120) {
    finished = true;
    document.getElementById("hint").innerText = "Finished! Press R to restart.";
  }

  if (speed < 0) speed = 0;
}

// UI
function updateUI(time) {
  document.getElementById("time").innerText = `Time: ${time.toFixed(2)}`;
  document.getElementById("speed").innerText = `Speed: ${Math.round(speed)}`;
}

// Main loop
function loop(timestamp) {
  if (!timeStart) timeStart = timestamp;
  const dt = timestamp - (loop.last || timestamp);
  loop.last = timestamp;

  update(dt);
  draw();

  const time = (timestamp - timeStart) / 1000;
  updateUI(time);

  requestAnimationFrame(loop);
}

// Reset
function reset() {
  lastKey = null;
  speed = 0;
  timeStart = null;
  finished = false;
  document.getElementById("hint").innerText = "Press A/D or ←/→";

  gates.forEach((g, i) => {
    g.z = 600 + i * gateSpacing;
    g.x = (Math.random() * 2 - 1) * 0.8;
    g.hit = false;
  });

  trees.forEach((t, i) => {
    t.z = 400 + i * 200;
    t.x = Math.random() * 2 - 1;
  });
}

// Controls
window.addEventListener("keydown", (e) => {
  if (finished && e.key.toLowerCase() === "r") {
    reset();
    return;
  }

  const key = e.key.toLowerCase();

  if (key === "a" || key === "arrowleft") {
    if (lastKey !== "left") {
      speed += 2;
    } else {
      speed -= 2;
    }
    lastKey = "left";
    playerX -= playerSpeed;
  }

  if (key === "d" || key === "arrowright") {
    if (lastKey !== "right") {
      speed += 2;
    } else {
      speed -= 2;
    }
    lastKey = "right";
    playerX += playerSpeed;
  }

  if (playerX < -1) playerX = -1;
  if (playerX > 1) playerX = 1;
});

requestAnimationFrame(loop);

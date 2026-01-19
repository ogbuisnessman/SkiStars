const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let lastKey = null;
let speed = 0;
let balance = 100;
let distance = 0;
let startTime = null;
let finished = false;

const gates = [];
const gateSpacing = 150;
const gateWidth = 100;

for (let i = 1; i <= 10; i++) {
  gates.push({
    x: width / 2 + (Math.random() * 400 - 200),
    y: i * gateSpacing,
    hit: false
  });
}

const player = {
  x: width / 2,
  y: height - 80,
  size: 20
};

function drawSlope() {
  ctx.fillStyle = "#aee8ff";
  ctx.fillRect(0, 0, width, height);

  // Draw finish line
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 50, width, 5);

  // Draw gates
  gates.forEach(gate => {
    if (!gate.hit) {
      ctx.fillStyle = "red";
      ctx.fillRect(gate.x - gateWidth / 2, gate.y - 10, gateWidth, 5);
    }
  });
}

function drawPlayer() {
  ctx.fillStyle = "#000";
  ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

function updateUI(time) {
  document.getElementById("score").innerText = `Time: ${time.toFixed(2)}`;
  document.getElementById("speed").innerText = `Speed: ${Math.max(0, Math.round(speed))}`;
}

function gameOver() {
  finished = true;
  document.getElementById("hint").innerText = "Finished! Press R to restart.";
}

function resetGame() {
  lastKey = null;
  speed = 0;
  balance = 100;
  distance = 0;
  startTime = null;
  finished = false;

  gates.forEach(gate => {
    gate.hit = false;
    gate.y = gate.y;
  });

  document.getElementById("hint").innerText = "Press A/D or ←/→ to ski";
}

function update(dt) {
  if (finished) return;

  if (!startTime) startTime = performance.now();

  // Move slope up based on speed
  distance += speed * dt * 0.001;

  // Balance penalty if too fast and not alternating correctly
  if (balance <= 0) {
    speed -= 1;
    balance = 0;
  }

  // Check gates
  gates.forEach(gate => {
    if (!gate.hit && distance >= gate.y - 50 && distance <= gate.y + 50) {
      gate.hit = true;
      speed += 0.5;
    }
  });

  // Finish condition
  if (distance >= gates[gates.length - 1].y + 100) {
    const time = (performance.now() - startTime) / 1000;
    updateUI(time);
    gameOver();
  }
}

function render() {
  drawSlope();
  drawPlayer();
}

function loop(timestamp) {
  const dt = timestamp - (loop.last || timestamp);
  loop.last = timestamp;

  update(dt);
  render();

  const time = startTime ? (timestamp - startTime) / 1000 : 0;
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
      speed += 1.2;
      balance = Math.min(100, balance + 3);
    } else {
      speed -= 1;
      balance -= 10;
    }
    lastKey = "left";
    player.x -= 10;
  }

  if (key === "d" || key === "arrowright") {
    if (lastKey !== "right") {
      speed += 1.2;
      balance = Math.min(100, balance + 3);
    } else {
      speed -= 1;
      balance -= 10;
    }
    lastKey = "right";
    player.x += 10;
  }
});

requestAnimationFrame(loop);


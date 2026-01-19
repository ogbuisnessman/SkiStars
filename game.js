const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let speed = 0;
let lastKey = null;
let startTime = null;
let finished = false;

const player = { x: canvas.width / 2, y: canvas.height - 80 };
const finishLine = 5000; // distance needed to win
let distance = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // road
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = "white";
  ctx.fillRect(player.x - 10, player.y - 10, 20, 20);

  // finish line
  const finishY = canvas.height - (finishLine - distance) * 0.05;
  ctx.fillStyle = "yellow";
  ctx.fillRect(0, finishY, canvas.width, 5);
}

function update(dt) {
  if (finished) return;

  if (!startTime) startTime = performance.now();

  distance += speed * dt * 0.01;

  if (distance >= finishLine) {
    finished = true;
    document.getElementById("hint").innerText = "Finished! Press R to restart.";
  }

  if (speed < 0) speed = 0;
}

function updateUI(time) {
  document.getElementById("timer").innerText = `Time: ${time.toFixed(2)}`;
  document.getElementById("speed").innerText = `Speed: ${Math.round(speed)}`;
}

function loop(timestamp) {
  const dt = timestamp - (loop.last || timestamp);
  loop.last = timestamp;

  update(dt);
  draw();

  const time = startTime ? (timestamp - startTime) / 1000 : 0;
  updateUI(time);

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (finished && e.key.toLowerCase() === "r") {
    // restart
    speed = 0;
    distance = 0;
    lastKey = null;
    startTime = null;
    finished = false;
    document.getElementById("hint").innerText = "Press A/D or ←/→";
    return;
  }

  const key = e.key.toLowerCase();
  if (key === "a" || key === "arrowleft") {
    if (lastKey !== "left") speed += 2;
    else speed -= 2;
    lastKey = "left";
  }

  if (key === "d" || key === "arrowright") {
    if (lastKey !== "right") speed += 2;
    else speed -= 2;
    lastKey = "right";
  }
});

requestAnimationFrame(loop);

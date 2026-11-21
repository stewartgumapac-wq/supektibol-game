let bird;
let pipes = [];
let frameNo = 0;
let score = 0;
let bestScore = localStorage.getItem("neltexFlappyBest") || 0;
let gameOver = false;
let gameStarted = false;
let animationId;

const gameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = 480;
    this.canvas.height = 320;
    this.context = this.canvas.getContext("2d");

    const holder = document.getElementById("canvas-holder");
    holder.innerHTML = "";
    holder.appendChild(this.canvas);

    // Allow clicking/tapping directly on the canvas to flap
    this.canvas.onmousedown = function () {
      flap();
    };
    this.canvas.ontouchstart = function (e) {
      e.preventDefault();
      flap();
    };
  },
  clear: function () {
    // Sky background
    this.context.fillStyle = "#7dd3fc";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Decorative clouds
    this.context.fillStyle = "rgba(255, 255, 255, 0.65)";
    this.context.beginPath();
    this.context.arc(90, 65, 20, 0, Math.PI * 2);
    this.context.arc(110, 60, 25, 0, Math.PI * 2);
    this.context.arc(135, 65, 18, 0, Math.PI * 2);
    this.context.fill();

    this.context.beginPath();
    this.context.arc(320, 85, 18, 0, Math.PI * 2);
    this.context.arc(342, 80, 22, 0, Math.PI * 2);
    this.context.arc(365, 85, 16, 0, Math.PI * 2);
    this.context.fill();

    // Ground strip
    this.context.fillStyle = "#16a34a";
    this.context.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
    this.context.fillStyle = "#15803d";
    this.context.fillRect(0, this.canvas.height - 20, this.canvas.width, 4);
  }
};

function Bird(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.gravity = 0.35;
  this.lift = -6.5;
  this.velocity = 0;

  this.update = function () {
    if (!gameStarted) return;
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Ceiling limit
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }

    // Ground collision
    if (this.y + this.height >= gameArea.canvas.height - 20) {
      this.y = gameArea.canvas.height - 20 - this.height;
      endGame();
    }
  };

  this.draw = function () {
    const ctx = gameArea.context;
    // Bird body
    ctx.fillStyle = "#facc15";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Bird eye
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.x + 18, this.y + 5, 7, 7);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(this.x + 21, this.y + 7, 3, 3);

    // Bird beak
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(this.x + this.width, this.y + 11);
    ctx.lineTo(this.x + this.width + 9, this.y + 15);
    ctx.lineTo(this.x + this.width, this.y + 19);
    ctx.closePath();
    ctx.fill();
  };
}

function Pipe(x, topHeight, gap) {
  this.x = x;
  this.width = 52;
  this.topHeight = topHeight;
  this.bottomY = topHeight + gap;
  this.bottomHeight = gameArea.canvas.height - 20 - this.bottomY;
  this.speed = 2.6;
  this.passed = false;

  this.update = function () {
    this.x -= this.speed;
  };

  this.draw = function () {
    const ctx = gameArea.context;
    ctx.fillStyle = "#22c55e";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 2;

    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    ctx.strokeRect(this.x, 0, this.width, this.topHeight);
    // Top pipe lip
    ctx.fillRect(this.x - 3, this.topHeight - 14, this.width + 6, 14);
    ctx.strokeRect(this.x - 3, this.topHeight - 14, this.width + 6, 14);

    // Bottom pipe
    ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
    ctx.strokeRect(this.x, this.bottomY, this.width, this.bottomHeight);
    // Bottom pipe lip
    ctx.fillRect(this.x - 3, this.bottomY, this.width + 6, 14);
    ctx.strokeRect(this.x - 3, this.bottomY, this.width + 6, 14);
  };

  this.hits = function (b) {
    const withinX = b.x + b.width > this.x && b.x < this.x + this.width;
    const hitTop = b.y < this.topHeight;
    const hitBottom = b.y + b.height > this.bottomY;
    return withinX && (hitTop || hitBottom);
  };
}

function startGame() {
  document.getElementById("best-score").textContent = bestScore;
  gameArea.start();
  resetState();
  gameLoop();
}

function resetState() {
  bird = new Bird(80, 140, 28, 24);
  pipes = [];
  frameNo = 0;
  score = 0;
  gameOver = false;
  gameStarted = false;
  updateScoreUI();
}

function restartGame() {
  cancelAnimationFrame(animationId);
  resetState();
  gameLoop();
}

function flap() {
  if (gameOver) {
    restartGame();
    return;
  }
  if (!gameStarted) {
    gameStarted = true;
  }
  bird.velocity = bird.lift;
}

function updateScoreUI() {
  document.getElementById("current-score").textContent = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("neltexFlappyBest", bestScore);
  }
  document.getElementById("best-score").textContent = bestScore;
}

function endGame() {
  gameOver = true;
}

function drawOverlayText(title, subtitle) {
  const ctx = gameArea.context;
  ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
  ctx.fillRect(0, 0, gameArea.canvas.width, gameArea.canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, gameArea.canvas.width / 2, 140);

  ctx.fillStyle = "#facc15";
  ctx.font = "600 15px Segoe UI, sans-serif";
  ctx.fillText(subtitle, gameArea.canvas.width / 2, 175);
}

function gameLoop() {
  gameArea.clear();

  if (gameStarted && !gameOver) {
    frameNo++;

    // Spawn new pipe every 105 frames
    if (frameNo === 1 || frameNo % 105 === 0) {
      const gap = 98;
      const minHeight = 35;
      const maxHeight = gameArea.canvas.height - 20 - gap - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      pipes.push(new Pipe(gameArea.canvas.width, topHeight, gap));
    }
  }

  // Update & draw pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    if (gameStarted && !gameOver) {
      pipes[i].update();
    }
    pipes[i].draw();

    // Check collision
    if (pipes[i].hits(bird)) {
      endGame();
    }

    // Score point when passing pipe
    if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
      pipes[i].passed = true;
      score++;
      updateScoreUI();
    }

    // Remove off-screen pipes
    if (pipes[i].x + pipes[i].width < -10) {
      pipes.splice(i, 1);
    }
  }

  bird.update();
  bird.draw();

  if (!gameStarted && !gameOver) {
    drawOverlayText("READY TO FLY?", "Press SPACE, Click, or Tap FLAP to Start");
  } else if (gameOver) {
    drawOverlayText("GAME OVER", `Final Score: ${score} — Click or Press SPACE to Retry`);
  }

  animationId = requestAnimationFrame(gameLoop);
}

// Keyboard support (Spacebar or Up Arrow)
window.addEventListener("keydown", function (e) {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    flap();
  }
});
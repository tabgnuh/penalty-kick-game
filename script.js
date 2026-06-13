const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const shotsEl = document.getElementById('shots');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let shots = 0;
const maxShots = 5;

// Game objects
let ball = { x: 400, y: 420, radius: 15, vx: 0, vy: 0, shooting: false };
let goalkeeper = { x: 350, width: 80, height: 120 };
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

let gameOver = false;

// Simple goal posts
function drawField() {
    // Grass
    ctx.fillStyle = '#0a3d0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Penalty area
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.strokeRect(200, 250, 400, 250);
    
    // Goal
    ctx.fillStyle = '#222';
    ctx.fillRect(280, 150, 240, 15); // crossbar
    ctx.fillRect(280, 150, 10, 120);
    ctx.fillRect(510, 150, 10, 120);
    
    // Net lines
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    for (let i = 290; i < 520; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 155);
        ctx.lineTo(i, 260);
        ctx.stroke();
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    
    // Goalkeeper (simple rectangle + head)
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(goalkeeper.x, 180, goalkeeper.width, goalkeeper.height);
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(goalkeeper.x + 40, 170, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Power indicator when dragging
    if (isDragging) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(dragStartX, dragStartY);
        ctx.stroke();
    }
    
    // UI text
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = score >= 3 ? '#0f0' : '#f00';
        ctx.font = 'bold 50px Arial';
        ctx.fillText(score >= 3 ? 'YOU WIN!' : 'GAME OVER', 220, 250);
    }
}

// Update game logic
function update() {
    if (ball.shooting) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.4; // gravity
        
        // Collision with goalkeeper
        if (
            ball.x > goalkeeper.x && 
            ball.x < goalkeeper.x + goalkeeper.width &&
            ball.y > 180 && ball.y < 300 &&
            Math.abs(ball.vy) > 2
        ) {
            ball.vx = -ball.vx * 0.6;
            ball.vy = -8;
            setTimeout(resetShot, 800);
        }
        
        // Goal detection
        if (ball.y < 200 && ball.x > 290 && ball.x < 510) {
            score++;
            scoreEl.textContent = score;
            setTimeout(resetShot, 600);
        }
        
        // Out of bounds
        if (ball.y > 500 || ball.x < 0 || ball.x > canvas.width) {
            setTimeout(resetShot, 400);
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Mouse controls
canvas.addEventListener('mousedown', (e) => {
    if (gameOver || ball.shooting) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    if (Math.hypot(mx - ball.x, my - ball.y) < 40) {
        isDragging = true;
        dragStartX = mx;
        dragStartY = my;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    const power = Math.min(Math.hypot(dragStartX - endX, dragStartY - endY) / 8, 25);
    
    ball.vx = (ball.x - endX) * 0.12;
    ball.vy = (ball.y - endY) * 0.12;
    ball.shooting = true;
    
    shots++;
    shotsEl.textContent = `${shots}/${maxShots}`;
    
    if (shots >= maxShots) {
        setTimeout(() => gameOver = true, 1200);
    }
});

function resetShot() {
    ball.x = 400;
    ball.y = 420;
    ball.vx = 0;
    ball.vy = 0;
    ball.shooting = false;
    
    // Move goalkeeper randomly
    goalkeeper.x = 280 + Math.random() * 160;
}

restartBtn.addEventListener('click', () => {
    score = 0;
    shots = 0;
    scoreEl.textContent = 0;
    shotsEl.textContent = `0/${maxShots}`;
    gameOver = false;
    resetShot();
});

// Start game
resetShot();
gameLoop();

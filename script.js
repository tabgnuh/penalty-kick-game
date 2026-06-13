const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const shotsEl = document.getElementById('shots');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let shots = 0;
const maxShots = 5;

// Game objects
let ball = { x: 150, y: 380, radius: 18, vx: 0, vy: 0, shooting: false };

let player = { 
    x: 80, y: 280, 
    width: 120, height: 160,
    kicking: false, 
    kickProgress: 0 
};

let goalkeeper = { 
    x: 380, y: 140,
    width: 110, height: 160,
    targetX: 380,
    diving: null, // 'left', 'right', null
    diveProgress: 0
};

// Images
const images = {
    shibaStand: new Image(),
    shibaKick: new Image(),
    huskyStand: new Image(),
    huskyLeft: new Image(),
    huskyRight: new Image(),
    ballImg: new Image()
};

// Load images
function loadImages() {
    images.shibaStand.src = 'images/shiba-stand.png';
    images.shibaKick.src = 'images/shiba-kick.png';
    images.huskyStand.src = 'images/husky-stand.png';
    images.huskyLeft.src = 'images/husky-dive-left.png';
    images.huskyRight.src = 'images/husky-dive-right.png';
    images.ballImg.src = 'https://i.imgur.com/8v5f9.png'; // bóng mặc định (có thể thay bằng file local)
}

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let gameOver = false;

// Draw field
function drawField() {
    ctx.fillStyle = '#0a3d0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeRect(100, 220, 500, 280);

    // Goal
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(280, 130, 240, 20);
    ctx.fillRect(280, 130, 12, 150);
    ctx.fillRect(508, 130, 12, 150);
}

// Draw player (Shiba)
function drawPlayer() {
    const img = player.kicking ? images.shibaKick : images.shibaStand;
    ctx.drawImage(img, player.x, player.y, player.width, player.height);
}

// Draw Goalkeeper (Husky)
function drawGoalkeeper() {
    let img = images.huskyStand;
    
    if (goalkeeper.diving === 'left') img = images.huskyLeft;
    if (goalkeeper.diving === 'right') img = images.huskyRight;

    ctx.drawImage(img, goalkeeper.x, goalkeeper.y, goalkeeper.width, goalkeeper.height);
}

// Main draw
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    drawPlayer();
    drawGoalkeeper();

    // Ball
    ctx.drawImage(images.ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);

    if (isDragging) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.lineWidth = 6;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(dragStartX, dragStartY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = score >= 3 ? '#4ade80' : '#f87171';
        ctx.font = 'bold 60px Arial';
        ctx.fillText(score >= 3 ? 'VICTORY!' : 'GAME OVER', 170, 240);
        ctx.font = 'bold 32px Arial';
        ctx.fillText(`Final Score: ${score} / 5`, 260, 300);
    }
}

// Update
function update() {
    if (ball.shooting) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.45;

        // Goalkeeper AI
        const predictedX = ball.x + ball.vx * 7;
        goalkeeper.targetX = Math.max(280, Math.min(480, predictedX - 50));

        if (!goalkeeper.diving) {
            goalkeeper.x += (goalkeeper.targetX - goalkeeper.x) * 0.2;
        }

        // Collision with goalkeeper
        if (
            ball.x > goalkeeper.x && 
            ball.x < goalkeeper.x + goalkeeper.width &&
            ball.y > goalkeeper.y && 
            ball.y < goalkeeper.y + goalkeeper.height - 30
        ) {
            goalkeeper.diving = ball.vx < 0 ? 'left' : 'right';
            goalkeeper.diveProgress = 0;
            ball.vx *= -0.6;
            ball.vy = -10;
            setTimeout(resetShot, 900);
        }

        // Goal
        if (ball.y < 165 && ball.x > 295 && ball.x < 505) {
            score++;
            scoreEl.textContent = score;
            setTimeout(resetShot, 800);
        }

        // Out
        if (ball.y > 520 || ball.x < 0 || ball.x > canvas.width) {
            setTimeout(resetShot, 600);
        }
    }

    // Animation progress
    if (player.kicking) {
        player.kickProgress += 0.2;
        if (player.kickProgress > 4) player.kicking = false;
    }

    if (goalkeeper.diving) {
        goalkeeper.diveProgress += 0.15;
        if (goalkeeper.diveProgress > 5) goalkeeper.diving = null;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls (giữ nguyên)
canvas.addEventListener('mousedown', (e) => {
    if (gameOver || ball.shooting) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (Math.hypot(mx - ball.x, my - ball.y) < 50) {
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

    ball.vx = (ball.x - endX) * 0.14;
    ball.vy = (ball.y - endY) * 0.135;
    ball.shooting = true;

    player.kicking = true;
    player.kickProgress = 0;

    shots++;
    shotsEl.textContent = `${shots}/${maxShots}`;

    if (shots >= maxShots) {
        setTimeout(() => gameOver = true, 1600);
    }
});

function resetShot() {
    ball.x = 150;
    ball.y = 380;
    ball.vx = 0;
    ball.vy = 0;
    ball.shooting = false;
    player.kicking = false;

    goalkeeper.x = 360 + Math.random() * 70;
    goalkeeper.targetX = goalkeeper.x;
    goalkeeper.diving = null;
}

restartBtn.addEventListener('click', () => {
    score = 0;
    shots = 0;
    scoreEl.textContent = 0;
    shotsEl.textContent = `0/${maxShots}`;
    gameOver = false;
    resetShot();
});

// Init
loadImages();
resetShot();
gameLoop();

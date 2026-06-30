// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get device pixel ratio for sharp rendering
const dpr = window.devicePixelRatio || 1;

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const baseWidth = canvas.width / dpr;
const baseHeight = canvas.height / dpr;

let gameState = 'menu';
let score = 0;
let level = 1;
let wave = 1;
let multiplier = 1;
let gameLoopActive = false;

// Player
const player = {
    x: baseWidth / 2,
    y: baseHeight - 50,
    width: 30,
    height: 40,
    speed: 5,
    health: 100,
    maxHealth: 100,
    bullets: [],
    powerups: {
        rapidFire: 0,
        shield: 0,
        multishot: 0
    }
};

let keys = {};
let enemies = [];
let powerUps = [];
let particles = [];
let enemyBullets = [];

// Mobile touch controls
let touchControls = {
    left: false,
    right: false,
    shoot: false
};

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Touch event listeners
if (isMobile) {
    const controlLeft = document.getElementById('controlLeft');
    const controlCenter = document.getElementById('controlCenter');
    const controlRight = document.getElementById('controlRight');
    const mobileControls = document.getElementById('mobile-controls');
    
    mobileControls.classList.remove('hidden');
    
    // Left control
    controlLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.left = true;
        controlLeft.classList.add('active');
    });
    controlLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.left = false;
        controlLeft.classList.remove('active');
    });
    
    // Center control (shoot)
    controlCenter.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState === 'playing') shoot();
        controlCenter.classList.add('active');
    });
    controlCenter.addEventListener('touchend', (e) => {
        e.preventDefault();
        controlCenter.classList.remove('active');
    });
    
    // Right control
    controlRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.right = true;
        controlRight.classList.add('active');
    });
    controlRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.right = false;
        controlRight.classList.remove('active');
    });
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing') shoot();
    }
    
    if (e.key.toLowerCase() === 'p') {
        if (gameState === 'playing') togglePause();
        else if (gameState === 'paused') togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// UI Elements
const menuDiv = document.getElementById('menu');
const hudDiv = document.getElementById('hud');
const gameOverDiv = document.getElementById('gameOver');
const pauseDiv = document.getElementById('pause');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('menuBtn').addEventListener('click', goToMenu);
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('pauseMenuBtn').addEventListener('click', goToMenu);
document.getElementById('pauseBtn').addEventListener('click', togglePause);

function startGame() {
    gameState = 'playing';
    score = 0;
    level = 1;
    wave = 1;
    multiplier = 1;
    player.health = player.maxHealth;
    player.x = baseWidth / 2;
    enemies = [];
    powerUps = [];
    particles = [];
    enemyBullets = [];
    player.bullets = [];
    menuDiv.classList.remove('active');
    hudDiv.classList.remove('hidden');
    gameOverDiv.classList.remove('active');
    pauseDiv.classList.remove('active');
    spawnWave();
    if (!gameLoopActive) {
        gameLoopActive = true;
        gameLoop();
    }
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseDiv.classList.add('active');
    } else if (gameState === 'paused') {
        gameState = 'playing';
        pauseDiv.classList.remove('active');
    }
}

function goToMenu() {
    gameState = 'menu';
    menuDiv.classList.add('active');
    hudDiv.classList.add('hidden');
    gameOverDiv.classList.remove('active');
    pauseDiv.classList.remove('active');
}

function endGame() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = `Score Final: ${score}`;
    document.getElementById('finalLevel').textContent = `Onda Alcançada: ${wave}`;
    gameOverDiv.classList.add('active');
    hudDiv.classList.add('hidden');
}

function restartGame() {
    startGame();
}

// Draw Functions
function drawPlayer() {
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - player.width/2, player.y + player.height);
    ctx.lineTo(player.x + player.width/2, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#00ddff';
    ctx.fillRect(player.x - 5, player.y + 10, 10, 10);
}

function drawBullets() {
    ctx.fillStyle = '#00ff88';
    player.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        if (bullet.y < 0) {
            player.bullets.splice(index, 1);
        }
    });
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        enemy.x += Math.sin(enemy.x / 50) * 0.5;
        
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x - enemy.width/2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width/2, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (Math.random() < 0.01) {
            enemyBullets.push({
                x: enemy.x,
                y: enemy.y,
                speed: 3,
                radius: 2
            });
        }
        
        if (enemy.y > baseHeight) {
            enemies.splice(index, 1);
            player.health -= 10;
            if (player.health <= 0) endGame();
        }
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = '#ff3388';
    enemyBullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;
        
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (bullet.y > baseHeight) {
            enemyBullets.splice(index, 1);
        }
    });
}

function drawPowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += 2;
        
        ctx.fillStyle = powerUp.type === 'health' ? '#00ff00' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = powerUp.type === 'health' ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 170, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (powerUp.y > baseHeight) {
            powerUps.splice(index, 1);
        }
    });
}

function drawParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        ctx.fillStyle = `rgba(${particle.color}, ${particle.life / particle.maxLife})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

function createExplosion(x, y, color = '0, 255, 136') {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            maxLife: 30,
            size: Math.random() * 3 + 1,
            color
        });
    }
}

// Collision Detection
function checkCollisions() {
    player.bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < 20) {
                player.bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += Math.floor(10 * multiplier);
                multiplier = Math.min(multiplier + 0.1, 5);
                createExplosion(enemy.x, enemy.y, '255, 0, 85');
                
                if (Math.random() < 0.1) {
                    powerUps.push({
                        x: enemy.x,
                        y: enemy.y,
                        type: Math.random() < 0.5 ? 'health' : 'damage'
                    });
                }
            }
        });
    });
    
    enemyBullets.forEach((bullet, index) => {
        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 20) {
            enemyBullets.splice(index, 1);
            player.health -= 5;
            createExplosion(player.x, player.y, '255, 100, 100');
            if (player.health <= 0) endGame();
        }
    });
    
    powerUps.forEach((powerUp, index) => {
        const dx = powerUp.x - player.x;
        const dy = powerUp.y - player.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 25) {
            if (powerUp.type === 'health') {
                player.health = Math.min(player.health + 20, player.maxHealth);
            } else {
                multiplier = Math.min(multiplier + 0.5, 5);
            }
            powerUps.splice(index, 1);
            createExplosion(powerUp.x, powerUp.y, powerUp.type === 'health' ? '0, 255, 0' : '255, 170, 0');
        }
    });
}

// Shooting
function shoot() {
    player.bullets.push({
        x: player.x,
        y: player.y,
        speed: 7,
        radius: 3
    });
}

// Spawning
function spawnWave() {
    const enemyCount = 3 + wave * 2;
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: Math.random() * (baseWidth - 40) + 20,
            y: -50 - i * 60,
            width: 20,
            height: 30,
            speed: 1 + wave * 0.2
        });
    }
}

// Update HUD
function updateHUD() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = wave;
    document.getElementById('multiplier').textContent = multiplier.toFixed(1);
    document.getElementById('healthText').textContent = `HP: ${Math.max(0, player.health)}/100`;
    
    const healthPercent = Math.max(0, (player.health / player.maxHealth) * 100);
    document.getElementById('healthFill').style.width = healthPercent + '%';
}

// Player Movement
function updatePlayer() {
    if (keys['a'] || keys['arrowleft'] || touchControls.left) {
        player.x -= player.speed;
    }
    if (keys['d'] || keys['arrowright'] || touchControls.right) {
        player.x += player.speed;
    }
    
    player.x = Math.max(player.width/2, Math.min(baseWidth - player.width/2, player.x));
}

// Main Game Loop - CONTÍNUO
function gameLoop() {
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, baseWidth, baseHeight);
    
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
        const x = (Date.now() * 0.01 + i * 160) % baseWidth;
        ctx.beginPath();
        ctx.arc(x, 50, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    if (gameState === 'playing') {
        updatePlayer();
        drawPlayer();
        drawBullets();
        drawEnemies();
        drawEnemyBullets();
        drawPowerUps();
        drawParticles();
        checkCollisions();
        updateHUD();
        
        if (enemies.length === 0 && enemyBullets.length === 0) {
            wave++;
            multiplier = Math.max(1, multiplier - 0.3);
            spawnWave();
        }
    }
    
    // LOOP CONTÍNUO
    if (gameLoopActive) {
        requestAnimationFrame(gameLoop);
    }
}

// Iniciar o loop quando carregar a página
window.addEventListener('load', () => {
    menuDiv.classList.add('active');
    gameLoopActive = true;
    gameLoop();
});

// Prevent zoom on double tap
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, false);

// Prevent default touch behavior for game
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, false);

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, false);

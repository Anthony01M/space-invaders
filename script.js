const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 30,
    width: 30,
    height: 30,
    speed: 5,
    dx: 0,
    alive: true
};

const bullets = [];
const enemyBullets = [];
let enemies = [];
let level = 1;
const enemyRows = 3;
const enemyCols = 8;
const enemyWidth = 40;
const enemyHeight = 20;
const enemyPadding = 10;
const enemyOffsetTop = 30;
const enemyOffsetLeft = 30;

function createEnemies() {
    enemies = [];
    const totalEnemyWidth = enemyCols * (enemyWidth + enemyPadding) - enemyPadding;
    const startX = (canvas.width - totalEnemyWidth) / 2;

    if (level % 10 === 0) {
        enemies.push({ x: canvas.width / 2 - 50, y: enemyOffsetTop, width: 100, height: 50, isBoss: true, health: 100 });
    } else {
        for (let row = 0; row < enemyRows; row++) {
            for (let col = 0; col < enemyCols; col++) {
                let enemyX, enemyY;
                let overlap;
                do {
                    overlap = false;
                    enemyX = startX + col * (enemyWidth + enemyPadding) + Math.random() * 20 - 10;
                    enemyY = row * (enemyHeight + enemyPadding) + enemyOffsetTop + Math.random() * 20 - 10;
                    for (let i = 0; i < enemies.length; i++) {
                        const existingEnemy = enemies[i];
                        if (
                            enemyX < existingEnemy.x + existingEnemy.width &&
                            enemyX + enemyWidth > existingEnemy.x &&
                            enemyY < existingEnemy.y + existingEnemy.height &&
                            enemyY + enemyHeight > existingEnemy.y
                        ) {
                            overlap = true;
                            break;
                        }
                    }
                } while (overlap);
                enemies.push({ x: enemyX, y: enemyY, width: enemyWidth, height: enemyHeight });
            }
        }
    }
}

function drawPlayer() {
    if (player.alive) {
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function drawBullets() {
    ctx.fillStyle = 'red';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = 'yellow';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    ctx.fillStyle = 'green';
    enemies.forEach(enemy => {
        if (enemy.isBoss) {
            ctx.fillStyle = 'purple';
        } else {
            ctx.fillStyle = 'green';
        }
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function movePlayer() {
    player.x += player.dx;

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function moveEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.x += bullet.dx || 0;
        bullet.y += bullet.dy || bullet.speed;
        if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
            enemyBullets.splice(index, 1);
        }
    });
}

function moveEnemies() {
    const maxSpeed = 1.5;
    const speed = Math.min(0.25 + level * 0.025, maxSpeed);

    enemies.forEach(enemy => {
        enemy.y += speed;
        if (enemy.y + enemy.height > canvas.height) {
            player.alive = false;
            console.log('Enemy reached the bottom!');
        }
    });
}

function detectCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bulletIndex, 1);
                if (enemy.isBoss) {
                    enemy.health -= 10;
                    if (enemy.health <= 0) {
                        enemies.splice(enemyIndex, 1);
                    }
                } else {
                    enemies.splice(enemyIndex, 1);
                }
            }
        });
    });

    enemyBullets.forEach((bullet, bulletIndex) => {
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            player.alive = false;
            console.log('Player hit!');
        }
    });

    enemies.forEach((enemy, enemyIndex) => {
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            player.alive = false;
            console.log('Player hit!');
        }
    });

    if (enemies.length === 0) {
        level++;
        createEnemies();
    }
}

function drawBossHealthBar(boss) {
    const barWidth = 100;
    const barHeight = 10;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 10;

    ctx.fillStyle = 'black';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthWidth = (boss.health / 100) * barWidth;
    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, healthWidth, barHeight);
}

function enemyShoot() {
    enemies.forEach(enemy => {
        if (enemy.isBoss) {
            if (Math.random() < 0.05) {
                const directions = [
                    { dx: (Math.random() - 0.5) * 0.6, dy: 1 },
                    { dx: -0.5, dy: 1 },
                    { dx: 0.5, dy: 1 },
                ];
                directions.forEach(direction => {
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2.5,
                        y: enemy.y + enemy.height,
                        width: 5,
                        height: 10,
                        speed: 3 + level * 0.2,
                        dx: direction.dx * (3 + level * 0.2),
                        dy: direction.dy * (3 + level * 0.2)
                    });
                });
            }
        } else {
            if (Math.random() < 0.0005) {
                enemyBullets.push({ x: enemy.x + enemy.width / 2 - 2.5, y: enemy.y + enemy.height, width: 5, height: 10, speed: 3 + level * 0.2 });
            }
        }
    });
}

function update() {
    if (player.alive) {
        movePlayer();
        moveBullets();
        moveEnemyBullets();
        moveEnemies();
        detectCollisions();
        enemyShoot();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemyBullets();
    drawEnemies();

    const boss = enemies.find(enemy => enemy.isBoss);
    if (boss) {
        drawBossHealthBar(boss);
    }
}

function gameOver() {
    ctx.font = '48px serif';
    ctx.fillStyle = 'white';
    const text = 'Game Over';
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, (canvas.width - textWidth) / 2, canvas.height / 2);

    restartButton.style.display = 'block';
    restartButton.style.position = 'absolute';
    restartButton.style.left = `${(window.innerWidth - restartButton.offsetWidth) / 2}px`;
    restartButton.style.top = `${canvas.offsetTop + canvas.height / 2 + 50}px`;
}

function restartGame() {
    player.alive = true;
    player.x = canvas.width / 2 - 15;
    player.y = canvas.height - 30;
    bullets.length = 0;
    enemyBullets.length = 0;
    level = 1;
    createEnemies();
    restartButton.style.display = 'none';
    gameLoop();
}

function gameLoop() {
    update();
    draw();
    if (player.alive) {
        requestAnimationFrame(gameLoop);
    } else {
        gameOver();
    }
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    } else if (e.key === ' ') {
        bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = 0;
    }
}

restartButton.addEventListener('click', restartGame);
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
createEnemies();
gameLoop();
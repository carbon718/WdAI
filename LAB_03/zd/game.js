// --- KONFIGURACJA I ZMIENNE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let frames = 0;
const DEGREE = Math.PI / 180;

// STANY GRY
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    dying: 2, // Stan, gdy ptak uderzył, ale spada na ziemię
    over: 3
};

// TABELA WYNIKÓW
const score = {
best: 0,
value: 0,

draw: function() {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";

    if (state.current == state.game || state.current == state.dying) {
    // Rysowanie wyniku w prawym górnym rogu
        let scoreStr = this.value.toString();
        let x = canvas.width - 20;

        // Rysowanie od prawej do lewej
        for(let i = scoreStr.length - 1; i >= 0; i--) {
            let num = scoreStr[i];
            let img = assets.numbers[num];
            x -= img.width;
            ctx.drawImage(img, x, 10);
            x -= 2; // Odstęp między cyframi
        }
    } else if (state.current == state.over) {
    // Wynik na ekranie końcowym
    ctx.font = "25px serif";
    ctx.fillStyle = "#FFF";
    ctx.lineWidth = 2;

    // Aktualny wynik
    ctx.fillText(this.value, 225, 186);
    ctx.strokeText(this.value, 225, 186);

    // Najlepszy wynik
    ctx.fillText(this.best, 225, 228);
    ctx.strokeText(this.best, 225, 228);
    }
},

reset: function() {
    this.value = 0;
    }
};

// --- ŁADOWANIE ZASOBÓW ---
// Obiekt przechowujący obrazy
const assets = {
    bg: new Image(),
    base: new Image(),
    bird: [new Image(), new Image(), new Image()],
    pipe: new Image(),
    message: new Image(),
    gameover: new Image(),
    numbers: []
};

// Obiekt przechowujący dźwięki
const sounds = {
    wing: new Audio(),
    hit: new Audio(),
    die: new Audio(),
    point: new Audio(),
    swoosh: new Audio()
};

// Przypisanie ścieżek
assets.bg.src = "assets/Flappy Bird/background-day.png";
assets.base.src = "assets/Flappy Bird/base.png";
assets.bird[0].src = "assets/Flappy Bird/yellowbird-downflap.png";
assets.bird[1].src = "assets/Flappy Bird/yellowbird-midflap.png";
assets.bird[2].src = "assets/Flappy Bird/yellowbird-upflap.png";
assets.pipe.src = "assets/Flappy Bird/pipe-green.png";
assets.message.src = "assets/UI/message.png";
assets.gameover.src = "assets/UI/gameover.png";

// Ładowanie cyfr 0-9
for(let i=0; i<=9; i++) {
    let img = new Image();
    img.src = `assets/UI/Numbers/${i}.png`;
    assets.numbers.push(img);
}

// Przypisanie dźwięków
sounds.wing.src = "assets/Sound Efects/wing.wav";
sounds.hit.src = "assets/Sound Efects/hit.wav";
sounds.die.src = "assets/Sound Efects/die.wav";
sounds.point.src = "assets/Sound Efects/point.wav";
sounds.swoosh.src = "assets/Sound Efects/swoosh.wav";

// --- OBIEKTY GRY ---

// TŁO
const bg = {
    x: 0,
    y: 0,
    draw: function() {
        ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);
    }
};

// ZIEMIA (BASE)
const fg = {
    h: 112, // Wysokość obrazka base.png
    x: 0,
    dx: 2,
    draw: function() {
        let yPos = canvas.height - assets.base.height;
        ctx.drawImage(assets.base, this.x, canvas.height - 112);
        ctx.drawImage(assets.base, this.x + assets.base.width, canvas.height - 112);
    },
    update: function() {
        if (state.current == state.game || state.current == state.getReady) {
            this.x = (this.x - this.dx) % (assets.base.width / 2);
            if (this.x <= -assets.base.width) this.x = 0;
        }
    }
};

// PTAK
const bird = {
    animation: [0, 1, 2, 1],
    x: 50,
    y: 150,
    speed: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,
    radius: 12,
    frame: 0,

    draw: function() {
    let birdImg = assets.bird[this.animation[this.frame]];

    ctx.save();
    ctx.translate(this.x, this.y);
    let rot = this.rotation * DEGREE;
    if(state.current == state.getReady) rot = 0;
    ctx.rotate(rot);

    ctx.drawImage(birdImg, -birdImg.width/2, -birdImg.height/2);
    ctx.restore();
},

flap: function() {
    this.speed = -this.jump;
    sounds.wing.currentTime = 0;
    sounds.wing.play().catch(() => {});
},

update: function() {
// Prędkość animacji machania skrzydłami
    const period = state.current == state.getReady ? 10 : 5;
    this.frame += frames % period == 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (state.current == state.getReady) {
    this.y = 150; // Reset pozycji
    this.rotation = 0 * DEGREE;
    } else {
    // Fizyka
    this.speed += this.gravity;
    this.y += this.speed;

    // Kolizja z podłogą
    if (this.y + assets.bird[0].height/2 >= canvas.height - 112) {
        this.y = canvas.height - 112 - assets.bird[0].height/2;

        if (state.current == state.game) {
            state.current = state.over;
            sounds.hit.play().catch(()=>{});
            onGameOver();
        } else if (state.current == state.dying) {
        state.current = state.over;
        // Dźwięk uderzenia w ziemię
            sounds.die.play().catch(()=>{});
            onGameOver();
        }
    }

        // Rotacja
            if (this.speed >= this.jump) {
                this.rotation = 90;
                this.frame = 1; // Przestań machać jak spadasz szybko
            } else {
                this.rotation = -25;
            }
        }
    }
};

// RURY
const pipes = {
    position: [],
    w: 52,
    h: 400, // Wysokość rury (z assetu to 320px, ale skalujemy/zakładamy)
    gap: 100, // Przerwa między rurami
    dx: 2,
    maxYPos: -150,

    draw: function() {
    for (let i = 0; i < this.position.length; i++) {
    let p = this.position[i];
    let topY = p.y;
    let bottomY = p.y + this.h + this.gap;

    // Górna rura (odwrócona)
    ctx.save();
    ctx.translate(p.x + this.w, topY + this.h);
    ctx.rotate(Math.PI); // Obrót o 180 stopni
    ctx.drawImage(assets.pipe, 0, 0, this.w, this.h);
    ctx.restore();

    // Dolna rura
    ctx.drawImage(assets.pipe, p.x, bottomY, this.w, this.h);
    }
},

update: function() {
if (state.current !== state.game) return;

// Dodawanie rur
if (frames % 100 == 0) {
    this.position.push({
    x: canvas.width,
    y: this.maxYPos * (Math.random() + 1)
    });
}

for (let i = 0; i < this.position.length; i++) {
let p = this.position[i];

let bottomPipeY = p.y + this.h + this.gap;

let birdLeft = bird.x - bird.radius;
let birdRight = bird.x + bird.radius;
let birdTop = bird.y - bird.radius;
let birdBottom = bird.y + bird.radius;

let pipeLeft = p.x;
let pipeRight = p.x + this.w;
let topPipeBottom = p.y + this.h;

if (birdRight > pipeLeft && birdLeft < pipeRight) {
    if (birdTop < topPipeBottom || birdBottom > bottomPipeY) {
        // Uderzenie
        state.current = state.dying;
        sounds.hit.play().catch(()=>{});
    }
}

// Ruch rur
p.x -= this.dx;

// Usuwanie rur poza ekranem
if (p.x + this.w <= 0) {
    this.position.shift();
    i--;
}

// Naliczanie punktów
if (p.x + this.w < bird.x && !p.passed) {
            score.value += 1;
            p.passed = true;
            sounds.point.play().catch(()=>{});
            score.best = Math.max(score.value, score.best);
        }
    }
},

reset: function() {
        this.position = [];
    }
};

// --- LOGIKA GAME OVER I LOCAL STORAGE ---
    const highScores = {
    key: 'flappyHighScores',
    get: function() {
    const scores = localStorage.getItem(this.key);
    return scores ? JSON.parse(scores) : [];
},
    save: function(newScore) {
    let scores = this.get();
    scores.push(newScore);
    scores.sort((a, b) => b - a); // Sortuj malejąco
    scores = scores.slice(0, 5); // Trzymaj tylko top 5
    localStorage.setItem(this.key, JSON.stringify(scores));
    }
};

function onGameOver() {
    highScores.save(score.value);
    let scores = highScores.get();
    if(scores.length > 0) score.best = scores[0];
}

// --- RYSOWANIE EKRANÓW ---

function drawGetReady() {

const w = 184;
const h = 267;
ctx.drawImage(assets.message, canvas.width/2 - w/2, 80);
}

function drawGameOver() {
const w = 192;
const h = 42;
ctx.drawImage(assets.gameover, canvas.width/2 - w/2, 80);

ctx.fillStyle = "#ded895";
ctx.fillRect(canvas.width/2 - 113, 150, 226, 114);
ctx.border = "2px solid #543847";
ctx.strokeRect(canvas.width/2 - 113, 150, 226, 114);

ctx.fillStyle = "#e86101";
ctx.font = "bold 20px Arial";
ctx.textAlign = "left";
ctx.fillText("WYNIK:", canvas.width/2 - 100, 190);
ctx.fillText("NAJLEPSZY:", canvas.width/2 - 100, 230);

ctx.fillStyle = "#543847"; // Ciemny brąz
ctx.fillRect(canvas.width/2 - 60, 300, 120, 40);
ctx.fillStyle = "#FFF";
ctx.font = "bold 16px Arial";
ctx.textAlign = "center";
ctx.fillText("Zagraj ponownie", canvas.width/2, 325);

ctx.fillStyle = "#000";
ctx.font = "14px Arial";
ctx.fillText("TOP 5 WYNIKÓW:", canvas.width/2, 370);
let scores = highScores.get();
for(let i=0; i<scores.length; i++) {
ctx.fillText(`${i+1}. ${scores[i]}`, canvas.width/2, 390 + (i*18));
}
}

// --- GŁÓWNA PĘTLA I STEROWANIE ---

function draw() {
ctx.fillStyle = "#70c5ce";
ctx.fillRect(0, 0, canvas.width, canvas.height);

bg.draw();
pipes.draw();
fg.draw();
bird.draw();

if (state.current == state.getReady) {
drawGetReady();
} else if (state.current == state.over) {
drawGameOver();
}

score.draw();
}

function update() {
bird.update();
fg.update();
pipes.update();
}

function loop() {
update();
draw();
frames++;
requestAnimationFrame(loop);
}

// Obsługa wejścia
// Spacja i Kliknięcie
const inputHandler = () => {
switch (state.current) {
case state.getReady:
state.current = state.game;
sounds.swoosh.play().catch(()=>{});
break;
case state.game:
bird.flap();
break;
case state.dying:
break;
case state.over:
state.current = state.getReady;
pipes.reset();
bird.speed = 0;
score.reset();
frames = 0;
break;
}
};

// Obsługa myszki dla przycisku "Zagraj ponownie"
canvas.addEventListener('click', function(evt) {
let rect = canvas.getBoundingClientRect();
let clickX = evt.clientX - rect.left;
let clickY = evt.clientY - rect.top;

if(state.current == state.over) {
if(clickX >= canvas.width/2 - 60 && clickX <= canvas.width/2 + 60 &&
clickY >= 300 && clickY <= 340) {
state.current = state.getReady;
pipes.reset();
bird.speed = 0;
score.reset();
frames = 0;
}
} else {
inputHandler();
}
});

// Obsługa klawiatury (Spacja)
document.addEventListener("keydown", function(e) {
if (e.code === "Space") {
// Jeśli game over, resetujemy od razu
inputHandler();
}
});

// START
loop();



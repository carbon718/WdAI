let time = 0;
let interval = null;

function updateDisplay() {
    const display = document.getElementById('digital-clock');
    if (time < 60) {
        display.innerText = `${time}s`;
    } else {
        const min = Math.floor(time / 60);
        const sec = time % 60;
        display.innerText = `${min}min ${sec}s`;
    }
}

document.getElementById("start-button").addEventListener("click", () => {
    if (interval === null) {
        interval = setInterval(() => {
            time++;
            updateDisplay();
        }, 1000);
    }
});

document.getElementById("stop-button").addEventListener("click", () => {
    clearInterval(interval);
    interval = null;
});

document.getElementById("reset-button").addEventListener("click", () => {
    clearInterval(interval);
    interval = null;
    time = 0;
    updateDisplay();
});

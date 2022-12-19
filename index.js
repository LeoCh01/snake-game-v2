const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
let score = 2;
const btnElement = document.getElementById("autoBtn");
let autoBtn = false;
const velSliderElement = document.getElementById("velSlider");
const velOutputElement = document.getElementById("velOutput");
const gridSliderElement = document.getElementById("gridSlider");
const gridOutputElement = document.getElementById("gridSliderOutput");

canvas.width = innerHeight / 1.1;
canvas.height = innerHeight / 1.1;

let bLen = 4;
let size = canvas.width / bLen;
let sVel = 5;
let board, sbody, sLen, buff, apple;
const direction = { w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0], x: [0, 0] };
let botMoves;
let alive;

// reset
function resetBoard() {
    clearInterval(alive);
    size = canvas.width / bLen;
    board = Array(bLen);
    sbody = [[Math.floor(bLen / 2), Math.floor(bLen / 2)]];
    sLen = 1;
    buff = ["x"];

    for (let i = 0; i < bLen; i++) {
        board[i] = Array(bLen);
    }

    for (let i = 0; i < bLen; i++) {
        for (let j = 0; j < bLen; j++) {
            board[i][j] = 0;
        }
    }

    board[Math.floor(bLen / 2)][Math.floor(bLen / 2)] = 1;
    generateApple();
    botMoves = undefined;
    moveSnake();
}

// if body has x, y
function posExists(x, y) {
    for (let i = 0; i < sLen; i++) {
        if (sbody[i][0] == x && sbody[i][1] == y) return true;
    }
    return false;
}

// main
function moveSnake() {
    alive = setInterval(() => {
        // bot code
        if (autoBtn) {
            if (botMoves == undefined) botMoves = findPath();
            if (botMoves != undefined) buff.push(botMoves.shift());
        }

        if (buff.length > 1) {
            buff.shift();
        }

        let x = sbody[sbody.length - 1][0] + direction[buff[0]][0];
        let y = sbody[sbody.length - 1][1] + direction[buff[0]][1];

        if (sbody.length > sLen) {
            let remove = sbody.shift();
            board[remove[0]][remove[1]] = 0;
        }

        // on death
        if (
            !(0 <= x && x < bLen && 0 <= y && y < bLen) ||
            (sLen > 1 && posExists(x, y))
        ) {
            console.log("died at: ", x, y);
            resetBoard();
            return;
        }

        sbody.push([x, y]);

        if (board[x][y] == 2) {
            sLen += 1;
            board[x][y] = 1;
            generateApple();
            board[x][y] = 0;

            // bot code
            if (autoBtn) {
                let m = findPath();
                if (m != undefined) botMoves = m;
            }

            score = Math.max(score, sLen);
            scoreElement.innerHTML = "Highest Score: " + score.toString();
        }

        board[x][y] = 1;
    }, 1000 / sVel);
}

// spawn new apple
function generateApple() {
    let possible = [];

    board.forEach((row, i) => {
        row.forEach((col, j) => {
            if (col != 1) possible.push([i, j]);
        });
    });
    apple = possible[Math.floor(Math.random() * possible.length)];
    board[apple[0]][apple[1]] = 2;
}

// draw
function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw grid
    for (let i = 0; i < bLen; i++) {
        for (let j = 0; j < bLen; j++) {
            ctx.fillStyle = "#eee";
            ctx.fillRect(i * size + 2, j * size + 2, size - 4, size - 4);
        }
    }

    // draw snake + apple borders
    ctx.fillStyle = "#030";
    for (const c of sbody) {
        const x = c[0];
        const y = c[1];
        ctx.fillRect(x * size - 2, y * size - 2, size + 4, size + 4);
    }
    ctx.fillStyle = "#300";
    ctx.beginPath();
    ctx.arc(
        apple[0] * size + size / 2,
        apple[1] * size + size / 2,
        size / 2.2,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // draw snake + apple
    for (let i = 0; i < sLen; i++) {
        const x = sbody[i][0];
        const y = sbody[i][1];
        ctx.fillStyle = "#4f4";
        ctx.fillRect(x * size, y * size, size, size);
    }

    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(
        apple[0] * size + size / 2,
        apple[1] * size + size / 2,
        size / 2.4,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // draw darker head
    ctx.fillStyle = "#0e0";
    ctx.fillRect(
        sbody[sbody.length - 1][0] * size,
        sbody[sbody.length - 1][1] * size,
        size,
        size
    );
}

// controls
window.addEventListener("keypress", (e) => {
    let cbl = buff.length;
    if (e.key == "w") {
        if (cbl < 4 && (buff[0] != "s" || (buff[1] != "s" && cbl == 2)))
            buff.push(e.key);
    }
    if (e.key == "a") {
        if (cbl < 4 && (buff[0] != "d" || (buff[1] != "d" && cbl == 2)))
            buff.push(e.key);
    }
    if (e.key == "s") {
        if (cbl < 4 && (buff[0] != "w" || (buff[1] != "w" && cbl == 2)))
            buff.push(e.key);
    }
    if (e.key == "d") {
        if (cbl < 4 && (buff[0] != "a" || (buff[1] != "a" && cbl == 2)))
            buff.push(e.key);
    }
    if (e.key == "r") {
        clearInterval(alive);
        resetBoard();
    }
});

// change speed slider
velSliderElement.addEventListener("input", (e) => {
    sVel = velSliderElement.value;
    velOutputElement.innerHTML = velSliderElement.value;
    clearInterval(alive);
    moveSnake();
});

// change grid size slider
gridSliderElement.addEventListener("input", (e) => {
    bLen = gridSliderElement.value;
    gridOutputElement.innerHTML = gridSliderElement.value;
    if (autoBtn) onAuto();
    resetBoard();
});

// ------------------------------

// shortest cycle to apple (kind of)
function findPath() {
    let pathCount = 0;
    let shortPath;
    let shortPathApl = bLen ** 2;
    let path = [];
    let start = sbody[sbody.length - 1];
    let end = sbody[0];
    let maxGen = 10;
    let dp = Array(bLen);
    for (let i = 0; i < bLen; i++) {
        dp[i] = Array(bLen).fill(0);
    }

    let notDir = { w: "s", a: "d", s: "w", d: "a", x: "" };
    let dir = [
        ["w", [0, -1]],
        ["a", [-1, 0]],
        ["s", [0, 1]],
        ["d", [1, 0]],
    ];

    for (let i = 0; i < sLen - 1; i++) {
        dp[sbody[i][0]][sbody[i][1]] = 1;
    }

    // eulerian cycle search
    function eulerian(x, y, apl) {
        if (pathCount == maxGen || (apl == -1 && path.length > shortPathApl))
            return;

        if (path.length == bLen ** 2 - sLen + 1 && x == end[0] && y == end[1]) {
            shortPathApl = apl;
            shortPath = path.slice();
            pathCount += 1;
            return;
        }

        if (dp[x][y] == 1 || (path.length == 1 && path[0] == notDir[buff[0]]))
            return;
        dp[x][y] = 1;

        for (const d of dir.sort((a, b) => {
            Math.abs(apple[0] - x - a[1][0]) +
                Math.abs(apple[1] - y - a[1][1]) -
                Math.abs(apple[0] - x - b[1][0]) -
                Math.abs(apple[1] - y - b[1][1]);
        })) {
            const i = d[1][0] + x;
            const j = d[1][1] + y;

            if (0 <= i && i < bLen && 0 <= j && j < bLen) {
                path.push(d[0]);
                board[i][j] == 2
                    ? eulerian(i, j, path.length)
                    : eulerian(i, j, apl);
                path.pop();
            }
        }

        dp[x][y] = 0;
    }

    eulerian(start[0], start[1], -1);
    return shortPath;
}

function onAuto() {
    if (!(bLen == 4 || bLen == 6)) return;
    autoBtn = !autoBtn;
    btnElement.style.color = autoBtn ? "#0f0" : "#000";
    clearInterval(alive);
    botMoves = findPath();
    moveSnake();
}

resetBoard();
animate();

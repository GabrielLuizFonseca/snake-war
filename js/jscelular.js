// Definindo as variáveis
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const audio = new Audio('../snake-war/assets/music_food.mp3');

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const size = 30;
const initialPosition = {x: 270, y: 240};
let snake = [initialPosition];

// Variáveis para controle de toques
let touchStartX = 0;
let touchStartY = 0;

// Adicionando os eventos de toque corretamente

const handleTouchStart = (e) => {
    const touch = e.touches[0]; // Pega o primeiro toque
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
};

const handleTouchMove = (e) => {
    if (!touchStartX || !touchStartY) return;

    const touch = e.touches[0]; // Pega o primeiro toque
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Verifica a direção do movimento do toque
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Movimento horizontal
        if (deltaX > 0 && direction !== "left") {
            direction = "right";
        } else if (deltaX < 0 && direction !== "right") {
            direction = "left";
        }
    } else {
        // Movimento vertical
        if (deltaY > 0 && direction !== "up") {
            direction = "down";
        } else if (deltaY < 0 && direction !== "down") {
            direction = "up";
        }
    }

    // Atualiza a posição inicial para o próximo toque
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
};

// Função para corrigir o toque no canvas (por exemplo, para eventos de toque no dispositivo)
const getTouchPosition = (e) => {
    const rect = canvas.getBoundingClientRect(); // Obtém as dimensões do canvas
    const touchX = e.touches[0].clientX - rect.left; // Corrige a posição X
    const touchY = e.touches[0].clientY - rect.top;  // Corrige a posição Y

    return { x: touchX, y: touchY };
};

// Funções para o controle do jogo (como movimento da cobra, colisão, comida, etc.)

document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowRight" && direction != "left") {
        direction = "right";
    }
    if (key == "ArrowLeft" && direction != "right") {
        direction = "left";
    }
    if (key == "ArrowDown" && direction != "up") {
        direction = "down";
    }
    if (key == "ArrowUp" && direction != "down") {
        direction = "up";
    }
});

// Adicionando o controle por toque
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);

// Funções do jogo (como drawFood, drawSnake, etc.)

const incrementScore = () => {
    score.innerText = + score.innerText + 10
}

const randomNumber = (min, max) => {
    return Math.round(Math.random()*(max-min) + min)
}
const randomPosition = () =>{
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number /30)*30
}
const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}
const food = {
        x: randomPosition(),
        y: randomPosition(),
        color: randomColor()
    }

let direction
let loopId

const drawFood = () => {
    const {x, y, color} = food

    ctx.fillStyle = color
    ctx.shadowColor = "orange"
    ctx.shadowBlur = 6
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}
const drawSnake = () => {
    ctx.fillStyle = "#ddd"

    snake.forEach((position, index) => {
        if(index == snake.length -1){
            ctx.fillStyle = "white"
        }

        ctx.fillRect(position.x, position.y, size, size)
    })
}

const moveSnake = () => {
    if(!direction) return
    const head = snake[snake.length -1]

    if(direction == "right"){
        
        snake.push({ x: head.x + size, y: head.y})
    }
    if(direction == "left"){
        snake.push({ x: head.x - size, y: head.y})
    }
    if(direction == "down"){
        snake.push({ x: head.x, y: head.y + size})
    }
    if(direction == "up"){
        snake.push({ x: head.x, y: head.y - size})
    }
    
    snake.shift()
}

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    for(let i = 30; i < canvas.width; i += 30){
        // linha x
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()
        // linha y
        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

const checkEat = () =>{
    const head = snake [snake.length - 1]
    
    if(head.x == food.x && head.y == food.y){
        incrementScore()
        snake.push(head)
        audio.play()

        let x = randomPosition()
        let y = randomPosition()
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

const checkCollison = () =>{
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length -2

    const wallColision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfColission = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position == head.y
    })
    if(wallColision || selfColission){
        gameOver()
    }
}

const gameOver = () => {
    direction = undefined

    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(2px)"
}

// Função do loop do jogo (onde a lógica do jogo é executada)
const gameLoop = () => {
    clearInterval(loopId);

    ctx.clearRect(0, 0, 600, 600);
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEat();
    checkCollison();

    loopId = setTimeout(() => {
        gameLoop();
    }, 300);
};

// Iniciando o jogo
gameLoop();

// Evento de início de jogo
buttonPlay.addEventListener("click", () => {
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";

    snake = [initialPosition];
});
const mobileMessage = document.getElementById("mobileMessage");

const checkScreenSize = () => {
    if (window.innerWidth < 420) {
        mobileMessage.classList.remove("hidden"); // Exibe a mensagem
    } else {
        mobileMessage.classList.add("hidden"); // Esconde a mensagem
    }
};

// Verificar a tela ao carregar e quando houver redimensionamento
window.addEventListener("load", checkScreenSize);
window.addEventListener("resize", checkScreenSize);

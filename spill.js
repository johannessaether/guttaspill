//board
let board
let boardwidth = 360
let boardheight = 640
let ctx

//bird
let birdwidth = 30
let birdheight = 45
let birdx = boardwidth / 8
let birdy = boardheight / 2
let birdimage

let bird = {
    x: birdx,
    y: birdy,
    width: birdwidth,
    height: birdheight
}

//pipes
let pipeArray = []
let pipeWidth = 100
let pipeHeight = 512
let pipex = boardwidth
let pipey = 0

let topPipeImg
let bottomPipeImg

//fysikk
let velocityy = 0 // fuglens hoppefart
let gravity = 0.4
let velocityx = 0 // Verdi kommer fra slider
let placementSpeed = 0
let speedInc = 1

//funksjonalitet
let gameOver = false
let score = 0
const highscore = parseInt(localStorage.getItem("highscore")) || 0
let startaBird = false

window.onload = function () {
    board = document.getElementById("board")
    board.height = boardheight
    board.width = boardwidth
    ctx = board.getContext("2d") //brukes til å tegne på board
    velocityx = document.getElementById("speed").value * (-1) // pipenes fart mot venstre

    //loader bilder
    birdImg = new Image()
    birdImg.src = "./media/flappybird.png"
    birdImg.onload = function () {
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height)
        topPipeImg = new Image()
        topPipeImg.src = "./media/pipe_topp.png"

        bottomPipeImg = new Image()
        bottomPipeImg.src = "./media/pipe_bunn.png"

        document.addEventListener("keydown", moveBird)
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(0, 0, boardwidth, boardheight)
        ctx.fillStyle = "pink"
        ctx.font = "27px sans-serif"
        ctx.fillText("Trykk på Space for å starte", 20, 320)
    }
}

function update() {
    requestAnimationFrame(update);
    if (gameOver == false) {
        speedInc += 0.0001
        velocityx = document.getElementById("speed").value * (-speedInc)  // pipenes fart mot venstre
    }
    if (gameOver == true) {
        speedInc = 1
        velocityx = document.getElementById("speed").value * (-1)
    }

    if (gameOver) {
        return
    }
    ctx.clearRect(0, 0, board.width, board.height)


    //bird
    velocityy += gravity
    bird.y = Math.max(bird.y + velocityy, 0)
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height)

    if (bird.y > board.height) {
        gameOver = true
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i]
        pipe.x += velocityx
        ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5 // fordi det er to piper
            var pointSound = document.getElementById("point")
            pointSound.cloneNode().play()
            pipe.passed = true
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true
        }
    }

    // fjerner pipes for å minimere minneplass
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift() // fjerner første elementet fra 
    }

    //score 
    ctx.font = "45px sans-serif"
    ctx.fillText(score, 165, 100)

    if (gameOver) {
        var gameOverSound = document.getElementById("gameover")
        gameOverSound.play()

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(0, 0, boardwidth, boardheight)

        ctx.fillStyle = "pink"
        ctx.fillText(score, 165, 100)
        ctx.fillText("GAME OVER", 40, 300)
        if (score < highscore) {
            ctx.fillText("Highscore: " + highscore, 40, 340)
        }
        if (score > highscore) {
            localStorage.setItem("highscore", score)
            ctx.fillText("NY highscore: " + score, 10, 340)
        }
    }
}



function placePipes() {
    if (gameOver) {
        return
    }

    let randomPipeY = pipey - pipeHeight / 4 - Math.random() * (pipeHeight / 2)
    let openingSpace = board.height / 4

    let topPipe = {
        img: topPipeImg,
        x: pipex,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe)

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipex,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe)
}


function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp") {
        placementSpeed = (-5000 / velocityx) + (-2000 / velocityx)
        if (startaBird == false) {
            requestAnimationFrame(update)
            setInterval(placePipes, placementSpeed) //pipenes plasseringsfart
        }

        startaBird = true
        document.addEventListener("keydown", moveBird)
        // hopp
        velocityy = -6
        var jumpSound = document.getElementById("jump")
        jumpSound.cloneNode().play()

        //reset
        if (gameOver) {
            bird.y = birdy
            pipeArray = []
            score = 0
            gameOver = false
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
}


const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

var isGameOver = false
var gameLoserPlayed = false

// Variables
canvas.width = 1225
canvas.height = 600

let score = 0
let signs = [-1, 1]
var paddle 
var ball
var bricks = []



function clickSound(){
    var audio = document.querySelector('#audio')
    audio.play()
}

function winnerSound(){
    var audio2 = document.querySelector('#audio2')
    audio2.play()
}

function loserSound(){
    var audio3 = document.querySelector('#audio3')
    audio3.play()
}


// Events
// keydown event for paddle controls
addEventListener('keydown', event => {

    if(event.key == 'ArrowLeft' ){
        paddle.moveLeft()
    }

    if( event.key == 'ArrowRight' ){
        paddle.moveRight()
    }
})


// keyup event for paddle controls
addEventListener('keyup', event => {

    if(event.key == 'ArrowLeft' ){
        paddle.moveLeft()
        paddle.dx = 0
    }

    if( event.key == 'ArrowRight' ){
        paddle.moveRight()
        paddle.dx = 0
    }
})



//Pause The game
addEventListener('keypress', pauseGame)

addEventListener('resize', () => {
    console.log(window.innerWidth)
})



// Utility functions
function randomIntFromRange(min, max) {
    return Math.floor( Math.random() * (max - min + 1) + min )
}   



class Paddle{

    constructor(x, y){

        this.position = {
            x: x,
            y: y
        }

        this.dimensions = {
            width: 200,
            height: 10
        }

        this.dx = 0
        this.speed = 8
        this.color = 'white'
    }

    draw(){
        ctx.fillStyle = this.color
        ctx.fillRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height)
    }

    moveLeft(){
        this.dx = -this.speed
    }

    moveRight(){
        this.dx = this.speed
    }

    moveLeftControl(){
        this.position.x -= 50
    }

    moveRightControl(){
        this.position.x += 50
    }


    // detect left and right walls
    detectWalls(){
        if( this.position.x + this.dimensions.width >= canvas.width ){
            this.position.x = canvas.width - this.dimensions.width
        }

        if( this.position.x <= 0 ){
            this.position.x = 0
        }
    }

    update(){
        // detect walls
        this.detectWalls()
        
        this.position.x += this.dx
        this.draw()
    }

} // end of class



// Ball class
class Ball{

    constructor(x, y){

        this.position = {
            x: x,
            y: y
        }

        this.dx = signs[ Math.round( Math.random() ) ] * 5
        this.dy = 3
        this.radius = 10
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true)
        ctx.fillStyle = 'white'
        ctx.stroke()
        ctx.fill()
    }

    detectSideWalls(){

        if( this.position.x + this.radius >= canvas.width || this.position.x - this.radius < 0 ){
            this.dx = -this.dx
        }
    }

    detectTopWall(){
        if( this.position.y - this.radius < 0 ){
            this.dy = -this.dy
        }
    }


    ballPaddleCollision(){

        if( this.position.y + this.radius >= paddle.position.y && this.position.x + this.radius >= paddle.position.x && this.position.x - this.radius <= paddle.position.x + paddle.dimensions.width && isGameOver == false ){
            clickSound()
            this.dy = 6
            this.dy = -this.dy
        }

    }

    detectBottomWall(){

        if( this.position.y - this.radius >= canvas.height ){
            gameOver()
        }

    }


    update(){

        // detect side walls
        this.detectSideWalls()

        // detect top wall
        this.detectTopWall()

        // detect bottom wall
        this.detectBottomWall()
        

        // ball and paddle collision 
        this.ballPaddleCollision()

        this.position.x += this.dx
        this.position.y += this.dy

        this.draw()
    }


}// end of Ball class



class Brick{

    constructor(x, y){
       
        this.position = {
            x: x,
            y: y
        }
    
        this.dimensions = {
            width: 50,
            height: 30
        }
        this.color = 'darkorange'
        this.markedForDeletion = false
    }


    draw(){
        ctx.fillStyle = this.color
        ctx.fillRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height)

        ctx.strokeStyle = 'white'
        ctx.strokeRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height)
        
    }

    ballBrickCollision(){

        if(  (ball.position.y - ball.radius <= this.position.y + this.dimensions.height)  && 
        ( ball.position.x - ball.radius >= this.position.x ) &&
        ( ball.position.x + ball.radius <= this.position.x + this.dimensions.width)
        ){
            clickSound()
            ball.dy = -ball.dy
            score += 1
            console.log(score)
            document.querySelector('#score').textContent = score
            this.markedForDeletion = true
        }

    }

    update(){

        this.ballBrickCollision()

        if( score == 44 ){
            winnerSound()
            ball.dx = 0
            ball.dy = 0 
           gameWon()
        }
        
        bricks = bricks.filter(brick => {
            return (brick.markedForDeletion === false)
        })


        this.draw()
    }

}


// Implementaion 


function init() {

    // paddle object
    paddle = new Paddle(canvas.width/2 - 100, canvas.height - 10)

    // ball object
    let ballXPos = randomIntFromRange(100, canvas.width - 100)
    let ballYPos = randomIntFromRange(100, canvas.height/2 )

    ball = new Ball(ballXPos, ballYPos)
    
    let brickXPos = 10
    let brickXPos2 = 10
    let brickYPos = 10
    
    
    for(let i = 0; i < 22; i++){
        bricks.push( new Brick(brickXPos, brickYPos) )

        brickXPos = brickXPos + 55
    }

    for(let i = 0; i < 22; i++){
        bricks.push( new Brick(brickXPos2, 50) )

        brickXPos2 = brickXPos2 + 55
    }
}




function gameOver(){

    isGameOver = true

    if( isGameOver == true && gameLoserPlayed == false ){
        loserSound()
        gameLoserPlayed = true
    }
    
    ball.dx = 0
    ball.dy = 0

    document.querySelector('#overlay').style.display = 'block'
    document.querySelector('#overlay-content').style.display = 'flex'
    document.querySelector('#display-score').textContent = score
}



function gameWon(){
    document.querySelector('#game-won-overlay').style.display = 'flex'
    document.querySelector('#game-won-content').style.display = 'block'
    document.querySelector('#score-win').textContent = score
}

function restartGame() {
    location.reload()
}

var currentDx 
var currentDy 
var isPaused = false

function pauseGame(event){

    if( event.key == ' '){
        isPaused = true

        if( !isGameOver ){
            currentDx = ball.dx
            currentDy = ball.dy
    
            ball.dx = 0
            ball.dy = 0
    
            document.querySelector('#game-paused').style.display = 'block'
            document.querySelector('#game-paused-content').style.display = 'flex'
    
        }
    }

    if( isPaused ){
        removeEventListener('keypress', pauseGame)
    }
}


function resumeGame(){
    isPaused = false
    ball.dx = currentDx
    ball.dy = currentDy

    document.querySelector('#game-paused').style.display = 'none'
    document.querySelector('#game-paused-content').style.display = 'none'


    if(!isPaused){
        addEventListener('keypress', pauseGame)
    }
    
}


document.addEventListener('touchstart', touchStart)


let intialTouchPosition = 0
let isOnPaddle = false


function touchStart(event){

    if(event.touches){

        let mouseX = event.touches[0].clientX;
        let paddleLeftX = paddle.position.x;
        let paddleRightX = paddle.position.x + paddle.dimensions.width;
        
        if(  mouseX <= paddleRightX && mouseX >= mouseX ){
            intialTouchPosition = event.touches[0].clientX
            console.log('touch start, position X:', event.touches[0].clientX)
            isOnPaddle = true
            console.log('paddle init X: ', paddle.position.x)


            console.log('mouse is on paddle')
            
        }

        console.log(window.innerWidth)
        console.log(isOnPaddle)
    }

    document.addEventListener('touchmove', touchMove)
    document.addEventListener('touchend', touchEnd)


}

function touchMove(event){

    if( intialTouchPosition ){

        if( isOnPaddle ){
            if( event.touches[0].clientX <= intialTouchPosition ){
                console.log('moving left')
                paddle.position.x -= 8
    
            }else if(event.touches[0].clientX >= intialTouchPosition){
                console.log('moving Right')
                paddle.position.x += 8
            }
        }else{
            isOnPaddle = false
        }

        
    }   
}


function touchEnd(event){
    paddle.dx = 0
}


function animate() {
    requestAnimationFrame(animate)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    paddle.update()
    ball.update()

    bricks.forEach(brick => {
        brick.update()
    })


console.log()

}

init()
animate()
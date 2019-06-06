const Game = require('./game')
const AI = require('./ai')
const {renderInstructions} = require('./util')

const tetris = new Game()
if(JSON.parse(localStorage.getItem('game')))
    tetris.loadState()
tetris.render()

let ai = false

renderInstructions(ai)

window.addEventListener('keydown', function(e) {
    let key = e.keyCode
    let character = String.fromCharCode(key).toUpperCase()

    console.log(key, character)

    if(character === 'A'){
        ai = !ai
        renderInstructions(ai)
        tetris.reset()
        tetris.clearState()
        tetris.render()
    }

    if(!tetris.isPaused && !ai){
        switch(key){
            case 37: //LEFT
                tetris.moveLeft()
                tetris.movesTaken++
                break;
            case 38: //ROTATE
                tetris.rotateShape()
                tetris.movesTaken++
                break;
            case 39: //RIGHT
                tetris.moveRight()
                tetris.movesTaken++
                break;
            case 40: //DOWN
                tetris.moveDown()
                break;
        }
    }

    if(!ai){
        switch(character){
            case 'P':
                if(!tetris.isOver){
                    tetris.isPaused = !tetris.isPaused
                    if(!tetris.isPaused){
                        if(tetris.isResumed)
                            tetris.loadState()
                        tetris.start()
                    }else{
                        tetris.isResumed = true
                        tetris.saveState()
                    }
                }
                console.log(tetris.isPaused)
                break;
            case 'R':
                tetris.reset()
                tetris.clearState()
                tetris.render()
                break;
            
        }
    }else{
        const genetic = new AI(tetris)
        switch(character){
            case 'T':
                genetic.start()
                break;
        }
    }
    
})
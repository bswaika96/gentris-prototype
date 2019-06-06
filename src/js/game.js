const util = require('./util')

const Game = function() {
    this.board = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
        ]
    
    this.shapes = [{
        type: 'I',
        form: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]]
    },{
        type: 'J',
        form: [[2,0,0], [2,2,2], [0,0,0]]
    },{
        type: 'L',
        form: [[0,0,3], [3,3,3], [0,0,0]]
    },{
        type: 'O',
        form: [[4,4], [4,4]]
    },{
        type: 'S',
        form: [[0,5,5], [5,5,0], [0,0,0]]
    },{
        type: 'T',
        form: [[0,6,0], [6,6,6], [0,0,0]]
    },{
        type: 'Z',
        form: [[7,7,0], [0,7,7], [0,0,0]]
    }]

    this.currentShape = {
        x: 0,
        y: 0,
        shape: undefined
    }
    this.upcomingShape = undefined

    this.score = 0
    this.isOver = false
    this.isPaused = true
    this.isResumed = false
    this.speed = 200
    this.movesTaken = 0
    this.moveLimit = 500

    this.visualComponents = {
        board: document.querySelector('.board'),
        block: document.querySelector('.block'),
        score: document.querySelector('.score'),
        moves: document.querySelector('.moves'),
        gameOver: document.querySelector('.gameOverBlock'),
        console: document.querySelector('.console')
    }
}

/*
=========================GAME SHAPE FUNCTIONS=============================
*/

Game.prototype.nextShape = function() {
    if(!this.upcomingShape){
        this.currentShape.shape = util.clone(this.shapes[util.randomBetween(0, this.shapes.length-1)])
    }else{
        this.currentShape.shape = util.clone(this.upcomingShape)
    }
    this.currentShape.x = util.randomBetween(0, this.board[0].length-this.currentShape.shape.form[0].length)
    this.currentShape.y = 0
    this.upcomingShape = util.clone(this.shapes[util.randomBetween(0, this.shapes.length-1)])
}

Game.prototype.applyShape = function() {
    for (var row = 0; row < this.currentShape.shape.form.length; row++) {
        for (var col = 0; col < this.currentShape.shape.form[row].length; col++) {
            if (this.currentShape.shape.form[row][col] !== 0) {
                this.board[this.currentShape.y + row][this.currentShape.x + col] = this.currentShape.shape.form[row][col]
            }
        }
    }
}

Game.prototype.removeShape = function() {
    for (var row = 0; row < this.currentShape.shape.form.length; row++) {
        for (var col = 0; col < this.currentShape.shape.form[row].length; col++) {
            if (this.currentShape.shape.form[row][col] !== 0) {
                this.board[this.currentShape.y + row][this.currentShape.x + col] = 0
            }
        }
    }
}

/*
=========================MOVEMENT FUNCTIONS=============================
*/

Game.prototype.moveDown = function(){
    if(this.currentShape.shape){
        let result = {
            lose: false, 
            moved: true, 
            rowsCleared: 0
        }
        this.removeShape()
        this.currentShape.y++
        if (util.collides(this.board, this.currentShape)) {
            this.currentShape.y--
            this.applyShape()
            this.nextShape()
            result.rowsCleared = this.clearRows()
            if (util.collides(this.board, this.currentShape) || this.movesTaken === this.moveLimit) {
                result.lose = true
                this.isOver = true
                this.isPaused = true
                this.currentShape = {
                    x: 0,
                    y: 0,
                    shape: undefined
                }
                this.renderGameOver()
                this.clearState()
            }
            result.moved = false
        }
        if(!result.lose)
            this.applyShape()
        this.score++
        this.render()
        return result
    }
    return undefined
}

Game.prototype.moveRight = function() {
    if(this.currentShape.shape){
        this.removeShape()
        this.currentShape.x++
        if (util.collides(this.board, this.currentShape)) {
            this.currentShape.x--
        }
        this.applyShape()
    }
}

Game.prototype.moveLeft = function() {
    if(this.currentShape.shape){
        this.removeShape()
        this.currentShape.x--
        if (util.collides(this.board, this.currentShape)) {
            this.currentShape.x++
        }
        this.applyShape()
    }
}

Game.prototype.rotateShape = function() {
    if(this.currentShape.shape){
        this.removeShape();
        this.currentShape.shape.form = util.rotate(this.currentShape.shape.form, 1);
        if (util.collides(this.board, this.currentShape)) {
            this.currentShape.shape.form = util.rotate(this.currentShape.shape.form, 3);
        }
        this.applyShape();
    }
}


/*
=========================RENDERING FUNCTIONS=============================
*/

Game.prototype.renderBoard = function() {
    this.visualComponents.board.innerHTML = ''
    this.board.forEach((row) => {
        let rowDiv = document.createElement('div')
        rowDiv.classList.add('row')
        row.forEach((cell) => {
            let cellDiv = document.createElement('div')
            cellDiv.classList.add('cell')
            if(cell === 0)
                cellDiv.classList.add('empty')
            else{
                cellDiv.classList.add('non-empty')
                cellDiv.classList.add(this.shapes[cell-1].type)
            }
            rowDiv.appendChild(cellDiv)
        })
        this.visualComponents.board.appendChild(rowDiv)
    })
}

Game.prototype.renderBlock = function() {
    this.visualComponents.block.innerHTML = ''
    if(this.upcomingShape){
        this.upcomingShape.form.forEach((row, index) => {
            let rowDiv = document.createElement('div')
            rowDiv.classList.add('row')
            row.forEach((cell) => {
                let cellDiv = document.createElement('div')
                cellDiv.classList.add('cell')
                if(cell === 0){

                }else{
                    cellDiv.classList.add('non-empty')
                    cellDiv.classList.add(this.shapes[cell-1].type)
                }
                rowDiv.appendChild(cellDiv)
            })
            this.visualComponents.block.appendChild(rowDiv)
        })
    }
}

Game.prototype.renderScore = function() {
    this.visualComponents.score.innerHTML = `${this.score}`
}

Game.prototype.renderMoves = function() {
    this.visualComponents.moves.innerHTML = `${this.movesTaken}/${this.moveLimit}`
}

Game.prototype.renderGameOver = function() {
    this.visualComponents.gameOver.innerHTML = ''
    if(this.isOver){
        this.visualComponents.gameOver.innerHTML = 'GAME OVER!'
    }
}

Game.prototype.renderConsole = function(...params) {
    this.visualComponents.console.innerHTML += `<li>${params}</li>`
}

Game.prototype.render = function() {
    this.renderBoard()
    this.renderBlock()
    this.renderScore()
    this.renderMoves()
    this.renderGameOver()    
}

/*
=========================GAME FUNCTIONS=============================
*/

Game.prototype.start = function() {
    if(!this.isResumed){
        this.nextShape()
        this.applyShape()
        this.render()
    }
    let gameLoop = () => {
        if(!this.isPaused){
            this.update()
        }else{
            clearInterval(interval)
        }
    }
    let interval = setInterval(gameLoop, this.speed)
}

Game.prototype.update = function() {
    let moveDownResults = this.moveDown()
    // this.renderConsole(moveDownResults.moved, moveDownResults.lose, moveDownResults.rowsCleared)
    if(moveDownResults)
        this.render()
}

Game.prototype.clearRows = function() {
    let rowsToClear = []
 	for (let row = 0; row < this.board.length; row++) {
 		let containsEmptySpace = false
 		for (let col = 0; col < this.board[row].length; col++) {
 			if (this.board[row][col] === 0) {
 				containsEmptySpace = true
 			}
 		}
 		if (!containsEmptySpace) {
 			rowsToClear.push(row)
 		}
 	}
 	if (rowsToClear.length == 1) {
 		this.score += 400
 	} else if (rowsToClear.length == 2) {
 		this.score += 1000
 	} else if (rowsToClear.length == 3) {
 		this.score += 3000
 	} else if (rowsToClear.length >= 4) {
 		this.score += 12000
 	}
 	let rowsCleared = rowsToClear.length
 	for (let toClear = rowsToClear.length - 1; toClear >= 0; toClear--) {
 		this.board.splice(rowsToClear[toClear], 1)
 	}
 	while (this.board.length < 15) {
 		this.board.unshift([0,0,0,0,0,0,0,0,0,0])
 	}
 	return rowsCleared;
}

Game.prototype.reset = function() {
    this.board = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
        ]
    
    this.currentShape = {
        x: 0,
        y: 0,
        shape: undefined
    }
    this.upcomingShape = undefined

    this.nextShape()

    this.score = 0
    this.isOver = false
    this.isPaused = true
    this.isResumed = false
    this.movesTaken = 0
}

/*
=========================GAME STATE FUNCTIONS=============================
*/

Game.prototype.saveState = function() {
    const state = JSON.stringify({
        board: this.board,
        currentShape: this.currentShape,
        upcomingShape: this.upcomingShape,
        score: this.score,
        isOver: this.isOver,
        isResumed: this.isResumed,
        movesTaken: this.movesTaken
    })
    localStorage.setItem('game', state)
}

Game.prototype.loadState = function() {
    const state = JSON.parse(localStorage.getItem('game'))
    if(state){
        this.board = state.board
        this.currentShape = state.currentShape
        this.upcomingShape = state.upcomingShape
        this.score = state.score
        this.isOver = state.isOver
        this.isResumed = state.isResumed
        this.movesTaken = state.movesTaken
    }
}

Game.prototype.clearState = function() {
    if(JSON.parse(localStorage.getItem('game')))
        localStorage.removeItem('game')
}

Game.prototype.getState = function() {
    const state = util.clone({
        board: this.board,
        currentShape: this.currentShape,
        upcomingShape: this.upcomingShape,
        score: this.score,
        isOver: this.isOver,
        isResumed: this.isResumed,
        movesTaken: this.movesTaken
    })

    return state
}

Game.prototype.setState = function(state) {
    if(state){
        this.board = util.clone(state.board)
        this.currentShape.x = util.clone(state.currentShape.x)
        this.currentShape.y = util.clone(state.currentShape.y)
        if(state.currentShape.shape){
            this.currentShape.shape = util.clone(state.currentShape.shape)
        }else{
            this.currentShape.shape = undefined
        }
        if(state.upcomingShape){
            this.upcomingShape = util.clone(state.upcomingShape)
        }else{
            this.upcomingShape = undefined
        }
        this.score = util.clone(state.score)
        this.isOver = util.clone(state.isOver)
        this.isResumed = util.clone(state.isResumed)
        this.movesTaken = util.clone(state.movesTaken)
    }
}

/*
=========================BOARD EVALUATION FUNCTIONS=============================
*/

Game.prototype.getPeaks = function() {
    let peaks = [15,15,15,15,15,15,15,15,15,15]
 	for (let row = 0; row < this.board.length; row++) {
 		for (let col = 0; col < this.board[row].length; col++) {
 			if (this.board[row][col] !== 0 && peaks[col] === 15) {
 				peaks[col] = row
 			}
 		}
    }
    return peaks 
}

Game.prototype.getCumulativeHeight = function() {
    this.removeShape()
 	let peaks = this.getPeaks()
 	let totalHeight = 0;
 	for (let i = 0; i < peaks.length; i++) {
 		totalHeight += 20 - peaks[i]
 	}
 	this.applyShape()
 	return totalHeight
}

Game.prototype.getRelativeHeight = function() {
    this.removeShape()
    let peaks = this.getPeaks()
    this.applyShape()
    
    return Math.max.apply(Math, peaks) - Math.min.apply(Math, peaks)
}

Game.prototype.getHeight = function() {
    this.removeShape()
    let peaks = this.getPeaks()
    this.applyShape()
    
    return 15 - Math.min.apply(Math, peaks)
}

Game.prototype.getRoughness = function() {
    this.removeShape()
    let peaks = this.getPeaks()
    let roughness = 0
    for(let i = 0; i < peaks.length; i++){
        roughness += Math.abs(peaks[i] - peaks[i+1])
    }
    this.applyShape()
    
    return roughness
}

Game.prototype.getHoles = function() {
    this.removeShape()
    let peaks = this.getPeaks()
    let holes = 0
    for (let x = 0; x < peaks.length; x++) {
        for (let y = peaks[x]; y < this.board.length; y++) {
            if (this.board[y][x] === 0) {
                holes++;
            }
        }
    }
    this.applyShape()
    
    return holes
}

module.exports = Game
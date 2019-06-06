const util = require('./util')

const AI = function(game) {
    this.game = game

    this.populationSize = 50
    this.genomes = []
    this.currentGenome = -1
    this.generation = 0
    this.mutation = 0.1
    this.mutationStep = 0.3

    this.roundState = undefined
    this.lastState = undefined

    this.archive = {
        populationSize: 0,
        currentGeneration: 0,
        elites: [],
        genomes: []
    }
    
    this.draw = true
    this.interval = undefined

    this.visualComponents = {
        genome: document.querySelector('.genome')
    }
}

AI.prototype.start = function() {
    // if(JSON.parse(localStorage.getItem('archive'))){
    //     localStorage.removeItem('archive')
    // }
    // if(JSON.parse(localStorage.getItem('elite'))){
    //     localStorage.removeItem('elite')
    // }

    this.archive.populationSize = this.populationSize

    this.draw = true

    this.game.nextShape()
    this.game.applyShape()
    this.game.render()

    this.roundState = this.game.getState()

    this.createInitialPopulation()

    let gameLoop = () => {
        if(!this.game.isOver){
            this.update()
        }else{
            this.game.reset()
        }
    }
    this.interval = setInterval(gameLoop, 10)
}

AI.prototype.update = function() {
    var results = this.moveDown();
    if(results){
        if (!results.moved) {
            if (results.lose) {
                this.genomes[this.currentGenome].fitness = util.clone(this.game.score);
                this.game.reset()
                this.evaluateNextGenome();
            } else {
                this.makeNextMove();
            }
        }
        if(this.draw)
            this.game.render()
    }else{
        clearInterval(this.interval)
        this.interval = undefined
        this.start()
    }
}

AI.prototype.stop = function() {
    clearInterval(this.interval)
    this.interval = undefined
    let archiveData = JSON.parse(localStorage.getItem('archive'))
    if(archiveData){
        let {elites} = archiveData
        let elite = Math.max(...elites)
        console.log(elite)
    }
}

AI.prototype.moveDown = function() {
    if(this.game.currentShape.shape !== undefined){
        let result = {
            lose: false, 
            moved: true, 
            rowsCleared: 0
        }
        this.game.removeShape()
        this.game.currentShape.y++
        if (util.collides(this.game.board, this.game.currentShape)) {
            this.game.currentShape.y--
            this.game.applyShape()
            this.game.nextShape()
            result.rowsCleared = this.game.clearRows()
            if (util.collides(this.game.board, this.game.currentShape) || this.game.movesTaken === this.game.moveLimit) {
                result.lose = true
            }
            result.moved = false
        }
        if(!result.lose){
            this.game.applyShape()
            this.game.score++
        }
        if(this.draw)
            this.game.render()
        return result
    }
    return undefined
}

AI.prototype.makeChild = function(mum, dad) {
    let child = {
        id : Math.random(),
        rowsCleared: util.randomChoice(mum.rowsCleared, dad.rowsCleared),
        weightedHeight: util.randomChoice(mum.weightedHeight, dad.weightedHeight),
        cumulativeHeight: util.randomChoice(mum.cumulativeHeight, dad.cumulativeHeight),
        relativeHeight: util.randomChoice(mum.relativeHeight, dad.relativeHeight),
        holes: util.randomChoice(mum.holes, dad.holes),
        roughness: util.randomChoice(mum.roughness, dad.roughness),
        fitness: -1
    }
    if (Math.random() < this.mutationRate) {
        child.rowsCleared = child.rowsCleared + Math.random() * this.mutationStep * 2 - this.mutationStep
    }
    if (Math.random() < this.mutationRate) {
        child.weightedHeight = child.weightedHeight + Math.random() * this.mutationStep * 2 - this.mutationStep
    }
    if (Math.random() < this.mutationRate) {
        child.cumulativeHeight = child.cumulativeHeight + Math.random() * this.mutationStep * 2 - this.mutationStep
    }
    if (Math.random() < this.mutationRate) {
        child.relativeHeight = child.relativeHeight + Math.random() * this.mutationStep * 2 - this.mutationStep
    }
    if (Math.random() < this.mutationRate) {
        child.holes = child.holes + Math.random() * this.mutationStep * 2 - this.mutationStep
    }
    if (Math.random() < this.mutationRate) {
        child.roughness = child.roughness + Math.random() * this.mutationStep * 2 - this.mutationStep
    }
    return child
}

AI.prototype.getRandomGenome = function() {
    return this.genomes[util.randomWeightedNumBetween(0, this.genomes.length - 1)]
}

AI.prototype.evolve = function() {
    console.log("Generation " + this.generation + " evaluated.")
 	this.currentGenome = 0
 	this.generation++
 	this.game.reset()
 	this.roundState = this.game.getState()
     
    this.genomes.sort(function(a, b) {
 		return b.fitness - a.fitness
 	});
 	this.archive.elites.push(util.clone(this.genomes[0]))
 	console.log("Elite's fitness: " + this.genomes[0].fitness)
 	while(this.genomes.length > this.populationSize / 2) {
 		this.genomes.pop()
 	}
     
    var totalFitness = 0
 	for (var i = 0; i < this.genomes.length; i++) {
 		totalFitness += this.genomes[i].fitness
    }
    
    var children = []
	children.push(util.clone(this.genomes[0]));
	while (children.length < this.populationSize) {
		children.push(this.makeChild(this.getRandomGenome(), this.getRandomGenome()))
	}
    
    this.genomes = []
	this.genomes = this.genomes.concat(children)
    
    this.archive.genomes = util.clone(this.genomes)
	this.archive.currentGeneration = util.clone(this.generation)
	console.log(this.archive)
    
    localStorage.setItem('archive', JSON.stringify(this.archive))
}

AI.prototype.getAllPossibleMoves = function() {
    let lastState = this.game.getState()
 	let possibleMoves = []
 	let iterations = 0
 	for (let rots = 0; rots < 4; rots++) {
 		let oldX = []
 		for (let t = -5; t <= 5; t++) {
 			iterations++
 			this.game.setState(lastState)
 			for (let j = 0; j < rots; j++) {
 				this.game.rotateShape()
 			}
 			if (t < 0) {
 				for (let l = 0; l < Math.abs(t); l++) {
 					this.game.moveLeft()
 				}
 			} else if (t > 0) {
 				for (let r = 0; r < t; r++) {
 					this.game.moveRight()
 				}
 			}
 			if (!util.contains(oldX, this.game.currentShape.x)) {
                let moveDownResults = this.moveDown()
                while (moveDownResults.moved) {
                    moveDownResults = this.moveDown()
                }
                let algorithm = {
                    rowsCleared: moveDownResults.rowsCleared,
                    weightedHeight: Math.pow(this.game.getHeight(), 1.5),
                    cumulativeHeight: this.game.getCumulativeHeight(),
                    relativeHeight: this.game.getRelativeHeight(),
                    holes: this.game.getHoles(),
                    roughness: this.game.getRoughness()
                }

                let rating = 0
                rating += util.clone(algorithm.rowsCleared) * util.clone(this.genomes[this.currentGenome].rowsCleared)
                rating += util.clone(algorithm.weightedHeight) * util.clone(this.genomes[this.currentGenome].weightedHeight)
                rating += util.clone(algorithm.cumulativeHeight) * util.clone(this.genomes[this.currentGenome].cumulativeHeight)
                rating += util.clone(algorithm.relativeHeight) * util.clone(this.genomes[this.currentGenome].relativeHeight)
                rating += util.clone(algorithm.holes) * util.clone(this.genomes[this.currentGenome].holes)
                rating += util.clone(algorithm.roughness) * util.clone(this.genomes[this.currentGenome].roughness)
                
                if (moveDownResults.lose) {
                    rating -= 500
                }
                possibleMoves.push({rotations: rots, translation: t, rating: rating, algorithm: algorithm})
                oldX.push(this.game.currentShape.x) 				
 			}
 		}
 	}
 	this.game.setState(lastState);
 	return possibleMoves;
}

AI.prototype.getHighestRatedMove = function(moves) {
    let maxRating = -10000000000000
    let maxMove = -1
    let ties = []
    for (let index = 0; index < moves.length; index++) {
        if (moves[index].rating > maxRating) {
            maxRating = moves[index].rating
            maxMove = index
            ties = [index]
        } else if (moves[index].rating == maxRating) {
            ties.push(index)
        }
    }
   let move = moves[ties[0]]
   move.algorithm.ties = ties.length
   return move
}

AI.prototype.makeNextMove = function() {
    this.game.movesTaken++;
 	if (this.game.movesTaken > this.game.moveLimit) {
        this.genomes[currentGenome].fitness = util.clone(this.game.score)
        this.game.reset() 
 		this.evaluateNextGenome()
 	} else {
 		let oldDraw = util.clone(this.draw)
 		this.draw = false
        let possibleMoves = this.getAllPossibleMoves()
        let lastState = this.game.getState()
        this.game.nextShape();
 		for (let i = 0; i < possibleMoves.length; i++) {
 			let nextMove = this.getHighestRatedMove(this.getAllPossibleMoves())
 			possibleMoves[i].rating += nextMove.rating
 		}
 		this.game.setState(lastState)
 		let move = this.getHighestRatedMove(possibleMoves)
 		for (let rotations = 0; rotations < move.rotations; rotations++) {
 			this.game.rotateShape()
 		}
 		if (move.translation < 0) {
 			for (let lefts = 0; lefts < Math.abs(move.translation); lefts++) {
 				this.game.moveLeft()
 			}
 		} else if (move.translation > 0) {
 			for (let rights = 0; rights < move.translation; rights++) {
 				this.game.moveRight()
 			}
 		}
 		this.draw = oldDraw
        if(this.draw)
            this.game.render()
 	}
}

AI.prototype.evaluateNextGenome = function() {
    this.currentGenome++
 	if (this.currentGenome == this.genomes.length) {
 		this.evolve()
    }
    this.renderGenome()
 	this.game.setState(this.roundState)
 	this.game.movesTaken = 0
 	this.makeNextMove()
}

AI.prototype.createInitialPopulation = function() {
    this.genomes = []
 	for (let i = 0; i < this.populationSize; i++) {
 		let genome = {
 			id: Math.random(),
 			rowsCleared: Math.random() - 0.5,
 			weightedHeight: Math.random() - 0.5,
 			cumulativeHeight: Math.random() - 0.5,
 			relativeHeight: Math.random() - 0.5,
 			holes: Math.random() * 0.5,
 			roughness: Math.random() - 0.5,
 		};
 		this.genomes.push(genome)
     }
    this.game.reset()
 	this.evaluateNextGenome()
}

AI.prototype.renderGenome = function() {
    this.visualComponents.genome.innerHTML = ''
    if(this.currentGenome > -1 && this.currentGenome <= this.populationSize){
        let html = ''
        let tab = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        html += `<h3>Generation: ${this.generation+1} </h3>`
        html += `<h3>Genome: ${this.currentGenome+1}/${this.populationSize}</h3><br><br>`

        html += '{<br>'
        let genome = this.genomes[this.currentGenome]
        for(let prop in genome){
            html += tab + `<span class="genomeProp">${prop}</span> : ${genome[prop]} <br>`
        }
        html += '}<br>'
        this.visualComponents.genome.innerHTML = html
    }
}

module.exports = AI
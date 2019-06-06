const randomBetween = (min, max) => {
    return min + Math.floor(Math.random() * (max-min+1))
}

const collides = (scene, obj) => {
    for (var row = 0; row < obj.shape.form.length; row++) {
        for (var col = 0; col < obj.shape.form[row].length; col++) {
            if (obj.shape.form[row][col] !== 0) {
                if (scene[obj.y + row] === undefined || scene[obj.y + row][obj.x + col] === undefined || scene[obj.y + row][obj.x + col] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

const transpose = (array) => {
    return array[0].map(function(col, i) {
        return array.map(function(row) {
            return row[i];
        });
    });
}

const rotate = (matrix, times) => {
    for (var t = 0; t < times; t++) {
        matrix = transpose(matrix);
        for (var i = 0; i < matrix.length; i++) {
            matrix[i].reverse();
        }
    }
    return matrix;
}

const instructions = '<h3>How to Play</h3> <hr> <p>     Block Movements <br>     &nbsp;&nbsp;&nbsp;&nbsp;Move Left : [Left Arrow Key] <br>   &nbsp;&nbsp;&nbsp;&nbsp;Move Right : [Right Arrow Key] <br>     &nbsp;&nbsp;&nbsp;&nbsp;Rotate : [Up Arrow Key] <br>     &nbsp;&nbsp;&nbsp;&nbsp;Move Down : [Down Arrow Key] <br>     Game Controls <br>     &nbsp;&nbsp;&nbsp;&nbsp;Play/Pause : [P]<br>     &nbsp;&nbsp;&nbsp;&nbsp;Reset : [R]<br> &nbsp;&nbsp;&nbsp;&nbsp;Toggle AI : [A] <br> </p>'
const instructionsAI = ' <h3>How to AI</h3><hr><p> Game Controls <br>&nbsp;&nbsp;&nbsp;&nbsp;Train : [T]<br>&nbsp;&nbsp;&nbsp;&nbsp;Stop Training : [S]<br>&nbsp;&nbsp;&nbsp;&nbsp;Load Elite : [E]<br> &nbsp;&nbsp;&nbsp;&nbsp;Toggle AI : [A] <br> </p> '

const renderInstructions = (ai) => {
    let instructionsBlock = document.querySelector('.game .instructions')
    if(ai){
        instructionsBlock.innerHTML = instructionsAI
    }else{
        instructionsBlock.innerHTML = instructions
    }
}

const clone = (obj) => JSON.parse(JSON.stringify(obj))

const contains = (a, obj) => {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

const randomWeightedNumBetween = (min, max) => Math.floor(Math.pow(Math.random(), 2) * (max - min + 1) + min)

const randomChoice = (propOne, propTwo) => {
    if (Math.round(Math.random()) === 0) {
        return clone(propOne);
    } else {
        return clone(propTwo);
    }
}

const randomProperty = (obj) => (obj[randomKey(obj)])

const randomKey = (obj) => {
    var keys = Object.keys(obj);
    var i = randomBetween(0, keys.length);
    return keys[i];
}

module.exports = {
    randomBetween,
    collides,
    rotate,
    renderInstructions,
    clone,
    contains,
    randomKey,
    randomProperty,
    randomWeightedNumBetween,
    randomChoice
}
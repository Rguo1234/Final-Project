const OVERTIME = 1000;
let probability = 0.25;
let t= 0;
let scene = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1];
let firstLayer = [], secondLayer = [], output = [], input = [], rewards = [];
let hidden = 10, inputLength = 15, outputLength = 5;
let beta = 0.25, R = 0.9, C = 0.8, urest = 0, ureset = 0, threshold = 1; 
let inputfirst = [], firstsecond = [], secondoutput = [];
let turtleLocation = 42;
let starCodes = ['EAT', "WALK", "RUN", "FURNITURE", "MONEY", "SHELL", "OCEAN", "PLAY"];
function createNeuron(R, C, threshold, urest, ureset) {
    let neuron = [R, C, threshold, urest, ureset, R * C, [], []];
    return neuron;
}
function canFire(neuron, I) {
    let u = (neuron[0] * I + neuron[3]) + (neuron[7][t - 1] - (neuron[0] * I + neuron[3])) * Math.exp(-1 / neuron[5]);
    if (u >= threshold) {
        u = neuron[4];
        neuron[7].push(u);
        neuron[6].push(t);
        return 1;
    }
    neuron[7].push(u);
    return 0;
}
function createWeight() {
    return Math.random();
}
function keepTime() {
    if (t > OVERTIME) {
        for (let i = 0; i < hidden; i++) {
            firstLayer[i][7] = [];
            firstLayer[i][6] = [];
            secondLayer[i][7] = [];
            secondLayer[i][6] = [];
        }
        for (let i = 0; i < inputLength; i++) {
            input[i][7] = [];
            input[i][6] = [];
        }
        for (let i = 0; i < outputLength; i++) {
            output[i][7] = [];
            output[i][6] = [];
        } 
        t = 0;
    }
    t++;
}
function reward() {
    rewards[0] = 1;
    let mx = 0;
    for (let i = 0; i < outputLength; i++)
        mx = Math.max(mx, rewards[i]);
    return mx;
}
function loss(output) {
    return Math.pow((reward() - output), 2) + beta * (t - OVERTIME);
}
function feedForward() {
    if (Math.random() < probability) {
        let star = document.createElement('p');
        star.innerHTML = starCodes[Math.floor(Math.random() * 8)] + " <img src = '../images/starfish.png' id = 'star'>";
        document.body.append(star);
        let starImage = document.getElementsByTagName('p')[document.getElementsByTagName('p').length - 1];
        starImage.style.position = "relative";
        starImage.style.top = "20vh";
        starImage.style.left = "60vw";
        starImage.style.fontFamily = "cursive";
        let x = 0;
        let interval = setInterval(function() {
        if (x++ >= 100) 
            clearInterval(interval);
            starImage.style.left = (60 - x) / 100 + "vw";
            starImage.style.top = -25 - Math.pow(60 - x, 2) / 100 + "vh";
        }, 100);
        probability = Math.max(probability - 0.01, 0);
    }
    let inputI = [];
    for (let i = 0; i < hidden; i++) 
        for (let j = 0; j < inputLength; j++) 
            inputI.push(canFire(input[j], scene) * inputfirst[j][i]);
    let hiddenI = [];
    for (let i = 0; i < hidden; i++)
        for (let j = 0; j < hidden; j++)
            hiddenI.push(canFire(firstLayer[j], inputI[j]) * firstsecond[j][i]);
    let outputI = [];
    for (let i = 0; i < hidden; i++)
        for (let j = 0; j < outputLength; j++)
            outputI.push(canFire(secondLayer[j], hiddenI[j]) * secondoutput[j][i]);
    let firstspike = 1000;
    let result = -1;
    for (let i = 0; i < outputLength; i++) {
        if (canFire(output[i], outputI[i]) && firstspike > output[i][7][output[i][7].length - 1]) {
            firstspike =  output[i][7][output[i][7].length - 1];
            result = i;
        }
    }
    let diff = loss(result);
    console.log("My loss " + diff);
    let turtle = document.getElementsByClassName("turtle")[0];
    if (result == 0)
        turtle.style.left = ++turtleLocation + "vw";
    else if (result == 1)
        turtle.style.left = --turtleLocation + "vw";
    else if (result == 2)
        turtle.src = "../images/turtle-eat.png";
    else if (result == 3)
        turtle.src = "../images/turtle-sleep.png";
    else 
        turtle.src = "../images/turtle-play.png";
    backProp();
}
function backProp() {
    for (let i = 0; i < inputLength; i++){
        let inhibit = canFire(input[i], -1);
    }
    
}
setInterval(keepTime, 1000);
setInterval(feedForward, 1000);
for (let i = 0; i < hidden; i++) {
    firstLayer.push(createNeuron(R, C, threshold, urest, ureset));
    secondLayer.push(createNeuron(R, C, threshold, urest, ureset));
}
for (let i = 0; i < outputLength; i++) {
    output.push(createNeuron(R, C, threshold, urest, ureset));
    rewards.push(0);
}
for (let i = 0; i < inputLength; i++) 
    input.push(createNeuron(R, C, threshold, urest, ureset));
for (let i = 0; i < hidden; i++) {
    let layer = [];
    for (let j = 0; j < hidden; j++) 
        layer.push(createWeight());
    firstsecond.push(layer);
}
for (let i = 0; i < inputLength; i++) {
    let layer = [];
    for (let j = 0; j < hidden; j++) 
        layer.push(createWeight());
    inputfirst.push(layer);
}
for (let i = 0; i < hidden; i++) {
    let layer = [];
    for (let j = 0; j < outputLength; j++) 
        layer.push(createWeight());
    secondoutput.push(layer);
}

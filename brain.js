const OVERTIME = 10000;
let probability = 0.20;
let scene = [0, 0, 0];
let t= 0;
let firstLayer = [], secondLayer = [], output = [], input = [], rewards = [];
let hidden = 10, inputLength = 15, outputLength = 5;
let R = 0.9, C = 0.8, urest = 0.1, ureset = 0, threshold = 0.5; 
let inputfirst = [], firstsecond = [], secondoutput = [];
let turtleLocation = 42;
let starCodes = ['EAT', "WALK", "RUN", "FURNITURE", "MONEY", "SHELL", "OCEAN", "PLAY"];
function normalize() {
    let res = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mn = OVERTIME;
    for (let i = 0; i < scene.length; i++)
        mn = Math.min(mn, scene[i]);
    if (mn == 0) mn = 1;
    for (let i = 0; i < scene.length; i++)
        scene[i] /= mn;
    let j = 0;
    for (let i = 0; i < scene.length; i++) {
        scene[i] = Math.round(scene[i]);
        while (j < 5 * (i + 1)) {
            res[j++] = scene[i] % 2;
            scene[i] = Math.floor(scene[i] / 2);
        }
    }
    scene = res;
} 
function createNeuron(R, C, threshold, urest, ureset) {
    let neuron = [R, C, threshold, urest, ureset, R * C, [0], [urest]];
    return neuron;
}
function canFire(neuron, I) {
    I *= 5;
    let u = (neuron[0] * I + neuron[3]) + (neuron[7][Math.max(0, t - 1)] - (neuron[0] * I + neuron[3])) * Math.exp(-(t - neuron[6][Math.max(0, neuron[6].length - 1)]) / neuron[5]);
    if (u >= neuron[2]) {
        u = neuron[4];
        neuron[6].push(t);
        neuron[7].push(u);
        return 1;
    }
    neuron[7].push(u);
    return 0;
}
function createWeight() {
    return Math.random() * 5;
}
function reward() {
    if (turtleLocation > 70) rewards[0] = 1;
    else if (turtleLocation < 20) rewards[1] = 1;
}
function feedForward() {
    t++;
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
    scene = [document.getElementsByTagName("img").length, t, document.querySelectorAll("#star").length];
    normalize();
    let inputI = [], fire = [];
    for (let i = 0; i < inputLength; i++)
        fire.push(canFire(input[i], scene[i]));
    for (let i = 0; i < hidden; i++) {
        let sum = 0;
        for (let j = 0; j < inputLength; j++) 
            sum += fire[j] * inputfirst[j][i];
        inputI.push(sum);
    }
    let hiddenI = [];
    fire = [];
    for (let i = 0; i < hidden; i++)
        fire.push(canFire(firstLayer[i], inputI[i]));
    for (let i = 0; i < hidden; i++) {
        let sum = 0;
        for (let j = 0; j < hidden; j++) 
            sum += fire[j] * firstsecond[j][i];
        hiddenI.push(sum);
    } 
    let outputI = [];
    fire = [];
    for (let i = 0; i < hidden; i++)
        fire.push(canFire(secondLayer[i], hiddenI[i]));
    for (let i = 0; i < outputLength; i++) {
        let sum = 0;
        for (let j = 0; j < hidden; j++) 
            sum += fire[j] * secondoutput[j][i];
        outputI.push(sum);
    } 
    let spikeAvg =0, squared =0, result = -1, firstspike = OVERTIME;
    for (let i = 0; i < outputLength; i++) {
        if (canFire(output[i], outputI[i]) && firstspike > output[i][6][output[i][6].length - 1]) {
            firstspike = output[i][7][output[i][7].length - 1];
            result = i;
        }
    }
    for (let i = 0; i < outputLength; i++) 
        spikeAvg += output[i][6][output[i][6].length - 1];
    spikeAvg /= outputLength;
    for (let i = 0; i < outputLength; i++)
        squared += Math.pow((-rewards[i] + spikeAvg / 1000), 2);
    squared = 1 / outputLength * squared;
    console.log(squared);
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
    backProp()
}
function backProp() {
    let alpha = 0.05;
    for (let i = 0; i < hidden; i++) 
        for (let j = 0; j < outputLength; j++) 
            secondoutput[i][j] = secondoutput[i][j] - alpha * (-rewards[j] + t / 1000);
    for (let i = 0; i < hidden; i++) 
        for (let j = 0; j < hidden; j++) 
            firstsecond[i][j] = firstsecond[i][j] - alpha * (t/1000);
    for (let i = 0; i < inputLength; i++) 
        for (let j = 0; j < hidden; j++) 
            inputfirst[i][j] = inputfirst[i][j] - alpha * (t/1000) * (t/1000);
}

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
setInterval(feedForward, 1000);
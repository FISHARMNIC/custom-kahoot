var http = require('http')
var url = require('url');
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var userCounter = 0
var gameHasStarted = false
var connectedUsers = [] //token
var userPoints = {} // token : points
var tokenUsers = {} // token : username
var numberAnswered = 0
var return_data = {}

var chosenQuestion
var answer
var questionCounter = 0

var questions = {
    "What type of food is a bannana?": [["fruit", "veggie", "meat", "not food"], 0],
    "How many wheels does a car have?": [["1", "3", "4", "2"], 2],
    "Do porcupines have quills?": [["yes", "no", "maybe", "idk"], 0]
}
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
    var params = url.parse(req.url, true).query

    return_data.gameState = gameHasStarted ? "running" : "offline"
    return_data.questionCounter = questionCounter

    if (params.request != undefined) console.log("req", params.request)
    switch (params.request) {
        case "connect":
            console.log("User connected")
            return_data.connectionStatus = "connected"
            return_data.token = String(userCounter)
            connectedUsers.push(return_data.token)
            tokenUsers[return_data.token] = params.username
            userPoints[return_data.token] = 0
            userCounter++
            break
        case "question":
            return_data = { ...return_data, chosenQuestion }
            break
        case "answer":
            if (connectedUsers.includes(params.token)) {
                numberAnswered++
                console.log(answer)
                if(params.answer == answer) {
                    userPoints[params.token]++
                } else {
                    userPoints[params.token]--
                }
                return_data = { ...return_data, 
                    answer, 
                    points: userPoints[params.token], 
                    lbPoints: Object.values(userPoints),
                    lbNames: Object.values(tokenUsers),
                }
            }
            break
    }
    var output = JSON.stringify(return_data)
    return_data = {}
    res.end(output);
}).listen(8000);

rl.on('line', function (line) {
    if (line = "start") {
        if (!gameHasStarted) {
            gameHasStarted = true
            console.log("Game Starting!")
            startGame()
        }
    }
})

function startGame() {
    chosenQuestion = newQuestion()
    setInterval(function () {
        if (connectedUsers.length == numberAnswered) {
            chosenQuestion = newQuestion()
        }
    }, 1000);
}

function newQuestion() {
    numberAnswered = 0
    var questionNum = randInt(0, (Object.entries(questions)).length - 1)
    answer = (Object.values(questions))[questionNum][1]
    questionCounter++
    return {
        question: (Object.keys(questions))[questionNum],
        selections: (Object.values(questions))[questionNum][0]
    }
}

//do something like create an interval where it is constantly checking if everyone anwered and if so then new question

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
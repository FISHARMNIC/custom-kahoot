const url = 'http://192.168.0.162:8000';
const Http = new XMLHttpRequest();

var data = {}
var token
var response
var questionCounter = 1

function makeRequest(params = { dummy: idk }) {
    return new Promise((resolve, reject) => {
        var out = "/?"

        Object.entries(params).forEach(x => {
            out += `${x[0]}=${x[1]}&`
        })
        out = out.slice(0, -1)
        Http.open("GET", url + out);
        Http.send();
        Http.onload = (e) => {
            resolve(JSON.parse(Http.responseText))
        }
        setTimeout(() => {
            document.getElementById("error").innerHTML = "Connection Error"
            reject('timeout')
        }, 1000)
    })
}

async function join() {
    response = await makeRequest({ request: "connect" , username: document.getElementById("username").value})
    console.log(response)
    if (response.connectionStatus == "connected") {
        token = response.token
        data = deepCopy(response)
        wasConnected()
    } else {
        document.getElementById("error").innerHTML = "Connection Error"
    }
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify((obj)))
}

function wasConnected() {
    document.open()
    document.write("<h1> Connected and waiting for the game to start... </h1>")
    startCheck = setInterval(async function () {
        var requestRet = await makeRequest({})
        if (requestRet.gameState == "running") {
            clearInterval(startCheck)
            newQuestion()
        }
    }, 500);
}

async function newQuestion() {
    document.open()
    document.write(`
    <h1> You are now playing </h1>
    <h3 id="question"></h3>
    <button id="0" onclick="clicked(0)">Answer 0</button>
    <button id="1" onclick="clicked(1)">Answer 1</button>
    <button id="2" onclick="clicked(2)">Answer 2</button>
    <button id="3" onclick="clicked(3)">Answer 3</button>
    `)
    response = await makeRequest({request: "question"})
    console.log(response)
    document.getElementById("question").innerHTML = response.chosenQuestion.question;
    ([0,1,2,3]).forEach(x => {
        document.getElementById(`${x}`).innerHTML = response.chosenQuestion.selections[x]
    })
}

async function clicked(selection) {
    response = await makeRequest({request: "answer", answer: selection, token: token})
    console.log("answered", response)
    document.open()
    if(selection == response.answer) {
        document.write("<h1>Correct!</h1>")
    } else {
        document.write("<h1>Oops!</h1>")
    }
    document.write("<h3>Waiting for a new Question<h3>")
    document.write(`You have ${response.points} points`)
    response.lbNames.forEach((x,ind) => {
        document.write(`<h4>${x} : ${response.lbPoints[ind]}</h4>`)
    }) 
    startCheck = setInterval(async function () {
        var req = await makeRequest({})
        if (questionCounter != req.questionCounter) {
            questionCounter++
            clearInterval(startCheck)
            newQuestion()
        }
    }, 500);
}
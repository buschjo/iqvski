( function () {
    const ScreenController = skribbl.ScreenController;

    const GameScreenController = function () {
        ScreenController.call(this);
    }
    GameScreenController.prototype = Object.create(ScreenController.prototype);
    GameScreenController.prototype.constructor = GameScreenController;

    const elements = {
        tutorialDone: false
    }
    const countdown = {
        total: 6,
        number: 6
    }
    const timer = {
        width: 100,
        totalTime: 20,
        startTime: 0
    }
    

    Object.defineProperty(GameScreenController.prototype, "display", {
        value: function () {
            skribbl.clearScreen();
            const mainEl = document.querySelector("main");
            mainEl.appendChild(document.getElementById("game-template").content.cloneNode(true).firstElementChild);

            elements.overlay = document.getElementById("overlay");
            elements.skipButton = document.getElementById("skip");
            elements.overlayText = document.getElementById("overlay-text");
            elements.timer = document.getElementById("timer");
            elements.clearButton = document.getElementById("clear");   
            elements.undoButton = document.getElementById("undo");
            elements.countdownNumber = document.getElementById("overlay-number");          
            
            elements.clearButton.addEventListener("click", clear);
            elements.undoButton.addEventListener("click", function () {
                skribbl.canvasData.undo();
            });
            if (elements.tutorialDone) {
                startGame();
            } else {
                showTutorial();
            }
        }
    });

    Object.defineProperty(GameScreenController.prototype, "setup", {
        value: function () {
            skribbl.canvasData.setup();
        }
    });

    function clear() {        
        skribbl.canvasData.erase();
        var bars = document.getElementsByClassName("bar__full");
        for (let bar of bars) {
            bar.innerHTML = " ";
            bar.style.width = "0%";
        }
    }

    const drawBars = skribbl.drawBars = function (top5, probs) {
        //loop over the predictions 
        for (var i = 0; i < top5.length; i++) {
            let sym = document.getElementById('sym' + (i + 1));
            let prob = document.getElementById('prob' + (i + 1));
            let temp = probs[i];
            let mr = Math.round(temp * 100);
            prob.style.width = mr + '%';
            prob.innerHTML = top5[i];
            if (top5[i] == skribbl.word) {
                prob.style.backgroundColor = "#5271ff";
            } else {
                prob.style.backgroundColor = "#545454";
            }
        }
    }
    function startGame() {
        skribbl.word = skribbl.classNames[getRandomInt(100)];
        console.log(skribbl.word);
        startCountdown(skribbl.word);
        setTimeout(function () {
            startTimer();
        }, 6000);
        
    }

    function endGame() {
        skribbl.endScreenController.display();
        clearInterval(elements.timerInterval);
    }

    const evaluate = skribbl.evaluate = function (word) {
        if (skribbl.names[0] == word) {
            skribbl.timeElapsed = calculateTimeElapsed() / 1000;
            skribbl.win = true;
            endGame();
        } else {
            skribbl.win = false;
        }
        console.log("win: " + skribbl.win);
    }

    function showTutorial(){
        elements.overlay.style.display = "block";
        elements.skipButton.style.display = "block";
        elements.overlayText.innerText = "Tutorial: Draw the word! Get it to the top before the times runs out!";
        elements.skipButton.addEventListener("click", function() {
            skipTutorial();
        });
    }
    
    function skipTutorial(){
        elements.skipButton.style.display = "none";
        elements.tutorialDone = true;
        startGame();
    }

    function startCountdown(word) {
        elements.overlay.style.display = "block";
        var count = setInterval(function () {
            elements.overlayText.innerText = word;
            //todo refactor
            countdown.number--;
            if (countdown.number <= 4 && countdown.number > 1) {
                elements.countdownNumber.textContent = countdown.number - 1;
            }
            if (countdown.number == 1) {
                elements.countdownNumber.textContent = "Go!";
            }
            if (countdown.number <= 0) {
                clearInterval(count);
                elements.overlay.style.display = "none";
                countdown.number = countdown.total;
            }
        }, 1000);
    }

    function startTimer() {   
        timer.startTime = Date.now();     
        let timerWidth = timer.width;
        let totalTime = timeLeft = timer.totalTime;
        elements.timerInterval = setInterval(function () {
            timeLeft = timeLeft - 0.1;
            timeLeft = timeLeft.toFixed(2);
            timerWidth = timeLeft * (100 / totalTime);
    
            elements.timer.style.width = timerWidth + '%';
            // document.getElementById("timerNumber").textContent = timeLeft;
            if (timerWidth <= 85 && timerWidth > 60) {
                elements.timer.style.animation = "transition1 5s linear";
            }
            if (timerWidth <= 60 && timerWidth > 20) {
                elements.timer.style.backgroundColor = "#ffde59";
            }
            if (timerWidth <= 20) {
                elements.timer.style.animation = "transition2 4s linear";
            }
            if (timeLeft <= 0) {
                endGame();
            }
        }, 100);
    }

    function calculateTimeElapsed() {
        return Date.now() - timer.startTime;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    window.addEventListener("load", event => {
        const controller = skribbl.gameScreenController = new GameScreenController();
        for (const startGameButton of document.getElementsByClassName("start-game")) {
            startGameButton.addEventListener("click", () => {
                controller.display();
                controller.setup();
            });
        }        
    });

} ());
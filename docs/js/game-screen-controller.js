class GameScreenController extends ViewController {
    constructor() {
        super();
        this.elements = {};
        this.countdown = {
            total: 5,
            number: 5
        };
        this.timer = {
            width: 100,
            totalTime: 20,
            startTime: 0
        }
    }

    display() {
        this.clearScreen();
        const mainEl = document.querySelector("main");
        mainEl.appendChild(document.getElementById("game-template").content.cloneNode(true).firstElementChild);

        this.elements.overlay = document.getElementById("overlay");
        this.elements.skipButton = document.getElementById("skip");
        this.elements.nextStepButton = document.getElementById("nextstep");
        this.elements.overlayText = document.getElementById("overlay-text");
        this.elements.timer = document.getElementById("timer");
        this.elements.clearButton = document.getElementById("clear");
        this.elements.undoButton = document.getElementById("undo");
        this.elements.countdownNumber = document.getElementById("overlay-number");
        this.elements.skipWordButton = document.getElementById("skip__tool");

        // skribbl.canvasData.responsive();
        var that = this;
        this.elements.clearButton.addEventListener("click", that.clear);
        this.elements.undoButton.addEventListener("click", that.undo);
        this.elements.skipWordButton.addEventListener("click", () => {
            that.clearTimerInterval();
            that.display();
        })

        this.appController.startGame();
    }

    setup() {
        console.log('setup');
        this.appController.gameRound.canvasData.setup();
    }

    startCountdown(word) {
        //same as line 140
        this.elements.skipButton.style.display = "none";
        this.elements.nextStepButton.style.display = "none";
        this.elements.overlay.style.display = "block";
        this.elements.overlayText.innerText = word;
        var that = this;
        var count = setInterval(function () {
            //todo refactor
            that.countdown.number--;
            if (that.countdown.number <= 4 && that.countdown.number > 1) {
                that.elements.countdownNumber.textContent = that.countdown.number - 1;
            }
            if (that.countdown.number == 1) {
                that.elements.countdownNumber.textContent = "Draw!";
            }
            if (that.countdown.number <= 0) {
                clearInterval(count);
                that.elements.overlay.style.display = "none";
                that.countdown.number = that.countdown.total;
            }
        }, 1000);
    }

    setTimerInterval(timer) {
        let timerWidth = this.timer.width;
        let totalTime = this.timer.totalTime;
        let timeLeft = this.timer.totalTime;
        var that = this;
        this.elements.timerInterval = setInterval(function () {
            timeLeft = timeLeft - 0.1;
            timeLeft = timeLeft.toFixed(2);
            timerWidth = timeLeft * (100 / totalTime);
            that.elements.timer.style.width = timerWidth + '%';
            // document.getElementById("timerNumber").textContent = timeLeft;
            //Nastja will evtl. was ausprobieren
            if (timerWidth <= 85 && timerWidth > 60) {
                that.elements.timer.style.animation = "transition1 5s linear";
            }
            if (timerWidth <= 60 && timerWidth > 20) {
                that.elements.timer.style.backgroundColor = "#ffde59";
            }
            if (timerWidth <= 20) {
                that.elements.timer.style.animation = "transition2 4s linear";
            }
            if (timeLeft <= 0) {
                that.appController.endGame();
            }
        }, 100);
    }

    clearTimerInterval() {
        clearInterval(this.elements.timerInterval);
    }

    undo() {
        var appController = SingletonAppController.getInstance();
        appController.gameRound.canvasData.undo();
    }

    clear() {
        var appController = SingletonAppController.getInstance();
        appController.gameRound.canvasData.erase();
        var bars = document.getElementsByClassName("bar__full");
        for (let bar of bars) {
            bar.innerHTML = " ";
            bar.style.width = "0%";
        }
    }

    skipWord() {

    }

    drawBars(top5, probs) {
        //loop over the predictions
        var appController = SingletonAppController.getInstance();
        for (var i = 0; i < top5.length; i++) {
            let sym = document.getElementById('sym' + (i + 1));
            let prob = document.getElementById('prob' + (i + 1));
            let temp = probs[i];
            let mr = Math.round(temp * 100);
            //Extract Method
            if (prob != null) {
                prob.style.width = mr + '%';
                prob.innerHTML = '&nbsp;' + (Math.round(probs[i] * 100) < 10 ? '0' : "") + Math.round(probs[i] * 100) + '%' + '&nbsp;' + top5[i];
                //CSS auslagern in classes
                if (top5[i] == appController.gameRound.word) {
                    prob.style.backgroundColor = "#ff5757";
                    //prob.style.textShadow = "0 0 5px yellow";
                } else {
                    prob.style.backgroundColor = "#1c1c1c";
                    prob.style.font = "";
                    prob.style.textShadow = "";
                }
            }

        }
    }
}

window.addEventListener("load", () => {

    let appController = SingletonAppController.getInstance();
    if (typeof appController.gameScreenController == "undefined") {
        appController.gameScreenController = new GameScreenController();
    }

    for (const startGameButton of document.getElementsByClassName("start-game")) {
        startGameButton.addEventListener("click", () => {
            console.log('gameScreenController');
            appController.gameScreenController.display();
            appController.gameScreenController.setup();
        });
    }
});
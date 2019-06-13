class WheelApp {
    constructor(textArea,wheelCanvas) {
        this.textArea = textArea;
        this.wheelCanvas = wheelCanvas;
        this.ctx = this.wheelCanvas.getContext('2d');
        this.wheelTextArray = new Array(7).fill("");
        this.wheelColorArray = [];
        this.spinTheta = 0;
        this.spinDelta = 0;
        this.spinning = false;
        this.timeoutVar = null;
        this.generateColorArray();
        this.calculateWheelDimensions();
    }

    generateColorArray = () => {
        let colorArray = [];
        this.wheelTextArray.forEach((e,i,a)=>{
            let hues = 
                [Math.floor(Math.random()*359),
                 Math.floor(Math.random()*359),
                 Math.floor(Math.random()*359)]
                 .map(e=>{
                    if (e>=360) { 
                        e = e - 360
                    }
                    return `hsl(${e},50%,50%)`;
                 });
            colorArray.push(hues);
        })
        this.wheelColorArray = colorArray;
    }

    calculateWheelDimensions = () => {
        if (this.spinning === true) { return; }
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        if (this.windowWidth > this.windowHeight) {
            this.wheelCanvas.width = Math.floor(this.windowHeight * 0.8);
            this.wheelCanvas.height = this.wheelCanvas.width;
        }
        else {
            this.wheelCanvas.width = Math.floor(this.windowWidth * 0.8);
            this.wheelCanvas.height = this.wheelCanvas.width;
        }
        this.wheelRadius = (this.wheelCanvas.width / 2) - (0.03 * this.wheelCanvas.width); 
        this.wheelCenterX = this.wheelCanvas.width / 2;
        this.wheelCenterY = this.wheelCanvas.height / 2;
        this.drawWheel();
    }

    drawWheel = () => {
        let c = this.ctx;
        let centerX = this.wheelCenterX;
        let centerY = this.wheelCenterY;
        let r = this.wheelRadius;
        let theta = (2*Math.PI) / this.wheelTextArray.length;

        //draw a wedge for each item in wheelTextArray
        this.wheelTextArray.forEach((e,i,a)=>{
            c.lineWidth = Math.floor(this.wheelRadius * 0.02);
            let grad = c.createRadialGradient(centerX,centerY,r/8,centerX,centerY,r);
            // grad.addColorStop(0,`hsl(${Math.floor(Math.random()*359)},50%,50%)`);
            grad.addColorStop(0,this.wheelColorArray[i][0]);
            grad.addColorStop(0.5,this.wheelColorArray[i][1]);
            grad.addColorStop(1,this.wheelColorArray[i][2]);
            c.fillStyle = grad;
            if (i === 0 && this.spinning === false) { c.restore(); c.resetTransform(); }
            else { 
                c.translate(centerX,centerY);
                c.rotate(theta); 
                c.translate(-centerX,-centerY);
            }
            c.moveTo(centerX,centerY);
            c.beginPath();
            c.lineTo(centerX + r * Math.cos(theta/2), centerY - r * Math.sin(theta/2));
            c.arc(centerX,centerY,r,-theta/2,theta/2,false);
            c.lineTo(centerX,centerY);
            c.fill();
            let maxFontWidth = Math.floor(r*1.2/(e.length));
            let maxFontHeight = Math.PI * r / a.length;
            let fontSize = (maxFontWidth > maxFontHeight) ? maxFontHeight : maxFontWidth;
            c.font = `${fontSize}px Monospace`;
            c.textAlign = "right";
            c.textBaseline = "middle";
            c.fillStyle = "white";
            c.strokeStyle = "black";
            c.strokeText(e, centerX + r - c.lineWidth*2,centerY);
            c.fillText(e, centerX + r - c.lineWidth*2, centerY);

        })

        //draw a lines between wedges (because strokes get concealed);
        this.wheelTextArray.forEach((e,i)=>{
            c.lineWidth = Math.floor(this.wheelRadius * 0.02);
            c.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--fgColor2');
            if (i === 0 && this.spinning === false) { c.restore(); c.resetTransform(); }
            else { 
                c.translate(centerX,centerY);
                c.rotate(theta); 
                c.translate(-centerX,-centerY);
            }
            c.beginPath();
            c.moveTo(centerX,centerY);
            c.lineTo(centerX + r * Math.cos(theta/2), centerY - r * Math.sin(theta/2));
            c.stroke();
        })
        //draw outline of entire wheel
        c.lineWidth = Math.floor(this.wheelRadius * 0.02);
        c.moveTo(centerX,centerY);
        c.moveTo(r,0);
        c.beginPath();
        c.arc(centerX,centerY,r,0,2*Math.PI,false);
        c.stroke();

        //draw central circle of wheel
        c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bgColor1');
        c.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--fgColor2');
        c.moveTo(centerX,centerY);
        c.moveTo(r/12,0);
        c.beginPath();
        c.arc(centerX,centerY,r/12,0,2*Math.PI,false);
        c.stroke();
        c.fill();
        
        //draw pointer
        let rotationFix = theta - this.spinDelta ;
        c.translate(centerX,centerY);
        c.rotate(rotationFix);
        c.translate(-centerX,-centerY);

        //draw the actual pointer
        c.strokeStyle="black";
        c.fillStyle="lightGreen";
        c.beginPath();
        c.moveTo(centerX+(r*.95),centerY);
        c.lineTo(this.wheelCanvas.width,centerY+c.lineWidth*2);
        c.lineTo(this.wheelCanvas.width,centerY-c.lineWidth*2);
        c.lineTo(centerX+(r*.95),centerY);
        c.fill();
        c.lineWidth = 2;
        c.stroke();


        c.translate(centerX,centerY);
        c.rotate(-rotationFix);
        c.translate(-centerX,-centerY);
    }

    spinWheel = (first) => {
        this.spinTheta = 1.5; 
        if (first) {
            this.spinning = true;
            document.querySelector("#wheelSpinButton").disabled = true;
            document.querySelector("#wheelStopButton").disabled = false;
            document.querySelector("#wheelTextarea").disabled = true;
            let spinDuration = 1000*(Math.random()*15 + 15); //between 15 and 30 seconds
            this.spinStartTime = new Date().getTime();
            this.spinEndTime = this.spinStartTime + spinDuration;
        }
        let currentTime = new Date().getTime();
        this.spinTheta = this.spinTheta - this.spinTheta * (currentTime - this.spinStartTime)/(this.spinEndTime - this.spinStartTime);
        this.spinDelta = this.spinDelta + this.spinTheta;
        if (this.spinDelta > 2*Math.PI) { this.spinDelta = this.spinDelta - (2*Math.PI); }
        if (this.spinTheta > 2*Math.PI) { this.spinTheta = this.spinTheta - (2*Math.PI); }
        if (this.spinTheta >=0) { 
            this.ctx.translate(this.wheelCenterX,this.wheelCenterY);
            this.ctx.rotate(this.spinTheta);
            this.ctx.translate(-this.wheelCenterX,-this.wheelCenterY);
            this.drawWheel(); 
            this.timeoutVar = setTimeout(this.spinWheel,20,false); 
        }
        else {
            //calculate winner
            let wedgeAngle = 2*Math.PI/this.wheelTextArray.length;
            let wedgeNumber = this.wheelTextArray.length - Math.round(this.spinDelta/wedgeAngle);
            if (wedgeNumber === this.wheelTextArray.length) { wedgeNumber = 0; }
            this.spinning = false;
            document.querySelector("#wheelSpinButton").disabled = false;
            document.querySelector("#wheelStopButton").disabled = true;
            document.querySelector("#wheelTextarea").disabled = false;
            this.displayWinner(this.wheelTextArray[wedgeNumber]);
        }
    }

    displayWinner = (winner) => {
        winner = (winner.length > 0) ? winner : "[nobody]";
        document.querySelector("#wheelGameWinnerName").innerText = winner;
        document.querySelector("#wheelGameWinner").style.display = "flex";
    }

    playAgain = () => {
        document.querySelector("#wheelGameWinner").style.display = "none";
    }
    stopWheel = () => {
        clearTimeout(this.timeoutVar);
        this.spinning = false;
        document.querySelector("#wheelSpinButton").disabled = false;
        document.querySelector("#wheelStopButton").disabled = true;
        document.querySelector("#wheelTextarea").disabled = false;
    }
    updateTextArray = (e) => {
        if ((e.inputType === "insertText" ) || e.data === null) {
            this.wheelTextArray = e.target.value.split(/\n/).filter(Boolean);
            if (this.wheelTextArray.length === 0) { this.wheelTextArray = new Array(7).fill("")}
            while (this.wheelTextArray.length < 1) {
                this.wheelTextArray.push("");
            }
            this.generateColorArray();
            this.ctx.restore();
            this.ctx.resetTransform();
            this.spinDelta = 0;
            this.spinTheta = 0;
            this.drawWheel();
        }
    }
}

let textArea = document.querySelector('#wheelTextarea');
let wheelCanvas = document.querySelector('#wheelCanvas');
let wheel = new WheelApp(textArea,wheelCanvas);
window.addEventListener('resize',wheel.calculateWheelDimensions);
document.querySelector("#wheelTextarea").addEventListener('input',wheel.updateTextArray);
document.querySelector("#wheelSpinButton").addEventListener('click',()=>wheel.spinWheel(true));
document.querySelector("#wheelGamePlayAgain").addEventListener("click",wheel.playAgain);
document.querySelector("#wheelStopButton").addEventListener("click",wheel.stopWheel);

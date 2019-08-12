class MainSimulation{
    constructor(){
        this.objects = [];

        this.attack = 0.05;
        this.decay = 0.2;
        this.sustain = 0.2;
        this.release = 1.2;


        this.noteHoldAreaWidth = 0.5;
        this.maxWidth = 2; //define the coordinate system
        this.maxHeight = 1;


        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.synth = null;

        this.playState = "none";
        this.noteStartTime = 0;
    }

    start(){    

        this.canvas = document.getElementById("canvas");
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height= canvas.height;
        this.last_t = Date.now() / 1000;

        this.centerPos = [this.width/2, this.height/2];


        this.attackBtn = new DraggableSidewaysButton(this, 'Attack', (val) => {
            this.attack = val;

        });
        
        this.decaySustainBtn = new DraggableSidewaysAndVerticalButton(this, 'Decay', 'Sustain', (xVal, yVal) => {
            this.decay = xVal - this.attack;
            this.sustain = yVal;

        });
        this.releaseBtn = new DraggableSidewaysButton(this, 'Release', (val) => {
            this.release = val - this.attack - this.decay - this.noteHoldAreaWidth;
        });

        window.addEventListener("mousemove", this.onmousemove.bind(this));
        window.addEventListener("mousedown", this.onmousedown.bind(this));
        window.addEventListener("mouseup", this.onmouseup.bind(this));

        window.addEventListener("touchmove", this.ontouchmove.bind(this),{'passive':false});
        window.addEventListener("touchstart", this.ontouchstart.bind(this),{'passive':false});
        window.addEventListener("touchend", this.onmouseup.bind(this),{'passive':false});
        window.addEventListener("touchcancel", this.onmouseup.bind(this),{'passive':false});

        this.objects = [new ASDRGraphDrawer(this),  this.attackBtn, this.decaySustainBtn, this.releaseBtn];

        this.synth = new Synth(this.audioContext);

        this.update();
    }

    updateCanvasSize(){
        //called every frame. also clears the canvas
        this.canvas.width = this.width = window.innerWidth;
        this.canvas.height = this.height = window.innerHeight;
    }

    ontouchmove(event){
        event.preventDefault();

        let rect = this.canvas.getBoundingClientRect();
        
        for(var i=0;i<event.touches.length;i++){
            let touch = event.touches[i];
            this.onmousemove({x: touch.clientX - rect.left, y: touch.clientY- rect.top});
        }

    }

    onmousemove(event){
        let x = event.x;
        let y = event.y;
        for(var i=0;i<this.objects.length;i++){
            this.objects[i].onmousemove(x,y);
        }

    }

    ontouchstart(event){
        if(event.target == this.canvas)event.preventDefault();

        let rect = this.canvas.getBoundingClientRect();

        for(var i=0;i<event.touches.length;i++){
            let touch = event.touches[i];
            this.onmousedown({x: touch.clientX - rect.left, y: touch.clientY- rect.top});
        }
    }

    onmousedown(event){
        let x = event.x;
        let y = event.y;
        let clickedSomething = false;
        for(var i=0;i<this.objects.length;i++){
            this.objects[i].onmousedown(x,y);
            if(this.objects[i].pos && dist([x,y],this.objects[i].pos) < 30){
                this.objects[i].clicked = true;
                this.objects[i].onclick();
                clickedSomething = true;
            }
        }
        if(!clickedSomething)this.defaultOnMouseDown();
    }

    onmouseup(event){
        let x = event.x;
        let y = event.y;

        for(var i=0;i<this.objects.length;i++){
           this.objects[i].onmouseup(x,y);
           this.objects[i].clicked = false;
        }
        this.defaultOnMouseUp();
    }

    //working with the internal coordinate system
    moveTo(x,y){
        this.context.lineTo(...this.toCanvasCoords(x,y));
    }
    lineTo(x,y){
        this.context.lineTo(...this.toCanvasCoords(x,y));
    }
    toCanvasCoords(x,y){
        let width = this.canvas.width;
        let height = this.canvas.height;

        let maxHeight = 1;

        let xPadding = 100;
        let yPadding = 100;

        return [x / this.maxWidth * (width-xPadding*2)+xPadding, (maxHeight-y) / maxHeight * (height-yPadding*2)+yPadding];
    }
    toInternalCoords(canvasX, canvasY){
        let width = this.canvas.width;
        let height = this.canvas.height;

        let maxHeight = 1;

        let xPadding = 100;
        let yPadding = 100;

        return [(canvasX -xPadding) /(width-xPadding*2) * this.maxWidth, maxHeight-((canvasY -yPadding) /(height-yPadding*2) * maxHeight)];
    }

    recalcStartPositions(){
        this.attackBtn.leftLimit = 0;
        this.decaySustainBtn.leftLimit = this.attack;
        this.releaseBtn.leftLimit = this.attack + this.decay + this.noteHoldAreaWidth;
    }

    recalcButtonPositions(){
        this.attackBtn.x = this.attack;
        this.attackBtn.y = 1;

        this.decaySustainBtn.x = this.attack + this.decay;
        this.decaySustainBtn.y = this.sustain;

        //this.sustainBtn.x = this.decaySustainBtn.x;
        //this.sustainBtn.y = this.sustain;

        this.releaseBtn.x = this.attack + this.decay + this.noteHoldAreaWidth + this.release;
        this.releaseBtn.y = 0;

        this.recalcStartPositions();
    }


    defaultOnMouseDown(){
        this.synth.attack = this.attack;
        this.synth.sustain = this.sustain;
        this.synth.delay = this.decay;
        this.synth.release = this.release;
        this.synth.play(440);

        this.noteStartTime = this.synth.currentTime();
        this.playState = "attack";
    }

    defaultOnMouseUp(){
        this.synth.stop();
        this.noteStartTime = this.synth.currentTime();
        this.playState = "release";
    }

    update(){
        let context = this.context;
        const t = Date.now() / 1000;
        const dt = Math.min(t-this.last_t, 1/30);
        this.last_t = t;

        this.recalcButtonPositions();


        //draw
        this.updateCanvasSize();
       // context.fillRect(0,0,this.width,this.height);

        for(var i=0;i<this.objects.length;i++){
            this.objects[i].draw(context);
        }


        //if playing, draw the volume
        if(this.playState != "none"){
            
            let x = this.synth.currentTime() - this.noteStartTime;
            if(this.playState == "attack" && x > this.attack + this.decay + this.noteHoldAreaWidth){
                x = this.attack + this.decay+ this.noteHoldAreaWidth;
            }
            if(this.playState == "release"){
                x += this.attack + this.decay + this.noteHoldAreaWidth;
                
            }
            //if(x > this.decay)this.playState = "none";
            
            context.strokeStyle = "red";
            context.lineWidth = 3;
            context.beginPath();
            this.moveTo(x, 0);
            this.lineTo(x, 1);
            context.stroke();
        }

        window.requestAnimationFrame(this.update.bind(this));
    }
}



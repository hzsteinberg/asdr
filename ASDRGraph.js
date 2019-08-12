class ASDRGraphDrawer{
    constructor(parent){
        this.parent = parent;
    }

    onmousedown(){}
    onmouseup(){}
    onmousemove(){}

    draw(context){

        //render graph
        context.fillStyle = "lightblue";
        context.strokeStyle = "lightblue";
        

        let a = this.parent.attack;
        let d = this.parent.decay;
        let s = this.parent.sustain;
        let r = this.parent.release;

        let noteHoldAreaWidth = this.parent.noteHoldAreaWidth;

        context.beginPath();
        this.parent.moveTo(0,0);
        this.parent.lineTo(a, 1);
        this.parent.lineTo(a+d, s);
        this.parent.lineTo(a+d+noteHoldAreaWidth, s);
        this.parent.lineTo(a+d+noteHoldAreaWidth+r, 0);
        context.closePath();
        context.fill();
    }
}

class DraggableSidewaysButton{
    constructor(parent, ondragCallback){
        this.parent = parent;
        this.ondragCallback = ondragCallback;

        this.x = 1;
        this.y = 1;

        this.pos = [0,0];

        this.leftLimit = 0;
        this.rightLimit = 5;
    }

    onmousedown(){}
    onclick(){
        this.beingDragged = true;
    }
    endDrag(){
        this.ondragCallback(this.x);
    }
    onmousemove(mouseX,mouseY){
       if(this.beingDragged){
            let x = this.parent.toInternalX(mouseX);

            if(x < this.leftLimit)x = this.leftLimit;

            if(x > this.rightLimit)x = this.rightLimit;

            this.x = x;

            this.ondragCallback(this.x);
       }else{
        //change color on hover
       }

    }
    onmouseup(){
        if(this.beingDragged)this.endDrag();
        this.beingDragged = false;
    }
    draw(context){
        this.pos = this.parent.toCanvasCoords(this.x, this.y);

        context.fillStyle = "blue";
        if(this.beingDragged)context.fillStyle = "darkblue";

        drawCircle(context, this.pos[0],this.pos[1], 20);

        //lines

        context.strokeStyle = "darkblue";
        let barHeight = 0.025;
        let labelOffset = 0.05;

        context.lineWidth = 3;
        context.beginPath();
        this.parent.moveTo(this.leftLimit, this.y + labelOffset + barHeight/2);
        this.parent.lineTo(this.leftLimit, this.y + labelOffset - barHeight/2);
        this.parent.moveTo(this.leftLimit, this.y + labelOffset);
        this.parent.lineTo(this.x, this.y + labelOffset);
        this.parent.moveTo(this.x, this.y + labelOffset + barHeight/2);
        this.parent.lineTo(this.x, this.y + labelOffset - barHeight/2);
        context.stroke();
    }

}

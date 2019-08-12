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
    constructor(parent, title, ondragCallback){
        this.parent = parent;
        this.title = title;
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
            let x = this.parent.toInternalCoords(mouseX,mouseY)[0];

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

        let lineY = 0; //this.y

        context.lineWidth = 3;
        context.beginPath();
        this.parent.moveTo(this.leftLimit, lineY + barHeight/2);
        this.parent.lineTo(this.leftLimit, lineY - barHeight/2);
        this.parent.moveTo(this.leftLimit, lineY);
        this.parent.lineTo(this.x, lineY);
        this.parent.moveTo(this.x, lineY + barHeight/2);
        this.parent.lineTo(this.x, lineY - barHeight/2);
        context.stroke();

        //label
        
        context.fillStyle = "darkblue";
        context.font = "20" + "pt bold calibri";
        let midpointX = (this.leftLimit + this.x)/2;
        drawCenteredText(context, this.title, ...this.parent.toCanvasCoords(midpointX, lineY - barHeight*2));

        //dashed line up to the dot
        context.strokeStyle = "hsla(240,50%,30%,0.7)";
        for(var y=lineY + barHeight+ 0.02; y < this.y - 0.03 && y < 3; y += 0.02){
            context.beginPath();
            this.parent.moveTo(this.x, y);
            this.parent.lineTo(this.x, y + 0.01);
            context.stroke();
        }
    }

}



class DraggableSidewaysAndVerticalButton{
    constructor(parent, xTitle, yTitle, ondragCallback){
        this.parent = parent;
        this.xTitle = xTitle;
        this.yTitle = yTitle;
        this.ondragCallback = ondragCallback;

        this.x = 1;
        this.y = 1;

        this.pos = [0,0];

        this.leftLimit = 0;
        this.rightLimit = 5;

        this.bottomLimit = 0;
        this.topLimit = 1;
    }

    onmousedown(){}
    onclick(){
        this.beingDragged = true;
    }
    endDrag(){
        this.ondragCallback(this.x,this.y);
    }
    onmousemove(mouseX,mouseY){
        //upgrade to go y
       if(this.beingDragged){
            let pos = this.parent.toInternalCoords(mouseX,mouseY);
            let x = pos[0],y=pos[1]

            if(x < this.leftLimit)x = this.leftLimit;
            if(x > this.rightLimit)x = this.rightLimit;
            if(y < this.bottomLimit)y = this.bottomLimit;
            if(y > this.topLimit)y = this.topLimit;


            this.x = x;
            this.y = y;

            this.ondragCallback(this.x,this.y);
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

        //horizontal line
        context.strokeStyle = "darkblue";
        let barHeight = 0.025;
        let dotMargin = 0.04;

        let horizlineY = 0; //this.y

        context.lineWidth = 3;
        context.beginPath();
        this.parent.moveTo(this.leftLimit, horizlineY + barHeight/2);
        this.parent.lineTo(this.leftLimit, horizlineY - barHeight/2);
        this.parent.moveTo(this.leftLimit, horizlineY);
        this.parent.lineTo(this.x, horizlineY);
        this.parent.moveTo(this.x, horizlineY + barHeight/2);
        this.parent.lineTo(this.x, horizlineY - barHeight/2);
        context.stroke();

        //vertical line
        let vertLineX = this.x + 0.2;
        context.beginPath();
        this.parent.moveTo(vertLineX + barHeight/2, this.bottomLimit);
        this.parent.lineTo(vertLineX - barHeight/2, this.bottomLimit);
        this.parent.moveTo(vertLineX, this.bottomLimit);
        this.parent.lineTo(vertLineX, this.y);
        this.parent.moveTo(vertLineX + barHeight/2, this.y);
        this.parent.lineTo(vertLineX - barHeight/2, this.y);
        context.stroke();

        //horizontal label
        
        context.fillStyle = "darkblue";
        context.font = "20" + "pt bold calibri";
        let midpointX = (this.leftLimit + this.x)/2;
        drawCenteredText(context, this.xTitle, ...this.parent.toCanvasCoords(midpointX, horizlineY - barHeight*2));

        //vertical label
        let midpointY = (this.bottomLimit + this.y)/2;
        /*
        let letterHeight = 20;
        for(var i=0;i<this.yTitle.length;i++){
            let letter = this.yTitle[i];
            let pos = this.parent.toCanvasCoords(vertLineX - barHeight*2, midpointY)
            pos[1] += 20 * (i - this.yTitle.length/2);
            drawCenteredText(context, letter, ...pos);
        }*/
        //alt version: text to the right of the bar
        let textX = vertLineX + barHeight/2;
        let pos = this.parent.toCanvasCoords(textX, midpointY);
        pos[0] += (10*this.yTitle.length);
        drawCenteredText(context, this.yTitle, ...pos);

        //dashed line up to the dot
        context.strokeStyle = "hsla(240,50%,30%,0.7)";
        for(let y=horizlineY + barHeight+ 0.02; y < this.y - dotMargin && y < 3; y += 0.02){
            context.beginPath();
            this.parent.moveTo(this.x, y);
            this.parent.lineTo(this.x, y + 0.01);
            context.stroke();
        }
        //dashed line sideways to the dot
        for(let x=vertLineX - barHeight/2 - dotMargin; x > this.x + dotMargin && x >0; x -= 0.02){
            context.beginPath();
            this.parent.moveTo(x+0.01, this.y);
            this.parent.lineTo(x, this.y);
            context.stroke();

            context.beginPath();
            this.parent.moveTo(x+0.01, this.bottomLimit);
            this.parent.lineTo(x, this.bottomLimit);
            context.stroke();
        }
    }

}

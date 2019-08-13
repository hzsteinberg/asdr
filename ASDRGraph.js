let buttonBeingDraggedColor = "hsl(180,50%, 50%)"//"darkblue"
let buttonDefaultColor = "blue"
let lineColor = "darkblue"
let lineDraggedColor = "hsl(180,50%, 50%)"
let dashedLineColor = "hsla(240,50%,30%,0.3)";

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
        context.strokeStyle = "gray";
        

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

        //time axis
        context.lineWidth = 3
        let axisMargin = 0.1;
        context.beginPath();
        this.parent.moveTo(0, -axisMargin - 0.01);
        this.parent.lineTo(0, -axisMargin + 0.01);
        this.parent.lineTo(0,-axisMargin);

        let axisEnd = a+d+noteHoldAreaWidth+r + 0.3;
        this.parent.lineTo(axisEnd, -axisMargin);
        this.parent.moveTo(axisEnd-0.013, -axisMargin-0.01);
        this.parent.lineTo(axisEnd, -axisMargin);

        this.parent.lineTo(axisEnd-0.013, -axisMargin+0.01);
        this.parent.lineTo(axisEnd, -axisMargin);
        context.stroke();

        context.fillStyle = "gray";
        context.font = "16" + "pt bold calibri";

        let pos = this.parent.toCanvasCoords(0, -axisMargin)

        drawCenteredText(context, "Time", ...vecAdd(pos, [-16*3, 2]));
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

        this.textOffset = -0.05;
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
    calcHorizLinePlacement(){
        return 0 //this.y - 0.1;
    }
    drawCircle(context, t){

        this.parent.context.fillStyle = "hsl(240, 100%, "+(40+5*Math.sin(t*2))+"%)";
        if(this.beingDragged)context.fillStyle = buttonBeingDraggedColor;

        drawCircle(this.parent.context, this.pos[0],this.pos[1], 20 + 1.5*Math.sin(t*2));

    }
    draw(context, t){
        this.pos = this.parent.toCanvasCoords(this.x, this.y);
        this.drawCircle(context, t);

        //lines

        context.strokeStyle = lineColor;
        if(this.beingDragged)context.strokeStyle = lineDraggedColor;
        let barHeight = 0.025;

        let lineY = this.calcHorizLinePlacement();

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
        
        context.fillStyle = lineColor;
        if(this.beingDragged)context.fillStyle = lineDraggedColor;
        context.font = "20" + "pt bold calibri";
        let midpointX = (this.leftLimit + this.x)/2;
        drawCenteredText(context, this.title, ...this.parent.toCanvasCoords(midpointX, lineY +this.textOffset));

        //dashed line up to the dot
        context.strokeStyle = dashedLineColor
        /*
        for(var y=0; y < lineY - barHeight/2 && y < 3; y += 0.02){
            context.beginPath();
            this.parent.moveTo(this.x, y);
            this.parent.lineTo(this.x, y + 0.01);
            context.stroke();
        }*/

        //dashed line down to start
        for(var y=0; y < lineY - 0.03 && y < 3; y += 0.02){
            context.beginPath();
            this.parent.moveTo(this.leftLimit, y);
            this.parent.lineTo(this.leftLimit, y + 0.01);
            context.stroke();
        }
    }

}
class DraggableAtkBtn extends DraggableSidewaysButton{
    constructor(parent, title, ondragCallback){
        super(parent, title, ondragCallback);
        this.textOffset = 0.05;
    }
    calcHorizLinePlacement(){
        return this.y + 0.065;
    }
}



class DraggableSidewaysAndVerticalButton extends DraggableSidewaysButton{
    constructor(parent, xTitle, yTitle, ondragCallback){
        super(parent, '', ondragCallback);
        this.xTitle = xTitle;
        this.yTitle = yTitle;

        this.bottomLimit = 0;
        this.topLimit = 1;
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
    calcHorizLinePlacement(){
        return 0 //this.y - 0.1;
    }
    draw(context,t){
        this.pos = this.parent.toCanvasCoords(this.x, this.y);
        this.drawCircle(context, t);

        //horizontal line
        context.strokeStyle = lineColor;
        if(this.beingDragged)context.strokeStyle = lineDraggedColor;
        let barHeight = 0.025;
        let dotMargin = 0.04;

        let horizlineY = this.calcHorizLinePlacement();

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
        let vertLineX = this.x + 0.15;
        context.beginPath();
        this.parent.moveTo(vertLineX + barHeight/2, this.bottomLimit);
        this.parent.lineTo(vertLineX - barHeight/2, this.bottomLimit);
        this.parent.moveTo(vertLineX, this.bottomLimit);
        this.parent.lineTo(vertLineX, this.y);
        this.parent.moveTo(vertLineX + barHeight/2, this.y);
        this.parent.lineTo(vertLineX - barHeight/2, this.y);
        context.stroke();

        //horizontal label
        
        context.fillStyle = lineColor;
        if(this.beingDragged)context.fillStyle = lineDraggedColor;
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

        //dashed line down to the dot
        context.strokeStyle = dashedLineColor;
        for(let y=horizlineY + barHeight+ 0.02; y < this.y - dotMargin && y < 3; y += 0.02){
            context.beginPath();
            this.parent.moveTo(this.x, y);
            this.parent.lineTo(this.x, y + 0.01);
            context.stroke();
        }
        //dashed line down to start
        for(let y=horizlineY + 0.02; y < 1 - dotMargin && y < 3; y += 0.02){
            context.beginPath();
            this.parent.moveTo(this.leftLimit, y);
            this.parent.lineTo(this.leftLimit, y + 0.01);
            context.stroke();
        }
        //dashed line sideways to the dot
        for(let x=vertLineX - barHeight*1.5; x > this.x + dotMargin && x >0; x -= 0.02){
            context.beginPath();
            this.parent.moveTo(x+0.01, this.y);
            this.parent.lineTo(x, this.y);
            context.stroke();

            /*context.beginPath();
            this.parent.moveTo(x+0.01, this.bottomLimit);
            this.parent.lineTo(x, this.bottomLimit);
            context.stroke();*/
        }
    }

}

class HoldToPlayDrawer{
    constructor(parent){
        this.parent = parent;
        this.noteStartTime = 0;
        this.noteReleaseTime = 0;
        this.playState = "none"

        this.lastAttackX = 0;
        this.lastReleaseX = 0;
    }

    onmousedown(x,y){}
    onmousemove(x,y){}
    mousedown(){//called directly by parent if no other objects clicked
        
        this.noteStartTime = this.parent.synth.currentTime();
        this.playState = "attack";
        this.lastAttackX = 0;
    }

    onmouseup(x,y){
        if(this.playState == 'attack'){
            this.noteReleaseTime = this.parent.synth.currentTime();
            this.playState = "release";
            this.lastReleaseX = 0;
        }
    }

    draw(context, t){
        let a = this.parent.attack;
        let d = this.parent.decay;
        let s = this.parent.sustain;
        let r = this.parent.release;

        let w = this.parent.noteHoldAreaWidth; //the area representing holding down the note

        //if playing, draw the volume
        if(this.playState != "none"){
            
            let x = this.parent.synth.currentTime() - this.noteStartTime;
            if(this.playState == "attack"){
                 this.lastAttackX = x;
            }

            if(this.playState == "attack" && x > a + d + w){
                x = a+d+ w;
            }
            if(this.playState == "release"){
                x = this.parent.synth.currentTime()-this.noteReleaseTime + a+d + w;
                
            }

            if(x > a+d+r+w){
                this.playState = "none";
            }

            context.strokeStyle = "red";
            context.lineWidth = 3;
            context.beginPath();
            this.parent.moveTo(x, 0);
            this.parent.lineTo(x, this.parent.envelopeVolumeAtTime(x));
            context.stroke();


            context.fillStyle = "hsla(240,50%,70%,0.8)";
            context.lineWidth = 3;
            context.beginPath();
            this.parent.moveTo(0, 0);
            if(x > a)this.parent.lineTo(a, this.parent.envelopeVolumeAtTime(a));
            if(x > a+d)this.parent.lineTo(a+d, this.parent.envelopeVolumeAtTime(a+d));
            if(x > a+d+w)this.parent.lineTo(a+d+w, this.parent.envelopeVolumeAtTime(a+d+w));
            // x capped to a+d+w+r above
            this.parent.lineTo(x, this.parent.envelopeVolumeAtTime(x));
            this.parent.lineTo(x, 0);
            context.closePath();
            context.fill();
        }

    }

}

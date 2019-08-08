# Canvas
Canvas is a small standalone JS library for managing HTLM canvas.

Features :
- Zoom in/out using mouse wheel
- Moving into your Canvas by dragging
- Managing multiple layers
- Injecting the canvas where you want

```
myapp = {}
myapp.init = function() {

    var options = {
        trackMouseDrag: true,
        trackWheel: true,
        layers_nicknames: ['paper', 'pen'],
        height: 1000,
        width: 1000,
        div: document.getElementById('myCanvasContainer')
    }
    myapp.canvas = new Canvas(options);
};
```


```
myapp.display = function() {

    var x = 0,
        y = 0;
    var w = Turtle.canvas.width,
        h = Turtle.canvas.height;


    //Drawing paper layer
    myapp.canvas.selectLayer('paper');
    var ctx = Turtle.canvas.drawingContext;

    myapp.ctx.beginPath();
    myapp.ctx.rect(x, y, w, h);
    myapp.ctx.fillStyle = '#FFFFFF';
    myapp.ctx.fill();

    //Drawing pen layer
    myapp.canvas.selectLayer('pen');
    ctx = Turtle.canvas.drawingContext;

    ctx.beginPath();
    ctx.arc(95, 50, 40, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000'
    ctx.stroke();


    myapp.canvas.render();
}
```
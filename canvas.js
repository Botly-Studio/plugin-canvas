var layers = 0;

class Layer {
    constructor(options) {
        this._visible = true;
        this._width = options.witdh || 1000;
        this._height = options.height || 1000;
        this._name = 'layer' + layers++;
        this._nickname = options.nickname || this._name;
        this._cvs = document.createElement('canvas');
        this._cvs.style = "width: 100%;" +
            "height: auto; " +
            "border: none; " +
            "display : none;";

        this._cvs.height = this._height;
        this._cvs.width = this._width;
        this._cvs.id = this._name;
        this._ctx = this._cvs.getContext('2d');
        this._ctx.imageSmoothingEnabled = options.smoothing;
    }

    clear() {
        this._ctx.clearRect(0, 0, this.width, this.height);
    }

    get nickname() {
        return this._nickname;
    }

    get ctx() {
        return this._ctx;
    }

    get cvs() {
        return this._cvs;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get isVisible() {
        return this._visible;
    }

    show() {
        this._visible = true;
    }

    hide() {
        this._visible = false;
    }

    toggle() {
        this._visible = !this._visible;
    }
}


class Canvas {
    constructor(options) {
        this._smoothing = options.smoothing || true;
        this._trackMouseDrag = options.trackMouseDrag || false;
        this._trackWheel = options.trackWheel || false;
        this._layerCount = options.layerCount || options.layers_nicknames.length || 1;
        this._height = options.height || 1000;
        this._width = options.width || 1000;
        this._injectionDiv = options.div || document.getElementsByTagName('div')[0];
        this._layers = []

        this._cvs = document.createElement('canvas');
        this._cvs.id = 'render';
        this._ctx = this._cvs.getContext('2d');
        this._ctx.imageSmoothingEnabled = this._smoothing;
        this._cvs.height = this._height;
        this._cvs.width = this._width;

        this._injectionDiv.appendChild(this._cvs);

        this._lastX = this._cvs.width / 2;
        this._lastY = this._cvs.height / 2;
        this._zoom = 0;
        this._offset = { x: 0, y: 0 };
        this._dContext = this._ctx;


        if (this._layerCount > 1) {
            for (let k = 0; k < this._layerCount; k++) {
                this._layers.push(new Layer({ width: this._width, height: this._height, nickname: options.layers_nicknames[k], smoothing: this._smoothing }));
                this._injectionDiv.appendChild(this._layers[k].cvs);
            }
        }

        trackTransforms(this._ctx);
        //this._ctx.translate(-500, -500);
        this._ctx.scale(2, 2);
        this._ctx.translate(-250, -250); //(1000/2) / scale
        this._ctx.save();
        this.render();

        if (this._trackMouseDrag) {
            var parent = this;
            this._cvs.addEventListener('mousedown', function(evt) {
                var wFactor = parent._width / document.getElementById('render').offsetWidth;
                var hFactor = parent._height / document.getElementById('render').offsetHeight;
                document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
                parent.lastX = evt.offsetX || (evt.pageX - parent._cvs.offsetLeft);
                parent.lastY = evt.offsetY || (evt.pageY - parent._cvs.offsetTop);
                parent.lastX *= wFactor;
                parent.lastY *= hFactor;
                parent.dragStart = parent._ctx.transformedPoint(parent.lastX, parent.lastY);
                parent.dragged = false;
            }, false);

            this._cvs.addEventListener('mousemove', function(evt) {
                var wFactor = parent._width / document.getElementById('render').offsetWidth;
                var hFactor = parent._height / document.getElementById('render').offsetHeight;
                parent.lastX = evt.offsetX || (evt.pageX - parent._cvs.offsetLeft);
                parent.lastY = evt.offsetY || (evt.pageY - parent._cvs.offsetTop);
                parent.lastX *= wFactor
                parent.lastY *= hFactor

                parent.dragged = true;
                if (parent.dragStart) {
                    var pt = parent._ctx.transformedPoint(parent.lastX, parent.lastY);
                    parent._ctx.translate(pt.x - parent.dragStart.x, pt.y - parent.dragStart.y);
                    parent._offset.x
                    parent.render();
                }
            }, false);

            this._cvs.addEventListener('mouseup', function(evt) {
                parent.dragStart = null;
                if (!parent.dragged) parent.zoom(evt.shiftKey ? -1 : 1, parent);
            }, false);

            this._cvs.addEventListener('mouseleave', function(evt) {
                parent.dragStart = null;
                if (!parent.dragged) parent.zoom(evt.shiftKey ? -1 : 1, parent);
            }, false);


        }
        if (this._trackWheel) {
            this._cvs.addEventListener('DOMMouseScroll', function(evt) {
                parent.handleScroll(evt, parent)
            }, false);

            this._cvs.addEventListener('mousewheel', function(evt) {
                parent.handleScroll(evt, parent)
            }, false);
        }


    }

    render() {
        var p1 = this._ctx.transformedPoint(0, 0);
        var p2 = this._ctx.transformedPoint(this._cvs.width, this._cvs.height);
        this._ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

        this._ctx.save();
        this._ctx.setTransform(1, 0, 0, 1, 0, 0);
        this._ctx.clearRect(0, 0, this._cvs.width, this._cvs.height);
        this._ctx.restore();

        // Clear the entire Canvas
        this._layers.forEach(l => {
            if (l.isVisible)
                this._ctx.drawImage(l.cvs, 0, 0);
        });
    }

    zoom(clicks, obj) {
        obj = obj || this;
        var scaleFactor = 1.02;
        var pt = obj._ctx.transformedPoint(obj.lastX, obj.lastY);
        obj._ctx.translate(pt.x, pt.y);
        var factor = Math.pow(scaleFactor, clicks);
        obj._ctx.scale(factor, factor);
        obj._ctx.translate(-pt.x, -pt.y);
        obj.render();
    }

    reset(obj) {
        obj = obj || this;
        obj._ctx.clearRect(0, 0, obj.width, obj.height);
        obj._layers.forEach(l => {
            l.ctx.clearRect(0, 0, obj.width, obj.height);
        });
        obj.resetTransform(obj);
        obj.render();
    }

    clear(obj) {
        obj = obj || this;
        obj._layers.forEach(l => {
            l.ctx.clearRect(0, 0, obj.width, obj.height);
        });
        obj._ctx.clearRect(0, 0, obj.width, obj.height);
        obj.render();
    }

    resetTransform(obj) {
        obj = obj || this;
        while (obj._ctx.savedTransforms.length >= 1) {
            obj._ctx.restore();
        }
        obj._ctx.save();
        obj._ctx.translate(-obj._offset.x, -obj._offset.y);
        obj._offset = { x: 0, y: 0 };
        obj.render();
    }

    handleScroll(evt, obj) {
        obj = obj || this;
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) obj.zoom(delta, obj);
        return evt.preventDefault() && false;
    };

    setBackGround(path) {
        var canvasStyle = Canvas.cvs.style;
        canvasStyle.background = "#ffffff";

        this._ctx.fillStyle = '#ffffff';
        this._ctx.fill();
        TurCanvastle.ctx.clearRect(0, 0, Canvas.width, Canvas.height);
        Canvas.sprites = [];

        var background = new Image();
        background.src = path;

        // Make sure the image is loaded first otherwise nothing will draw.
        background.onload = function() {
            this._ctx.drawImage(background, 0, 0);
        }
    };

    get drawingContext() {
        return this._dContext;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    selectLayer(selector) {
        if (this._layers.length == 0) {
            this._dContext = this._ctx;
        } else {
            if (typeof selector == "number") {
                if (selector < this._layers.length && selector >= 0) {
                    this._dContext = this._layers[selector]._ctx;
                }
            } else
                this._layers.forEach(l => {
                    if (l.nickname == selector)
                        this._dContext = l._ctx;
                });
        }
    }

    getLayer(selector) {
        if (this._layers.length == 0) {
            return this;
        } else {
            if (typeof selector == "number") {
                if (selector < this._layers.length && selector >= 0) {
                    return this._layers[selector];
                }
            } else if (typeof selector == "string") {
                var output;
                this._layers.forEach(l => {
                    if (l.nickname == selector) output = l;
                });
                if (output) return output;
                else return layer[0];
            } else {
                return this._layers[0];
            }
        }
    }

    getContext(selector) {
        if (this._layers.length == 0) {
            return this._ctx;
        } else {
            if (typeof selector == "number") {
                if (selector < this._layers.length && selector >= 0) {
                    return this._layers[selector]._ctx;
                }
            } else if (typeof selector == "string") {
                var output;
                this._layers.forEach(l => {
                    if (l.nickname == selector) output = l;
                });
                if (output) return output._ctx;
                else return layer[0]._ctx;
            } else {
                return this._layers[0]._ctx;
            }
        }
    }
}; //Class end


// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    ctx.xform = svg.createSVGMatrix();
    ctx.getTransform = function() { return ctx.xform; };

    ctx.savedTransforms = [];
    var save = ctx.save;
    ctx.save = function() {
        ctx.savedTransforms.push(ctx.xform.translate(0, 0));
        return save.call(ctx);
    };

    var restore = ctx.restore;
    ctx.restore = function() {
        ctx.xform = ctx.savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function(sx, sy) {
        ctx.xform = ctx.xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };

    var rotate = ctx.rotate;
    ctx.rotate = function(radians) {
        ctx.xform = ctx.xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };

    var translate = ctx.translate;
    ctx.translate = function(dx, dy) {
        ctx.xform = ctx.xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };

    var transform = ctx.transform;
    ctx.transform = function(a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        ctx.xform = ctx.xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };

    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a, b, c, d, e, f) {
        ctx.xform.a = a;
        ctx.xform.b = b;
        ctx.xform.c = c;
        ctx.xform.d = d;
        ctx.xform.e = e;
        ctx.xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };

    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function(x, y) {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(ctx.xform.inverse());
    }
}
Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    return this.path(path.join(",")).attr({stroke: color});
};


Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    return this.path(path.join(",")).attr({stroke: color});
};


viewLoader.define("linechart", class LineChartControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, "<div class='linechart control'></div>");
  
    this.r = Raphael(this.$container[0], this.width, this.height);
    this.redraw();
    
    //this.r.drawGrid(leftgutter + X * .5 + .5, topgutter + .5, width - leftgutter - X, height - topgutter - bottomgutter, 10, 10, "#000");
      
    //if("value" in args) this.value = args.value;
  
    
    if(! EDITOR) {
      
      this.pipeline.listen(data => {

        this.values = data;
        this.redraw();
      });
      
      //this.$container.on("change", () => this.pipeline.pump(this.value));
    }
    
    $(this.r.canvas).css("overflow", "visible");
  }

  //set value(value) {
    //this.$container.val(value);
  //}

  //get value() {
    //return this.$container.val()*1;
  //}

    
  redraw() {
    
    var w = this.width-2,
        h = this.height-2;
    
    this.r.clear();
    
    if(! Array.isArray(this.values)) {
      console.warn("[%o] data is not an array", this);
      return;
    }
    
    var points;
    
    const today = (new Date).toISOString().split(/[TZ]/)[0];
    
    const timeAxis = this.values[0] instanceof Object && "timestamp" in this.values[0] && "value" in this.values[0];
    
    if(timeAxis) {
      
      points = this.values
        .map(p => ({ x: new Date(p.timestamp), y: p.value*1 }))
        .sort((a, b) => a.x > b.x);
    } else {
      
      points = this.values.map((p, i) => ({ x: i, y: p*1 }));
    }
      
    points = points.filter(p => typeof p.y === "number");
    
    if(points.length == 0) {
      console.warn("[%o] no suitable data points", this);
      return;
    }
    
    var minX = points[0].x*1, minY = Infinity,
        maxX = points[points.length-1].x*1, maxY = - Infinity;
    
    points.forEach(p => {
      minY = Math.min(p.y, minY);
      maxY = Math.max(p.y, maxY);
    });
    
    var dY = maxY-minY,
      dX = maxX-minX;
    
    maxX += dX*0.1;
    maxY += dY*0.1;
    minY -= dY*0.1;
    
    dY = maxY-minY;
    dX = maxX-minX;

    /*
    var sX = (Math.log10(dX) % 1 > 0.28)
      ? Math.pow(10, Math.floor(Math.log10(dX)))
      : Math.pow(5, Math.floor(Math.log(dX) / Math.log(5)));
    
    
    var sY = (Math.log10(dY) % 1 > 0.28)
      ? Math.pow(10, Math.floor(Math.log10(dY)))
      : Math.pow(5, Math.floor(Math.log(dY) / Math.log(5)));
    */
    
    var sX = Math.pow(10, Math.floor(Math.log10(dX))),
        sY = Math.pow(10, Math.floor(Math.log10(dY)));
    
    var nX = Math.floor(dX/sX),
        nY = Math.floor(dY/sY);
    
    if(nX == 1) sX /= 4, nX = Math.floor(dX/sX);
    if(nX == 2) sX /= 3, nX = Math.floor(dX/sX);
    if(nX == 9) sX *= 3, nX = Math.floor(dX/sX);
    if(nX == 8) sX *= 2, nX = Math.floor(dX/sX);
    if(nX == 7) sX *= 2, nX = Math.floor(dX/sX);

    if(nY == 1) sY /= 4, nY = Math.floor(dY/sY);
    if(nY == 2) sY /= 3, nY = Math.floor(dY/sY);
    if(nY == 9) sY *= 3, nY = Math.floor(dY/sY);
    if(nY == 8) sY *= 2, nY = Math.floor(dY/sY);
    if(nY == 7) sY *= 2, nY = Math.floor(dY/sY);
    
    if(nY%2) --nY;
    //if(nX%2) --nX;
    
    var oX = 0,
        oY = (dY-sY*nY)/2;

    //console.log({dX, dY});
    //console.log({oX, nX, sX, oY, nY, sY});
    //console.log({minX, maxX, minY, maxY});
    
    var oXr = oX/dX*w,
        oYr = oY/dY*h,
        sXr = sX/dX*w,
        sYr = sY/dY*h;
    
    const labelYAttr = {font: "12px Helvetica, Arial", fill: "#333", "text-anchor": "end"};
    const labelXAttr = {font: "12px Helvetica, Arial", fill: "#333", "text-anchor": "middle"};
    const axisAttr = {stroke: "#999", "stroke-width":2};
    const gridAttr = {stroke: "#AAA", "stroke-width":1};
    const graphAttr = {stroke: "#0066cc", "stroke-width":2};
    
    var grid = [];
    for(var i=0; i<=nY; ++i) {
      
      if(maxY-oY-i*sY === 0)
        this.r.path(["M", 0, Math.floor(oYr+i*sYr)+.5, "H", w].join(",")).attr(axisAttr);
      else
        grid = grid.concat(["M", 0, Math.floor(oYr+i*sYr)+.5, "H", w]);
      
      this.r.text(-5, Math.floor(oYr+i*sYr)+.5, maxY-oY-i*sY).attr(labelYAttr);
    }
    for(var i=0; i<=nX; ++i) {
      
      if(minX+oX+i*sX === 0)
        this.r.path(["M", Math.floor(oXr+i*sXr)+.5, 0, "V", h].join(",")).attr(axisAttr);
      else
        grid = grid.concat(["M", Math.floor(oXr+i*sXr)+.5, 0, "V", h]);
      
      var y = minX+oX+i*sX, label;
      if(timeAxis) {
        
        var time = (new Date(y)).toISOString().split(/[TZ]/);
        label = time[1]+(time[0] === today ? "" : "\n"+time[0]);
      } else {
        
        label = y;
      }
      
      if(!timeAxis || w > 600 || ! (i%2))
        this.r.text(Math.floor(oXr+i*sXr)+.5, h+12, label).attr(labelXAttr);
    }
    this.r.path(grid.join(",")).attr(gridAttr);
    
    var graph = ["M", (points[0].x-minX)/dX*w, h-(points[0].y-minY)/dY*h];
    for(var i=1; i<points.length; ++i)
      graph = graph.concat(["L", (points[i].x-minX)/dX*w, h-(points[i].y-minY)/dY*h]);
    
    this.r.path(graph.join(",")).attr(graphAttr);
  }

  resize(w, h) {
    super.resize(w, h);
    this.r.setSize(this.width, this.height);
    this.redraw();
  }

  serialize() {
    var ser = super.serialize();
    //ser.value = this.value;
    return ser;
  }
});
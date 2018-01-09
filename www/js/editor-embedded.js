var editor = new class Editor extends Events {
  
  constructor() {
    super();
    
    this.movingCtrl = null;
    this.resizingCtrl = null;
    this.selectedCtrl = null;
    this.isNewCtrl = false;
  }
  
  beginCreate(control, mx, my) {
    
    app.create(control, {type: control, position: {x: mx, y: my}}, (err, ctrl) => {
      
      if(err) throw err;
      
      this.isNewCtrl = true;
      
      ctrl.$container.addClass("hover");
      
      this.select(ctrl);
      this.movingCtrl = ctrl;
      //this.moveControl(mx, my);
    });
  }
  
  grid(x) {
    
    return x - x % 12;
  }
  
  onMousemove(event) {
    
    if(this.movingCtrl) {
      
      var box = this.movingCtrl.app.$container.position();
      this.movingCtrl.move(this.grid(event.pageX-box.left), this.grid(event.pageY-box.top));
    }
    
    if(this.resizingCtrl) {
      
      var pos = this.resizingCtrl.position();
      var box = this.resizingCtrl.app.$container.position();
      this.resizingCtrl.resize(this.grid(event.pageX-pos.left-box.left), this.grid(event.pageY-pos.top-box.top));
    }
  }
  
  onClick(event) {
    
    if(this.resizingCtrl) {
      
      this.resizingCtrl.$container.removeClass("hover");
      this.selectedCtrl = this.resizingCtrl;
      this.selectedCtrl.$container.addClass("selected");
      this.resizingCtrl = null;
      this.isNewCtrl = false;
      return;
    }
    
    if(this.movingCtrl) {
      
      var box = this.movingCtrl.app.$container.position();
      this.movingCtrl.move(this.grid(event.pageX-box.left), this.grid(event.pageY-box.top));
      
      var size = this.movingCtrl.size();
      if(this.movingCtrl.resize(size.width, size.height) == false) {
        
        this.movingCtrl.$container.removeClass("hover");
        this.isNewCtrl = false;
      } else {
        
        this.resizingCtrl = this.movingCtrl;
      }
      
      this.movingCtrl = null;
      return;
    }
    
    var $ctrl = $(event.target).closest(".control");
    if($ctrl[0]) {
      
      var ctrl = app.ctrls[$ctrl.attr("data-uuid")];
      this.select(ctrl);
    } else {
      
      this.select(null);
    }
  }
  
  onEscape() {
    
    if(this.movingCtrl) {
      
      if(this.isNewCtrl) {
        
        this.movingCtrl.destruct();
        delete app.ctrls[this.movingCtrl.uuid];
      } else {
        this.selectedCtrl = this.movingCtrl;
        this.selectedCtrl.$container.addClass("selected").removeClass("hover");
      }
      this.movingCtrl = null;
      return;
    }
    
    if(this.resizingCtrl) {
      
      if(this.isNewCtrl) {
        this.movingCtrl.destruct();
        delete app.ctrls[this.movingCtrl.uuid];
      } else {
        this.selectedCtrl = this.resizingCtrl;
        this.selectedCtrl.$container.addClass("selected").removeClass("hover");
      }
      this.resizingCtrl = null;
      return;
    }
    
    if(this.selectedCtrl) {
      
      this.select(null);
      return;
    }
  }
  
  select(ctrl) {
    
    if(this.selectedCtrl == ctrl)
      return;
    
    if(this.selectedCtrl) {
      
      this.selectedCtrl.$container.removeClass("selected");
      this.emit("unselect", this.selectedCtrl);
    }
    
    if(ctrl) {
      
      ctrl.$container.addClass("selected");
      this.emit("select", ctrl);
    }
    
    this.selectedCtrl = ctrl;
  }
  
  /////////////////////////////////////////////////////////
  
  moveControl(mx, my) {
    
    this.movingCtrl = this.selectedCtrl;
    
    var size = this.movingCtrl.size();
    var box = this.movingCtrl.app.$container.position();
    
    this.movingCtrl.move(mx-size.width/2-box.left, my-size.height-box.top);
  }
  
  removeControl() {
    
    this.selectedCtrl.destruct();
    delete app.ctrls[this.selectedCtrl.uuid];
    this.select(null);
  }
  
  /////////////////////////////////////////////////////////
  
  setMeta(meta, value) {
    
    app.setMeta(meta, value);
  }
  
  /////////////////////////////////////////////////////////
  
  asEntity() {
    
    return {
      type: "Application",
      id: app.page,
      controls: [Object.values(app.ctrls).map(ctrl =>
        encodeURIComponent(JSON.stringify(ctrl.serialize()))
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\'/g, "%27")
      )],
      metadata: [encodeURIComponent(JSON.stringify(app.metadata))
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\'/g, "%27")]
    }
  }
}


///////////////////////////////////////////////////////////


editor.on("select", (ctrl) => {
  
  window.parent.editor.onSelect(ctrl);
});

editor.on("unselect", (ctrl) => {
  
  window.parent.editor.onUnselect(ctrl);
});

///////////////////////////////////////////////////////////


$(window).on("mousemove", editor.onMousemove.bind(editor));

$(window).on("click", editor.onClick.bind(editor));

$(window).keyup(function(event) {
  if (event.keyCode == 27 /* ESCAPE */) {
    editor.onEscape();
  }
});


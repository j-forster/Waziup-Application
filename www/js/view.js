class View extends Events {
  
  constructor(html) {    
    super();
    
    this.content = document.createElement("div");
    this.content.innerHTML = html;
    
    this.$ = (sel) => $(sel, this.content); //.querySelector.bind(this.content);
    //this.$$ = this.content.querySelectorAll.bind(this.content);
    
    for(var master of this.$("[id]"))
      this["$"+master.id] = $(master);
    
    this.loaded = false;
  }
  
  load(parentNode, name) {
    
    $(parentNode).append(this.content);
    this.loaded = true;
  }
  
  unload() {
    
    $(this.content).detach();
    this.loaded = true;
  }
}

///////////////////////////////////////////////////////////



var viewLoader = new class ViewLoader extends Events {
  
  constructor(element, tracking=false) {
    
    super();
    this.waiting = {};
    this.ctrls = {};
  }
  
  get(name, cb) {
    
    if(name in this.ctrls)
      return cb(null, this.ctrls[name]);
    if(name in this.waiting)
      this.waiting[name].push(cb);
    else {
      this.waiting[name] = [cb];
      $.getScript("view/"+name+".js");
    }
  }
  
  define(name, Ctrl) {
    
    var waiting = this.waiting[name];
    delete this.waiting[name];
    this.ctrls[name] = Ctrl;
    if(Array.isArray(waiting))
      for(var cb of waiting)
        cb(null, Ctrl);
  }
}
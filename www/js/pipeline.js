class Pipeline extends Events {
  
  
  constructor(data = {}) {
    super();
    
    this.id = Pipeline.count++;
    this.data = data;
    this.on("*", (event, scope, conn) => console.log("[Pipeline%i] %s '%s' by %o (%o)", this.id,  event, scope.join("."), conn.control|| conn, this));
  }
  
  touch(scope = []) {
    
    this.emit("pump", scope, this); 
  }
};

Pipeline.count = 0;

// var pipeline = new Pipeline;

Pipeline.Connector = class Connector {
  
  constructor(ctrl, ppl="") {
    
    this.control = ctrl;
    this.pipeline = ctrl.app.pipeline;
    this.mutex = new Set;
    
    if(ppl) {
      
      this.events = ppl.split(":");
      this.scope = this.events.shift().split(".");

      if(this.events.length == 0)
          this.events = ["pump"];
    } else {
      
      this.events = [];
      this.scope = [];
    }
    
  }
  
  pump(data) {
    
    if(data !== undefined)
      this.data = data;
    this.emit("pump");
  }
  
  get data() {
    
    var data = this.pipeline.data;
      for(var scope of this.scope)
          data = data instanceof Object ? data[scope] : null;
    return data;
  }
  
  set data(new_data) {
    
    var data = this.pipeline.data;
    
    for(var i=0; i<this.scope.length-1; ++i) {
      
      if(data[this.scope[i]] instanceof Object)
        data = data[this.scope[i]];
      else
        data = data[this.scope[i]] = {};
    }
    
    data[this.scope[this.scope.length-1]] = new_data;
  }
  
  touch() {
    
    for(var event of this.events)
      this.emit(event); 
  }
  
  listen(cb) {
    
    for(let event of this.events)
      this.on(event, cb);
    
    if(this.events.includes("pump"))
      cb(this.data, "pump", this.control);
  }
  
  fail(err) {
    
    this.pipeline.data.error = err;
    this.emit("error");
  }
  
  emit(event) {
    
    if(this.mutex.has(event))
      return;
    this.mutex.add(event);
    this.pipeline.emit(event, this.scope, this); 
    this.mutex.delete(event);
  }
  
  on(event, cb) {
    
    this.pipeline.on(event, (function(scope, sender) {
      
      var event_now = event;
      
      if(event_now === "*") {
        event_now = arguments[0];
        scope = arguments[1];
        sender = arguments[2];
      }

      var min = Math.min(this.scope.length, scope.length);
      
      for(var i=0; i<min; ++i)
        if(scope[i] !== this.scope[i])
          return;
      
      cb(this.data, event_now, sender);
    }).bind(this));
  }
}
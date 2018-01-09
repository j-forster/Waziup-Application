viewLoader.define("script-initial", class ScriptInitialControl extends Control {

  constructor(args) {
  
    args.resizeable = false;
    args.hidden = true;
    super(args, "<div class='script-navigate control'><img src='img/script_initial.svg'><br><span>Script Initial</span></div>");
    
    
    this.setObject(args.object || {});
  
    if(! EDITOR) {
      
      this.pipeline.listen((_) => {
        
        var data;
        
        try {
          
          data = eval(this.object);
        } catch(err) {
          
          this.pipeline.error(err);
        }
        
        if(data && !this.pipeline.data) {
          
          this.pipeline.pump(data);
          this.pipeline.emit("init");
        }
      });
    }
  }

  setObject(object) {
    
    this.object = object;
    
    //if(EDITOR)
    //  this.$container.find("span").text(url || (EDITOR?"<url>":""));
  }

  serialize() {
    var ser = super.serialize();
    ser.object = this.object;
    return ser;
  }
  
});
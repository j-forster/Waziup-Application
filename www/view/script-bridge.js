viewLoader.define("script-bridge", class ScriptBridgeControl extends Control {

  constructor(args) {
  
    args.resizeable = false;
    args.hidden = true;
    super(args, "<div class='script-bridge control'><img src='img/script_bridge.svg'><br><span></span></div>");
    
    
    //this.setObject(args.object || {});
    if(args.bridge)
      this.setBridge(args.bridge.dir, args.bridge.ppl);
    else
      this.setBridge("to", "");
  
    if(! EDITOR) {
      
      var conn = new Pipeline.Connector(this, args.bridge.ppl);

      if(this.bridge.dir === "insert" || this.bridge.dir === "to" || this.bridge.dir === "both") {
        
        this.pipeline.listen(data => {
          
          if(this.bridge.dir === "insert") {
            var array = conn.data;
            if(Array.isArray(array)) {
              
              array.push(data);
              conn.pump(array);
            }
          } else {
            
            conn.pump(data);
          }
        });
      }
      
      if(this.bridge.dir === "from" || this.bridge.dir === "both") {
        
        conn.listen(data => {
          this.pipeline.pump(data);
        });
      }
    }
  }

  setBridge(dir, ppl) {
    
    this.bridge = {dir, ppl};
    
    if(EDITOR)
      this.$container.find("span").text((this.pipeline|| "<Pipeline>")+" "+dir+" " + (ppl || "<Pipeline>"));
  }

  serialize() {
    var ser = super.serialize();
    ser.bridge = this.bridge;
    return ser;
  }
  
});
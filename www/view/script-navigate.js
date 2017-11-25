viewLoader.define("script-navigate", class ScriptNavigateControl extends Control {

  constructor(args) {
  
    args.resizeable = false;
    args.hidden = true;
    super(args, "<div class='script-navigate control'><img src='img/script_navigate.svg'><br><span></span></div>");
    
    
    this.setNavigateURL(args.url || "");
  
    if(! EDITOR) {
      
      this.pipeline.listen((data) => {

        var url = app.template(this.url, data, (m) => encodeURI(JSON.stringify(m)));
        
        location.replace(url);
      });
    }
  }

  setNavigateURL(url) {
    
    this.url = url;
    
    if(EDITOR)
      this.$container.find("span").text(url || (EDITOR?"<url>":""));
  }

  serialize() {
    var ser = super.serialize();
    ser.url = this.url;
    return ser;
  }
  
});
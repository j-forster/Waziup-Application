const EMPTY_BUTTON = "Use the button 'Edit Text' to change this content.";

viewLoader.define("button", class ButtonControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, "<button class='button control'>Hello :)</button>");
  
    //if("value" in args) this.value = args.value;
    
    this.text = args.text || "";
    this.html = args.html ||(EDITOR?EMPTY_BUTTON:"");
  
    if(! EDITOR) {

      this.$container.on("click", () => {
        this.pipeline.emit("click");
      });
      
      this.pipeline.listen(data => {

        if(data) this.$container.show();
        else {
          this.$container.hide();
          return;
        }
        
        if(this.text) {
          this.$container.html(this.app.template(this.text_to_html, data));
        } else {
          
          if(data === null || data === undefined) {
          
            this.$container.text("");
            return;
          }

          if(typeof data == "string")
            this.$container.text(data);
          else {

            try {

              this.$container.text(JSON.stringify(data, null, 2));
            } catch(err) {

              this.$container.text(err);
            }
          }
        }
      });
    }
  }
  
  set html(html) {
    this.text_to_html = html;
    this.$container.html(html||(EDITOR?EMPTY_TEXT:""));
  }

  get html() {
    return this.text_to_html;
  }

  serialize() {
    var ser = super.serialize();
    ser.text = this.text;
    ser.html = this.text_to_html;
    return ser;
  }
  
});
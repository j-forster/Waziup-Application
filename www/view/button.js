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
      
      this.app.templateAsync(this.text_to_html, null, (html) => this.$container.html(html));
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
const EMPTY_TEXT = "Use the button 'Edit Text' to change this content.";

viewLoader.define("text", class TextControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, "<div class='text control'>" + (EDITOR?EMPTY_TEXT:"") + "</div>");
    
    this.text = args.text || "";
    this.html = args.html ||(EDITOR?EMPTY_TEXT:"");
  
    if(! EDITOR) {

      this.pipeline.listen(data => {

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
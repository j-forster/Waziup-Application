viewLoader.define("input-string", class InputStringControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, "<input type='text' class='input-string control' value=''>");
  
    if("value" in args) this.value = args.value;
  
    if(! EDITOR) {
      
      this.pipeline.listen(data => {

        this.value = data;
      });
      
      this.$container.on("change", () => this.pipeline.pump(this.value));
    }
  }

  set value(value) {
    this.$container.val(value);
  }

  get value() {
    return this.$container.val();
  }

  serialize() {
    var ser = super.serialize();
    ser.value = this.value;
    return ser;
  }
  
});
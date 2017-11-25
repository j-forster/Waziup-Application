viewLoader.define("number", class NumberControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, "<input type='number' class='number control' value='0'>");
  
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
    return this.$container.val()*1;
  }

  serialize() {
    var ser = super.serialize();
    ser.value = this.value;
    return ser;
  }
});
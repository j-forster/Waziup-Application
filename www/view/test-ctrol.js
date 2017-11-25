viewLoader.define("test-ctrol", class TestCtrol {

  constructor() {
  
    this.$container = $("<div class='testctrl'>").appendTo(document.body);
  }

  move(x, y) {
    
    this.$container.css({
      top: y,
      left: x
    });
  }

  position() {
    
    var pos = this.$container.css(["top", "left"]);
    return {top: parseFloat(pos.top), left: parseFloat(pos.left)};
  }

  size() {
   
    return {
      width: this.$container.width(),
      height: this.$container.height()
    }
  }

  resize(w, h) {
    
    this.$container.css({
      width: w,
      height: h
    });
  }

  destruct() {
    
    this.$container.remove();
  }
  
});
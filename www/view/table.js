const TABLE_TEMPLATE = `
<div class='view-table control'>
  <span>No data to display...</span>
  <ul></ul>
</div>
`;


viewLoader.define("table", class TableControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, TABLE_TEMPLATE);
  
    this.$list = this.$container.find("ul");
    this.$message = this.$container.find("span");
    
    this.ctrl = args.control || "";
    
    if(!EDITOR) {
      
      this.data = [];
      
      this.active_elm_pipeline = args.active_elm_pipeline
        ? new Pipeline.Connector(this, args.active_elm_pipeline)
        : null; 
      
      this.pipeline.listen((data) => {
        
        this.createList(data);
        //console.log("table", data)
      });
      
      this.$list.on("click", "li", (evt) => this.onHover(evt));
    } else {
      
      this.active_elm_pipeline = args.active_elm_pipeline || "";
    }
  }
  
  onHover(event) {
    
    var index = $(event.currentTarget).index();
    
    //console.log(event, $(event.currentTarget), index);
    if(this.active_elm_pipeline)
      this.active_elm_pipeline.pump(this.data[index]);
    
  }

  createList(data) {
    
    this.data = data;
    
    if(! Array.isArray(data)) {
      
      this.$message.text("Data is not displayable!").show();
      this.$list.hide();
      return;
    }
    
    if(data.length === 0) {
      
      this.$message.text("This list contains no items.").show();
      this.$list.hide();
      return;
    }
    
    this.$list.empty().append(data.map((entity, i) => {
      
      var $li = $("<li>");
      var args = {
        container: $li,
        position: {
          x: "", 
          y: ""
        },
        pipeline: this.pipeline.scope.join(".")+"."+i
      };

      this.app.create(this.ctrl, args);
      return $li;
    }));
    
    this.$list.show();
    this.$message.hide();
  }
  
  setActiveElmPipeline(pipeline) {
    
    this.active_elm_pipeline = pipeline;
  }

  setControl(ctrl) {
    
    this.ctrl = ctrl;
  }

  setMeta(meta, value) {
    
    this.$list = this.$list || this.$container.find("ul");
    
    if(meta == "css") {
      
      this.$list.attr("style",value);
      
    } else if(meta == "class") {
      
      this.$list.attr("class", value);
    } 
    
    super.setMeta(meta, value);
  }

  serialize() {
    var ser = super.serialize();
    ser.active_elm_pipeline = this.active_elm_pipeline;
    ser.control = this.ctrl;
    return ser;
  }
  
});
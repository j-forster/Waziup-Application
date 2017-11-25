const TABLE_TEMPLATE = `
<div class='view-table control'>
  <span>No data to display...</span>
  <table>
    <thead>
      <tr></tr>
    </thead>
    <tbody>
    </tbody>
  </table>
</div>
`;


viewLoader.define("table", class TableControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, TABLE_TEMPLATE);
  
    this.$table = this.$container.find("table");
    this.$thead = this.$container.find("thead tr");
    this.$tbody = this.$container.find("tbody");
    this.$message = this.$container.find("span");
    
    
    if(!EDITOR) {
      
      this.data = [];
      
      this.active_elm_pipeline = args.active_elm_pipeline
        ? new Pipeline.Connector(this, args.active_elm_pipeline)
        : null; 
      
      this.pipeline.listen((data) => {
        
        this.createTable(data);
        //console.log("table", data)
      });
      
      this.$tbody.on("click", "tr", (evt) => this.onHover(evt));
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

  createTable(data) {
    
    this.data = data;
    
    if(! Array.isArray(data)) {
      
      this.$message.text("Data is not displayable!").show();
      this.$table.hide();
      return;
    }
    
    if(data.length === 0) {
      
      this.$message.text("This list contains no items.").show();
      this.$table.hide();
      return;
    }

    var keys = new Set(Object.keys(data[0]));
    for(var i=1; i<data.length; ++i) {
      
      for(var key of keys)
        if(! (key in data[i]))
          keys.delete(key);
    }
    
    if(keys.size === 0) {
      
      this.$message.text("The items could not be displayed.").show();
      this.$table.hide();
      return;
    }
    
    this.$thead.empty().append(Array.from(keys).map(key => $("<th>").text(key)));
    this.$tbody.empty().append(data.map(entity => $("<tr>").append(... Array.from(keys).map(key => $("<td>").text(entity[key])))));
    this.$table.show();
    this.$message.hide();
  }
  
  setActiveElmPipeline(pipeline) {
    
    this.active_elm_pipeline = pipeline;
  }

  serialize() {
    var ser = super.serialize();
    ser.active_elm_pipeline = this.active_elm_pipeline;
    return ser;
  }
  
});
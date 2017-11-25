const LIST_TEMPLATE = `
<div class='view-list control'>
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


viewLoader.define("list", class ListControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, LIST_TEMPLATE);
  
    this.$table = this.$container.find("table");
    this.$thead = this.$container.find("thead tr");
    this.$tbody = this.$container.find("tbody");
    this.$message = this.$container.find("span");
    
    this.rows = args.rows || [{
      attr: "",
      head: "",
      ctrl: ""
    }];
    
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
  
  setMeta(meta, value) {
    
    this.$table = this.$table || this.$container.find("table");
    
    if(meta == "css") {
      
      this.$table.attr("style",value);
      
    } else if(meta == "class") {
      
      this.$table.attr("class", value);
    } 
    
    super.setMeta(meta, value);
  }
  
  setRows(rows) {
    
    this.rows = rows;
    
    this.$message.hide();
    this.$thead.empty().append(this.rows.map(row => $("<td>").text(row.head)));
    
    if(EDITOR) {
      this.$tbody.empty().append($("<tr>").append(
        this.rows.map(row => $("<td>").text("["+row.ctrl+"]"))
      ));
    }
  }
  
  onHover(event) {
    
    var index = $(event.currentTarget).index();
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

    this.$thead.empty().append(this.rows.map(row => $("<td>").text(row.head)));
    this.$tbody.empty().append(data.map((entity, i) => $("<tr>").append(
      
      this.rows.map((row, j) => {
        
        var $td = $("<td>");
        var args = {
          container: $td,
          position: {
            x: "", 
            y: ""
          },
          pipeline: this.pipeline.scope.join(".")+"."+i+"."+row.attr
        };
        
        this.app.create(row.ctrl, args);
        return $td;
      }

    ))));
    
    this.$table.show();
    this.$message.hide();
  }
  
  setActiveElmPipeline(pipeline) {
    debugger;
    this.active_elm_pipeline = pipeline;
  }

  serialize() {
    var ser = super.serialize();
    ser.rows = this.rows;
    ser.active_elm_pipeline = this.active_elm_pipeline;
    return ser;
  }
  
});
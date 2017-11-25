viewLoader.define("pipeline-history", class PipelineHistoryControl extends Control {

  constructor(args) {
  
    args.resizeable = false;
    args.hidden = true;
    super(args, "<div class='ppl_pull control hidden'><img src='img/ppl_pull.svg'><br>Historical Data<br><span>Entity@Type</span></div>'");
  
    this.entity = {id:"", type:"", attr:""};
    if(args.entity) this.setEntity(args.entity.id||"", args.entity.type||"", args.entity.attr||"");
    
    if(!EDITOR && this.entity.id) {
      
      app.on("load", () => this.loadHistoricalData());
    }
  }

  loadHistoricalData() {
    
    /*app.broker.history("v1/entities/"+this.entity.id+(this.entity.type?"?type="+this.entity.type:"")).then(entity => {

      this.pipeline.pump(entity);
      this.pipeline.emit("pull", entity);
    }, error => {

      this.pipeline.fail(error);
    });*/
  }

  setEntity(id, type, attr) {
    
    this.entity.id = id;
    this.entity.type = type;
    this.entity.attr = attr;
    
    if(EDITOR)
      this.$container.find("span").text((id||"<entity>")+"@"+(type||"<type>"));
  }

  getEntity() {
    
    return this.entity;
  }

  serialize() {
    var ser = super.serialize();
    ser.entity = this.entity;
    return ser;
  }
  
});
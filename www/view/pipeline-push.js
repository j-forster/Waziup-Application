viewLoader.define("pipeline-push", class PipelinePushControl extends Control {

  constructor(args) {
  
    args.resizeable = false;
    args.hidden = true;
    super(args, "<div class='ppl_push control hidden'><img src='img/ppl_push.svg'><br><span>Entity@Type</span></div>'");
  
    this.entity = {id:"", type:"", attr:""};
    if(args.entity) this.setEntity(args.entity.id||"", args.entity.type||"", args.entity.attr||"");
    
    if(!EDITOR && this.entity.id) {
      
      this.initialValue = null;
      
      this.pipeline.listen(data => {

        this.submitEntity(data);
      });
      
      this.pipeline.on("pull", (value, event, entity) => {
        
        try {
          this.initialValue = JSON.parse(JSON.stringify(value));
        } catch(err) {
          console.error("Pipeline-Push: no clone of the initial entity", err);
        }
      });
    }
  }

  submitEntity(value) {
    
    if(! this.entity.attr) {
      
      // submit entity attributes
      Object.keys(value).forEach(attr => {
      
        if(["id", "owner", "type"].includes(attr))
          return;

        if(!("value" in value[attr]))
          return;

        var newValue = value[attr].value;

        if(this.initialValue && attr in this.initialValue) {

          var oldValue = this.initialValue[attr].value;
          if(JSON.stringify(newValue) == JSON.stringify(oldValue))
            return;

          this.submitAttribute(attr, newValue);
          console.log(attr+" changed:", newValue);
          
        }
      });
    } else {
      
      if(JSON.stringify(value) == JSON.stringify(this.initialValue))
            return;
      
      this.submitAttribute(this.entity.attr, value);
      console.log(this.entity.attr+" changed:", value);
    }
    
    
    /*app.broker.get("v2/entities/"+this.entity.id+(this.entity.type?"?type="+this.entity.type:"")).then(entity => {

      this.pipeline.pump(entity);
    }, error => {

      this.pipeline.fail(error);
    });*/
  }
  
  submitAttribute(attr, newValue) {
    
    app.broker.put("v2/entities/"+this.entity.id+"/attrs/"+attr+"/value"+(this.entity.type?"?type="+this.entity.type:""), newValue).then(resp => {

      console.log("okay");
    }, error => {

      console.error("error "+attr, error);
    });
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
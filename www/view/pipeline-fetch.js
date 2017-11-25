viewLoader.define("pipeline-fetch", class PipelineFetchControl extends Control {

  constructor(args) {
  
    args.resizeable = false;
    args.hidden = true;
    super(args, "<div class='ppl_fetch control hidden'><img src='img/ppl_fetch.svg'><br><span>GET &lt;URL&gt;</span></div>'");
  
    this.fetch = {url:"", method:""};
    if(args.fetch) this.setFetch(args.fetch.method||"", args.fetch.url||"", args.fetch.body||"");
    
    if(!EDITOR) {
      
      if(this.fetch.method === "GET" && this.pipeline.events.length === 1 && this.pipeline.events[0] === "pump")
        app.on("load", (data) => this.doFetch(null, data));
      else
        this.pipeline.listen((data) => this.doFetch(data, data));
    }
  }

  doFetch(body, templData) {
    
    var url = app.template(this.fetch.url, templData);
    
    if(this.fetch.body)
      body = (new Pipeline.Connector(this, this.fetch.body)).data
    
    var init = {
      headers: new Headers({
        "Accept": "application/json,text/plain"
      }),
      method: this.fetch.method,
      body: (this.fetch.method !== "GET") && body !== null ? JSON.stringify(body) : null
    };
    
    if(this.token)
      init.headers.append("Authorization", "Bearer "+this.token);
    
    if(this.fetch.method === "POST" || this.fetch.method === "PUT") {
      
      if(typeof body == "object")
        init.headers.append("Content-Type", "application/json");
      else
        init.headers.append("Content-Type", "text/plain");
    }
    
    var request = new Request(url, init);
    
    fetch(request).then((resp) => {
      
      var error = resp.ok ? null : Error("The server returned with status "+resp.status+" ("+resp.statusText+").");

      resp.text().then(text => {

        if(this.fetch.method == "GET") {
          
          if(text) {

            try {
              var obj = JSON.parse(text);
            } catch(err) {

              return;
            }
            if(this.fetch.method == "GET")
              this.pipeline.pump(obj);
            
            this.pipeline.emit("fetch");
          } else {

            this.pipeline.fail(error);
          }
        } else {
          
          if(! resp.ok)
            this.pipeline.fail(error);
          else
            this.pipeline.emit("fetch");
        }

      }, () => {
        
        this.pipeline.fail(error);
      });
      
    }, (err) => this.pipeline.fail("Network error: "+err.message+"."));
  }

  setFetch(method, url, body) {
    
    this.fetch.method = method;
    this.fetch.url = url;
    this.fetch.body = body;
    
    if(EDITOR)
      this.$container.find("span").text((method||"GET")+" "+(url||"<URL>"));
  }

  serialize() {
    var ser = super.serialize();
    ser.fetch = this.fetch;
    return ser;
  }
  
});
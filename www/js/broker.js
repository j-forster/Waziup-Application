var broker;

//


class Broker extends Events {
  
  constructor(interf, token) {
    super();
    this.interface = interf;
    
    this.token = token;
    
    this.subscriptions = new Map;
    
    // this.interface.servicePath = "TEST";
    this.$fiwiservpath = $(".entity-type-filter input");
    this.$entityTypeFilter = $(".entity-type-filter input");
    
    this.entityFilter = {
      type: this.$entityTypeFilter.val()
    };
    this.state = 0;
    
    //
    
    this.on("change", () => this.state++);
    
    this.onFiWiSelectChange = this.onFiWiSelectChange.bind(this);
    $(".fiwire-servicepath select")
      .on("change", this.onFiWiSelectChange);
    
    this.onEntityFilterChange = this.onEntityFilterChange.bind(this);
    this.$entityTypeFilter
      .on("change", this.onEntityFilterChange)
      .on("keydown", (event) => {
      
        if(event.which === 13)
          event.target.blur();
      });
    
    $(".entity-type-filter li").on("click", (event) => {
      
      var type = $(event.currentTarget).attr("data-value");
      this.setEntityFilter(type);
    })
  }
  
  normalizeEntityFilter(filter = this.entityFilter) {
    
    return Object.keys(filter)
      .filter(f => filter[f] && filter[f] !== "*")
      .map(f => f+"="+filter[f])
      .join("&");
  }
  
  
  onFiWiSelectChange(event) {
    
    var select = event.target;
    this.interface.servicePath = select.options[select.selectedIndex].value;
    this.emit("change");
  }
  
  setEntityFilter(value) {
    
    this.$entityTypeFilter.val(value);
    this.onEntityFilterChange();
  }
  
  onEntityFilterChange() {
    
    this.entityFilter.type = this.$entityTypeFilter.val();
    this.emit("change");
  }
  
  visible(method, args, messageBox, cb) {
    
    $(messageBox).html('<h1><i class="material-icons">cloud_download</i> Loading content…</h1>').show();
    
    var timeout = setTimeout(() => $(messageBox).append($("<span>").text("This takes longer than usual…")), 5000);
    
    this[method.toLowerCase()].call(this, ...args, (err, data) => {
      
      clearTimeout(timeout);
      
      if(err) {
        
        $(messageBox).html('<h1><i class="material-icons">error_outline</i> Error loading content.</h1>'+
          'Check your network connection and make sure the server is up and allows requests from this domain.<br>'+
          '<em>'+err.message+" at "+args.join(", ")+"</em>");
      } else {
        
        $(messageBox).hide();
        cb(data);
      }
    });
  }
  
  log(method, ...args) {
    
    this[method.toLowerCase()].call(this, ...args, (err, data) => {
      
      console.log(err, data);
    });
  }
  
  get(path, cb) {
    
    return this.fetch(this.pathToUrl(path), "GET", null, cb);
  }
  
  delete(path, cb) {
    
    return this.fetch(this.pathToUrl(path), "DELETE", null, cb);
  }
  
  post(path, obj, cb) {
    
    return this.fetch(this.pathToUrl(path), "POST", obj, cb);
  }
  
  put(path, obj, cb) {
    
    return this.fetch(this.pathToUrl(path), "PUT", obj, cb);
  }
  
  history(path, cb) {
    
    return this.fetch(this.interface.cygnus+"/"+path, "GET", null, cb);
  }
  
  pathToUrl(path) {
    
    if(path.startsWith("v1/") && this.interface.fiwareOrionV1)
      return this.interface.fiwareOrionV1 + "/" + path.substr(3);
    if(path.startsWith("v2/") && this.interface.fiwareOrionV2)
      return this.interface.fiwareOrionV2 + "/" + path.substr(3);
    return this.interface.fiwareOrion + "/" + path;
  }
  
  fetch(url, method, body, cb) {
    
    if(! cb) {
      
      return new Promise((resolve, reject) => {
        
        this.fetch(url, method, body, (err, data) => {
          
          if(err) reject(err);
          else resolve(data);
        });
      });
    }
    
    if(! url.startsWith("https://") && ! url.startsWith("http://")) {
    
      cb(Error("The broker does not support this operation."));
      return;
    }
    
    var init = {
      headers: new Headers({
        "Accept": "application/json,text/plain",
        "Fiware-ServicePath": "/"+this.interface.servicePath,
        "Fiware-Service": "waziup"
      }),
      method,
      body: body !== null ? JSON.stringify(body) : null
    };
    
    if(this.token)
      init.headers.append("Authorization", "Bearer "+this.token);
    
    if(method === "POST" || method === "PUT") {
      
      if(typeof body == "object")
        init.headers.append("Content-Type", "application/json");
      else
        init.headers.append("Content-Type", "text/plain");
    }
    
    var request = new Request(url, init);
    
    fetch(request).then((resp) => {
      
      var error = resp.ok ? null : Error("The server returned with status code "+resp.status+" ("+resp.statusText+").");

      resp.text().then(text => {

        if(text) {

          try {
            var obj = JSON.parse(text);
          } catch(err) {
            cb(Error("The response was not json decoded."));
            return;
          }
          cb(error, obj);
        } else {

          cb(error, null);
        }
      }, () => {
        
        cb(error);
      });
      
    }, (err) => cb(Error("Network error: "+err.message+".")));
  }
  
  subscribe(entity, cb) {
    
    var key = entity.id+"@"+entity.type,
        subscription = this.subscriptions.get(key);
    
    if(subscription) subscription.callbacks.push(cb);
    else this.subscriptions.set(key, new Broker.Subscription(entity, cb))
  }
  
  unsubscribe(entity, cb) {
    
    
    var key = entity.id+"@"+entity.type,
        subscription = this.subscriptions.get(key);
    
    if(subscription) {
      
      if(subscription.callbacks.includes(cb)) {
        
        if(subscription.callbacks.length === 1) {
          
          subscription.clear();
          this.subscriptions.delete(key);
        } else {
          
          subscription.callbacks.splice(subscription.callbacks.indexOf(cb), 1);
        }
      }
    }
  }
}


Broker.Subscription  = class Subscription {
  
  constructor(entity, cb) {
    
    this.entity = entity;
    this.callbacks = [cb];
    this.fetch = this.fetch.bind(this);
    this.interval = setInterval(this.fetch, 5000);
  }
  
  fetch() {
    
    broker.get("v2/entities/"+this.entity.id+"?type="+this.entity.type, this.onFetch.bind(this));
  }
  
  clear() {
    
    clearInterval(this.interval);
  }
  
  onFetch(err, data) {
    
    if(err || !this.interval) return;
    this.callbacks.forEach(cb => cb(data));
  }
}

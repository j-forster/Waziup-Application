var broker;

//


class Broker extends Events {
  
  constructor(interf, token) {
    super();
    this.interface = interf;
    
    this.token = token;
    
    this.subscriptions = new Map;
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
  
  url(pattern, entity) {
    
    var error = null;
    return {
      url: this.api + pattern.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
      
        if(error) return;
        if(! key in entity)
          error = new Error("Required: what."+key);
        else
          return entity[key];
      }),
      error
    };
  }
  
  log(method, ...args) {
    
    this[method.toLowerCase()].call(this, ...args, (err, data) => {
      
      if(err) console.error(err, data);
      else console.log(data);
    });
  }
  
  get(what, cb) {
    
    if(what.sensors)
      return this.fetch("GET", "sensors", what, null, cb);
    if(what.measurement_id)
      return this.fetch("GET", "sensors/{sensor_id}/measurements/{measurement_id}", what, null, cb);
    if(what.sensor_id)
      return this.fetch("GET", "sensors/{sensor_id}", what, null, cb);
    
    if(what.auth)
      return this.fetch("GET", "auth", what, null, cb);
    if(what.users)
      return this.fetch("GET", "users", what, null, cb);
    if(what.user_id)
      return this.fetch("GET", "users/{user_id}", what, null, cb);
    
    this.fetch(null, null, what, null, cb);
  }
  
  delete(what, cb) {
    
    if(what.measurement_id)
      return this.fetch("DELETE", "sensors/{sensor_id}/measurements/{measurement_id}", what, null, cb);
    if(what.sensor_id)
      return this.fetch("DELETE", "sensors/{sensor_id}", what, null, cb);
  }
  
  post(entity, data, cb) {
    
    return this.fetch(entity, "POST", data, cb);
  }
  
  put(entity, data, cb) {
    
    return this.fetch(entity, "PUT", data, cb);
  }
  
  history(entity, cb) {
    
    return this.fetch(this.interface.cygnus+"/"+path, "GET", null, cb);
  }
  
  fetch(method, pattern, what, body, cb) {
    
    if(! cb) {
      
      return new Promise((resolve, reject) => {
        
        this.fetch(method, pattern, what, body, (err, data) => {
          
          if(err) reject(err);
          else resolve(data);
        });
      });
    }
    
    if(!pattern || !what)
      return cb(new Error("Unknown request."));
    
    var {error, url} = this.url(pattern, what);
    if(error) return cb(error);
    
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
    
    broker.get(this.entity, this.onFetch.bind(this));
  }
  
  clear() {
    
    clearInterval(this.interval);
  }
  
  onFetch(err, data) {
    
    if(err || !this.interval) return;
    this.callbacks.forEach(cb => cb(data));
  }
}

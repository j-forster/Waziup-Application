var broker;

//


class Broker extends Events {
  
  constructor() {
    super();
    
    this.domain = "waziup";
    this.protocol = "https";
  }
  
  fetch(method, url, body) {
    
    var headers = new Headers();
    
    if(body != undefined) {
      
      body = JSON.stringify(body);
      headers.append("Content-Type", "application/json");
    }
    
    if(this.token) {
      
      headers.append("Authorization", "Bearer "+this.token);
    }
    
    return window.fetch(url, { method, headers, body })
    .then((response) => new Promise((resolve, reject) => {

      var contentType = response.headers.get("content-type");
      if(contentType && contentType.includes("application/json")) {
        
        return response.json().then(json => {
          
          if(response.ok) resolve(json);
          else reject(json.description || `Server returned: ${ response.status } ${ response.statusText }`);
        }, reject)
      } else {
        
        if(response.ok) response.text().then(resolve);
        else reject(`Server returned: ${ response.status } ${ response.statusText }`);
      }
    }));
  }
  
  login(username, password) {
    
    return this.fetch("POST", this.protocol + "://dev.waziup.io/api/v1/auth/token", { username, password })
    .then(token => {
      
      this.token = token;
      return token;
    });
  }
  
  get basicURL() {
    
    return this.protocol + "://dev.waziup.io/api/v1/domains/" + this.domain;
  }
  
  createEntity(entity) {
    
    return this.fetch("POST", this.basicURL+"/entities", entity);
  }
  
  getEntity(type, id) {
    
    return this.fetch("GET", this.basicURL+"/entities/"+type+"/"+id);
  }
  
  putEntityAttr(type, id, attr, data) {
    
    return this.fetch("PUT", this.basicURL+"/entities/"+type+"/"+id+"/"+attr, data);
  }
}
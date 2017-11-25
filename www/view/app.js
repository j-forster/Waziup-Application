class Control extends Events {
  
  constructor(args, html) {
    super();
    
    this.type = args.type;
    
    this.resizeable = args.resizeable;
    this.metadata = {};
    
    this.app = args.app;
    
    this.hidden = args.hidden;
    this.uuid = guid();
    
    if(! args.hidden || EDITOR) {
      
      this.$container = $(html).appendTo(args.container || this.app.$container);
      this.x = args.position.x;
      this.y = args.position.y;

      if(args.resizeable && args.position.width && args.position.height) {
        this.width = args.position.width;
        this.height = args.position.height;
      }
    
      this.$container.attr("data-uuid", this.uuid);
    }
    
    if(args.metadata)
      Object.keys(args.metadata).forEach(key => this.setMeta(key, args.metadata[key]));
    this.pipeline = EDITOR ? args.pipeline || "" : new Pipeline.Connector(this, args.pipeline);
  }
  
  destruct() {
    
    this.$container.remove();
  }
  
  setMeta(meta, value) {
    
    if(meta == "css") {
      
      var x = this.x, y = this.y, w = this.width, h = this.height;
      this.$container.attr("style",value);
      this.move(x, y); this.resize(w, h);
      
    } else if(meta == "class") {
      
      if(this.metadata.class)
        this.$container.removeClass(this.metadata.class.split(","));
      this.$container.attr("class", this.$container.attr("class")+" "+value);
      
    } else if(meta == "title") {
      
      this.$container.attr("title", value);
    }
    
    this.metadata[meta] = value;
  }
  
  get x() {
    return this.$container.position().left;
  }

  set x(x) {
    this.$container.css({ left: x });
  }

  get y() {
    return this.$container.position().top;
  }

  set y(y) {
    this.$container.css({ top: y });
  }
  
  position() {
    return {
      left: this.x,
      top: this.y
    }
  }
  
  move(x, y) {
    this.x = x;
    this.y = y;
  }
  
  size() {
    
    return {
      width: this.width,
      height: this.height
    }
  }
  
  resize(w, h) {
    
    if(! this.resizeable)
      return false;
    this.width = w;
    this.height = h;
  }

  get width() {
    return this.$container.width();
  }

  get height() {
    return this.$container.height();
  }

  set height(height) {
    this.$container.css({ height });
  }

  set width(width) {
    this.$container.css({ width });
  }
  
  serialize() {
    var ser = {
      type: this.type,
      pipeline: this.pipeline,
      position: {
        x: this.x,
        y: this.y
      },
      metadata: this.metadata
    };
    
    if(this.resizeable) {
      ser.position.width = this.width;
      ser.position.height = this.height;
    }
    
    return ser;
  }
}



///////////////////////////////////////////////////////////


class AppControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, "<div class='app control'></div>");
    
    this.page = args.page || "";
    
    this.broker = window.broker;
    
    this.ctrls = {};
    this.metadata = {};
    
    this.app = this;
    
    if(! EDITOR) {
    
      this.exists = false;

      var hash_list = location.hash.substr(1).split("&").map(hash => hash.split("=", 2));
      this.hash = {};
      for(var h of  hash_list)
        this.hash[h[0]] = bestEncoding(h[1]);

      var search_list = location.search.substr(1).split("&").map(search => search.split("=", 1));
      this.search = {};
      for(var s of  search_list)
        this.search[s[0]] = bestEncoding(s[1]);

      
      var pipeline = this.pipeline;
      this.pipeline = new Pipeline();
      
      var conn = new Pipeline.Connector(this, "this");
      conn.pipeline = this.pipeline;
      
      conn.listen(data => {
        pipeline.pump(data);
      });
      
      pipeline.listen(data => {
        conn.pump(data);
      });
      
      
      this.on("init", () => {

        this.pipeline.location = window.location;
        this.pipeline.emit("pump", ["location"], this);
        this.pipeline.data.window = window;
        this.pipeline.emit("pump", ["window"], this);
        this.pipeline.data.app = this;
        this.pipeline.emit("pump", ["app"], this);

        this.emit("load");
      });
      
    } else {
      
      this.on("init", () => {

        if(EDITOR) window.parent.editor.onAppLoad();
      });
    }
    
    if(this.page && (!EDITOR||args.isRootApp))
      this.navigate(this.page);
    else
      this.$container.text(this.page ? "Page: "+this.page : "No page specified.");

    //
    
    function bestEncoding(s) {
      
      try {
        s = decodeURIComponent(s);
      } catch(err) {
        return s+"";
      }
      try {
        return JSON.parse(s);
      } catch(err) {}
      return s+"";
    }
  }
  
  setPage(page) {
    
    this.page = page;
    if(EDITOR)
      this.$container.text("Page: "+page);
  }
  
  navigate(page) {
    
    this.page = page;
    
    broker.get("v2/entities/"+page+"?type=Application").then(entity => {
    
      this.exists = true;
      var controls = entity.controls.value.map(val => JSON.parse(decodeURIComponent(val)));
      
      var remaining = controls.length;
      console.groupCollapsed("["+page+"] Controls");
      
      controls.forEach(ctrl => this.create(ctrl.type, ctrl, () => {
        
        if(--remaining == 0) {
          
          console.groupEnd("["+page+"] Controls");
          this.emit("init");
          $("#loading").hide();
        }
      }));
      
      //
      
      var metadata = JSON.parse(decodeURIComponent(entity.metadata.value));
      this.metadata = metadata;
      Object.keys(metadata).forEach(key => this.setMeta(key, metadata[key]));
      
    }, err => {

      if(EDITOR) {
        
        alert("There was no application found.\nA new one will be created once you click 'Save App'.");
        $("#loading").hide();
        
        this.setMeta("width", 600);
        this.setMeta("height", 800);
        this.setMeta("title", "My new App");
        
        this.create("text", {
          type: "text",
          text: "# My new App\nAdd your content here..",
          html: '<h1 id="mynewapp">My new App</h1><p>Add your content here..</p>',
          position: {
            x: 48, y: 32,
            width: 288, height: 128
          }
        })
        
        this.emit("init");
      }
      else {
        
        $("#loading").text("Nothing in here..").show();
      }
    });
  }
  
  setMeta(meta, value) {

    this.metadata[meta] = value;
    
     if(meta == "stylesheet") {
          
        $("<link>", {
          rel: "stylesheet",
          href: value
        }).appendTo("head");

      } else if(meta == "title") {

        document.title = value;

      } else if(meta == "width") {

        this.$container.width(value);

      } else if(meta == "height") {

        this.$container.height(value);

      } else if(meta == "css") {

        $("body").attr("style", value);
      } else if(meta == "class") {

        $("body").attr("class", value+(EDITOR?"EDITOR":""));
      }
  }
  
  template(str, data, decode = function bestDecoding(d) {
      
      if(typeof d == "string")
        return d;
      try {
        return JSON.stringify(d, null, 2);
      } catch(err) {}
      return d+"";
    }) {
    
    if(str.match(/\{\{\s*([\w\d\.]+)\s*\}\}/)) {
          
      return str.replace(/\{\{\s*([\w\d\.]+)\s*\}\}/g, (match, text) => {

        return decode(!text.trim() ? data : (new Pipeline.Connector(this, text)).data);
      });
    }
    
    return str;
  }
  
  
  create(name, args, cb) {
    
    viewLoader.get(name, (err, Ctrl) => {
      
      if(err) {
        if(cb) cb(err);
        else throw err;
        return;
      }
      
      args.app = this;
      var ctrl = new Ctrl(args);
      this.ctrls[ctrl.uuid] = ctrl;
      
      console.log(ctrl);
      this.emit("control", ctrl);
      
      if(cb) cb(null, ctrl);
    });
  }


  serialize() {
    var ser = super.serialize();
    ser.name = this.name;
    ser.page = this.page;
    return ser;
  }
  
}



viewLoader.define("app", AppControl);

/*
var app = new class App extends Events {
  
  constructor() {
    super();
    
    this.broker = new Broker(Waziup, "");
    this.id = "";
    // this.pipelines = {};
    this.exists = false;
    this.ctrls = {};
    
    this.metadata = {};
    
    var hash_list = location.hash.substr(1).split("&").map(hash => hash.split("=", 2));
    this.hash = {};
    for(var h of  hash_list)
      this.hash[h[0]] = bestEncoding(h[1]);
    
    var search_list = location.search.substr(1).split("&").map(search => search.split("=", 1));
    this.search = {};
    for(var s of  search_list)
      this.search[s[0]] = bestEncoding(s[1]);
    
    this.on("init", () => {
      
      if(EDITOR) window.parent.editor.onAppLoad();
      
      pipeline.data.location = window.location;
      pipeline.emit("pump", ["location"], this);
      pipeline.data.window = window;
      pipeline.emit("pump", ["window"], this);
      pipeline.data.app = this;
      pipeline.emit("pump", ["app"], this);
      
      this.emit("load");
    });
    
    function bestEncoding(s) {
      
      try {
        s = decodeURIComponent(s);
        return JSON.parse(s);
      } catch(err) {}
      return s+"";
    }
  }
  
  template(str, decode = function bestDecoding(d) {
      
      if(typeof d == "string")
        return d;
      try {
        return JSON.stringify(d);
      } catch(err) {}
      return d+"";
    }) {
    
    if(str.match(/\{\{(.+)\}\}/)) {
          
      return str.replace(/\{\{(.+)\}\}/g, (match, text) => {

        var data = (new Pipeline.Connector(this, text)).data;
        return decode(data);
      });
    }
    
    return str;
  }
  
  navigate(id) {
    
    this.id = id;
    this.broker.get("v2/entities/"+id+"?type=Application").then(entity => {
    
      this.exists = true;
      var controls = entity.controls.value.map(val => JSON.parse(decodeURIComponent(val)));
      
      var remaining = controls.length;
      console.groupCollapsed("Controls");
      
      controls.forEach(ctrl => this.create(ctrl.type, ctrl, () => {
        
        if(--remaining == 0) {
          
          console.groupEnd("Controls");
          this.emit("init");
          $("#loading").hide();
        }
      }));
      
      //
      
      var metadata = JSON.parse(decodeURIComponent(entity.metadata.value));
      this.metadata = metadata;
      Object.keys(metadata).forEach(key => this.setMeta(key, metadata[key]));
      
    }, err => {

      if(EDITOR) {
        
        alert("There was no application found.\nA new one will be created once you click 'Save App'.");
        $("#loading").hide();
        
        this.setMeta("width", 600);
        this.setMeta("height", 800);
        this.setMeta("title", "My new App");
        
        this.create("text", {
          type: "text",
          text: "# My new App\nAdd your content here..",
          html: '<h1 id="mynewapp">My new App</h1><p>Add your content here..</p>',
          position: {
            x: 48, y: 32,
            width: 288, height: 128
          }
        })
        
        this.emit("init");
      }
      else {
        
        $("#loading").text("Nothing in here..").show();
      }
    });
  }
  
  setMeta(meta, value) {
    
    this.metadata[meta] = value;
    
     if(meta == "stylesheet") {
          
        $("<link>", {
          rel: "stylesheet",
          href: value
        }).appendTo("head");

      } else if(meta == "title") {

        document.title = value;

      } else if(meta == "width") {

        $("#content").width(value);

      } else if(meta == "height") {

        $("#content").height(value);

      } else if(meta == "css") {

        $("body").attr("style", value);
      } else if(meta == "class") {

        $("body").attr("class", value+(EDITOR?"EDITOR":""));
      }
  }
  
  create(name, args, cb) {
    
    viewLoader.get(name, (err, Ctrl) => {
      
      if(err) {
        if(cb) cb(err);
        else throw err;
        return;
      }
      
      var ctrl = new Ctrl(args);
      this.ctrls[ctrl.uuid] = ctrl;
      
      console.log(ctrl);
      this.emit("control", ctrl);
      
      if(cb) cb(null, ctrl);
    });
  }
  
  setMeta(meta, value) {
    
    this.metadata[meta] = value;
    
     if(meta == "stylesheet") {
          
        $("<link>", {
          rel: "stylesheet",
          href: value
        }).appendTo("head");

      } else if(meta == "title") {

        document.title = value;

      } else if(meta == "width") {

        $("#content").width(value);

      } else if(meta == "height") {

        $("#content").height(value);

      } else if(meta == "css") {

        $("body").attr("style", value);
      } else if(meta == "class") {

        $("body").attr("class", value+(EDITOR?"EDITOR":""));
      }
  }
}*/
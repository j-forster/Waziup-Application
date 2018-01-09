// var $content = $("#content");

const EDITOR = location.hash == "#editor";


/*var app = new class App extends Events {
  
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
      Object.keys(metadata).forEach(meta => {
        
        if(meta == "stylesheet") {
          
          $("<link>", {
            rel: "stylesheet",
            href: metadata.stylesheet
          }).appendTo("head");
          
        } else if(meta == "title") {
          
          document.title = metadata.title;
          
        } else if(meta == "width") {
          
          $("#content").width(metadata.width);
          
        } else if(meta == "height") {
          
          $("#content").height(metadata.height);
          
        } else if(meta == "css") {
          
          $("body").attr("style", metadata.css);
        } else if(meta == "class") {
          
          $("body").attr("class", metadata.class+(EDITOR?"EDITOR":""));
        }
      });
      
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

var broker = new Broker();

broker.login("cdupont", "password").then(() => {
  
  console.log("login OK");
}, err => {
  
  console.error("login FAILED", err);
});

if(EDITOR) {
  
  $.getScript("js/editor-embedded.js");
  $(document.body).addClass("EDITOR");
}

var app = new AppControl({
  page: location.search.substr(1) || "index",
  app: {
    $container: $(document.body),
    pipeline: new Pipeline()
  },
  position: {
    x: "",
    y: ""
  },
  isRootApp: true
});

app.$container.attr("id", "app");

// app.navigate(location.search.substr(1) || "index");

function guid() {
  var s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

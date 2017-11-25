viewLoader.define("map", class MapControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, "<div class='control map'></div>");
  
    if("value" in args) this.value = args.value;
  
    this.vectorSource = new ol.source.Vector({});
    
    if(! EDITOR) {
      
      this.serializeForm = "array";
      this.pipeline.listen(data => {

        this.value = data;
      });
      
      this.point = new ol.Feature({});
     // this.vectorSource.addFeature(this.point);
      // this.vectorSource.addFeature(this.point);
      
      //this.$container.on("change", () => this.pipeline.pump(this.value));
    }
    
    this.layers = [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Vector({
        source: this.vectorSource
      })
    ];
    
    this.map = new ol.Map({
      layers: this.layers,
      target: this.$container[0],
      controls: new ol.Collection(),
      view: new ol.View({
        center: [0, 0],
        zoom: EDITOR?2:17
      })
    });
    
    if(! EDITOR) {
      
      this.map.on("click", (event) => {

        var coords = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
        coords = [coords[1], coords[0]]; // lat/lon > lon/lat
        if(this.serializeForm == "latlong")
          coords = {latitude: coords[1], longitude: coords[0]};
        this.pipeline.pump(coords);
      });
    }
  }
  
  resize(w, h) {
    super.resize(w, h);
    
    this.map.updateSize();
  }

  set value(value) {
    //this.$container.val(value);
  
    var coords;
    
    if(Array.isArray(value) && value.length == 2) {
      
      this.serializeForm = "array";
      coords = ol.proj.transform([value[1], value[0]], 'EPSG:4326', 'EPSG:3857');
    } else if(value instanceof Object && "latitude" in value && "longitude" in value) {
      
      this.serializeForm = "latlong";
      coords = ol.proj.transform([value.latitude, value.longitude], 'EPSG:4326', 'EPSG:3857');
    }
    
    if(coords) {
      
      try {
        
        if(! this.vectorSource.getFeatures().length)
          this.vectorSource.addFeature(this.point);

        this.point.setGeometry(new ol.geom.Point(coords));
        this.map.getView().setCenter(coords);
      } catch(err) {};
    } else {
      
      if(this.vectorSource.getFeatures().length)
        this.vectorSource.removeFeature(this.point);
    }
  }

  get value() {
    return this.currentValue;
  }

  serialize() {
    var ser = super.serialize();
    return ser;
  }
  
});
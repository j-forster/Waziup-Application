/*
var simplemde = new SimpleMDE({
  // element: $("#mde")[0],
  spellChecker: false,
  autoDownloadFontAwesome: false,
  autosave: { enabled: false }
});

var renderMarkdownTimeout = 0;

simplemde.codemirror.on("change", function() {
  
  clearTimeout(renderMarkdownTimeout)
  renderMarkdownTimeout = setTimeout(renderMarkdown, 800);
});

function renderMarkdown() {
  
  console.log(simplemde.options.previewRender(simplemde.value(), simplemde.codemirror.getWrapperElement().lastChild));
}
*/


///////////////////////////////////////////////////////////


var $toolbar = $("#toolbar"),
    $iframe = $("iframe");

var editor = new class Editor {
  
  constructor() {
    
    $iframe[0].src = "index.html" + location.search + "#editor";
   
    $toolbar.on("click", (event) => {
      
      var action = event.target.getAttribute("data-action");
        if(action) this[action](event);
    });
  }
  
  onAppLoad() {
    
    $("[data-app-meta='css']").val(this.app.metadata.css||"");
    $("[data-app-meta='title']").val(this.app.metadata.title||"");
    $("[data-app-meta='width']").val(this.app.metadata.width||"");
    $("[data-app-meta='height']").val(this.app.metadata.height||"");
    $("[data-app-meta='stylesheet']").val(this.app.metadata.stylesheet||"");
    $("[data-app-meta='class']").val(this.app.metadata.class||"");
  }
  
  get iframe() {
    
    return $iframe[0].contentWindow;
  }
  
  
  get app() {
    return this.iframe.app; 
  }
  
  get embeddedEditor() {
    return this.iframe.editor;
  }
  
  get selectedCtrl() {
    return this.embeddedEditor.selectedCtrl;
  }
  

  create(event) {
    
    var control = event.target.getAttribute("data-control");
    this.iframe.editor.beginCreate(control, event.pageX, event.pageY);
  }
  
  onSelect(ctrl) {
    
    $("[data-ctrl-type~='"+ctrl.type+"']").show();
    $("#control-tb").show();
    $("#tb-app").hide();
    
    $("#pipeline").val(ctrl.pipeline);
    
    if(ctrl.type=="pipeline-pull" || ctrl.type=="pipeline-push") {
      $("#entity_id").val(ctrl.getEntity().id);
      $("#entity_type").val(ctrl.getEntity().type);
      $("#entity_attr").val(ctrl.getEntity().attr);
    }
    
    if(ctrl.type=="pipeline-fetch") {
      $("#fetch_method").val(ctrl.fetch.method);
      $("#fetch_url").val(ctrl.fetch.url);
      $("#fetch_body").val(ctrl.fetch.body);
    }
    
    if(ctrl.type=="script-navigate") {
      $("#navigate_url").val(ctrl.url);
    }
    
    if(ctrl.type=="table" || ctrl.type=="list") {
      $("#table_active_elm").val(ctrl.active_elm_pipeline);
    }
    
    if(ctrl.type=="app") {
      $("#app_page").val(ctrl.page);
    }
    
    if(ctrl.type=="script-initial") {
      $("#script_initial").val(ctrl.object);
    }
    
    if(ctrl.type=="script-bridge") {
      $("#script_bridge_ppl").val(ctrl.bridge.ppl);
      $("#script_bridge_dir").val(ctrl.bridge.dir);
    }
    
    if(ctrl.type=="list") {
      
      var rows = ctrl.rows;
      var $tbody = $("[data-ctrl-type='list'] tbody");
      $tbody.empty();
      
      for(var row of rows) {
        
        $("<tr>").append(
          $("<td>").append($("<input type='text'>").val(row.attr)),
          $("<td>").append($("<input type='text'>").val(row.head)),
          $("<td>").append($("<input type='text'>").val(row.ctrl)),
          $("<td>").append($("<button><i class='material-icons'>remove</i></button>"))
        ).appendTo($tbody);
      }
    }
    
    $("[data-control-meta='class']").val(ctrl.metadata.class||"");
    $("[data-control-meta='title']").val(ctrl.metadata.title||"");
    $("[data-control-meta='css']").val(ctrl.metadata.css||"");
  }
  
  onUnselect(ctrl) {
    
    if(["text", "button"].includes(ctrl.type) && $("#mde").is(":visible")) {
      this.doneMarkdown();
    }
    
    $("[data-ctrl-type]").hide();
    $("#control-tb").hide();
    $("#tb-app").show();
  }
  
  /////////////////////////////////////////////////////////
    
  onAppMetaChange(event) {
    
    var meta = $(event.target).attr("data-app-meta"),
        value = $(event.target).val();

    this.embeddedEditor.setMeta(meta, value);
  } 
  
  onControlMetaChange(event) {
    
    var meta = $(event.target).attr("data-control-meta"),
        value = $(event.target).val();
    
    this.selectedCtrl.setMeta(meta, value);
  }
    
  /////////////////////////////////////////////////////////
  
  moveControl() {
    
    this.iframe.editor.moveControl(event.pageX, event.pageY);
  } 
  
  removeControl() {
    
    this.iframe.editor.removeControl();
  }
  
  onFetchChange() {
    
    var method = $("#fetch_method").val(),
        url = $("#fetch_url").val(),
        body = $("#fetch_body").val();
    this.selectedCtrl.setFetch(method, url, body);
  }
  
  onNavigateURLChange() {
    
    var url = $("#navigate_url").val();
    this.selectedCtrl.setNavigateURL(url);
  }
  
  onTableActiveElmChange() {
    
    var pipeline = $("#table_active_elm").val();
    this.selectedCtrl.setActiveElmPipeline(pipeline);
  }
  
  onScriptInitialChange() {
    
    var obj = $("#script_initial").val();
    
    try {
      eval(obj);
      this.selectedCtrl.setObject(obj);
      $("#script_initial").css("color", "");
    } catch(err) {
      
      $("#script_initial").css("color", "red");
    }
  }
  
  onAppPageChange() {
    
    var page = $("#app_page").val();
    this.selectedCtrl.setPage(page);
  }
    
  onListRowsChange(event) {
    
    var rows = $("[data-ctrl-type='list'] tbody tr").toArray().map(
      tr => ({
        attr: $(tr).find("input")[0].value,
        head: $(tr).find("input")[1].value,
        ctrl: $(tr).find("input")[2].value,
      })
    );
    
    this.selectedCtrl.setRows(rows);
  }
    
  onListRowRemove(event) {
    
    $(event.target).closest("tr").remove();
    this.onListRowsChange();
  }
  
  onListRowAdd() {
    
    $("<tr>").append(
      $("<td>").append($("<input type='text'>")),
      $("<td>").append($("<input type='text'>")),
      $("<td>").append($("<input type='text'>")),
      $("<td>").append($("<button><i class='material-icons'>remove</i></button>"))
    ).appendTo("[data-ctrl-type='list'] tbody");
  }
  
  onScriptBridgeChange() {
    
    var dir = $("#script_bridge_dir").val(),
        ppl = $("#script_bridge_ppl").val();
    this.selectedCtrl.setBridge(dir, ppl);
  }
  
  /////////////////////////////////////////////////////////
  
  onEntityChange() {
    
    var id = $("#entity_id").val(),
      type = $("#entity_type").val(),
      attr = $("#entity_attr").val();
    
    this.selectedCtrl.setEntity(id, type, attr);
  }
  
  onPipelineChange() {
    
    this.selectedCtrl.pipeline = $("#pipeline").val();
  }
  
  /////////////////////////////////////////////////////////
  
  editMarkdown() {
    
    $("#mde, #tb-mde").show();
    $("#tb-general").hide();
    $("#mde").focus().val(this.selectedCtrl.text);
    
    this.html = this.selectedCtrl.html;
    this.renderMarkdownTimeout = 0;
  }
  
  endMarkdown() {
    
    clearTimeout(this.renderMarkdownTimeout);
    $("#mde, #tb-mde").hide();
    $("#tb-general").show();
    this.html = null;
  }
  
  doneMarkdown() {
    
    this.renderMarkdown();
    var text = $("#mde").val();
    this.selectedCtrl.text = text;
    this.endMarkdown();
  }
  
  cancelMardown() {
    
    this.endMarkdown();
    this.selectedCtrl.html = this.html;
  }
  
  helpMarkdown() {
    
  }
  
  renderMarkdown() {
    
    var converter = new showdown.Converter({emoji: true});
    var text = $("#mde").val();
    var html = converter.makeHtml(text);
    
    //this.selectedCtrl.setText(text);
    this.selectedCtrl.html = html;
  }
  
  /////////////////////////////////////////////////////////
  
  showApp() {
    
    window.open("index.html?"+this.app.page, "_blank");
  }
  
  saveApp() {
    
    var entity = this.embeddedEditor.serialize();
    
    if(this.app.exists) {
      
      this.app.broker.put("v2/entities/"+this.app.page+"/attrs/controls?type=Application", entity.controls).then(() => {
      
        console.log("ok controls");
      }, error => {

        console.log(error);
      });
      
      this.app.broker.put("v2/entities/"+this.app.page+"/attrs/metadata?type=Application", entity.metadata).then(() => {
      
        console.log("ok metadata");
      }, error => {

        console.log(error);
      });
      
    } else {
      
      this.iframe.app.broker.post("v2/entities", entity).then(() => {
      
        console.log("ok");
        this.app.exists = true;
      }, error => {

        console.log(error);
      })
    }
  }
}


$("#mde").on("keyup", () => {
  
  clearTimeout(editor.renderMarkdownTimeout)
  editor.renderMarkdownTimeout = setTimeout(editor.renderMarkdown.bind(editor), 800);
});

$("#pipeline").on("change", editor.onPipelineChange.bind(editor));
$("[data-app-meta]").on("change", editor.onAppMetaChange.bind(editor));
$("[data-control-meta]").on("change", editor.onControlMetaChange.bind(editor));
$("#navigate_url").on("change", editor.onNavigateURLChange.bind(editor));
$("#table_active_elm").on("change", editor.onTableActiveElmChange.bind(editor));
$("#app_page").on("change", editor.onAppPageChange.bind(editor));
$("#script_initial").on("keyup", editor.onScriptInitialChange.bind(editor));
$("[data-ctrl-type='list'] tbody").on("change", "input", editor.onListRowsChange.bind(editor))
$("[data-ctrl-type='list'] tbody").on("click", "button", editor.onListRowRemove.bind(editor))
$("[data-ctrl-type='list'] thead button").on("click", editor.onListRowAdd.bind(editor))
$("#script_bridge_ppl, #script_bridge_dir").on("change", editor.onScriptBridgeChange.bind(editor))


$("[data-sub-tb]").on("mouseenter", (event) => {
  
  var subTb = $(event.target).attr("data-sub-tb");
  console.log($("[data-tb='"+subTb+"']"));
  $("[data-tb='"+subTb+"']").show();
}).on("mouseleave", (event) => {
  
  var subTb = $(event.target).attr("data-sub-tb");
  $("[data-tb='"+subTb+"']").hide();
});

$("#entity_id, #entity_type, #entity_attr").on("change", editor.onEntityChange.bind(editor));
$("#fetch_method, #fetch_url, #fetch_body").on("change", editor.onFetchChange.bind(editor));

$(window).keyup(function(event) {
  if (event.keyCode == 27 /* ESCAPE */) {
    editor.iframe.editor.onEscape();
  }
});

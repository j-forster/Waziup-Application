const PPL_Observation_Template = `

<table class='ppl_observ control'>
  <thead>
    <tr><th>Event</th><th>Scope</th><th>Sender</th></tr>
  </thead>
  <tbody>
  </tbody>

</table>

`;


viewLoader.define("pipeline-observation", class PipelineObservationControl extends Control {

  constructor(args) {
  
    args.resizeable = true;
    args.hidden = false;
    super(args, PPL_Observation_Template);
  
    
    if(!EDITOR) {
      
      this.pipeline.on("*", (data, event, sender) => {
        
        this.$container.find("tbody").append(
          $("<tr>").append([
            $("<td>").text(event),
            $("<td>").text(sender.scope.join(".")),
            $("<td>").text(sender.control.constructor.name)
          ])
        );
      });
    }
  }


  serialize() {
    var ser = super.serialize();
    // ser.entity = this.entity;
    return ser;
  }
  
});
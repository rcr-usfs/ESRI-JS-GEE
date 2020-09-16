// year range
  
  var startYear = 1985;
  var endYear = 2019;
  var lossThresh = 0.35;
  var gainThresh = 0.4;
  var applyTreeMask = true;
  var sortByMethod = 'year';//Choose year or prob

  function handleYearRangeChange(newMinValue, newMaxValue) {
    yearMinValue = newMinValue;
    yearMaxValue = newMaxValue;

    // debounce the year range update
    console.log(yearMinValue);console.log(yearMaxValue);
  }
function update(event){
  console.log(event)
}
var templates = {

  'legendDiv':`<div id='legend-div' class='my-legend' style='display:none;background: #222;width: 200px;border-radius: 3px;'>
                    <div class='legend-title'>Class Key</div>
                    <div class='legend-scale'>
                        <ul class='legend-labels' id = 'the-legend-labels'></ul>
                    </div>
                    <div class='legend-source'><a href="#link to source"></a></div>

                </div>`,
 
  'paramsDiv':`<div id = 'params-div' class = 'params' style='display:none;'>
                <h3 class = 'param-element'>Parameters</h3>

                 <label class = 'param-element'>
                    Year range
                    <calcite-slider
                      id = 'year-range-slider'
                      min="${startYear}"
                      max="${endYear}"
                      min-value="${startYear}"
                      max-value="${endYear}"
                      step="1"
                      label-handles="true"
                      precise="true"
                      title = 'Choose range of years to include for loss and gain'
                    ></calcite-slider>
                  </label>

                  <label class = 'param-element'>
                    Loss Threshold
                    <calcite-slider
                      id = 'loss-thresh-slider'
                      min="0.05"
                      max="0.95"
                      value="${lossThresh}"
                      title = 'Choose model confidence threshold for loss'
                      step="0.050"
                      label-handles="true"
                      precise="true"
                    ></calcite-slider>
                  </label>

                  <label class = 'param-element'>
                    Gain Threshold
                    <calcite-slider
                      id = 'gain-thresh-slider'
                      min="0.05"
                      max="0.95"
                      value="${gainThresh}"
                      title = 'Choose model confidence threshold for gain'
                      step="0.050"
                      label-handles="true"
                      precise="true"
                    ></calcite-slider>
                  </label>

                  <label class = 'param-element'>
                      Constrain analysis to areas with trees
                      <calcite-radio-group 
                      id = 'applyTreeMask-radio' 
                      title = 'Choose whether to constrain gain and loss to areas with trees at 3 year window during specific time period'
                      scale="s"
                        
                      >
                        <calcite-radio-group-item
                          value=true
                          checked="true"
                        >
                          Yes
                        </calcite-radio-group-item>
                        <calcite-radio-group-item
                          value=false
                          checked="false"
                        >
                          No
                        </calcite-radio-group-item>
                      </calcite-radio-group>
                    </label>

                    <label class = 'param-element'>
                      Summary method
                      <calcite-radio-group
                        id = 'summary-method-radio'
                        scale="s"
                        
                      >
                        <calcite-radio-group-item
                          value="year"
                          checked="true"
                          title = 'Choose this option to show the most recent year of loss and gain'
                        >
                          Most Recent
                        </calcite-radio-group-item>
                        <calcite-radio-group-item
                          value="prob"
                          checked="false"
                          title = 'Choose this option to show the loss and gain year corresponding to the highest model confidence'
                        >
                          Highest Probability
                        </calcite-radio-group-item>
                      </calcite-radio-group>
                    </label>

              </label>
              

                        </div>`}
$('head').append(templates.legendDiv);
$('head').append(templates.paramsDiv);


$('#year-range-slider').bind( "mouseup", function(e) {
  startYear = e.target.minValue;
  endYear =  e.target.maxValue;
  reRun();
});

$('#loss-thresh-slider').bind('mouseup',function(e){
  lossThresh = e.target.value;
  reRun();
})

$('#gain-thresh-slider').bind('mouseup',function(e){
  gainThresh = e.target.value;
  reRun();
})

$('#applyTreeMask-radio').bind('click',function(e){
  applyTreeMask = e.target.value;
  reRun();
})

$('#summary-method-radio').bind('click',function(e){
  sortByMethod = e.target.value;
  reRun();
})
$('#rerun-button').bind('click',function(e){
  reRun()
})
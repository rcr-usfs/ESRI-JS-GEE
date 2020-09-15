 var addLayer;var map;var view;
    var mapper = new Object();
    var layerNumber = 1;
    var layerList = [];
    require([
      "esri/widgets/Attribution",
      "esri/config",
      "esri/layers/GeoJSONLayer",
      "esri/layers/WebTileLayer",
      "esri/Map",
      "esri/Basemap",
      "esri/views/SceneView",
      "esri/views/MapView",
      "esri/widgets/Expand",
      "esri/widgets/LayerList",
      "esri/widgets/Legend",
      "esri/widgets/CoordinateConversion",
      "esri/layers/ElevationLayer",
      "esri/layers/BaseElevationLayer",
      "esri/widgets/BasemapGallery",
      "esri/widgets/ScaleBar",
      "dojo/domReady!"
    ], function(Attribution,esriConfig, GeoJSONLayer, WebTileLayer, Map,
      Basemap, SceneView,MapView,Expand,LayerList,Legend,CoordinateConversion,ElevationLayer,BaseElevationLayer,BasemapGallery,ScaleBar
    ) {

      // Push Regular Expression to allow all *.stamen.com servers. Alternatively,
      // it can be added as a list of servers, e.g. push("stamen-tiles-a.a.ssl.fastly.net",
      // "stamen-tiles-b.a.ssl.fastly.net", "stamen-tiles-c.a.ssl.fastly.net", "stamen-tiles-d.a.ssl.fastly.net")
      esriConfig.request.corsEnabledServers.push(
        "https://earthengine.googleapis.com/map");

        
        
        
      var ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({

          properties: {
            // exaggerates the actual elevations by x
            exaggeration: 2
          },

          load: function() {
            this._elevation = new ElevationLayer({
              url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
            });

            // wait for the elevation layer to load before resolving load()
            this.addResolvingPromise(this._elevation.load());
          },

          // Fetches the tile(s) visible in the view
          fetchTile: function(level, row, col) {
            return this._elevation.fetchTile(level, row, col)
              .then(function(data) {

                var exaggeration = this.exaggeration;
                for(var i = 0; i < data.values.length; i++) {
                  data.values[i] = data.values[i] * exaggeration;
                }

                return data;
              }.bind(this));
          }
        });

      map = new Map({
        basemap: 'hybrid',
        ground: {
        layers: [ new ExaggeratedElevationLayer() ]
                }
        });


      // Listen for any layer being added or removed in the Map
      // map.allLayers.on("change", function(event) {
      //  console.log("Layer added: ", event.added);
      //  console.log("Layer removed: ", event.removed);
      //  console.log("Layer moved: ", event.moved);
      // });
      // var mapCenter = [-113.67,47.92]//FNF

      var initCamera;
      if(localStorage.coverMapperCamera === undefined || localStorage.coverMapperCamera === null){
        var mapCenter = [-100,30]
        initCamera = {
        heading: 0,
        tilt:10,
        position: {
          latitude: mapCenter[1],
          longitude: mapCenter[0],
          z: 7000000
        }
      };
      }
      else{
        initCamera = JSON.parse(localStorage.coverMapperCamera);
      }
      

      view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: initCamera
      });
      // var view = new MapView({
      //   container: "viewDiv",
      //   map: map,
      //   center: mapCenter,
      //   zoom:9
      // });
      view.watch("camera", function(newValue) {localStorage.coverMapperCamera = JSON.stringify(newValue)});

      //   var ccWidget = new CoordinateConversion({
      //     view: view
      //   });

      // view.ui.add(ccWidget, "bottom-right");
      view.ui.add('attribution','test');
      var scalebar = new ScaleBar({
      view: view
      });
      view.ui.add(scalebar, "bottom-right");


      var basemapGallery = new BasemapGallery({
        view: view,
        
      });

       var bmExpand = new Expand({
        view: view,
        content: basemapGallery,
        id: 'Basemaps',
        autoCollapse: true
      });

      // Add the expand instance to the ui

      view.ui.add(bmExpand, "top-right");

      // Instructions expand widget
                const legend = document.getElementById("the-legend");
                $('#the-legend').show();
                legendExpand = new Expand({
                    expandIconClass: "esri-icon-key",
                    expandTooltip: "Legend",
                    expanded: true,
                    view: view,
                    content: legend
                });
       view.ui.add(legendExpand, "bottom-left");
    


      ee.initialize("https://rcr-ee-proxy.herokuapp.com/api","https://earthengine.googleapis.com/map",function(){



      console.log('initialized')
      $('#spinner').hide();
      runGEE();



      })

      addGeoJSON = function(geoJSON, name,popupTemplate,renderer){
        const geojsonLayer = new GeoJSONLayer({
          url: geoJSON,
          title:name,
          opacity:0.4,
          popupTemplate: popupTemplate,
          copyright:'Google Earth Engine',
          renderer: renderer //optional
        });
          map.layers.add(geojsonLayer);

      }
      
      addLayer = function(eeImage,vizParams,name,visible){
          if(vizParams.addRampToLegend === undefined || vizParams.addRampToLegend === null){vizParams.addRampToLegend = false};
          if(visible === undefined || visible === null){visible = true};
          if(name === undefined || name === null){name = 'Layer '+ layerNumber.toString()};
          if(!vizParams.opacity){vizParams.opacity = 1};
          if(vizParams.addRampToLegend){
            if(vizParams.labelEnding === undefined || vizParams.labelEnding === null){vizParams.labelEnding = ''}
            var palette = vizParams.palette;
            var ramp = palette.split(',').map(function(i){return '#'+i}).join(',');
            console.log(ramp)
            $('#the-legend-labels').append(`<br>
            <li><span style = 'width:100%;'>${name}</span></li>
            <li><span style='background:linear-gradient(to right,${ramp});width:100%;'></span></li>
            <li style = 'float:left'>${vizParams.min}${vizParams.labelEnding}</li>
            <li style = 'float:right'>${vizParams.max}${vizParams.labelEnding}</li>`)
          }
         
          var actualOpacity = vizParams.opacity;
          vizParams.opacity = 1;
          var m = eeImage.getMap(vizParams);
          var url = "https://earthengine.googleapis.com/map/"+m.mapid+"/{level}/{col}/{row}?token="+m.token;
          console.log(name);console.log(url);
          var urlThumb = "https://earthengine.googleapis.com/map/"+m.mapid+"/10/177/409?token="+m.token + ".png"
          var eeBaseLayer = new WebTileLayer({
                          urlTemplate: url,
                          id: name,
                          title:name,
                          visible: visible,
                          opacity: actualOpacity ,
                          copyright:'Google Earth Engine|USDA Forest Service' 
                          });
          // Create a Basemap with the WebTileLayer. The thumbnailUrl will be used for
          // the image in the BasemapToggle widget.
          // var eeMap = new Basemap({
          // baseLayers: [eeBaseLayer],
          // title: name,
          // id: name,
          // thumbnailUrl: urlThumb
          // });
          
          map.layers.add(eeBaseLayer)
          layerList.push(eeBaseLayer)
          layerNumber ++
        }

        mapper.addLayer = addLayer;

      ////////////////////////////////////////////////////////////
      function runGEE(){
        function thresholdChange(changeCollection,changeThreshLower,changeDir){
            if(changeDir === undefined || changeDir === null){changeDir = 1}
            var change = changeCollection.map(function(img){
              var yr = ee.Date(img.get('system:time_start')).get('year');
              var changeYr = img.multiply(changeDir).gte(changeThreshLower);
              var yrImage = img.where(img.mask(),yr);
              changeYr = yrImage.updateMask(changeYr).int16();
              return img.updateMask(changeYr.mask()).addBands(changeYr);
            });
            return change;
          }
      var startYear = 1985;
      var endYear = 2019;
      var lossThresh = 30;
      var gainThresh = 30;

      var sortByMethod = 'year';//Choose year or prob

      lossYearPalette =  'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
      lossMagPalette = 'D00,F5DEB3';
      gainYearPalette =  'AFDEA8,80C476,308023,145B09';
      gainMagPalette = 'F5DEB3,006400';
      changeDurationPalette = 'BD1600,E2F400,0C2780';

      var treeMasks = ee.Image('projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/Landcover_Probability_epwt_treemask_stack');
      var treeBandNames = ee.List.sequence(startYear+1,endYear-1).map(function(yr){
        return ee.String('Tree_').cat(ee.Number(yr).int16().format());
      });
      treeMask = treeMasks.select(treeBandNames).reduce(ee.Reducer.max()).selfMask();

      // addLayer(treeMask,{min:1,max:1,palette:'0F0'},'Tree Mask');


      var lcms = ee.ImageCollection('projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_epwt_annualized').select(['DND','RNR'],['Loss','Gain']);

      var loss = thresholdChange(lcms.select(['Loss']),lossThresh,1).select([0,1],['prob','year']).qualityMosaic(sortByMethod);
      var gain = thresholdChange(lcms.select(['Gain']),gainThresh,1).select([0,1],['prob','year']).qualityMosaic(sortByMethod);
      
      addLayer(loss.select(['year']),{min:startYear,max:endYear,palette:lossYearPalette,addRampToLegend:true},'Loss Year')
      addLayer(gain.select(['year']),{min:startYear,max:endYear,palette:gainYearPalette,addRampToLegend:true},'Gain Year')

      
     view.when(function() {



        // Add widget to the top right corner of the view
        // view.ui.add(layerList, "top-right");
        var layerList = new LayerList({
                        view: view,
                        listItemCreatedFunction: function (event) {

                            // The event object contains an item property.
                            // is is a ListItem referencing the associated layer
                            // and other properties. You can control the visibility of the
                            // item, its title, and actions using this object.

                            var item = event.item;



                            // An array of objects defining actions to place in the LayerList.
                            // By making this array two-dimensional, you can separate similar
                            // actions into separate groups with a breaking line.

                            item.actionsSections = [

                                [{
                                    title: "Increase opacity ",
                                    className: "esri-icon-up",
                                    id: "increase-opacity"
                                }, {
                                    title: "Decrease opacity",
                                    className: "esri-icon-down",
                                    id: "decrease-opacity"
                                }]
                            ];


                        }
                    });

                    // Event listener that fires each time an action is triggered

                    layerList.on("trigger-action", function (event) {
                        console.log(event)
                        // The layer visible in the view at the time of the trigger.
                        var visibleLayer = event.item.layer;

                        //.visible ?
                        //USALayer : censusLayer;

                        // Capture the action id.
                        var id = event.action.id;

                        if (id === "increase-opacity") {

                            // if the increase-opacity action is triggered, then
                            // increase the opacity of the GroupLayer by 0.25

                            if (visibleLayer.opacity < 1) {
                                visibleLayer.opacity += 0.25;

                            }
                        } else if (id === "decrease-opacity") {

                            // if the decrease-opacity action is triggered, then
                            // decrease the opacity of the GroupLayer by 0.25

                            if (visibleLayer.opacity > 0) {
                                visibleLayer.opacity -= 0.25;
                            }
                        }
                    });
        var bgExpand = new Expand({
        view: view,
        content: layerList,
        expanded: true,
        id: 'EE Maps'
      });
    
      // Add the expand instance to the ui

      view.ui.add(bgExpand, "top-right");

  

      });
     
     

}

    });
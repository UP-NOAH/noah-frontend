'use strict';

var module = angular.module('ol3_service', [

]);

module.factory('Draw', ['$rootScope', function($rootScope){

    var factory = {};
    var sketch;
    var sketchElement;
    var mouseX;
    var mouseY;
    var outputList = document.getElementById('measureOutput');

    factory.closeDrawLayer = function() {
        $rootScope.map.removeInteraction($rootScope.draw);
        $('#measureOutput').css({'display': 'none'});
        //$($rootScope.map.getViewport()).off('mousemove');
    }

    factory.cleanDrawLayer = function() {
        $rootScope.map.removeInteraction($rootScope.draw);
        $('#measureOutput').css({'display': 'none'});
    }

    factory.formatLength = function(line){
        var length = Math.round(line.getLength() * 100) / 100;
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) + ' km';
        } else {
            output = (Math.round(length * 100) / 100) + ' m';
        }
        return output;
    };

    factory.formatArea = function(polygon){
        var area = polygon.getArea();
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) + ' m<sup>2</sup>';
        }
        return output;
    };

    factory.mouseMoveHandler = function(evt) {
        if (sketch) {
            var output;
            var geom = (sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                output = factory.formatArea((geom));
            } else if(geom instanceof ol.geom.LineString) {
                output = factory.formatLength((geom));
            }
            outputList.innerHTML = '<p>' + output + '</p>';
        }
    };

    factory.measure = function(type) {
        $rootScope.draw = new ol.interaction.Draw({
            source: $rootScope.drawVector,
            type: type
        });

        $rootScope.map.addInteraction($rootScope.draw);

        $($rootScope.map.getViewport()).on('mousemove', function(evt) {
            mouseX = evt.pageX + 'px';
            mouseY = evt.pageY - 90 + 'px';
            $('#measureOutput').css({'top': mouseY, 'left': mouseX});
            factory.mouseMoveHandler(evt);
        });

        var element = document.getElementById('measure');
        var content = document.getElementById('measure-content');
        var closer = document.getElementById('measure-closer');

        var popup = new ol.Overlay({
            element: element,
            stopEvent: false
        });
        $rootScope.map.addOverlay(popup);

        closer.onclick = function() {
            element.style.display = 'none';
            closer.blur();
            $($rootScope.map.getViewport()).off('mousemove');
            return false;
        }

        $($rootScope.map.getViewport()).on('mousemove', function(evt) {
            var pixel = $rootScope.map.getEventPixel(evt.originalEvent);
            var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                return feature;
            });

            if (feature) {
                // catches the event when a mouse is over a marker
                if ( feature.get('measure')) {
                    var geometry = feature.getGeometry();
                    //var coord = geometry.getLastCoordinate();
                    //popup.setPosition(coord);
                    var extent = geometry.getExtent();
                    var aveX = ((extent[2] + extent[0]) / 2);
                    var aveY = ((extent[3] + extent[1]) / 2);
                    popup.setPosition([aveX, aveY]);
                    content.innerHTML = '<p>' +feature.get('measure')+'</p>';
                    element.style.display = 'block';
            //     } else if (feature.get('type')) {
            //         var type = feature.get('type');
            //         if (type.toString == '2' || type == '4-Hour Rain Forecast' || type == '4-') {};
            //         var name = feature.get('name');
            //         if ( !(name=='Philippines' ||  name=='floodreport' || name==undefined ) ) {
            //             var geometry = feature.getGeometry();
            //             var coord = geometry.getCoordinates();
            //             popup.setPosition(coord);
            //             content.innerHTML = '<p>' + feature.get('name') + '</p>';
            //             element.style.display = 'block';
            //         }
            //     }
                } else {
                    element.style.display = 'none';
                }
            }
        });

        $rootScope.draw.on('drawstart', function(evt){
                // set sketch
                sketch = evt.feature;
                 $('#measureOutput').fadeIn('slow');
                //sketchElement = document.createElement('p');
                //var outputList = document.getElementById('measureOutput');
                /*if (outputList.childNodes) {
                    outputList.insertBefore(sketchElement, outputList.firstChild);
                } else {
                    outputList.appendChild(sketchElement);
                }*/
            }, this);

        $rootScope.draw.on('drawend', function(evt) {
                $('#measureOutput').fadeOut('slow').css({'display': 'none'});
                var measure = ol.proj.transform(sketch.getGeometry().getLastCoordinate(),
                    'EPSG:3857',
                    'EPSG:4326');

                var present = false;
                for (var i=0; i<$rootScope.layers.length; i++) {
                    if ($rootScope.layers[i].draw_layer_name) {
                        present = true;
                    }
                }
                if (!present) {
                    $rootScope.drawLayer['draw_layer_name'] = 'Draw Layer';
                    $rootScope.layers.push($rootScope.drawLayer);
                }
                sketch.set('measure', outputList.innerHTML);
                // unset sketch
                sketch = null;
                sketchElement = null;
            }, this);
    };

    return factory;
}]);
//function to check if feature is cluster
function isCluster(feature) {
    if (!feature || !feature.get('features')) {
        return false;
    }
        return feature.get('features').length > 1;
}

//Used for Critical Facilities and Mosquito/OVIndex
module.factory('Facilities', ['$rootScope', function($rootScope){
    var factory = {};
    var popupKey;
    factory.toggle = function(component) {
        if ($rootScope.facilityMarkers[component.name] == undefined){
            var iconFeatures=[];
            for(var i=0;i<component.features.length;i++){
                var point = component.features[i];

                if (component.tag!="ovindex"){
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([point.lng,point.lat], 'EPSG:4326','EPSG:3857')),
                        name: point.name
                    });
                }
                else{
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([point.lng,point.lat], 'EPSG:4326','EPSG:3857')),
                        name: point.name,
                        ovindex: point.ovindex,
                        municipality: point.municipality,
                        date: point.date_submitted,
                        action: point.action
                    });
                }

                iconFeatures.push(iconFeature);
            }

            var vectorSource = new ol.source.Vector({
                features: iconFeatures //add an array of features
            });

            var clusterSource = new ol.source.Cluster({
                source: vectorSource
            });

            var raw = new ol.layer.Vector({
              source: vectorSource

            });

            var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon(({
                               anchor: [0.5, 45],
                               anchorXUnits: 'fraction',
                               anchorYUnits: 'pixels',
                               src: '/static/img/map/'+component.name+'.png'
                    }))
            });

            var clusterLayer = new ol.layer.Vector({
                source: clusterSource,
                style: iconStyle
            });
            var element = document.getElementById('popup');
            var content = document.getElementById('popup-content');
            var closer = document.getElementById('popup-closer');

            var popup = new ol.Overlay({
                element: element,
                stopEvent: false
            });
            $rootScope.map.addOverlay(popup);

            //pop up when marker is hovered
            popupKey = $rootScope.map.on('pointermove', function(e) {
                var pixel = $rootScope.map.getEventPixel(e.originalEvent);
                var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return feature;
                });

                if(feature != undefined){
                    var popupMessage;
                    var coord;
                    //if marker is cluster, display how many markers inside
                    if (isCluster(feature)) {
                        element.style.height = "75px";
                        element.style.top = "-125px"
                        coord = feature.U.geometry.A;
                        popup.setPosition(coord);
                        popupMessage = 'There are ' + feature.get('features').length + " "+component.name +" in this cluster. Zoom in to see them"
                    }
                    //display marker info
                    else{
                        if (component.tag!="ovindex"){
                            popupMessage = feature.U.features[0].U.name;
                        }
                        else{
                            element.style.height = "200px";
                            element.style.top = "-250px"
                            popupMessage = "<p><b>School:</b>"+feature.U.features[0].U.name+"</p>"+"<p><b>Municipality:</b>"+feature.U.features[0].U.municipality+"</p>"+"<p><b>OVIndex:</b>"+feature.U.features[0].U.ovindex+"</p>"+"<p><b>Date Submitted:</b>"+feature.U.features[0].U.date+"</p>"+"<p><b>Actions to be taken: </b>"+feature.U.features[0].U.action+"</p>";
                        }
                        coord = feature.U.features[0].U.geometry;
                        popup.setPosition(coord.A);
                    }
                    content.innerHTML = '<p>' + popupMessage + '</p>';
                    element.style.display = 'block';

                }
                else {
                    element.style.display = 'none';
                }
            });
            $rootScope.facilityMarkers[component.name] = [clusterLayer, false];
        }


        // hides sensor layer
        if ($rootScope.facilityMarkers[component.name][1]) {
            $rootScope.map.removeLayer($rootScope.facilityMarkers[component.name][0]);
            $rootScope.facilityMarkers[component.name][1] = false;
            $rootScope.layers.splice($rootScope.layers.indexOf(component),1);
            // factory.removeCharts();
        // shows sensor layer
        } else {
            $rootScope.map.addLayer($rootScope.facilityMarkers[component.name][0]);
            $rootScope.facilityMarkers[component.name][1] = true;
            $rootScope.layers.push(component);
        }

    };

    return factory;
}]);


module.factory('Sensors', ['$rootScope', function($rootScope){
    var factory = {};

    // keys for events so that they can be turned off via unByKey
    var popupKey;
    var chartKey;

    factory.toggle = function(component) {
        // defines marker vectorlayer if not yet created
        if ($rootScope.markers[component.name] == undefined) {
            //var iconFeature = [];
            var type_id = component.type;
            var features = new Array(component.data.length);
            var styleCache = {};
            var src = '/static/img/map/' + component.icon;

            // define image to use
            var image = new ol.style.Icon({
                anchor: [0.5, 45],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: src
            });

            // defines icon style
            var iconStyle = new ol.style.Style({
                image: image
            });

            // fills the list with markers
            for (var i = 0; i < component.data.length; i++) {
                var point = component.data[i];
                var lat = point['lat'];
                var lng = point['lng'];
                var name = point['name'];
                var url = point['url'];

                if ( lat == 0 || lng == 0 || lat >= 30) {
                    console.log(name);
                    continue;
                } else {
                    var geometry = new ol.geom.Point(
                        ol.proj.transform(
                            [lng, lat],
                            'EPSG:4326',
                            'EPSG:3857'
                        )
                    );
                    features[i] = new ol.Feature({
                        geometry: geometry,
                        name: name,
                        url: url,
                        type: type_id,
                    });
                }
            };
            //filters undefined features due to unknown reasons
            features = features.filter(function( element ) {
               return element !== undefined;
            });
            var source = new ol.source.Vector ({
                features: features
            });

            // var clusterSource = new ol.source.Cluster ({
            //     distance: 50,
            //     source: source
            // });

            // creates a layer to overlay
            var vectorLayer = new ol.layer.Vector({
                source: source, //clusterSource,
                style:  iconStyle
                // style: function(feature, resolution) {
                //     console.log('feature: ', feature);
                //     console.log('feature length: ', feature.length);
                //     var size = feature.get('features').length;
                //     console.log('size: ', size);
                //     var style = styleCache[size];
                //     if (!style) {
                //         var style = [new ol.style.Style({
                //             image: new ol.style.Icon({
                //                 anchor: [0.5, 45],
                //                 anchorXUnits: 'fraction',
                //                 anchorYUnits: 'pixels',
                //                 src: src
                //             }),
                //             text: new ol.style.Text({
                //                 text: size.toString(),
                //                 fill: new ol.style.Fill({
                //                     color: '#000'
                //                 })
                //             })
                //         })];
                //         styleCache[size] = style;
                //     }
                //     return style;
                // }
            });

            $rootScope.markers[component.name] = [vectorLayer, false];

            // popup and highcharts
            var element = document.getElementById('popup');
            var content = document.getElementById('popup-content');
            var closer = document.getElementById('popup-closer');

            var popup = new ol.Overlay({
                element: element,
                stopEvent: false
            });
            $rootScope.map.addOverlay(popup);

            closer.onclick = function() {
                element.style.display = 'none';
                closer.blur();
                return false;
            }

            // change mouse cursor when over marker
            popupKey = $rootScope.map.on('pointermove', function(e) {
                var pixel = $rootScope.map.getEventPixel(e.originalEvent);
                var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return feature;
                });

                if (feature) {
                    // catches the event when a mouse is over a marker
                    var name = feature.get('name');
                    if ( !(name=='Philippines' ||  name=='floodreport' || name==undefined ) ) {
                        var geometry = feature.getGeometry();
                        var coord = geometry.getCoordinates();
                        popup.setPosition(coord);
                        content.innerHTML = '<p>' + feature.get('name') + '</p>';
                        element.style.display = 'block';
                    }
                } else {
                    element.style.display = 'none';
                }
            });

            // handles charts on mouse click on a marker
            chartKey = $rootScope.map.on('singleclick', function(e) {
                var pixel = $rootScope.map.getEventPixel(e.originalEvent);
                var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return feature;
                });
                if (feature) {
                    var name = feature.get('name');
                    if ( !(name=='Philippines' || name=='floodreport' || name==undefined ) ) {
                        factory.graph(feature);
                        $('#charts').fadeIn(300);
                    }
                } else {
                    $('#charts').fadeOut(300);
                }
            });
        }
        // hides sensor layer
        if ($rootScope.markers[component.name][1]) {
            $rootScope.map.removeLayer($rootScope.markers[component.name][0]);
            $rootScope.markers[component.name][1] = false;
            $rootScope.layers.splice($rootScope.layers.indexOf(component),1);
            // factory.removeCharts();
        // shows sensor layer
        } else {
            $rootScope.map.addLayer($rootScope.markers[component.name][0]);
            $rootScope.markers[component.name][1] = true;
            $rootScope.layers.push(component);
        }
    };

    factory.removeCharts = function() {
        $rootScope.map.unByKey(popupKey);
        $rootScope.map.unByKey(chartKey);
    }

    factory.graph = function(feature) {
        var ws = new WebSocket("ws://202.90.159.176:8080" + feature.get('url'));

        ws.onmessage = function(event) {
            //console.log(event.data);
            var data = JSON.parse(event.data);
            var chart_size = (data.series.length > 1 ? [480, 256] : [992, 518]);

            // resets the charts div
            $('#charts').empty();
            $('#charts').html('<span class="fa fa-arrows" onmousedown="$(this).parent().draggable(\'enable\')" onmouseup="$(this).parent().draggable(\'disable\')" style="padding:10px; background:#ccc; position:absolute; border-radius:5px;"></span><a href="/#" class="ol-popup-closer" onclick="$(\'#charts\').fadeOut(300);"></a>'+
                              '<h2>'+data.station.verbose_name+'</h2>');
            for (var i=0; i<data.series.length; i++) {
                // creates a new div
                $('#charts').append('<div id=chart_'+(i+1)+'></div>');
                (i%2 == 0 ? $('#chart_'+(i+1)).addClass('chart-even') : $('#chart_'+(i+1)).addClass('chart-odd'));

                var formatter = function() {
                    var p = this.points;
                    var s = p[0].key;
                    switch(p[0].series.name) {
                        case 'Rainfall': var unit = 'mm'; break;
                        case 'Pressure': var unit = 'hPa'; break;
                        case 'Humidity': var unit = '%'; break;
                        case 'Temperature': var unit = '°C'; break;
                        case 'Water Level': var unit = 'm'; break;
                    }
                    for (var i = 0; i < p.length; i++) {
                        s += '<br/><b style="color:' + p[i].series.color + '">';
                        s += p[i].series.name + ':</b> ' + p[i].y + unit;
                    }
                    return s;
                };

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: "chart_" + (i+1),
                        zoomType: "x",
                        width: chart_size[0],
                        height: chart_size[1],
                        type: 'spline',
                    },
                    credits : {
                        enabled : false
                    },
                    title: {
                        text: data.series[i].label,
                        x: 0, //center
                        style: { fontSize:'14px', fontWeight:'bold', color:'#333'},
                    },
                    subtitle: {
                        text: 'in the last 24 hours',
                        x: 0, //center
                    },
                    plotOptions: {
                        scatter: {marker: {radius: 2, states: {hover: {radius: 4}}}},
                        area: {
                            lineWidth: 1,
                            fillOpacity: 0.25,
                            shadow: false,
                            connectNulls: true,
                            states: {hover: {lineWidth: 1}},
                            marker: {
                                radius: 1,
                                states: {hover: {radius: 4}}
                            }
                        }
                    },
                    xAxis: {
                        categories: data.time,
                        tickWidth: 0,
                        labels: { enabled:false }
                    },
                    yAxis: {
                        title: {
                            text: data.series[i].label + ' (' + data.series[i].units + ')'
                        },
                    },
                    tooltip: {
                        shared: true,
                        crosshairs: true,
                        formatter: formatter,
                        borderColor: '#ccc',
                    },
                    series: [{
                        name: data.series[i].label,
                        data: data.series[i].values

                    }],
                    legend: { enabled:false },
                    colors: ['#0088CC', '#CD0F0D'],
                    symbols: ['circle', 'circle'],
                });

                // chart options per data type
                if (data.series[i].label == 'Rainfall') {
                    console.log(data.series[i]);
                    // defines the maximum y-axis and plotband value
                    var yTick = chart.yAxis[0].tickInterval;
                    var max_plotband = data.series[i].plot_bands[data.series[i].plot_bands.length-1].to;
                    var max = max_plotband > data.series[i].maxval ? max_plotband : data.series[i].maxval;
                    max = Math.ceil(max / yTick) * yTick;
                    chart.yAxis[0].setExtremes(0,max);
                    data.series[i].plot_bands[data.series[i].plot_bands.length-1].to = max;

                    // sets plotbands
                    for (var j=0; j<data.series[i].plot_bands.length; j++) {
                        chart.yAxis[0].addPlotBand({
                            from: data.series[i].plot_bands[j].from,
                            to: data.series[i].plot_bands[j].to,
                            color: data.series[i].plot_bands[j].color,
                            label: {
                                text: data.series[i].plot_bands[j].text,
                                style: {
                                    color: '#606060'
                                }
                            },
                        });
                    }
                } else if (data.series[i].label == 'Pressure') {
                    chart.yAxis[0].setExtremes(860,1020);
                } else if (data.series[i].label == 'Humidity') {
                    chart.yAxis[0].setExtremes(0,100);
                } else if (data.series[i].label == 'Temperatue') {
                    chart.yAxis[0].setExtremes(0,50);
                } else if (data.series[i].label == 'Water Level') {
                    chart.series[0].update({
                        type: 'areaspline'
                    });
                }
            }
        };
    };

    return factory;
}]);

module.factory('Layers', ['$rootScope', '$routeParams', '$interval', function($rootScope, $routeParams, $interval) {
    var factory = {};
    var transformer = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');
    //(false ? )
    //add $interval to switch the dopplers
    var doppler_counter = 0;
    var satellite_counter = 0;
    factory._animate = {
        ms : 1000,
        running : false,
        start : function() {
            this.running = true;
            return $interval(function(){
                if(factory.Doppler.active.length > 0) {
                    $.each(factory.Doppler.active, function(index, val){
                        factory.removeDoppler(factory.Doppler.layers[val]);
                        factory.loadToggle(factory.Doppler.modifyDoppler(factory.Doppler.layers[val], doppler_counter, val));
                    });
                    doppler_counter >= 4 ? doppler_counter = 0 : doppler_counter++;
                }
                if(!$.isEmptyObject(factory.Satellite.active)) {
                    var sat_type = factory.Satellite.active["sub_section_name"]
                    factory.removeDoppler(factory.Satellite.modifyURL(factory.Satellite.active, factory.Satellite.index));
                    factory.loadToggle(factory.Satellite.modifyURL(factory.Satellite.active, factory.Satellite.index, satellite_counter));
                    if(sat_type=="Rainfall Estimate (GSMAP)"){
                        satellite_counter >= 4 ? satellite_counter = 0 : satellite_counter++;
                    }
                    else{
                        satellite_counter >= 13 ? satellite_counter = 0 : satellite_counter++;
                    }
                }
            },this.ms);
        },
        focus : function(data, level) {
            var _lat =((data.sub_section_extent[2] - data.sub_section_extent[0]) / 2) + data.sub_section_extent[0];
            var _lon =((data.sub_section_extent[3] - data.sub_section_extent[1]) / 2) + data.sub_section_extent[1];
            $rootScope.map.getView().getZoom == level ? '' : $rootScope.map.getView().setZoom(level);
            $rootScope.map.getView().setCenter(ol.proj.transform([_lat, _lon], 'EPSG:4326', 'EPSG:3857'));
        }
    }

    //Doppler object handles it's layers being rendered on map -g
    factory.Doppler = {
        other : 0,
        active : [],
        url : [],
        layers : [],
        removeActive : function(index) {
            this.active.splice(index, 1);
        },
        modifyDoppler : function(data, counter, index) {
            data.sub_section_url = factory.Doppler.url[index].replace(/(\.[\w\d_-]+)$/i, counter+'$1');
            return data;
        },
        setActive : function(index) {
            var i = this.active.indexOf(index);
            i < 0 ? this.active.push(index) : this.active.splice(i, 1);
            return i < 0 ? true : false;
        },
        setLayer : function(index, data) {
            if(undefined != this.layers[index])
                this.layers[index] = data;
            else
                this.layers.push(data)
        },
        getLayer : function(index) {
            return this.layers[index]
        }
    }

    factory.Satellite = {
        index : 0,
        position : 0,
        active : {},
        counter : 1,
        url : [],
        clearActive : function() {
            this.active = {};
        },
        setActive : function(data, index) {
            var status = false;
            if(this.active.sub_section_name === data.sub_section_name) {
                this.clearActive();
                status = false;
            } else {
                this.active = data;
                this.index = index;
                status = true;
            }
            return status;
        },
        modifyURL : function(data, index, counter) {
            if( this.url[index].slice(28,36) == "himawari" ){
                if(counter < 10){
                    data.sub_section_url = this.url[index].slice(0, -5) + counter + '.png?' + Math.random()*100;
                }
                else{
                    data.sub_section_url = this.url[index].slice(0, -6) + counter + '.png?' + Math.random()*100;
                }
            }
            else if(this.url[index].slice(38,43)=="accum"){
                return data;
            }
            else{
                data.sub_section_url = this.url[index].slice(0, -5) + counter + '.png';
            }
            return data;
        }
    }

    factory.load = function(data) {
        data.sub_section_state  = 'off';
        data.sub_section_layer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                imageSize: data.sub_section_image_size,
                imageExtent: ol.extent.applyTransform(data.sub_section_extent, transformer),
                projection: 'EPSG:3857',
                url: data.sub_section_url
            }),
            opacity: 0.5
        });
    };

    //add static image layers directly on map -g
    factory.loadToggle = function(data) {
        data.sub_section_state  = 'on';
        data.sub_section_layer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                imageSize: data.sub_section_image_size,
                imageExtent: ol.extent.applyTransform(data.sub_section_extent, transformer),
                projection: 'EPSG:3857',
                url: data.sub_section_url
            }),
            opacity: 0.5
        });
        $rootScope.map.addLayer(data.sub_section_layer);
    }

    //remove doppler layer from map -g
    factory.removeDoppler = function(data) {
        if(data) {
            $rootScope.map.removeLayer(data.sub_section_layer);
            data.sub_section_state = 'off';
        }
    }

    factory.toggle = function(data) {
        if (data.sub_section_state === 'off') {
            if (data.sub_section_name.search('Station') == -1) {
                for (var i=0; i<$rootScope.layers.length; i++) {
                    if ($rootScope.layers[i].hasOwnProperty('sub_section_name') && $rootScope.layers[i].sub_section_name.search('Station') == -1) {
                        factory.toggle($rootScope.layers[i]);
                        break;
                    }
                }
            }
            console.log(data)
            $rootScope.map.addLayer(data.sub_section_layer);
            data.sub_section_state = 'on';
            $rootScope.layers.push(data);
        } else {
            $rootScope.map.removeLayer(data.sub_section_layer);
            data.sub_section_state = 'off';
            $rootScope.layers.splice($rootScope.layers.indexOf(data),1);
        }
    };

    factory.toggleReport = function(component) {
        if ($rootScope.markers[component['report_name']] == undefined) {
            var reportFeature = [];
            var reportStyle = [];
            var heightList = {
                'No Flood': 0,
                'Ankle High': 1,
                'Knee High': 2,
                'Waist High': 3,
                'Neck High': 4,
                'Top of Head High': 5,
                '1-Storey High': 6,
                '1.5-Storeys High': 7,
                '2-Storeys or Higher': 8
            };

            for (var i = 0; i < 9; i++) {
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        src: '/static/img/map/flood_report_icon_' + i + '.png'
                    })
                });
                reportStyle.push(iconStyle);
            }

            // fills the list with markers
            for (var j = 0; j < component.data.length; j++) {
                if (component.data[j]['lat'] == 0 || component.data[j]['lng'] == 0) {
                    continue;
                } else {
                    var feature = new ol.Feature({
                        geometry: new ol.geom.Point(
                            ol.proj.transform(
                                [component.data[j]['lng'], component.data[j]['lat']],
                                'EPSG:4326',
                                'EPSG:3857'
                            )
                        ),
                        name: 'floodreport',
                        flood_height: component.data[j]['flood_height'],
                        flood_time: component.data[j]['flood_time'],
                        details: component.data[j]['details']
                    });
                    feature.setStyle(reportStyle[heightList[component.data[j]['flood_height']]]);
                    reportFeature.push(feature);
                }
            };

            // creates a layer to overlay
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({ features: reportFeature })
            });
            $rootScope.markers[component['report_name']] = [vectorLayer, false];

            // reports
            var element = document.getElementById('report');
            var content = document.getElementById('report-content');
            var closer = document.getElementById('report-closer');

            var popup = new ol.Overlay({
                element: element,
                stopEvent: false
            });
            $rootScope.map.addOverlay(popup);

            closer.onclick = function() {
                element.style.display = 'none';
                closer.blur();
                return false;
            }

            // change mouse cursor when over marker
            $rootScope.map.on('singleclick', function(e) {
                var pixel = $rootScope.map.getEventPixel(e.originalEvent);
                var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return feature;
                });

                if (feature) {
                    // catches the event when a mouse is over a marker
                    var name = feature.get('name');
                    if ( !(name=='Philippines' || name==undefined ) ) {
                        if (name == 'floodreport') {
                            var geometry = feature.getGeometry();
                            var coord = geometry.getCoordinates();
                            popup.setPosition(coord);
                            content.innerHTML = '<p><span class="report">Flood Height:</span> ' +
                                feature.get('flood_height') + '</p>' +
                                '<p><span class="report">Date:</span> ' +
                                feature.get('flood_time') + '</p>' +
                                '<p><span class="report">Details:</span> ' +
                                feature.get('details') + '</p>';
                            element.style.display = 'block';
                        }
                    }
                } else {
                    element.style.display = 'none';
                }
            });
        }
        if ($rootScope.markers[component['report_name']][1]) {
            $rootScope.map.removeLayer($rootScope.markers[component['report_name']][0]);
            $rootScope.markers[component['report_name']][1] = false;
            $rootScope.layers.splice($rootScope.layers.indexOf(component),1);

        } else {
            $rootScope.map.addLayer($rootScope.markers[component['report_name']][0]);
            $rootScope.markers[component['report_name']][1] = true;
            $rootScope.layers.push(component);
        }

    };



//     factory.toggle7Day = function(component){
//         $rootScope.municipalities = [];
//         for (var i = 0;i < component.data.length;i++){
//             $rootScope.municipalities.push(component.data[i]["verbose_name"].replace(/_/g, ',').replace(/([A-Z])/g, ' $1').trim());
//         };

//         var defLocation = "Manila_MetropolitanManila"
//         for (var i = 0;i < component.data.length;i++){
//             if (defLocation == component.data[i]["verbose_name"]){
//                 $rootScope.name7 = component.data[i]["verbose_name"].replace(/_/g, ',').replace(/([A-Z])/g, ' $1').trim();
//                 $rootScope.date7 = [];
//                 for (var j = 0;j < component.data[i]["data"].length; j++){
//                     $rootScope.date7.push(component.data[i]["data"][j]["date"]);
//                 }
//             }
//         }
//     };

// //    FUNCTION FOR SEARCH BAR
//    factory.search7Day = function(location7) {
//         $rootScope.selected = '';
//         $rootScope.municipalities = [];
//         console.log(location7);
//    };

//    FUNCTION FOR CLICKING ON DATE



    factory.toggleForecast = function(component) {
        if ($rootScope.markers[component.outlook_name] == undefined) {
            var iconFeature = [];

            // fills the list with markers
            for (var i = 0; i < component.data.length; i++) {
                if (component.data[i]['data'] != null && component.data[i]['data'][0] != undefined) {
                    // defines icon style
                    var icon = ( component.outlook_name == '4-Hour Rain Forecast' ?
                                 component.data[i]['data'][0]['icon'] :
                                 component.data[i]['data'][0]['readings'][0]['icon']
                               );

                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon({
                            // anchor: [0.5, 45],
                            // anchorXUnits: 'fraction',
                            // anchorYUnits: 'pixels',
                            src: icon,
                            scale: 0.25
                        })
                    });
                    if (parseFloat(component.data[i]['lat']) == 0 || parseFloat(component.data[i]['lng']) == 0) {
                        continue;
                    } else {
                        var feature = new ol.Feature({
                            geometry: new ol.geom.Point(
                                ol.proj.transform(
                                    [parseFloat(component.data[i]['lng']), parseFloat(component.data[i]['lat'])],
                                    'EPSG:4326',
                                    'EPSG:3857'
                                )
                            ),
                            type: component.outlook_name,
                            name: component.data[i]['location'],
                            source: component.data[i]['source'],
                            data: component.data[i]['data'],
                            tstamp: component.data[i]['last_update']

                        });
                        feature.setStyle(iconStyle);
                        iconFeature.push(feature);
                    }
                }
            };

            // creates a layer to overlay
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({ features: iconFeature })
            });
            $rootScope.markers[component.outlook_name] = [vectorLayer, false];

            // popup and highcharts
            var element = document.getElementById('popup');
            var content = document.getElementById('popup-content');
            var closer = document.getElementById('popup-closer');

            var popup = new ol.Overlay({
                element: element,
                stopEvent: false
            });
            $rootScope.map.addOverlay(popup);

            closer.onclick = function() {
                element.style.display = 'none';
                closer.blur();
                return false;
            }

            // change mouse cursor when over marker
            var popupKey = $rootScope.map.on('pointermove', function(e) {
                var pixel = $rootScope.map.getEventPixel(e.originalEvent);
                var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return feature;
                });

                if (feature) {
                    // catches the event when a mouse is over a marker
                    //if ( !(feature.get('name')=='Philippines' || feature.get('name')==undefined ) ) {
                    var name = feature.get('name');
                    var feature_type = feature.get('type');
                    if (feature_type=="7-Day Weather Forecast"){
                        var geometry = feature.getGeometry();
                        var coord = geometry.getCoordinates();
                        popup.setPosition(coord);
                        content.innerHTML =
                            '<p><b>'+feature.get('name')+'</b></p>'+
                            '<p>'+feature.get('tstamp')+'</p>';
                        element.style.display = 'block';
                    }
                    else if ( !(name=='Philippines' ||  name=='floodreport' || name==undefined ) ) {
                        var geometry = feature.getGeometry();
                        var coord = geometry.getCoordinates();
                        popup.setPosition(coord);
                        content.innerHTML =
                            '<p><b>'+feature.get('name')+'</b></p>'+
                            '<p>Last update: '+feature.get('tstamp')+'</p>';
                        element.style.display = 'block';
                    }
                } else {
                    element.style.display = 'none';
                }
            });

            // handles charts on mouse click on a marker
            var chartKey = $rootScope.map.on('click', function(e) {
                var pixel = $rootScope.map.getEventPixel(e.originalEvent);
                var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                    return feature;
                });
                if (feature) {
                    $('.tables').empty();
                    factory.tabularize(feature);
                } else {
                    console.log("feature");
                    $('.tables').fadeOut(300);
                }
            });
        }
        if ($rootScope.markers[component.outlook_name][1]) {
            $rootScope.map.removeLayer($rootScope.markers[component.outlook_name][0]);
            $rootScope.markers[component.outlook_name][1] = false;
            $rootScope.layers.splice($rootScope.layers.indexOf(component),1);

        } else {
            //console.log(component);
            $rootScope.map.addLayer($rootScope.markers[component.outlook_name][0]);
            $rootScope.markers[component.outlook_name][1] = true;
            $rootScope.layers.push(component);
        }

    };

    factory.tabularize = function(feature) {
        var data = feature.get('data');
        console.log(data);

        if (feature.get('type') == '4-Hour Rain Forecast') {
            var rows = "";
            for (var i=0; i<data.length; i++) {
                rows = rows.concat("<tr><td><img src={0}></td><td>{1}%</td><td><b>{2}</b></td><td>{3}</td></tr>");
                rows = factory.stringFormat(rows,data[i]['icon'],data[i]['percent_chance_of_rain'],data[i]['chance_of_rain'],data[i]['time']);
            }
            var content = '<a href="/#" class="ol-popup-closer" onclick="$(\'.tables\').fadeOut(300);"></a>'+
                          '<h2>'+feature.get('name')+'</h2>'+
                          '<p>Source: '+feature.get('source')+'</p>'+
                          '<table class="table table-striped">'+
                          rows+
                          '</table>'+
                          '<p><i>Last checked: '+feature.get('tstamp')+'</i></p>'
            $('#four-hour').html(content);
            $('#four-hour').fadeIn(300);
        } else {
            var content = '<a href="/#" class="ol-popup-closer" onclick="$(\'.tables\').fadeOut(300);"></a>'+
                          '<h2>'+feature.get('name')+'</h2>'+
                          '<p>Source: '+feature.get('source')+'</p>'+
                          '<p><i>'+feature.get('tstamp')+'</i></p>'+
                          '<ul id="forecast-table" class="nav nav-tabs">'

            var lis = []
            for (var i=0; i<data.length; i++) {
                var li = "";
                li = li.concat('<li><a href="#{0}" data-toggle="tab">{1}</a></li>');
                lis[i] = factory.stringFormat(li,i,data[i]['date']);
                content = content.concat(lis[i]);
            }
            content = content.concat('</ul><div class="tab-content">');

            var tabs = []
            for (var i=0; i<data.length; i++) {
                var tab = ""
                tab = tab.concat('<div id="{0}" class="tab-pane" ><table class="table table-striped"><thead><tr><th>{1}</th><th>{2}</th><th>{3}</th><th>{4}</th><th>{5}</th><th>{6}</th><th>{7}</th><th>{8}</th></tr></thead><tbody>')
                tab = factory.stringFormat(tab,i,'Time','Weather Outlook','Temperature (°C)','Real Feel (°C)','Relative Humidity (%)','Rainfall (mm/h)','Windspeed (m/s)','Wind Direction');
                var readings = data[i]['readings'];
                for (var j=0; j<readings.length; j++) {
                    tab = tab.concat('<tr><td>{0}</td><td><img src={1}></td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td><td>{7}</td></tr>');
                    tab = factory.stringFormat(tab,readings[j]['time'],readings[j]['icon'],readings[j]['temperature'],readings[j]['heat_index'],readings[j]['relative_humidity'],readings[j]['rainfall'],readings[j]['wind_speed'],readings[j]['wind_direction']);
                }
                tabs[i] = tab.concat('</tbody></table><p><i>*The weather outlook displayed in this site is based on a Numerical Weather Prediction (NWP) model implemented by the NOAH-WISE Project. These forecasts are output of ongoing research and development, hence must be used with caution. The official weather forecast is being issued by PAGASA and should be the basis of decision making, especially during severe weather conditions.</i></p></div>');
                content = content.concat(tabs[i]);
            }
            content = content.concat('</div>');

            // var content = factory.stringFormat("i can speak {0} since i was {1}",'javascript',10);
            $('#four-day').html(content);
            $('#four-day').fadeIn(300);
            $('#forecast-table a:first').tab('show');
        }
    };

    factory.stringFormat = function (str, col) {
        col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);
        return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
            if (m == "{{") { return "{"; }
            if (m == "}}") { return "}"; }
            return col[n];
        });
    };

    factory.toggleTrack = function (component) {
        if ($rootScope.markers[component.outlook_name] == undefined) {        
            var stormTrackData = component.data;
            var track_features = [];
            var PAR = {points : [[120,25], [135,25], [135,5], [115,5], [115,15], [120,21], [120,25]]};
            function getIcon(Pos,Latest) {
                if (Pos == "Actual" && Latest == "Latest") {
                    return ['http://mahar.pscigrid.gov.ph/static/kmz/blue_storm.png',0.15];
                } else if (Pos == "Actual" && Latest =="No"){
                    return ['http://mahar.pscigrid.gov.ph/static/kmz/black_dot.png',.5];
                } else if (Pos == "Forecast") {
                    return ['http://mahar.pscigrid.gov.ph/static/kmz/yellow_storm.png',0.15];                    
                }
            }
            for (var j = 0; j < stormTrackData.length; j++) {
                var track_points = [];
                var stormTrack = stormTrackData[j].Data;
                for (var i = 0; i < stormTrackData[j].Data.length; i++) {
                    stormTrack[i].IsLatest = "No"; //add attribute to object
                    if (stormTrack[i].Position == "Forecast") {

                        if (stormTrack[i-1] && stormTrack[i-1].Position == "Actual") {
                            stormTrack[i-1].IsLatest = "Latest";
                            
                        }
                    }
                }
                for (var i = 0; i < stormTrack.length; i++) {
                    //icons
                    var TCiconFeature = new ol.Feature({
                      geometry: new ol.geom.Point(ol.proj.transform([parseFloat(stormTrack[i].Longitude), parseFloat(stormTrack[i].Latitude)], 'EPSG:4326', 'EPSG:3857')),
                      name: stormTrack[i].Category + " " + stormTrackData[j].Name,
                      forecast: stormTrack[i].Position,
                      speed: stormTrack[i].MaxWindSpeed,
                      gustiness: stormTrack[i].Gustiness,
                      tstamp: stormTrack[i].Date,
                      category: stormTrack[i].Category
                    });
                    if (stormTrack[i].Category != "Corner") {
                    TCiconFeature.setStyle(new ol.style.Style({
                          image: new ol.style.Icon(({
                            opacity: 1,
                            // opacity: stormTrack[i].Forecast == 0 ? 0.75 : 0.5,                            
                            // scale: stormTrack[i].Position == "Actual" ? 0.025 : 0.15,                         
                            scale: getIcon(stormTrack[i].Position, stormTrack[i].IsLatest)[1],
                            src: getIcon(stormTrack[i].Position, stormTrack[i].IsLatest)[0]
                            // src: stormTrack[i].Position == "Actual" ? 'http://mahar.pscigrid.gov.ph/static/kmz/blue_dot.png' :'http://mahar.pscigrid.gov.ph/static/kmz/yellow_storm.png'                            
                          }))
                        }));
                    }
                    track_features.push(TCiconFeature);

                    //lines
                    track_points.push([parseFloat(stormTrack[i].Longitude), parseFloat(stormTrack[i].Latitude)]);

                    //circle
                    if (stormTrack[i].Position == "Forecast") {
                        //var feature = new ol.Feature(new ol.geom.Circle(ol.proj.transform([parseFloat(stormTrack[i].Longitude), parseFloat(stormTrack[i].Latitude)], 'EPSG:4326', 'EPSG:3857'), parseInt(stormTrack[i].Radius)))
                        //track_features.push(feature);
                        var feature = new ol.Feature(new ol.geom.Polygon.circular(
                            new ol.Sphere(6378137),
                            [parseFloat(stormTrack[i].Longitude), parseFloat(stormTrack[i].Latitude)],
                            parseInt(stormTrack[i].Radius),
                            64).transform('EPSG:4326', 'EPSG:3857')
                            );
                        track_features.push(feature);                        
                    }
                }
                var ol_lines = new ol.Feature(new ol.geom.LineString(track_points).transform('EPSG:4326', 'EPSG:3857'));
                var ol_multilines = new ol.Feature(new ol.geom.MultiLineString([PAR.points]).transform('EPSG:4326', 'EPSG:3857'));
                track_features.push(ol_lines, ol_multilines);

            }
            var vectorLayer = new ol.layer.Vector({
                       source: new ol.source.Vector({
                        features: track_features,
                        projection: 'EPSG:4326'
                        })
                        })
        $rootScope.markers[component.outlook_name] = [vectorLayer, false];

        // popup and highcharts
        var element = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var closer = document.getElementById('popup-closer');

        var popup = new ol.Overlay({
            element: element,
            stopEvent: false
        });
        $rootScope.map.addOverlay(popup);

        closer.onclick = function() {
            element.style.display = 'none';
            closer.blur();
            return false;
        };

        // change mouse cursor when over marker
        var popupKey = $rootScope.map.on('click', function(e) {
            var pixel = $rootScope.map.getEventPixel(e.originalEvent);
            var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                return feature;
            });

            if (feature) {
                // catches the event when a mouse is over a marker
                //if ( !(feature.get('name')=='Philippines' || feature.get('name')==undefined ) ) {
                var name = feature.get('name');
                var feature_type = feature.get('type');
                if ((feature.get('category')=='LOW PRESSURE AREA')) {
                    var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    popup.setPosition(coord);
                    content.innerHTML =
                        '<p><b>LOW PRESSURE AREA</b></p>'
                    element.style.display = 'block';                                        
                }                
                else if (!(feature.get('category')=='Corner') && (feature.get('forecast')=='Forecast')) {
                    var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    popup.setPosition(coord);
                    content.innerHTML =
                        '<p><b>'+feature.get('name')+'</b></p>'+
                        '<p>'+feature.get('tstamp') + ' (' +feature.get('forecast').replace("Actual", "Observed").toUpperCase()+')</p>';
                    element.style.display = 'block';
                }
                else if (!(feature.get('category')=='Corner') && (feature.get('forecast')=='Actual')) {
                    var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    popup.setPosition(coord);
                    content.innerHTML =
                        '<p><b>'+feature.get('name')+'</b></p>'+
                        '<p>'+feature.get('tstamp') + ' (' +feature.get('forecast').replace("Actual", "Observed").toUpperCase()+')</p>'+
                        '<p>MAXIMUM SUSTAINED WINDS: ' + feature.get('speed') + ' KPH</p>'+
                        '<p>GUSTINESS: ' + feature.get('gustiness') + ' KPH</p>';
                    element.style.display = 'block';
                }
            } 
            else {
                element.style.display = 'none';
            }
        });

        // var clickKey = $rootScope.map.on('click', function(e) {
        //     var pixel = $rootScope.map.getEventPixel(e.originalEvent);
        //     var feature = $rootScope.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        //         return feature;
        //     });

        //     if (feature) {
        //         // catches the event when a mouse is over a marker
        //         //if ( !(feature.get('name')=='Philippines' || feature.get('name')==undefined ) ) {
        //         var name = feature.get('name');
        //         var feature_type = feature.get('type');
        //         if ( !(name=='Philippines' ||  name=='floodreport' || name==undefined || feature.get('category')=='Corner') ) {
        //             var geometry = feature.getGeometry();
        //             var coord = geometry.getCoordinates();
        //             popup.setPosition(coord);
        //             content.innerHTML =
        //                 '<p><b>'+feature.get('name')+'</b></p>'+
        //                 '<p>Last update: '+feature.get('tstamp')+'</p>';
        //             element.style.display = 'block';
        //         }
        //     } else {
        //         element.style.display = 'none';
        //     }
        // });


        }

        if ($rootScope.markers[component.outlook_name][1]) {
            $rootScope.map.removeLayer($rootScope.markers[component.outlook_name][0]);
            $rootScope.markers[component.outlook_name][1] = false;
            $rootScope.layers.splice($rootScope.layers.indexOf(component),1);

        } else {
            $rootScope.map.addLayer($rootScope.markers[component.outlook_name][0]);
            $rootScope.markers[component.outlook_name][1] = true;
            $rootScope.layers.push(component);
        }
        $rootScope.map.getView().setCenter(ol.proj.transform([122.5,14.0], 'EPSG:4326', 'EPSG:3857'));
        $rootScope.map.getView().setZoom(5);
    };





    factory.toggleHazardMap = function(component) {
        var workspace = component.geoserver_layer.split(':')[0];
        var hazard_name = component.geoserver_layer.split(':')[1];
        var layer_name = hazard_name.split('_');



        var bgy_workspace = "BarangayBoundary";//component.geoserver_layer.split(':')[0];
        var bgy_hazard_name = layer_name[0]+"_Boundary_Barangay";//component.geoserver_layer.split(':')[1];
        var bgycomponent = bgy_workspace+":"+bgy_hazard_name;


        var mun_workspace = "MunicipalBoundary";//component.geoserver_layer.split(':')[0];
        var mun_hazard_name = layer_name[0]+"_Boundary_Municipality";//component.geoserver_layer.split(':')[1];
        var muncomponent = mun_workspace+":"+mun_hazard_name;

        // this block is for layer naming
        if (layer_name[2] == "AlluvialFan" || layer_name[2] == "UnstableSlopes") {
            layer_name = layer_name[0]+' '+layer_name[2]+' Map';
        } else if (layer_name[1] == "LandslideHazards") {
            layer_name = layer_name[0] +' '+layer_name[1]+' Map';
        } else {
            layer_name = layer_name[1]+' '+layer_name[2]+' Map';
        }
        component['hazard_layer_name'] = layer_name;


        if ($rootScope.hazardMaps[hazard_name] == undefined) {
            var floodLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'http://geoserver.noah.dost.gov.ph/geoserver/'+workspace+'/wms',
                    params: {'LAYERS': component.geoserver_layer, 'TILED': true},
                    //crossOrigin: 'anonymous'
                }),
                opacity: 0.5
            });

            var bgyLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'http://geoserver.noah.dost.gov.ph/geoserver/'+bgy_workspace+'/wms',
                    params: {'LAYERS': bgycomponent, 'TILED': true},
                    //crossOrigin: 'anonymous'
                }),
                opacity: 0.5
            });

            var munLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'http://geoserver.noah.dost.gov.ph/geoserver/'+mun_workspace+'/wms',
                    params: {'LAYERS': muncomponent, 'TILED': true},
                    //crossOrigin: 'anonymous'
                }),
                opacity: 0.5
            });

            $rootScope.hazardMaps[hazard_name] = [floodLayer, false];
            $rootScope.hazardMaps[bgy_hazard_name] = [bgyLayer, false];
            $rootScope.hazardMaps[mun_hazard_name] = [munLayer, false];
        }

        if ($rootScope.hazardMaps[hazard_name][1]) {
            // hides hazard layer
            $rootScope.map.removeLayer($rootScope.hazardMaps[hazard_name][0]);
            $rootScope.map.removeLayer($rootScope.hazardMaps[bgy_hazard_name][0]);
            $rootScope.map.removeLayer($rootScope.hazardMaps[mun_hazard_name][0]);
            $rootScope.hazardMaps[hazard_name][1] = false;
            $rootScope.layers.splice($rootScope.layers.indexOf(component),1);


            //console.log('layer type: ', layer_name.split(' ')[1]);

        } else {
            // shows hazard layer
            for (var i=0; i<$rootScope.layers.length; i++) {
                if ($rootScope.layers[i].hazard_layer_name == layer_name) {
                    factory.toggleHazardMap($rootScope.layers[i]);
                }
            }
            $rootScope.map.addLayer($rootScope.hazardMaps[hazard_name][0]);
            $rootScope.map.addLayer($rootScope.hazardMaps[bgy_hazard_name][0]);
            $rootScope.map.addLayer($rootScope.hazardMaps[mun_hazard_name][0]);

            $rootScope.map.getView().setCenter(ol.proj.transform([component.center.lng, component.center.lat], 'EPSG:4326', 'EPSG:3857'));
            $rootScope.map.getView().setZoom(13);
            $rootScope.hazardMaps[hazard_name][1] = true;
            $rootScope.layers.push(component);
        }

    }

    return factory;
}]);


        $(document).ready(function(){

            $("#temp-img").hide();
            $("#rain-img").hide();
            $("#humidity-img").hide();
            $("#pressure-img").hide();

            $("#temp-img").addClass("hidden");
            $("#rain-img").addClass("hidden");
            $("#humidity-img").addClass("hidden");
            $("#pressure-img").addClass("hidden");

          $("a#Temp").click(function(){
            $(".shown").hide();
            $(".shown").addClass("hidden");
            $(".shown").removeClass("shown");
            $("#temp-img").show();
            $("#temp-img").addClass("shown");

          });

          $("a#Rain").click(function(){
            $(".shown").hide();
            $(".shown").addClass("hidden");
            $(".shown").removeClass("shown");
            $("#rain-img").show();
            $("#rain-img").addClass("shown");
          });

          $("a#Humi").click(function(){
            $(".shown").hide();
            $(".shown").addClass("hidden");
            $(".shown").removeClass("shown");
            $("#humidity-img").show();
            $("#humidity-img").addClass("shown");
          });

          $("a#Pres").click(function(){
            $(".shown").hide();
            $(".shown").addClass("hidden");
            $(".shown").removeClass("shown");
            $("#pressure-img").show();
            $("#pressure-img").addClass("shown");
          });
        });

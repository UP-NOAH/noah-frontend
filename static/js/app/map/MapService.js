'use strict';

var layers = [];

var styles = [
    'GoogleRoad',
    'GoogleTerrain',
    'GoogleSat',
    'GoogleHybrid',
    'ArcGIS',
    'OpenStreetMap',
    'OpenCycleMap',
    'OpenTransportMap',
    'Road',
    'Aerial',
    'AerialWithLabels',
];

var module = angular.module('map_service', []);

module.controller('MapCtrl', function($scope, $rootScope){

    function handleLocationError(browserHasGeolocation) {
        console.log(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
    }

    // Google Maps
    //center: new google.maps.LatLng(12.6760, 121.0437),
    $rootScope.gmap = new google.maps.Map(document.getElementById('gmap'), {
        mapTypeId: google.maps.MapTypeId.HYBRID,
        center: new google.maps.LatLng(12.386, 122.561),
        zoom: 6,
        disableDefaultUI: true,
        keyboardShortcuts: false,
        draggable: false,
        disableDoubleClickZoom: true,
        scrollwheel: false,
        streetViewControl: false,
        key: 'AIzaSyBH1g8w90_M8OQ6zeLzdKKIX62NGd10n_A'
    });

    var center = $rootScope.gmap.getCenter();
    var view = new ol.View({
        center: ol.proj.transform([center.lng(), center.lat()],
          'EPSG:4326', 'EPSG:3857'),
        zoom: $rootScope.gmap.getZoom(),
        minZoom: 3,
        maxZoom: 19,
        enableRotation: false
    });

    if( navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log(pos);
            $rootScope.gmap.setCenter(pos);
          });
    }else{
        console.log("Browser doesn't support Geolocation");
    }

    view.on('change:center', function() {
        var center = ol.proj.transform(view.getCenter(),
        'EPSG:3857', 'EPSG:4326');
        $rootScope.gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
    });
    view.on('change:resolution', function() {
        $rootScope.gmap.setZoom(view.getZoom());
    });

//    var s = new ol.style.Style({
//                fill: new ol.style.Fill({
//                    color: 'rgba(255, 255, 255, 0)'
//                })
//            })

    // Google Maps Ol3 Integration layer via GeoJSON
    layers.push(
        new ol.layer.Vector({
                url: 'static/json/PHL.geo.json',
                projection: 'EPSG:3857',
                format: new ol.format.GeoJSON(),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0)'
                    })
                })

        })
            /*,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0)'
                })
            })*/
    );



//    //mapbox flood
//    layers.push(
//        new ol.layer.Tile({
//         visible: true,
//         source: new ol.source.XYZ({
//           tileSize: [512, 512],
//            url: 'https://api.mapbox.com/styles/v1/cloud5/cipqhljci000l19m7mminjqjw/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2xvdWQ1IiwiYSI6ImNpcDU1czB2bzAwM2V2ZWt0NXF4bjNtcjEifQ.TPa7NFOV0B1PRnhSUUxTnA'
//          })
//       })
//    );

//    //geoserver boundary
//    var districtLayer = new ol.layer.Tile({
//        source: new ol.source.TileWMS({
//        url: 'http://202.90.159.177:8001/geoserver/wms?',
//        minZoom: 12,
//        params: {
//            'LAYERS': 'Boundary:Boundary_Province',
//            'TILED': true,
//                'FORMAT': 'image/png'
//        }})
//
//    });
//    layers.push(districtLayer);
//
//    var districtLayer = new ol.layer.Tile({
//        source: new ol.source.TileWMS({
//        url: 'http://202.90.159.177:8001/geoserver/wms?',
//        minZoom: 12,
//        params: {
//            'LAYERS': 'Boundary:Boundary_Municipality',
//            'TILED': true,
//                'FORMAT': 'image/png'
//        }})
//
//    });
//    layers.push(districtLayer);

    // ArcGIS Online
    var attribution = new ol.Attribution({
        html: 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
    });
    layers.push(
        new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.XYZ({
                attributions: [ attribution ],
                url: 'http://server.arcgisonline.com/ArcGIS/rest/services/' +
                        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                crossOrigin: 'anonymous'
            })
        })
    );

    // OpenStreetMap
    layers.push(
        new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.OSM({
                url: '//{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        })
    );

    // OpenCycleMap
    layers.push(
        new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.OSM({
                url: '//{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
            })
        })
    );

    // OpenTransportMap
    layers.push(
        new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.OSM({
                url: '//{a-c}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
            })
        })
    );

    // Bing Maps Set
    for (var i = 8, ii = styles.length; i < ii; ++i) {
        layers.push(
            new ol.layer.Tile({
                visible: false,
                preload: Infinity,
                source: new ol.source.BingMaps({
                    key: 'AqNJQ7F0LgqtsrECYKwo3ijiZyyDhrT2LF3GcP3zmi_DPTGlwJE8cx__OvSQlijW',
                    imagerySet: styles[i]
                })
            })
        );
    }

    // vector for map drawing tools
    //initialize vector
   /* $rootScope.drawVector = new ol.source.Vector();
    layers.push(
        new ol.layer.Vector({
            source: $rootScope.drawVector,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            }),
            visible: true
        })
    );*/

    var olMapDiv = document.getElementById('olmap');

    $rootScope.map = new ol.Map({
        layers: layers, //[vector],
        interactions: ol.interaction.defaults({
            altShiftDragRotate: false,
            dragPan: false,
            touchRotate: false
        }).extend([new ol.interaction.DragPan({kinetic: false})]),
        renderer: 'canvas',
        loadTilesWhileAnimating: true,
        target: 'map',
        view: view
    });

    //Search bar
    var geocoder = new Geocoder('nominatim', {
        provider: 'osm',
        lang: 'en',
        limit: 5,
        debug: true,
        placeholder: 'Find a place...',
        autoComplete: true,
        keepOpen: true,
        countrycodes: 'ph',
        defaultPrevented: false
    });
    geocoder.getLayer().setVisible(false);
    $rootScope.map.addControl(geocoder);
    geocoder.on('addresschosen', function(evt){
        console.info(evt);
        $rootScope.map.getView().setZoom(13);
    });

    // vector for map drawing tools
    //initialize vector
    $rootScope.createDrawLayer = function() {
        $rootScope.drawVector = new ol.source.Vector();
        $rootScope.drawLayer =
            new ol.layer.Vector({
                source: $rootScope.drawVector,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 3
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                }),
                visible: true
            });
        $rootScope.map.addLayer($rootScope.drawLayer);
    }
    $rootScope.createDrawLayer();

    //olMapDiv.parentNode.removeChild(olMapDiv);
    $rootScope.gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
    var zoomslider = new ol.control.ZoomSlider();
    //console.log('min: ', zoomslider.get('minResolution'));
    $rootScope.map.addControl(zoomslider);

   /* v = $rootScope.map.getView().getView2D().getResolution();
    console.log('resolution: ', v);
    console.log(view.getZoom());*/
   /* $rootScope.map.on('postcompose', function() {
        //console.log('postcompose!!!');
        var center = ol.proj.transform(view.getCenter(),
        'EPSG:3857', 'EPSG:4326');
        var zoom = view.getZoom();
        $rootScope.gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
        $rootScope.gmap.setZoom(zoom);
    });*/
    /*google.maps.event.addListenerOnce($rootScope.gmap, 'tilesloaded', function() {
        //console.log('here!');
        //var curWidth, curHeight;
        html2canvas($('#map'), {
            useCORS: true,
            onrendered: function(canvas) {
                // var img = new Image();
                // var newCanvas = document.createElement('canvas');
                // var newContext = newCanvas.getContext('2d');

                // img.onload = function() {
                //     curHeight = this.height;
                //     curWidth = this.width;
                // }
                // var source = canvas.toDataURL('image/png');
                // //console.log('source: ', source.width);
                // img.src = canvas.toDataURL('image/png');
                // //console.log('src: ', img.src);

                // console.log('img width: ', img.width);
                // img.width *= 0.65;
                // img.height *= 0.65;

                // //console.log('src: ', img.src);
                // newCanvas.width = img.width;
                // newCanvas.height = img.height;

                // newContext.drawImage(img, 0, 0, img.width, img.height);

                //console.log('canvas width: ', canvas.width);
                //console.log('newCanvas width: ', newCanvas.width);
                var finalImg = canvas.toDataURL('image/png'); //.replace('image/png', 'image/octet-stream');
                //console.log('canvas: ', newCanvas);
                //console.log('final: ', finalImg);
                $('#export-png').attr('href', finalImg);
                //clear img and newCanvas from memory after initializing download to browser
                //img = null;
                //newCanvas = null;

            }
        });
    });*/
});

module.controller('BaseMapCtrl', function($scope, $rootScope){

    $scope.basemaps = [
        {'name' : 'GoogleRoad', 'verbose' : 'Google Maps Roadmap'},
        {'name' : 'GoogleTerrain', 'verbose' : 'Google Maps Terrain'},
        {'name' : 'GoogleSat', 'verbose' : 'Google Maps Satellite'},
        {'name' : 'GoogleHybrid', 'verbose' : 'Google Maps Hybrid'},
        {'name' : 'ArcGIS', 'verbose' : 'ArcGIS Online'},
        {'name' : 'OpenStreetMap', 'verbose' : 'OpenStreetMap'},
        {'name' : 'OpenCycleMap', 'verbose' : 'OpenCycleMap'},
        {'name' : 'OpenTransportMap', 'verbose' : 'OpenTransportMap'},
        {'name' : 'Road', 'verbose' : 'Bing Maps Roadmap'},
        {'name' : 'Aerial', 'verbose' : 'Bing Maps Aerial'},
        {'name' : 'AerialWithLabels', 'verbose' : 'Bing Maps Aerial with Labels'}
    ];

    $scope.basemap = $scope.basemaps[3]; // google roadmap

    $scope.changeMap = function(basemap){
        $scope.basemap = basemap;

        switch($scope.basemap.name){
            case 'GoogleRoad':
                layers[0].setVisible(true);
                $rootScope.gmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                break;
            case 'GoogleTerrain':
                layers[0].setVisible(true);
                $rootScope.gmap.setMapTypeId(google.maps.MapTypeId.TERRAIN);
                break;
            case 'GoogleSat':
                layers[0].setVisible(true);
                $rootScope.gmap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                break;
            case 'GoogleHybrid':
                layers[0].setVisible(true);
                $rootScope.gmap.setMapTypeId(google.maps.MapTypeId.HYBRID);
                break;
            default:
                layers[0].setVisible(false);
        }

        $scope.basemap.name == 'ArcGIS' ?  layers[1].setVisible(true) : layers[1].setVisible(false);
        $scope.basemap.name == 'OpenStreetMap' ? layers[2].setVisible(true) : layers[2].setVisible(false);
        $scope.basemap.name == 'OpenCycleMap' ? layers[3].setVisible(true) : layers[3].setVisible(false);
        $scope.basemap.name == 'OpenTransportMap' ? layers[4].setVisible(true) : layers[4].setVisible(false);

        var i, ii;
        for (i = 5, ii = layers.length; i < ii; ++i) {
            layers[i].setVisible(styles[i+3] == $scope.basemap.name);
        }
        //layers[8].setVisible(true);
        //$rootScope.map.getLayers().getAt(8).setVisible(true);
    }
});

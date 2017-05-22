(function(){

var module = angular.module('websafe_service', [
    'websafe_config'
    ]);

module.factory('MapFunctions', [
    '$rootScope',
    '$http',
    '$q',
    'WebsafeConfig',
    function ($rootScope, $http, $q, WebsafeConfig) {
        // define some constants
        var map = $rootScope.map;
        var gmap = $rootScope.gmap;
        var view = map.getView();
        var proj = 'EPSG:4326';
        var version = '1.1.1';
        return {
            fetchLayers : function(url){
                var deferred = $q.defer();

                $http.get(url).success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config){
                    deferred.reject(status);
                });

                return deferred.promise;
            },
            fetchWMSLayer : function(resource_name){
                console.log(resource_name);
                layer_url = resource_name.split('_');
                bb = layer_url;
                console.log(bb);
                if (layer_url[1].substring(0,8) == 'Alluvial' ){
                    resource_name = layer_url[0] + ':' + layer_url[1].split(':')[1] + '_LandslideHazards';
                    console.log(resource_name);
                }

                else if (layer_url[0].substring(0,10) == 'Landslide:' ){
                    layer_url.splice(1,1);
                    // aa = layer_url.splice(1,1);
                    // bb = layer_url;
                    resource_name = layer_url.join('_');
                    console.log(resource_name);
                    // console.log(aa);
                    // console.log(bb);
                }

                var layer = new ol.layer.Image({
                    source: new ol.source.ImageWMS({
                        url: WebsafeConfig.geoserver_url,
                        params: {
                            'SERVICE': 'WMS',
                            'VERSION': version,
                            'LAYERS': resource_name,
                            'SRS': proj
                        },
                        serverType: 'geoserver',
                    }),
                    opacity: 0.5

                });
                return layer;
            },

            getWMSLayers : function(){
                var layers = [];

                map.getLayers().forEach(function(layer) {
                    if (layer instanceof ol.layer.Image){
                        layers.push(layer);
                    }
                });

                return layers;
            },

            getAllLayers : function(){
                return map.getLayers().getArray();
            },

            removeAllWMSLayers : function(){
                var layer_array = [];

                // first populate a temp array of the layers to be removed
                map.getLayers().forEach(function(layer) {
                    if (layer instanceof ol.layer.Image){
                        layer_array.push(layer);
                    }
                });

                // remove all the layers in the temp array
                for(var i=0; i < layer_array.length; i++){
                    map.removeLayer(layer_array[i]);
                }
            },

            zoomToCenter : function(center){
                var ol_center = ol.proj.transform([center.lng, center.lat], 'EPSG:4326', 'EPSG:3857');
                var resolution = 40;
                var duration = 1500;
                var start = +new Date();

                var pan = ol.animation.pan({
                    duration: duration,
                    source: map.getView().getCenter(),
                    start: start
                });

                var zoom = ol.animation.zoom({
                    duration: duration,
                    resolution: map.getView().getResolution()
                });

                map.beforeRender(zoom, pan);
                view.setResolution(resolution);
                view.setCenter(ol_center);
            },

            getLegend : function(layer_name){
                var url = geoserver_url + '?REQUEST=GetLegendGraphic&VERSION=' +
                        version + '&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=' +
                        layer_name + '&LEGEND_OPTIONS=fontName:Arial;forceLabels:on;';

                return url;
            }
        }
    }
]);

module.factory('WebsafeFunctions', [
    '$rootScope',
    '$http',
    '$q',
    'WebsafeConfig',
    function ($rootScope, $http, $q, WebsafeConfig) {

        return {
            calculate : function(params){
                var deferred = $q.defer();

                $http.get(WebsafeConfig.calculate_url, {params: params})
                .success(function(data, status, headers, config) {
                    console.log(data);
                    deferred.resolve(data);
                }).error(function(data, status, headers, config){
                    deferred.reject(status);
                });

                return deferred.promise;
            },

            getprofile : function(params){
                var deffered = $q.defer();

                $http.get(WebsafeConfig.profile_url, {params: params}).
                success(function(data,status,headers,config){
                    console.log(data);
                    deffered.resolve(data);
                }).error(function(data,status,headers,config){
                    deffered.reject(status);
                });
            },

            getdata : function(params){
                var deferred = $q.defer();

                $http.get(WebsafeConfig.data_url, {params: params})
                .success(function(data, status, headers, config) {
                    console.log(data);
                    deferred.resolve(data);
                }).error(function(data, status, headers, config){
                    deferred.reject(status);
                });

                return deferred.promise;
            },

            getmetadata : function(params){
                var deferred = $q.defer();

                $http.get(WebsafeConfig.metadata_url, {params: params})
                .success(function(data, status, headers, config) {
                    console.log(data);
                    deferred.resolve(data);
                }).error(function(data, status, headers, config){
                    deferred.reject(status);
                });

                return deferred.promise;
            },

            searchAndSortPSGC : function(list, psgc){
                var to_return = [];

                for(var i=0; i<list.length; i++){
                    var layer_list = list[i].layer_array;
                    var temp_json = {
                        'category' : list[i].category,
                        'type_id' : list[i].type_id,
                        'layer_array' : []
                    };

                    for(var j=0; j<layer_list.length; j++){
                        if(layer_list[j].psgc == psgc){
                            temp_json.layer_array.push(layer_list[j]);
                        }
                    }
                    to_return.push(temp_json);
                }

                return to_return;
            }
        }
    }
]);

})();
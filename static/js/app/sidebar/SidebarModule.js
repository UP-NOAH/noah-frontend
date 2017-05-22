'use strict';

var module = angular.module('sidebar_module', [
    'window_service',
    'sidebar_service'
]);

module.controller('ModalInstanceCtrl', [
    '$scope',
    '$modalInstance',
    function($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);

module.controller('SidebarCtrl', [
    '$scope',
    '$modal',
    '$rootScope',
    '$q',
    'DSCacheFactory',
    'ReqService',
    'SectionService',
    '_',
    'Layers',
    'Facilities',
    'Sensors',
    function($scope, $modal, $rootScope, $q, DSCacheFactory, ReqService, SectionService, _, Layers,Facilities , Sensors){

        $scope.cache = DSCacheFactory('noahcache');
        $scope.map_link = '#/';

        // Retrieve data of icons to be showed
        // on the sidebar
        //
        ReqService.getIcons(function(results) {
            $scope.dataLoaded = false;
            $scope.icons = results;
            $scope.dataLoaded = true;
        });

//        ReqService.getMapboxLayers(function(results) {
//           $rootScope.hazards = results;
//        });

        $scope.selected = '';
        $scope.locations = ['Alabel, Sarangani', 'Alaminos, Pangasinan', 'Angeles, Pampanga', 'Antipolo, Rizal', 'Aparri, Cagayan', 'Bacolod, Negros Occidental', 'Bago, Negros Occidental', 'Baguio, Benguet', 'Bais, Negros Oriental', 'Balanga, Bataan', 'Bangued, Abra', 'Basco, Batanes', 'Batac City, Ilocos Norte', 'Batangas City, Batangas', 'Bayawan, Negros Oriental', 'Bayombong, Nueva Vizcaya', 'Binan, Laguna', 'Bislig, Surigao del Sur', 'Boac, Marinduque', 'Bongao, Tawi-Tawi', 'Bontoc, Mountain Province', 'Borongan, Eastern Samar', 'Bulalacao, Oriental Mindoro', 'Butuan, Agusan del Norte', 'Cabanatuan, Nueva Ecija', 'Cabarroguis, Quirino', 'Cadiz, Negros Occidental', 'Cagayan de Oro, Misamis Oriental', 'Calamba, Laguna', 'Calapan, Oriental Mindoro', 'Calbayog, Samar', 'Caloocan, Metro Manila', 'Candon, Ilocos Sur', 'Canlaon, Negros Oriental', 'Catanauan, Quezon', 'Catarman, Northern Samar', 'Cauayan, Isabela', 'Cavite City, Cavite', 'Cebu City, Cebu', 'Claveria, Masbate', 'Coron, Palawan', 'Cotabato City, Maguindanao', 'Daet, Camarines Norte', 'Dagupan, Pangasinan', 'Danao, Cebu', 'Dapitan, Zamboanga del Norte', 'Dasmarinas, Cavite', 'Dipolog, Zamboanga del Norte', 'Dumaguete, Negros Oriental', 'El Nido, Palawan', 'Escalante, Negros Occidental', 'Gapan, Nueva Ecija', 'General Santos, South Cotabato', 'Gingoog, Misamis Oriental', 'Guimba, Nueva Ecija', 'Himamaylan, Negros Occidental', 'Iba, Zambales', 'Ilagan City, Isabela', 'Iligan, Lanao del Norte', 'Iloilo City, Iloilo', 'Infanta, Quezon', 'Iriga, Camarines Sur', 'Isabela, Basilan', 'Isulan, Sultan Kudarat', 'Jolo, Sulu', 'Jordan, Guimaras', 'Kabankalan, Negros Occidental', 'Kabugao, Apayao', 'Kalibo, Aklan', 'Kidapawan, Cotabato', 'Koronadal, South Cotabato', 'La Carlota, Negros Occidental', 'Lagawe, Ifugao', 'Laoag, Ilocos Norte', 'Lapu-Lapu City, Cebu', 'Las Pinas, Metro Manila', 'Legazpi, Albay', 'Ligao, Albay', 'Lipa, Batangas', 'Lucena, Quezon', 'Maasin, Southern Leyte', 'Maitum, Sarangani', 'Makati, Metro Manila', 'Malabon, Metro Manila', 'Malolos, Bulacan', 'Mamburao, Occidental Mindoro', 'Mandaluyong, Metro Manila', 'Mandaue, Cebu', 'Manila, Metro Manila', 'Marawi, Lanao del Sur', 'Marikina, Metro Manila', 'Masbate City, Masbate', 'Meycauayan, Bulacan', 'Munoz, Nueva Ecija', 'Muntinlupa, Metro Manila', 'Naga, Camarines Sur', 'Naval, Biliran', 'Navotas, Metro Manila', 'Olongapo, Zambales', 'Ormoc, Leyte', 'Oroquieta, Misamis Occidental', 'Ozamiz City, Misamis Occidental', 'Pagadian, Zamboanga del Sur', 'Pagudpud, Ilocos Norte', 'Palayan, Nueva Ecija', 'Paranaque, Metro Manila', 'Pasay, Metro Manila', 'Pasig, Metro Manila', 'Passi, Iloilo', 'Puerto Princesa, Palawan', 'Quezon City, Metro Manila', 'Romblon, Romblon', 'Roxas City, Capiz', 'Sagay, Negros Occidental', 'Salcedo, Eastern Samar', 'San Carlos, Negros Occidental', 'San Carlos, Pangasinan', 'San Fernando, La Union', 'San Fernando, Pampanga', 'San Jose del Monte, Bulacan', 'San Jose, Antique', 'San Jose, Nueva Ecija', 'San Juan, Metro Manila', 'San Mateo, Rizal', 'San Pablo City, Laguna', 'Sta Rosa, Laguna', 'Santiago, Isabela', 'Silay, Negros Occidental', 'Sindangan, Zamboanga del Norte', 'Sipalay, Negros Occidental', 'Sorsogon, Sorsogon', 'Surigao City, Surigao del Norte', 'Tabaco, Albay', 'Tabuk, Kalinga', 'Tacloban, Leyte', 'Tacurong, Sultan Kudarat', 'Tagaytay, Cavite', 'Tagbilaran, Bohol', 'Taguig, Metro Manila', 'Talisay, Cebu', 'Talisay, Negros Occidental', 'Tanauan, Batangas', 'Tangub, Misamis Occidental', 'Tanjay, Negros Oriental', 'Tarlac, Tarlac', 'Toledo, Cebu', 'Trece Martires, Cavite', 'Tuguegarao, Cagayan', 'Tungawan, Zamboanga Sibugay', 'Urdaneta, Pangasinan', 'Valenzuela, Metro Manila', 'Victorias, Negros Occidental', 'Vigan, Ilocos Sur', 'Virac, Catanduanes', 'Zamboanga City, Zamboanga'];
        $scope.municipalities = []

        $scope.getSplash = function(location) {
            $scope.selected = '';
            $scope.location = location;
            ReqService.getSplash(location)
                .then(function(data) {
                    $scope.date_today = data['date_today'];
                    $scope.last_update = data['last_update'];
                    $scope.source = data['source'];
                    $scope.forecasts = data['data'];
                }, function(error) {
                    console.log(error);
                })
        };

        //forecast modal instance
        $scope.modalInstance = null;

        $scope.open = function () {
            //manila by default
            $scope.getSplash('Manila, Metro Manila');
            $scope.modalInstance = $modal.open({
                templateUrl: 'forecast.html',
                controller: 'ModalInstanceCtrl',
                /*backdrop: 'static',
                keyboard: false,*/
                scope: $scope
            });
        };

        $scope.open();

        $scope.SevDayResultReady = false;

        $scope.get7DayResult = function(location){
            $scope.SevDayResultReady = false;
            $scope.location7 = location;
            var id = $scope.municipalities.indexOf(location) + 1;
            ReqService.getSevenday(id)
                .then(function(data){
                    $scope.last_updated = data['last_updated'];
                    $scope.forecasts = data['data'];
                    $scope.SevDayResultReady = true;
                }, function(error) {
                    console.log(error);
                })
        }

        $scope.toggle7Day = function(component){
            if ($scope.municipalities.length <= 0){
                for (var i = 0;i < component.data.length;i++){
                    $scope.municipalities.push(component.data[i]["verbose_name"].replace(/_/g, ',').replace(/([A-Z])/g, ' $1').trim());
                };
            }
            //Default
            $scope.get7DayResult("Manila, Metropolitan Manila");
        };

        $scope.dataPerDate = null;
        $scope.showDataPerDate = function(data){
             $scope.dataPerDate = data;
         }

        $scope.getImg = function(image){
            if (image.charAt(0) == 'R'){
                switch (image.charAt(-2)){
                    case '0':
                        return 'Rain0.png';
                    case '1':
                        return 'Rain1.png';
                    case '2':
                        return 'Rain2.png';
                    default:
                        return 'Rain34.png';
                }
            }
            else return image + '.png';
        }

        $scope.getMinMaxTemp = function(val,read){
            try{
                if (read != null){
                    var tempArray = []
                    for (var i = 0;i < read.length;i++){
                        if (read[i]['heat_index'].length > 6) {
                            var tempRange = read[i]['heat_index'].split('-');
                            tempArray.push(parseFloat(tempRange[0]).toFixed(1));
                            tempArray.push(parseFloat(tempRange[1]).toFixed(1));
                        }
                        else tempArray.push(parseFloat(read[i]['heat_index']).toFixed(1));
                    }
                    if (val == 1)  return Math.max.apply(null,tempArray);
                    else return Math.min.apply(null,tempArray);
                }
            }
            catch(err){
                console.log(err);
            }
        }

        $scope.getMaxRain = function(read){
            if (read != null){
                var maxAmt = 0.0;
                var index = -1;
                for (var i = 0;i < read.length;i++){
                    if (parseFloat(read[i]['rainfall']) > maxAmt){
                        maxAmt = parseFloat(read[i]['rainfall']);
                        index = i;
                    }
                }
                if (index == -1 || read[index]['icon'] == "ClearN"){
                    return $scope.getImg("ClearD");
                }
                else{
                    return $scope.getImg(read[index]['icon']);
                }
            }
            else{
                return $scope.getImg("ClearD");
            }
        }

        //toggle visibility
        $scope.showHideLayer = function(index, $event) {
            var i = $scope.layers.length - index - 1;
            console.log($scope.layers[i]);
            if($scope.layers[i].tag == "landslide" || $scope.layers[i].tag == 'stormsurge' || $scope.layers[i].tag == 'flood' || $scope.layers[i].tag == 'boundary') {
                console.log($scope.layers[i].name);
                $scope.layers[i].overlay_layer.setVisible(!$scope.layers[i].overlay_layer.getVisible());
            }
            else if($scope.layers[i].tag == "facility" || $scope.layers[i].tag == "ovindex"){
                console.log($scope.layers[i].name);
                $rootScope.facilityMarkers[$scope.layers[i].name][0].setVisible(!$rootScope.facilityMarkers[$scope.layers[i].name][0].getVisible());
            }
            else if($scope.layers[i].name){
                console.log($scope.layers[i].name);
                $rootScope.markers[$scope.layers[i].name][0].setVisible(!$rootScope.markers[$scope.layers[i].name][0].getVisible());
            }
            else if($scope.layers[i].outlook_name){
                console.log($scope.layers[i].outlook_name);
                $rootScope.markers[$scope.layers[i].outlook_name][0].setVisible(!$rootScope.markers[$scope.layers[i].outlook_name][0].getVisible());
            }
            else if($scope.layers[i].report_name){
                console.log($scope.layers[i].report_name);
                $rootScope.markers[$scope.layers[i].report_name][0].setVisible(!$rootScope.markers[$scope.layers[i].report_name][0].getVisible());
            }
            else if($scope.layers[i].sub_section_name != undefined){
                console.log($scope.layers[i].sub_section_name);
                $scope.layers[i].sub_section_layer.setVisible(!$scope.layers[i].sub_section_layer.getVisible());
            }
        };

        // Update Opacity
        $scope.opa = [];

        $scope.updateOpacity = function(index, $event) {
            var i = $scope.layers.length - index - 1;
            var _computedOpacity =  $scope.opa[index]/100;

            if ($scope.layers[i].tag == "landslide" || $scope.layers[i].tag == 'stormsurge' || $scope.layers[i].tag == 'flood' || $scope.layers[i].tag == 'boundary') {
                console.log($scope.layers[i].name);
                $scope.layers[i].overlay_layer.setOpacity(_computedOpacity);
                console.log($scope.layers[i].overlay_layer.getOpacity());
            }
            else if($scope.layers[i].tag == "facility" || $scope.layers[i].tag == "ovindex"){
                console.log($scope.layers[i].name);
                $rootScope.facilityMarkers[$scope.layers[i].name][0].setOpacity(_computedOpacity);
                console.log($rootScope.facilityMarkers[$scope.layers[i].name][0].getOpacity());
            }
            else if($scope.layers[i].name){
                console.log($scope.layers[i].name);
                $rootScope.markers[$scope.layers[i].name][0].setOpacity(_computedOpacity);
                console.log($rootScope.markers[$scope.layers[i].name][0].getOpacity())
            }
            else if($scope.layers[i].outlook_name){
                console.log($scope.layers[i].outlook_name);
                $rootScope.markers[$scope.layers[i].outlook_name][0].setOpacity(_computedOpacity);
                console.log($rootScope.markers[$scope.layers[i].outlook_name][0].getOpacity())
            }
            else if($scope.layers[i].report_name){
                console.log($scope.layers[i].report_name);
                $rootScope.markers[$scope.layers[i].report_name][0].setOpacity(_computedOpacity);
                console.log($rootScope.markers[$scope.layers[i].report_name][0].getOpacity())
            }
            else if($scope.layers[i].sub_section_name != undefined){
                console.log($scope.layers[i].sub_section_name);
                $scope.layers[i].sub_section_layer.setOpacity(_computedOpacity);
                console.log($scope.layers[i].sub_section_layer.getOpacity())
            }
        }

        // Remove overlayed layers functionality
        $scope.removeLayer = function(index, $event) {
            var _index = index;
            var isStation = $($event.target).closest('ul').text().search('Station') >= 0 ? true : false;
            var isSatellite = $($event.target).closest('ul').text().search('Image') >= 0 ? true : false;
            var other = $rootScope.layers.length - Layers.Doppler.active.length;
            index = $scope.layers.length-index-1;
            !$.isEmptyObject(Layers.Satellite.active) ? Layers.Satellite.position > index ? other = other - 1 : '' : '';
            if ($scope.layers[index].sub_section_name) {
                Layers.toggle($scope.layers[index]);
                var key = Layers.Doppler.active.length - _index;
                isStation ? Layers.Doppler.removeActive(other > 0 ? Layers.Doppler.other > index ? key : key - other : index) : '';
                isSatellite ? Layers.Satellite.clearActive() : '';
            } else if ($scope.layers[index].outlook_name) {
                $('.tables').fadeOut(300);
                Layers.toggleForecast($scope.layers[index]);
            } else if ($scope.layers[index].report_name) {
                Layers.toggleReport($scope.layers[index]);
            } else if ($scope.layers[index].tag == "facility" || $scope.layers[index].tag == "ovindex"){
                console.log($scope.layers[index]);
                Facilities.toggle($scope.layers[index]);
            } else if($scope.layers[index].tag == "landslide" || $scope.layers[index].tag == 'stormsurge' || $scope.layers[index].tag == 'flood' || $scope.layers[index].tag == 'boundary'){
                    console.log($scope.layers[index]);
                    $rootScope.map.removeLayer($scope.layers[index].overlay_layer);
                    $rootScope.layers.splice($rootScope.layers.indexOf($scope.layers[index]),1);
            }else if ($scope.layers[index].hazard_layer_name) {
                Layers.toggleHazardMap($scope.layers[index]);
            } else if ($scope.layers[index].name) {
                $('#charts').fadeOut(300);
                Sensors.toggle($scope.layers[index]);
            } else if ($scope.layers[index].draw_layer_name) {
                $rootScope.map.removeLayer($scope.layers[index]);
                $rootScope.layers.splice(index,1);
                $rootScope.createDrawLayer();
            }
        }

        $scope.downloadLayer = function(index) {
            index = $scope.layers.length-index-1
            console.log($scope.layers[index]);
            $.ajax({
                url: '/download',
                type: 'GET',
                dataType: 'json',
                data: {geoserver_layer:$scope.layers[index].geoserver_layer},
                success: function(value) {
                    console.log('AJAX: success');
                }
            });
        }

        $scope.tourMeDetails = [
            { title : 'TOGGLE DRAW', description : 'Toggles the Draw layer on and off to allow users to measure distance and area.' },
            { title : 'GET DISTANCE', description : 'Measures linear distance on map.' },
            { title : 'GET AREA', description : 'Measures area of polygon on map.' },
            //{ title : 'SEARCH AREA', description : 'Allows you to search for a specific place (eg. municipality, district, landmark, etc.) to zoom in on that area; powered by Google Maps.' },
            { title : 'MAP SELECTION', description : 'Allows you to choose among different map sources to use as base map.' },
            { title : 'ZOOM', description : 'Allows you to zoom in and out of the map.' },
            { title : 'WEATHER', description : 'Shows rain data, river inundation, Doppler and Satellite information, and weather outlook. ' },
            { title : 'SENSORS', description : 'Shows real-time information from rain gauges, weather stations, and tide levels.' },
            { title : 'FLOOD', description : 'Shows flood hazard maps and flood reports.' },
            { title : 'LANDSLIDES', description : 'Shows landslides hazards maps and landslide-related information.' },
            { title : 'STORM SURGE', description : 'Shows storm surge hazards maps and historical data.' },
            { title : 'BOUNDARIES', description : 'Shows provincial, municipal, barangay, and river basin boundaries.' },
            { title : 'CRITICAL FACILITIES', description : 'Shows schools, health facilities, police stations, and fire stations.' },
            { title : 'DENGUE MONITORING', description : 'Shows mosquito indices--a measurement of mosquito eggs in specified geographic locations which, in turn, reflects the distribution of Aedes mosquitoes, the vector for dengue.' },
            { title : 'WEBSAFE', description : 'Shows impact assessment of an area and computes for population-related data and building footprints in the event of a hazard.' },
            //{ title : 'MOSES', description : 'Mobile Operational System for Emergency Services.' },
            { title : 'RAINFALL DATA', description : 'Shows the rainfall record in mm/hr for places experiencing rainfall.' },
            { title : 'LATEST TWEETS', description : 'Shows latest tweets form PAGASA and ClimateX. Use this to complement information from this website. PAGASA tweets information regarding thunderstorms, typhoons and other weather related information.' }
        ];

        // start Tour Me
        //
        $scope.tourMe = function() {
            introJs()
            .setOptions({
                'skipLabel': '<i class="fa fa-close fa-fw"></i> Skip',
                'doneLabel': '<i class="fa fa-check fa-fw"></i> Done',
                'nextLabel' : 'Next <i class="fa fa-chevron-right fa-fw"></i>',
                'prevLabel' : '<i class="fa fa-chevron-left fa-fw"></i> Back',
                'scrollToElement' : true
            })
            .oncomplete(function(){
                swal({ title: "Good job!",
                       text : "Tour is done.<br/><small><em>Automatically close in 3 seconds.</em></small>",
                       type: "success",
                       timer: 3000,
                       html : true
                    });
            })
            .start();
        }

        // Retrieve all component's data to be stored
        // in the $rootScope and the browser's local storage
        //
        ReqService.getLinks()
            .then(function(data) {
                $scope.urls = data;
                $scope.urlslength = data.length;
                //console.log($scope.urls);
                if (!(_.isUndefined($scope.cache.get('data')))) {
                    $rootScope.cacheData = $scope.cache.get('data');
                }

                var data = {}, split = [], list = [];
                for (var ctr = 0; ctr < $scope.urlslength; ctr++) {

                split = $scope.urls[ctr].split('/');
                list.push(SectionService.get({

                    component: split[1],
                    section: split[2]

                }).$then(function(data) {
                    if (!(_.isUndefined(data.data))) {
                        return data.data;
                    }
                    return null
                }, function(error){
                    //When error occurs after calling the url
                    console.log("Error at sidebar url");
                    return {}
                }

                ));
                }

                $q.all(list).then(function (results) {
                    var toBeCached = {}
                    var toBeRoot = {}
                    for (var n = 0; n < results.length; n++){
                        data[$scope.urls[n]] = results[n];

                        if (n < 3) {
                            toBeCached[$scope.urls[n]] = data[$scope.urls[n]];
                        } else {
                            toBeRoot[$scope.urls[n]] = data[$scope.urls[n]];
                        }
                    }

                    $scope.cache.put('data', toBeCached);
                    if (_.isEmpty($rootScope.cacheData)) {
                        $rootScope.rootData = data;
                    } else {
                        $rootScope.rootData = _.extend(toBeRoot, $rootScope.cacheData);
                    }

                })

            }, function(error) {
                console.log("Error: ", error);
            });

    }
]);

module.controller('Menu1Ctrl', [
    '$scope',
    '$http',
    '$routeParams',
    '$rootScope',
    'Sensors',
    'Layers',
    '_',
    'Facilities',
    'ReqService',
    function($scope, $http, $routeParams, $rootScope, Sensors,Layers, _, Facilities,ReqService) {

        // Retrieve component's data from $rootScope
        // and stored to $scope.component
        //
        $rootScope.url = '/' + $routeParams.component + '/' + $routeParams.section;
        $scope.component = $rootScope.rootData[$rootScope.url];
        console.log($scope.component);
        // Validation of the component's data structure
        //
        try{
            if (_.isUndefined($scope.component['data']) || _.isEmpty($scope.component['data'])) {

            } else if (!(_.has($scope.component['data'][0], "sub_section_extent"))) {

            } else {
                for (var ctr = 0; ctr < $scope.component['data'].length; ctr++) {
                    var data = $scope.component['data'][ctr];
                    if (_.has(data, 'sub_section_state'))
                        break

                    Layers.load(data);
                    if($routeParams.section == "dopplers") {
                        data.sub_section_url = data.sub_section_url.replace('/img/','/radar/last5/');
                        Layers.Doppler.url.push(data.sub_section_url);
                        Layers.Doppler.setLayer(ctr, data);
                    } else if($routeParams.section == "satellites") {
                        Layers.Satellite.url.push(data.sub_section_url);
                    }
                }
            }
        }
        catch(err) {
            //console.log($rootScope.url);
        }

        

        /*if(!Layers._animate.running) {
            Layers._animate.start();
        }
        */
        // Handles OpenLayers 3 methods to be used
        // on the map
        //
        $scope.toggleLayer = function(index) {
            Layers.toggle($scope.component['data'][index]);
        }

        $scope.checkLayer = function(hazard_layer){
            var res = false;
            for (var i=0;i<$rootScope.layers.length;i++) {
                if ($rootScope.layers[i] === $scope.component) { //check if layer exists
                    res = true; //if exists, return true
                }
            }

            return res;
        }

        $scope.plotData = function(type) {
            $scope.component = $rootScope.rootData['/sensors/' + type];
            Sensors.toggle($scope.component);
        }

        //Ito yung para dun sa merge layers
        if($routeParams.component == "geoserver"){

            var hazard_layer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                url: '#####',
                params: {
                    'LAYERS': $scope.component.layer,
                    'TILED': true,
                        'FORMAT': 'image/png'
                }}),
                opacity:0.3
            });
            var hazard_data = {"sub_section_state":"off","sub_section_name":$routeParams.section.concat(" hazard layer"),"sub_section_layer":hazard_layer};

            /*
            var res = false;
            for (var i=0;i<$rootScope.layers.length;i++) {
                if ($rootScope.layers[i] === $scope.component) { //check if layer exists
                    res = true; //if exists, return true
                    //console.log("LAYER EXISTS");
                }
            }*/

            if ($scope.checkLayer(hazard_layer)){
                //console.log("LAYER EXISTS");
            }
            else{
                $scope.component['overlay_layer'] = hazard_layer;
                $rootScope.map.addLayer(hazard_layer);
                $rootScope.layers.push($scope.component);
            }

        }

        if($routeParams.component == "boundary"){
            if($routeParams.section != "all"){
                var boundaryLayer = new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                    url: '#####',
                    params: {
                        'LAYERS': $scope.component.layer,
                        'TILED': true,
                            'FORMAT': 'image/png'
                    }}),
                    opacity:1.0
                });

                if(!$scope.checkLayer(boundaryLayer)){
                    $rootScope.map.addLayer(boundaryLayer);
                    $scope.component['overlay_layer'] = boundaryLayer;
                    $rootScope.layers.push($scope.component);
                }
            }

        }

        if($routeParams.component == "facility"){

            //News marker logos
            if($routeParams.section != 'all'){
                  Facilities.toggle($scope.component);
            }

        }

        if($routeParams.component == "mosquito"){
            if($routeParams.section != 'all'){
                Facilities.toggle($scope.component);
            }
        }




        $scope.addToMap = function(index) {

            if ($routeParams.section == "floodreports") {
                ReqService.getReports($scope.component['data'][index]['sub_section_name'])
                    .then(function(data) {
                        data['report_name'] = $scope.component['data'][index]['sub_section_name']+' Flood Report';
                        Layers.toggleReport(data);
                    }, function(error) {
                        console.log(error);
                    })

            //dito ung storm track
            }

            else if ($routeParams.section == "weatheroutlook") {
                //console.log($scope.component['data'][index]);
                ReqService.getForecasts($scope.component['data'][index]['sub_section_url'])
                    .then(function(data) {
                        data['outlook_name'] = $scope.component['data'][index]['sub_section_name'];
                        if (data['outlook_name'] == "PAGASA Cyclone Update") {
                            Layers.toggleTrack(data);
                        }
                        else if (data['outlook_name'] == "7-Day Weather Forecast"){
                            $scope.toggle7Day(data);
                        }
                        else {
                            Layers.toggleForecast(data);    
                        }
                        
                    }, function(error) {
                        var mensahe = [
                            // { title: "May Bagyo ba?",
                            //   text : "WALA. Parang love life mo.<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //   type: "info",
                            //   timer: 10000,
                            //   html : true
                            // },
                            // { title: "May Bagyo ba?",
                            //    text : "WALA. Parang yung alam ni Jon Snow.<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //    type: "info",
                            //    timer: 10000,
                            //    html : true
                            // },
                            // { title: "May Bagyo ba?",
                            //   text : "Check mo laman ng wallet mo. Wala diba?<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //   type: "info",
                            //   timer: 10000,
                            //   html : true
                            // },
                            // { title: "May Bagyo ba?",
                            //   text : "Wala pa po ma'am/sir. Willing to wait?<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //   type: "info",
                            //   timer: 10000,
                            //   html : true
                            // },
                            // { title: "May Bagyo ba?",
                            //   text : "Akala mo lang meron! Pero wala, wala, WALA!<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //   type: "info",
                            //   timer: 10000,
                            //   html : true
                            // },
                            // { title: "May Bagyo ba?",
                            //   text : "Parang forever, WALA.<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //   type: "info",
                            //   timer: 10000,
                            //   html : true
                            // },
                            // { title: "May Bagyo ba?",
                            //   text : "Wala, parang relationship status nyo.<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //   type: "info",
                            //   timer: 10000,
                            //   html : true
                            // },
                            // { title: "No Track Available",
                            //    text : "There is no active Tropical Cyclone within the Philippine Area of Responsibility.<br/><small><em>This window will automatically close in 10 seconds.</em></small>",
                            //    type: "info",
                            //    timer: 10000,
                            //    html : true
                            // },
                            { title: "No Track Available",
                               text : "<small><em>This window will automatically close in 10 seconds.</em></small>",
                               type: "info",
                               timer: 10000,
                               html : true
                            }                            
                        ]; 
                        var randomText = Math.floor(Math.random() * (mensahe.length));
                        swal (mensahe[randomText]);
                        console.log(error);
                    });
            } else {
                if($routeParams.section == "dopplers") {
                    var isActive = Layers.Doppler.setActive(index);
                    isActive ? Layers._animate.focus($scope.component['data'][index], 8) : '';
                } else if($routeParams.section == "satellites") {
                    var status = Layers.Satellite.setActive($scope.component['data'][index], index);
                    status ? Layers._animate.focus($scope.component['data'][index], 5) : '';
                    Layers.Satellite.position = $rootScope.layers.length == 0 ? 0 : $rootScope.layers.length;
                } else {
                    Layers.Doppler.other = $rootScope.layers.length;
                    Layers.Satellite.clearActive();
                    Layers._animate.focus($scope.component['data'][index], 6);
                }
                $scope.toggleLayer(index);
            }
        }

    }
]);

module.controller('LocCtrl', [
    '$scope',
    '$rootScope',
    'Sensors',
    'Layers',
    '_',
    'ReqService',
    'filterFilter',
    function($scope, $rootScope, Sensors, Layers, _, ReqService, filterFilter) {

        $scope.selectedRegion = '', $scope.regions = '', $scope.provinces = '', $scope.municipals = '';
        $scope.hazardMaps = [], $scope.filteredProvinces = [];
        $scope.selectProvinceStr = "-- Province --";
        $scope.returnRateStr = "-- Return Rate --";

        // Retrieve component's data from $rootScope
        // and stored to $scope.component
        //
        $scope.component = $rootScope.rootData[$rootScope.url];
        if ($scope.component['name'] == "Storm Surge Advisory") {
            $scope.returnRateStr = "-- Advisory No. --";
        }

        ReqService.getLocations('regions')
            .then(function(data) {
                $scope.regions = data.data;
            }, function(error) {
                console.log(error);
            })

        ReqService.getLocations('provinces')
            .then(function(data) {
                $scope.provinces = data.data;
            }, function(error) {
                console.log(error);
            })

        ReqService.getLocations('municipals')
            .then(function(data) {
                $scope.municipals = data.data;
            }, function(error) {
                console.log(error);
            })

        // Data to be plotted to the map
        // in accordance to the component's data
        //
        if ($scope.component['tag'] == "landslide") {
            $scope.hazardMaps = $scope.component['landslide'];
        } else {
            $scope.component.data.forEach(function(rate) {
                rate.layers.forEach(function(map) {
                    var hazardMap = map;
                    hazardMap['name'] = rate.name;
                    $scope.hazardMaps.push(hazardMap);
                })
            })

        }

        // Determine a change in values of the
        // corresponding locations
        //
        $scope.selectedRegion = $scope.regions[0];
        $scope.$watch("selectedRegion", function (value) {
            if (value != null) {
                // Selects a subset of items from the array
                // $scope.provinces and return as a new array
                //
                $scope.filteredProvinces = filterFilter($scope.provinces, {region: $scope.selectedRegion.region});
                $scope.selectedProvince = null;

                // Determine if province selected is 'NCR'
                // then change placeholder
                //
                if ($scope.selectedRegion.name == "NCR") {
                    $scope.selectProvinceStr = "-- District --";
                } else {
                    $scope.selectProvinceStr = "-- Province --";
                }

                // if ($scope.component['name'] == 'Alluvial Fan') {
                //     console.log('alluvial here!');
                //     var testString = $scope.selectedRegion.region.substring(0, 2);
                //     console.log('1st 2 chars of Region: ', testString);
                //     //$scope.filterRegionFromMunicipalPSGC = filterFilter($scope.selectedRegion)
                // }
            } else {
                $scope.selectedProvince = value;
            }

        },true);

        $scope.$watch("selectedProvince", function (value) {
            if (value != null) {
                // Selects a subset of items from the array
                // $scope.municipals and return as a new array
                //
                $scope.filteredMunicipals = filterFilter($scope.municipals, {region: $scope.selectedProvince.region, province: $scope.selectedProvince.province});
                $scope.filteredFloodMaps = [];

            } else {
                $scope.selectedMunicipal = value;
            }

        },true);

        $scope.$watch("selectedMunicipal", function (value) {
            if (value != null) {
                // Selects a subset of items from the array
                // $scope.hazardMaps and return as a new array
                //
                $scope.filteredFloodMaps = filterFilter($scope.hazardMaps, {mun_city_psgc: $scope.selectedMunicipal.municipal});
                $scope.selectedFloodMap = null;

                // For landslides component
                //
                if ($scope.component['tag'] == 'landslide') {
                    Layers.toggleHazardMap($scope.filteredFloodMaps[0])
                }
            } else {
                $scope.filteredFloodMaps = [];
                $scope.selectedFloodMap = value;
            }
        },true);

        // Handles OpenLayers 3 methods to be used
        // on the map
        //
        $scope.addToMap = function(floodmap) {
            if (floodmap != null)
                Layers.toggleHazardMap(floodmap);
        }
    }
]);


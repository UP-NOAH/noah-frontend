(function(){

var module = angular.module('websafe_module', [
    'websafe_service',
    'ui.bootstrap',
    'ui.select2',
    'websafe_config',
    'ngSanitize'
]);

module.directive('chart', function() {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            chartData: "=value",
            chartObj: "=?"
        },
        transclude: true,
        replace: true,
        link: function($scope, $element, $attrs) {

            //Update when charts data changes
            $scope.$watch('chartData', function(value) {
                if (!value)
                    return;

                // Initiate the chartData.chart if it doesn't exist yet
                $scope.chartData.chart = $scope.chartData.chart || {};

                // use default values if nothing is specified in the given settings
                $scope.chartData.chart.renderTo = $scope.chartData.chart.renderTo || $element[0];
                if ($attrs.type)
                    $scope.chartData.chart.type = $scope.chartData.chart.type || $attrs.type;
                if ($attrs.height)
                    $scope.chartData.chart.height = $scope.chartData.chart.height || $attrs.height;
                if ($attrs.width)
                    $scope.chartData.chart.width = $scope.chartData.chart.type || $attrs.width;
                $scope.chartObj = new Highcharts.Chart($scope.chartData);
            });
        }
    };
});

module.config(['$tooltipProvider', function($tooltipProvider){
    $tooltipProvider.setTriggers({
        'mouseenter': 'mouseleave',
        'click': 'click',
        'focus': 'blur',
        'onTrigger': 'offTrigger'
    });
}]);

module.controller('ModalCtrl', [
    '$scope',
    '$modalInstance',
    function($scope, $modalInstance){
        $scope.exportChart = function(chartData) {
            var data = {
                options: JSON.stringify(chartData),
                filename: 'chart',
                type: 'image/png',
                async: true
            };

            var exportUrl = 'http://export.highcharts.com/';
            var url = '';
            $.ajax({
                type: 'POST',
                url: exportUrl,
                data: data,
                success: function(data) {
                    url = exportUrl + data;
                },
                async: false
            });
            return url;
        };
        $scope.viewPdf = function () {
            $("#viewPdf").html('<i class="fa fa-spinner fa-spin"></i> View PDF');
            $("#viewPdf").attr('disabled','disabled');

            var row1 = ''
            if ($scope.exposure.data.id == '2') {
                row1 = '<div id="row1">\
                        <table>\
                            <tr>\
                                <td rowspan="2" id="affected">\
                                    <img src="' + $scope.exportChart($scope.affectedPieChart) + '" />\
                                </td>\
                                <td colspan="2" id="total">\
                                    <div>\
                                        <img src="static/img/websafe/people_affected_population_100px.png" height="70" />\
                                        <div>\
                                            <h1 ng-bind="total">' + $scope.total + '</h1>\
                                            <span>Estimated Total Population*</span>\
                                        </div>\
                                    </div>\
                                </td>\
                            </tr>\
                            <tr>\
                                <td><img src="' + $scope.exportChart($scope.genderPieChart) + '"/></td>\
                                <td><img src="' + $scope.exportChart($scope.agePieChart) + '"/></td>\
                            </tr>\
                        </table>\
                        </div>\
                        <div id="estimate"><span>*Estimated population computed using current Philippine growthrate data.</span></div>';
            } else {
                row1 = '<div id="row1">\
                        <table>\
                            <tr>\
                                <td class="total">\
                                    <div>\
                                        <img src="static/img/websafe/infrastructure_building_100px.png" height="70" />\
                                        <div>\
                                            <h1>' + $scope.total + '</h1>\
                                            <span>Total Buildings*</span>\
                                        </div>\
                                    </div>\
                                </td>\
                                <td rowspan="2">\
                                    <div class="well text-center category">\
                                        <h3 class="high">'+ $scope.high +'</h3>\
                                        <p>High hazard areas</p>\
                                    </div>\
                                    <div class="well text-center category">\
                                        <h3 class="medium">' + $scope.medium + '</h3>\
                                        <p>Medium hazard areas</p>\
                                    </div>\
                                    <div class="well text-center category">\
                                        <h3 class="low">' + $scope.low + '</h3>\
                                        <p>Low hazard areas</p>\
                                    </div>\
                                </td>\
                            </tr>\
                            <tr>\
                                <td class="total">\
                                    <div>\
                                        <img src="static/img/websafe/disaster_flood_100px.png" height="70" />\
                                        <div>\
                                            <h1>' + $scope.total_impact + '</h1>\
                                            <span>Buildings Affected*</span>\
                                        </div>\
                                    </div>\
                                </td>\
                            </tr>\
                        </table>\
                        <h4>Breakdown by Housing Materials:</h4>\
                        <table>\
                            <tr>\
                                <td width="50%">\
                                    <div class="well text-center category breakdown">\
                                        <h3 class="material">3,006</h3>\
                                        <p>Wood</p>\
                                    </div>\
                                </td>\
                                <td width="50%">\
                                    <div class="well text-center category breakdown">\
                                        <h3 class="material">454</h3>\
                                        <p>Bamboo/Cogon/Nipa</p>\
                                    </div>\
                                </td>\
                            </tr>\
                            <tr>\
                                <td>\
                                    <div class="well text-center category breakdown">\
                                        <h3 class="material">206</h3>\
                                        <p>Makeshift/Improvised Materials</p>\
                                    </div>\
                                </td>\
                                <td>\
                                    <div class="well text-center category breakdown">\
                                        <h3 class="material">27</h3>\
                                        <p>Others</p>\
                                    </div>\
                                </td>\
                            </tr>\
                        </table>\
                        </div>';
            }

            $.ajax({
                url: '/showpdf',
                type: 'GET',
                dataType: 'json',
                data: {
                    body: $('#question').html() + row1 + $('#needs').html() + $('#checklist').html(),
                    location: $scope.location
                },
                success: function(value) {
                    $("#viewPdf").attr('disabled',false);
                    $("#viewPdf").html('View PDF');
                    window.open(value['url']);
                }
            });
        };
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };


    }
]);

module.controller('WebsafeCtrl', [
    '$scope',
    '$window',
    '$modal',
    '$timeout',
    '$rootScope',
    'MapFunctions',
    'WebsafeFunctions',
    'WebsafeConfig',
    function($scope, $window, $modal, $timeout, $rootScope, MapFunctions, WebsafeFunctions, WebsafeConfig){
        $scope.orig_haz_list = [];
        $scope.orig_exp_list = [];
        $scope.letterClicked = ''

        $scope.init = function(){
            $scope.hazard = { type: 'haz' };
            $scope.exposure = { type: 'exp' };
            $scope.hazard_list = $scope.orig_haz_list;
            $scope.exposure_list = $scope.orig_exp_list;
            $scope.hazard_selected = '__________';
            $scope.exposure_selected = '__________';
            $scope.impact_selected = '__________';
            $scope.impact_functions = WebsafeConfig.impact_functions;
            $scope.impact = {impact_function : WebsafeConfig.impact_functions[0].value};
            $scope.header = '';
            $scope.html = '';
            $scope.resultReady = false;
            $scope.l = null;
            $('.legend_hazard').draggable();
            $('.legend_exposure').draggable();
            $('.legend_impact').draggable();
            MapFunctions.removeAllWMSLayers();
        };
        $scope.init();

        $scope.exposure_selector = { width: '200px' };
        $scope.hazard_selector = { width: '200px' };
        $scope.impact_selector = { width: '200px', minimumResultsForSearch: -1 };
        $scope.onTrigger = function(target){
            $timeout(function() { $(target).trigger('onTrigger'); }, 0);
        };

        $scope.offTrigger = function(target){
            $timeout(function() { $(target).trigger('offTrigger'); }, 0);
        };

        $scope.showClicked = function (letter) {
            $scope.letterClicked = letter;
            console.log($scope.letterClicked);
        }
        // TODO: modal init
        // This function creates and opens a modal instance
        $scope.open = function () {
            var modalInstance = $modal.open({
                templateUrl: $scope.templateUrl,
                controller: 'ModalCtrl',
                scope: $scope,
                windowClass: 'websafe-modal',
            });
        };

        MapFunctions.fetchLayers(WebsafeConfig.exposure_url)
            .then(function(data){
                $scope.orig_exp_list = data;
                $scope.exposure_list = $scope.orig_exp_list;
            });
        MapFunctions.fetchLayers(WebsafeConfig.hazard_url)
            .then(function(data){
                $scope.orig_haz_list = data;
                $scope.hazard_list = $scope.orig_haz_list;
            });

        // this is a listener for every change in the layer selectors(exposure and hazard)
        $scope.layerChanged = function(layer){
            var data = {};
            if (layer.json_string != ""){
                data = angular.fromJson(layer.json_string);
                layer.data = data;
                if (layer.layer != null){
                    $rootScope.map.removeLayer(layer.layer);
                }

                var list = (layer.type == "haz") ? $scope.hazard_list : $scope.exposure_list;

                if (layer.type == "haz"){
                    $scope.haz_layer_text = layer;
                    layer.haz_type = layer.data.haz_type;
                    $scope.exposure_list = WebsafeFunctions.searchAndSortPSGC($scope.orig_exp_list, layer.data.psgc);
                }else{
                    $scope.hazard_list = WebsafeFunctions.searchAndSortPSGC($scope.orig_haz_list, layer.data.psgc);
                }

                for (var i=0; i<list.length; i++){
                    if(list[i].type_id == layer.data.id){
                        layer.category = list[i].category;
                    }
                }

                // this is where the layer name(displayed in WebSAFE question form) is composed
                switch(layer.category){
                    case "Building Footprints":
                        layer.name = data.verbose_name + " buildings";
                        $scope.exposure_selected = "buildings";
                        break;
                    case "Populations":
                        layer.name = data.verbose_name + " population";
                        $scope.exposure_selected = "people";
                        $scope.impact_selected = "need evacuation";
                        break;
                    // default, for floods.
                    default:
                        $scope.hazard_selected = layer.category + ' in ' + data.verbose_name + ', ' + data.province_verbose_name;
                        layer.name = data.verbose_name + ' '
                            + layer.category + ' ' + layer.haz_type;
                        if (layer.data.id <= 5){
                            $scope.impact_selected = "be flooded";
                        } else {
                            $scope.impact_selected = "be affected";
                        }
                        break;
                }

                MapFunctions.zoomToCenter(data.center);
                layer.layer = MapFunctions.fetchWMSLayer(data.resource_name);
                //layer.legend = MapFunctions.getLegend(data.resource_name);
                $rootScope.map.addLayer(layer.layer);
                //layer.showLegend = true;
            }
        };

        $scope.isCanvasBlank = function(canvas) {
            var blank = document.createElement('canvas');
            blank.width = canvas.width;
            blank.height = canvas.height;

            return canvas.toDataURL() == blank.toDataURL();
        };

        /*
            $scope.function to fetch all additional data{
                *params PSGC

                list = [list of tables(per tab)]

                iterate list:
                    $scope.table = table:{dictionary from Handler by michael}

                *
             }
        */

        $scope.fetchAdditionalPopData = function(psgc,type){

            $scope.getAdditionalData = function(psgc,table) {
                $.getJSON("websafe/additionaldata?psgc="+psgc+"&table="+table, function(data) {
                    $scope.additionalData[table] = data;
                    console.log($scope.additionalData[table]);
                });
            };
            if(type == '2'){
                var tables = ['hhhqualities',"poverty","unemployment",'atriskpopulation'];
            }
            else{
                var tables = ['housing','ownership','environmentalfactors'];
            }
            $scope.additionalData = {};

            for(var i = 0;i<tables.length;i++){
                $scope.getAdditionalData(psgc,tables[i]);
            };

        };

        $scope.toggleHousehold = function(psgc){

            var canvasIds = ['householdSex','householdLiteracy','householdMarital','householdEducation'];

            //toggle pie charts
            for(var i = 0;i<3;i++){
                $scope.togglePieChart(psgc,$scope.additionalData['hhhqualities'],canvasIds[i]);
            };
            //toggle bar charts
            $scope.additionalData['hhhqualities'].colors
            $scope.toggleBarChart(psgc,$scope.additionalData['hhhqualities'],canvasIds[3]);

        };

        $scope.toggleUnemployment = function(psgc){

            //toggle bar charts
            $scope.toggleBarChart(psgc,$scope.additionalData['unemployment'],'unemploymentRate');

        };

        $scope.toggleAtRisk = function(psgc){
            var canvasIds = ['atRiskPWD',"atRiskEthno","atRiskSee","atRiskHear","atRiskWalk","atRiskRem","atRiskCare","atRiskComm"]


            //toggle pie charts
            for(var i = 0;i<2;i++){
                console.log(canvasIds[i]+"pie");
                $scope.togglePieChart(psgc,$scope.additionalData['atriskpopulation'],canvasIds[i]);
            };
            for(var i = 2;i<canvasIds.length;i++){
                console.log(canvasIds[i]+"bar");
                $scope.toggleBarChart(psgc,$scope.additionalData['atriskpopulation'],canvasIds[i]);
            };

        };

        $scope.togglePoverty = function(psgc){

            var canvasIds = ['povertyIndividual','povertyHousehold'];

            //toggle pie charts
            for(var i = 0;i < 2;i++){
                $scope.togglePieChart(psgc,$scope.additionalData['poverty'],canvasIds[i]);
            };
        };


        $scope.toggleHouseCharacteristics = function(psgc){
            var canvasIds = ['houseWalls','houseRoof','houseFloor'];

            //toggle bar charts
            for(var i = 0;i < 3;i++){
                $scope.toggleBarChart(psgc,$scope.additionalData['housing'],canvasIds[i]);
            };

        };

        $scope.toggleHouseOwnership = function(psgc){

            var canvasIds = ['ownershipTenure','ownershipBuilt'];

            //toggle bar charts
            for(var i = 0;i < 2;i++){
                $scope.toggleBarChart(psgc,$scope.additionalData['ownership'],canvasIds[i]);
            };

        };

        $scope.toggleSanitary = function(psgc){

            var canvasIds = ['sanitaryGarbage','sanitaryToilet'];

            //toggle bar charts
            for(var i = 0;i < 2;i++){
                $scope.toggleBarChart(psgc,$scope.additionalData['environmentalfactors'],canvasIds[i]);
            };

        };

        //For pie charts of newly added charts in 2017
        $scope.togglePieChart = function(psgc,table,canvasId){
            console.log(table);
            console.log(canvasId);
            try{
                Chart.defaults.global.maintainAspectRatio = false;
                var ctx = document.getElementById(canvasId);
                if($scope.isCanvasBlank(ctx)){

                    //make the data whole numbers instead of percentage
                    for(var i = 0;i<table[canvasId].data.length;i++){
                        table[canvasId].data[i] = table[canvasId].data[i]*100;
                    };

                    var data = {
                        labels: table[canvasId].labels,  //fetchfrom BE
                        datasets: [
                            {
                                data: table[canvasId].data,      //fetchfrom BE
                                backgroundColor: table[canvasId].colors,  //fetchfrom BE
                                borderColor: table[canvasId].colors,
                                borderWidth: 1
                            }
                        ]

                    };

                    var pieChart = new Chart(
                        ctx,{
                           type: 'pie',
                           data: data,
                           options: {                                
                                animation:{
                                    animateScale:true
                                },
                                legend: {
                                    display: true,                                    
                                    labels: {
                                        fontColor: 'rgb(255, 99, 132)'
                                     }
                                },
                                tooltips: {
                                    displayColors: true,
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    borderColor: 'rgba(0,0,0,1)',
                                    borderWidth: 2,
                                    bodyFontColor: '#fff',
                                    cornerRadius: 6,
                                    xPadding: 6,
                                    yPadding:6,
                                    callbacks: {
                                        label: function(tooltipItem, data) {
                                            return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
                                        }
                                    }
                                }
                            }
                        }
                    );

                    //in case few data only
                    if(table[canvasId].data.length < 3){
                        ctx.style.width = '150px';
                        ctx.style.height = '150px';
                    }
                    else{
                        ctx.style.width = '250px';
                        ctx.style.height = '250px';
                    }
                }
                //console.log(ctx);
            }
            catch(e){
                console.log(e.message);
                //console.log("Error at pie chart");
            }
        };

        //For bar charts of newly added charts in 2017
        $scope.toggleBarChart = function(psgc,table,canvasId){
            try{
                //console.log(canvasId);

                Chart.defaults.global.maintainAspectRatio = false;
                var ctx = document.getElementById(canvasId);
                if($scope.isCanvasBlank(ctx)){

                    //make the data whole numbers instead of percentage
                    for(var i = 0;i<table[canvasId].data.length;i++){
                        table[canvasId].data[i] = table[canvasId].data[i]*100;
                    };

                    var data = {
                        labels: table[canvasId].labels,   //get from BE
                        datasets: [
                            {
                                data: table[canvasId].data,      //get from BE
                                backgroundColor: table[canvasId].colors,
                                borderColor: table[canvasId].colors,
                                borderWidth: 1                                
                            }
                        ]
                    };

                    var barChart = new Chart(
                        ctx,{
                           type: 'horizontalBar',
                           data: data,
                           options: {
                                legend: {
                                    display: false
                                },
                                scales: {
                                    xAxes: [{
                                        stacked: true
                                    }],
                                    yAxes: [{
                                        stacked: true
                                    }]
                                },
                                tooltips: {
                                    displayColors: false,
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    borderColor: 'rgba(0,0,0,1)',
                                    borderWidth: 1,
                                    bodyFontColor: '#fff',
                                    cornerRadius: 6,
                                    callbacks: {
                                        label: function(tooltipItems, data) {
                                            return ': ' + tooltipItems.xLabel + '%';
                                        }
                                    }
                                }
                            }
                        }
                    );
                    ctx.style.width = '200px';
                    ctx.style.height = '200px';
                    ctx.style.padding = '10px';
                }
                //console.log(ctx);
            }
            catch(e){
                  console.log("Error at bar chart");
            }
        };


        $scope.getProfile = function(psgc) {
            $.getJSON("websafe/profile?psgc="+psgc, function(data) {
                $scope.profile = data;
            });
        };

        $scope.toggleDisasterChart = function(psgc,exposure){
            try{
                $scope.getProfile(psgc);
                //console.log(exposure);

                if(exposure.id == 2){
                    var ctx = document.getElementById("disaster-chart2");
                }
                else{
                    var ctx = document.getElementById("disaster-chart");
                }
                Chart.defaults.global.maintainAspectRatio = false;
                var chartData = {
                    labels: ["Exposure","Capacity","Hazard","Vulnerability"],
                    datasets:   [
                        //Entries may be per year to see Improvement?
                        {
                            label: $scope.exposure.data.verbose_name, //Change it to the municipality name
                            backgroundColor: "rgba(193, 66, 66,.90)",
                            borderColor: "rgba(193, 66, 66,.90)",
                            pointBackgroundColor: "rgba(179,181,198,.90)",
                            pointBorderColor: "#fff",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "rgba(179,181,198,1)",
                            data: [$scope.profile['exposure'], $scope.profile['capacity'], $scope.profile['hazard'], $scope.profile['vulnerability']]
                        }
                    ]
                };

                var options = {
                        scale:  {
                            responsive: false,
                            ticks:  {
                                beginAtZero: true,
                                max: 10,
                                display: false
                            },
                            pointLabels: {
                                fontSize: 20
                            }
                        },
                        tooltips: {
                            callbacks: {
                                label: function(tooltipItem, data) {
                                        var value = data.datasets[0].data[tooltipItem.index];
                                      if(tooltipItem.index == 0) {
                                        return ["The LOWER the value, the LOWER the risk." , "People, property, systems, or other elements present in hazard zones", "that are thereby subject to potential losses."];
                                        }
                                    else if(tooltipItem.index == 1) {
                                        return ["The Higher the value, the LOWER the risk.", "The combination of all the strengths, attributes and resources available within", " a community, society or organization that can be used to achieve agreed goals"];
                                    }
                                    else if(tooltipItem.index == 2) {
                                        return ["The LOWER the value, the LOWER the risk.", "A dangerous phenomenon, substance, human activity or condition that may cause loss of life,", "injury or other health impacts, property damage, loss of livelihoods and services, social and economic ", "disruption, or environmental damage"];
                                    }
                                    else {
                                        return ["The LOWER the value, the LOWER the risk.", "The characteristics and circumstances of a community, system ", "or asset that make it susceptible to the damaging effects of a", "hazard"];
                                        }
                                },
                            },
                        },
                };

                function isCanvasBlank(canvas) {
                    var blank = document.createElement('canvas');
                    blank.width = canvas.width;
                    blank.height = canvas.height;

                    return canvas.toDataURL() == blank.toDataURL();
                }
                //console.log(ctx);
                if(isCanvasBlank(ctx)){
                    $scope.disasterRadarChart = new Chart(ctx, {
                            type: 'radar',
                            data: chartData,
                            options: options
                    });
                    ctx.style.width = '300px';
                    ctx.style.height = '300px';
                }

            }
            catch(e){
                    console.log(e.message);
            }
        };

        /*
         * this is the function to be called when you click the calculate button
         * this connects to the backend api and runs the InaSAFE calculate function
         */

        $scope.calculate = function(){
            var params = {};
            var hazard_data = $scope.hazard.data;
            var exposure_data = $scope.exposure.data;
            $scope.psadata = {};

            $scope.fetchAdditionalPopData(hazard_data.psgc,exposure_data.id);

            var tables = ['conveniences', 'economic', 'demographic',
                          'education', 'energy', 'landtenure',
                          'rh', 'wash'];

            $scope.getPSAData = function(table, psgc) {
                $.getJSON("websafe/data?table="+table+"&mun_psgc="+psgc, function(data) {
                    $scope.psadata[table] = data;
                });
            }
            for (i in tables) {
                $scope.getPSAData(tables[i],hazard_data.psgc);
            }

            if ($scope.exposure.layer == null){
                alert('Please select exposure layer.');
            }else if ($scope.hazard.layer == null){
                alert('Please select hazard layer.');
            }else{
                $scope.l = Ladda.create( document.querySelector( '.ladda-button' ) );
                $scope.l.start();

                params = {
                    'psgc' : hazard_data.psgc,
                    'haz_type' : $scope.hazard.haz_type,
                    'haz_type_id' : hazard_data.id,
                    //'exp_type' : $scope.exposure.exp_type,
                    'exp_type_id' : exposure_data.id
                };

                // this is where the we send the calculate request.
                WebsafeFunctions.calculate(params)
                .then(function(result){
                    $scope.l.stop();

                    $scope.templateUrl = '';
                    var seriesName = '';
                    if (result.success == true){
                        MapFunctions.removeAllWMSLayers();
                        $scope.hazard.showLegend = false;
                        $scope.exposure.showLegend = false;

                        $scope.resultReady = true;

                        Highcharts.setOptions({
                            lang: {
                                thousandsSep: ','
                            }
                        });

                        $scope.html = '';
                        $scope.location = result.data.location;
                        $scope.total = result.data.summary.total;
                        $scope.total_impact = result.data.summary.total_impact;
                        $scope.high = result.data.summary.high;
                        $scope.medium = result.data.summary.medium;
                        $scope.low = result.data.summary.low;
                        //$scope.actions = result.data.summary.action_checklist;

                        $scope.chartObj; // this will contain a reference to the highcharts' chart object

                        if (exposure_data.id == '2') {
                            $scope.templateUrl = 'populationResults.html';
                            seriesName = 'Population Affected';
                            $scope.exposure_text = 'people';
                            $scope.impact_text = 'need evacuation';
                            console.log($scope.haz_layer_text.category);

                            var total_needs = result.data.summary.total_needs;

                            $scope.rice = total_needs['Rice [kg]'];
                            $scope.clean_water = total_needs['Clean Water [l]'];
                            $scope.drinking_water = total_needs['Drinking Water [l]'];
                            $scope.toilets = total_needs['Toilets'];
                            $scope.family_kits = total_needs['Family Kits'];
                            $scope.addtl_rice = result.data.summary.gender['extra_rice']
                            $scope.hygiene_packs = result.data.summary.gender['hygiene'];
                            //$scope.poverty_incidence = '1.4';
                            $scope.youth = result.data.summary.age['youth'];
                            $scope.adult = result.data.summary.age['adult'];
                            $scope.elderly = result.data.summary.age['elderly'];
                            $scope.female = result.data.summary.gender['female'];
                            $scope.male = result.data.summary.gender['male'];
                            $scope.agePieChart = {
                                chart: {
                                    renderTo: 'age_chart',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: [0, 0, 0, 0],
                                    spacingTop: 0,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 150,
                                },
                                title: {
                                    text: null
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'top',
                                    itemMarginTop: 10,
                                    itemDistance: 6,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key} Affected<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.y}</span> ({point.percentage:.1f}%)</b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.y:,.0f}'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Age Distribution',
                                    data: [
                                        ['Youth',$scope.youth],
                                        ['Adult', $scope.adult],
                                        ['Elderly', $scope.elderly]
                                    ]
                                }]
                            };
                            $scope.genderPieChart = {
                                chart: {
                                    renderTo: 'gender_chart',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: [0, 0, 0, 0],
                                    spacingTop: 0,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 150,
                                },
                                colors: ['#e78ee2','#4689e8'],
                                title: {
                                    text: null
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'top',
                                    itemMarginTop: 10,
                                    itemDistance: 10,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key} Affected<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.y}</span> ({point.percentage:.1f}%)</b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.y:,.0f}'
                                        },
                                        showInLegend: true,
                                    },
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Gender Distribution',
                                    data: [
                                        ['Female', $scope.female],
                                        ['Male', $scope.male]
                                    ]
                                }]
                            };

                            var popn2010, grow_rate, m_popn2010, f_popn2010,
                                male_data = [], female_data = [],
                                agedp, young_agedp, old_agedp, ageDependentsData = [],
                                maleFemaleData = [];
                            var categories = ['0-4', '5-9', '10-14', '15-19', '20-24',
                                              '25-29', '30-34', '35-39', '40-44',
                                              '45-49', '50-54', '55-59', '60-64',
                                              '65+'];
                            var population_pyramid_title = null;
                            var population_pyramid_subtitle = null;
                            var ageDependentsTitle = null;
                            if ($scope.psadata.demographic.length != 0) {
                                popn2010 = $scope.psadata.demographic['popn2010'].value
                                grow_rate = $scope.psadata.demographic['grow_rate'].value
                                m_popn2010 = popn2010 * $scope.psadata.demographic['m_rate'].value;
                                f_popn2010 = popn2010 * $scope.psadata.demographic['f_rate'].value;
                                agedp = popn2010 * $scope.psadata.demographic['agedp_rate'].value;
                                young_agedp = agedp * $scope.psadata.demographic['yagdp_rate'].value;
                                old_agedp = agedp * $scope.psadata.demographic['oagdp_rate'].value;
                                population_pyramid_title = 'Population as of May 2010 Census: <span class="popn2010">' + popn2010.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>';
                                population_pyramid_subtitle = 'Annual growth rate: <span class="grow_rate">' + grow_rate.toFixed(5) + '</span>'
                                ageDependentsData = [
                                        ['Young (0-14)', young_agedp],
                                        ['Adult (15-59)', agedp - young_agedp - old_agedp],
                                        ['Old (60 above)', old_agedp]
                                    ]
                                    ageDependentsTitle = 'Age Dependents as of May 2010 Census: <span class="agedp">'+ agedp.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>'
                                male_data = [m_popn2010 * $scope.psadata.demographic['ag1m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag2m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag3m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag4m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag5m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag6m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag7m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag8m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag9m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag10m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag11m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag12m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag13m_rate'].value * -1,
                                             m_popn2010 * $scope.psadata.demographic['ag14m_rate'].value * -1];
                                female_data = [f_popn2010 * $scope.psadata.demographic['ag1f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag2f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag3f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag4f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag5f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag6f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag7f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag8f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag9f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag10f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag11f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag12f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag13f_rate'].value,
                                             f_popn2010 * $scope.psadata.demographic['ag14f_rate'].value];
                                maleFemaleData = [
                                        ['Female', f_popn2010],
                                        ['Male', m_popn2010]
                                    ]
                            }

                            $scope.populationPyramid = {
                                chart: {
                                    type: 'bar',
                                    renderTo: 'population_pyramid'
                                },
                                title: {
                                    useHTML: true,
                                    text: population_pyramid_title
                                },
                                subtitle: {
                                    useHTML: true,
                                    text: population_pyramid_subtitle
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                xAxis: [{
                                    categories: categories,
                                    reversed: false,
                                    labels: {
                                        step: 1
                                    }
                                }, { // mirror axis on right side
                                    opposite: true,
                                    reversed: false,
                                    categories: categories,
                                    linkedTo: 0,
                                    labels: {
                                        step: 1
                                    }
                                }],
                                yAxis: {
                                    title: {
                                        text: null
                                    },
                                    labels: {
                                        formatter: function(){
                                            return (Math.abs(this.value));
                                        }
                                    },
                                },
                                plotOptions: {
                                    bar: {
                                        dataLabels: {
                                            enabled: true,
                                            formatter: function() {
                                                return Math.round(Math.abs(this.y));
                                            },
                                            inside: false,
                                            padding: 5,
                                        }
                                    },
                                    series: {
                                        stacking: 'normal'
                                    }
                                },
                                tooltip: {
                                    formatter: function(){
                                        return '<b>'+ this.series.name +', age '+ this.point.category +'</b><br/>'+
                                            'Population: '+ Highcharts.numberFormat(Math.abs(this.point.y), 0);
                                    }
                                },
                                series: [{
                                    name: 'Male',
                                    data: male_data
                                }, {
                                    name: 'Female',
                                    data: female_data
                                }]
                            };

                            $scope.maleFemale = {
                                chart: {
                                    renderTo: 'male_female',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: 30,
                                    spacingTop: 0,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 200,
                                },
                                colors: ['#e78ee2','#4689e8'],
                                title: {
                                    text: 'Gender Distribution as of May 2010 Census',
                                    style: {
                                        fontSize: "14px"
                                    },
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 20,
                                    itemDistance: 6,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.y:,.0f}</span> ({point.percentage:.1f}%)</b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.y:,.0f}'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Gender Distribution',
                                    data: maleFemaleData
                                }]
                            };
                            /*
                            $scope.householdSex = {
                                chart: {
                                    renderTo: 'householdSex',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: 30,
                                    spacingTop: 0,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 270,
                                },
                                colors: ['#058DC7', '#50B432'],
                                title: {
                                    useHTML: true,
                                    text: '<span class="agedp">Household Head qualities</span>',        #same class as other titles
                                    style: {
                                        fontSize: "14px",
                                        textAlign: "center"
                                    },
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 20,
                                    itemDistance: 6,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                            };
                            */

                            $scope.ageDependents = {
                                chart: {
                                    renderTo: 'age_dependents',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: 30,
                                    spacingTop: 0,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 270,
                                },
                                colors: ['#058DC7', '#50B432', '#ED561B'],
                                title: {
                                    useHTML: true,
                                    text: ageDependentsTitle,
                                    style: {
                                        fontSize: "14px",
                                        marginTop: 10,
                                        padding: 10,
                                        textAlign: "center"
                                    },
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 20,
                                    itemDistance: 5,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.y:,.0f}</span> ({point.percentage:.1f}%)</b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.y:,.0f}'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Age Dependents Distribution',
                                    data: ageDependentsData
                                }]
                            };

                            var internetAccessData = [];
                            if($scope.psadata.conveniences.length != 0){
                                internetAccessData = [
                                    ['Home', $scope.psadata.conveniences['inac1_rate'].value * 100],
                                    ['Elsewhere', $scope.psadata.conveniences['inac2_rate'].value * 100]
                                ]
                            }
                            $scope.internetAccess = {
                                chart: {
                                    renderTo: 'internet_access',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    marginTop: 50,
                                    marginBottom: 20,
                                    spacingTop: 8,
                                    height: 200,
                                    width: 300,
                                },
                                title: {
                                    text: 'Percentage of Households with Internet Access',
                                    style: {
                                        fontSize: "15px"
                                    },
                                    y: 10
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    align: 'right',
                                    layout: 'vertical',
                                    verticalAlign: 'bottom',
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    enabled: false
                                },
                                yAxis: {
                                    min: 0,
                                    title: {
                                        text: 'Percentage of Population'
                                    },
                                    labels: {
                                        formatter: function () {
                                            return this.value + '%';
                                        }
                                    }
                                },
                                xAxis: {
                                    categories: ['Home','Elsewhere']
                                },
                                plotOptions: {
                                    column: {
                                        colorByPoint: true,
                                        colors: [
                                            '#ff0000',
                                            '#0000ff'
                                        ],
                                        dataLabels: {
                                            enabled: true,
                                            format: '{point.y:.2f}%'
                                        }
                                    }
                                },
                                series: [{
                                    type: 'column',
                                    showInLegend: false,
                                    data: internetAccessData
                                }]
                            };

                            $scope.conveniences = [];

                            function getValue(n) {
                                return new Array(Math.round(n));
                            };

                            if($scope.psadata.conveniences.length != 0) {
                                for (var i=1; i < 13; i++) {
                                    var name = 'ap' + i + '_rate';
                                    var temp_ = {
                                        'key': name,
                                        'value': getValue($scope.psadata.conveniences[name].value * 10),
                                        'verbose_name': $scope.psadata.conveniences[name].verbose_name
                                    };
                                    $scope.conveniences.push(temp_);
                                }
                            }

                            var literacyRateData = [];
                            var literacyRateDataM = [];
                            var literacyRateDataF = [];
                            if($scope.psadata.education.length != 0) {
                                literacyRateData = [
                                    ['Literate', $scope.psadata.education['litage'].value],
                                    ['Illiterate', 1-$scope.psadata.education['litage'].value]
                                ]
                                literacyRateDataM = [
                                    ['Literate', $scope.psadata.education['litagem'].value],
                                    ['Illiterate', 1-$scope.psadata.education['litagem'].value]
                                ]
                                literacyRateDataF = [
                                    ['Literate', $scope.psadata.education['litagef'].value],
                                    ['Illiterate', 1-$scope.psadata.education['litagef'].value]
                                ]

                            }

                            $scope.literacyRate = {
                                chart: {
                                    renderTo: 'literacy_rate',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: [30,0,25,0],
                                    spacingTop: 7,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 170,
                                },
                                colors: ['#64E572', '#FF9655'],
                                title: {
                                    useHTML: true,
                                    text: 'Literacy Rate as of May 2010 Census',
                                    style: {
                                        fontSize: "12sorpx",
                                        textAlign: "center"
                                    },
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 20,
                                    itemDistance: 5,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Literacy Rate',
                                    data: literacyRateData
                                }]
                            };
                            $scope.literacyRateM = {
                                chart: {
                                    renderTo: 'literacy_ratem',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: [30,0,25,0],
                                    spacingTop: 7,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 170,
                                },
                                colors: ['#1B3F8B', '#62B1F6'],
                                title: {
                                    useHTML: true,
                                    text: 'Male Literacy Rate as of May 2010 Census',
                                    style: {
                                        fontSize: "12px",
                                        textAlign: "center"
                                    },
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 20,
                                    itemDistance: 5,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Literacy Rate',
                                    data: literacyRateDataM
                                }]
                            };
                            $scope.literacyRateF = {
                                chart: {
                                    renderTo: 'literacy_ratef',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: [30,0,25,0],
                                    spacingTop: 7,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 200,
                                    width: 175,
                                },
                                colors: ['#CD3278', '#FF92BB'],
                                title: {
                                    useHTML: true,
                                    text: 'Female Literacy Rate as of May 2010 Census',
                                    style: {
                                        fontSize: "12px",
                                        textAlign: "center"
                                    },
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 20,
                                    itemDistance: 5,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Literacy Rate',
                                    data: literacyRateDataF
                                }]
                            };
                            var lightingFuelData = [];
                            var cookingFuelData = [];
                            if($scope.psadata.energy.length != 0){
                                lightingFuelData = [
                                    ['Electricity', $scope.psadata.energy['ful1_rate'].value],
                                    ['Kerosene', $scope.psadata.energy['ful2_rate'].value],
                                    ['LPG', $scope.psadata.energy['ful3_rate'].value],
                                    ['Oil', $scope.psadata.energy['ful4_rate'].value],
                                    ['Other', $scope.psadata.energy['ful5_rate'].value],
                                    ['None', $scope.psadata.energy['ful6_rate'].value],
                                ]

                                cookingFuelData = [
                                    ['Electricity', $scope.psadata.energy['fuc1_rate'].value],
                                    ['Kerosene', $scope.psadata.energy['fuc2_rate'].value],
                                    ['LPG', $scope.psadata.energy['fuc3_rate'].value],
                                    ['Charcoal', $scope.psadata.energy['fuc4_rate'].value],
                                    ['Wood', $scope.psadata.energy['fuc5_rate'].value],
                                    ['Other', $scope.psadata.energy['fuc6_rate'].value],
                                    ['None', $scope.psadata.energy['fuc7_rate'].value],
                                ]
                            }

                            $scope.lightingFuel = {
                                chart: {
                                    renderTo: 'lighting_fuel',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: [35, 0, 35, 0],
                                    spacingTop: 8,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 340,
                                    width: 240,
                                },
                                title: {
                                    text: 'Ratio of Households using Fuel for Lighting',
                                    style: {
                                        fontSize: "14px"
                                    },
                                    y: 15
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 10,
                                    itemDistance: 6,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: 'Type of Fuel - {point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'

                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Ratio of Households using Fuel for Lighting',
                                    data: lightingFuelData
                                }]
                            };
                            $scope.cookingFuel = {
                                chart: {
                                    renderTo: 'cooking_fuel',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    margin: [35, 0, 35, 0],
                                    spacingTop: 8,
                                    spacingBottom: 0,
                                    spacingLeft: 0,
                                    spacingRight: 0,
                                    height: 340,
                                    width: 240,
                                },
                                title: {
                                    text: 'Ratio of Households using Fuel for Cooking',
                                    style: {
                                        fontSize: "14px"
                                    },
                                    y: 15
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    verticalAlign: 'bottom',
                                    itemMarginBottom: 10,
                                    itemDistance: 6,
                                    padding: 0,
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10,
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: 'Type of Fuel - {point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Ratio of Households using Fuel for Cooking',
                                    data: cookingFuelData
                                }]
                            };

                            var drinkingWaterData = [];
                            var cookingWaterData = [];
                            var laundryWaterData = [];

                            try{
                                if($scope.psadata.wash.length != 0) {
                                    drinkingWaterData = [
                                        ['Own Faucet connected to Community Water System', $scope.psadata.wash['wsd1_rate'].value],
                                        ['Shared Faucet connected to Community Water System', $scope.psadata.wash['wsd2_rate'].value],
                                        ['Own Tubed/Piped Deep Well', $scope.psadata.wash['wsd3_rate'].value],
                                        ['Shared Tubed/Piped Deep Well', $scope.psadata.wash['wsd4_rate'].value],
                                        ['Shared Tubed/Piped Shallow Well', $scope.psadata.wash['wsd5_rate'].value],
                                        ['Dug Well', $scope.psadata.wash['wsd6_rate'].value],
                                        ['Protected Spring', $scope.psadata.wash['wsd7_rate'].value],
                                        ['Unrotected Spring', $scope.psadata.wash['wsd8_rate'].value],
                                        ['Lake/River/Rain/Others', $scope.psadata.wash['wsd9_rate'].value],
                                        ['Peddler', $scope.psadata.wash['wsd10_rate'].value],
                                        ['Bottled Water', $scope.psadata.wash['wsd11_rate'].value],
                                        ['Other Sources', $scope.psadata.wash['wsd12_rate'].value],
                                    ]

                                    cookingWaterData = [
                                        ['Own Faucet connected to Community Water System', $scope.psadata.wash['wsc1_rate'].value],
                                        ['Shared Faucet connected to Community Water System', $scope.psadata.wash['wsc2_rate'].value],
                                        ['Own Tubed/Piped Deep Well', $scope.psadata.wash['wsc3_rate'].value],
                                        ['Shared Tubed/Piped Deep Well', $scope.psadata.wash['wsc4_rate'].value],
                                        ['Shared Tubed/Piped Shallow Well', $scope.psadata.wash['wsc5_rate'].value],
                                        ['Dug Well', $scope.psadata.wash['wsc6_rate'].value],
                                        ['Protected Spring', $scope.psadata.wash['wsc7_rate'].value],
                                        ['Unrotected Spring', $scope.psadata.wash['wsc8_rate'].value],
                                        ['Lake/River/Rain/Others', $scope.psadata.wash['wsc9_rate'].value],
                                        ['Peddler', $scope.psadata.wash['wsc10_rate'].value],
                                        ['Bottled Water', $scope.psadata.wash['wsc11_rate'].value],
                                        ['Other Sources', $scope.psadata.wash['wsc12_rate'].value],
                                    ]

                                    laundryWaterData = [
                                        ['Own Faucet connected to Community Water System', $scope.psadata.wash['wsw1_rate'].value],
                                        ['Shared Faucet connected to Community Water System', $scope.psadata.wash['wsw2_rate'].value],
                                        ['Own Tubed/Piped Deep Well', $scope.psadata.wash['wsw3_rate'].value],
                                        ['Shared Tubed/Piped Deep Well', $scope.psadata.wash['wsw4_rate'].value],
                                        ['Shared Tubed/Piped Shallow Well', $scope.psadata.wash['wsw5_rate'].value],
                                        ['Dug Well', $scope.psadata.wash['wsw6_rate'].value],
                                        ['Protected Spring', $scope.psadata.wash['wsw7_rate'].value],
                                        ['Unrotected Spring', $scope.psadata.wash['wsw8_rate'].value],
                                        ['Lake/River/Rain/Others', $scope.psadata.wash['wsw9_rate'].value],
                                        ['Peddler', $scope.psadata.wash['wsw10_rate'].value],
                                        ['Bottled Water', $scope.psadata.wash['wsw11_rate'].value],
                                        ['Other Sources', $scope.psadata.wash['wsw12_rate'].value],
                                    ]
                                }
                            }
                            catch(error){
                            }
                            $scope.drinkingWater = {
                                chart: {
                                    renderTo: 'drinking_water',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    spacingTop: 7,
                                    marginTop: 30,
                                    marginBottom: 0,
                                    height: 220,
                                    width: 540
                                },
                                title: {
                                    useHTML: true,
                                    text: 'Source of Water for Drinking',
                                    style: {
                                        fontSize: "16px",
                                        textAlign: "center"
                                    },
                                },
                                colors: ['#95c15f', '#2d8bbe', '#f19506', '#ff6060', '#c3f4fe', '#885159',
                                        '#645188', '#886451', '#528881', '#ff00a9', '#c79dd7', '#1ba1e2'],
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    align: 'right',
                                    layout: 'vertical',
                                    verticalAlign: 'bottom',
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Drinking Water',
                                    data: drinkingWaterData
                                }]
                            };
                            $scope.cookingWater = {
                                chart: {
                                    renderTo: 'cooking_water',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    spacingTop: 7,
                                    marginTop: 30,
                                    marginBottom: 0,
                                    height: 220,
                                    width: 540
                                },
                                title: {
                                    useHTML: true,
                                    text: 'Source of Water for Cooking',
                                    style: {
                                        fontSize: "16px",
                                        textAlign: "center"
                                    },
                                },
                                colors: ['#95c15f', '#2d8bbe', '#f19506', '#ff6060', '#c3f4fe', '#885159',
                                        '#645188', '#886451', '#528881', '#ff00a9', '#c79dd7', '#1ba1e2'],
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    align: 'right',
                                    layout: 'vertical',
                                    verticalAlign: 'bottom',
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10,
                                    margin: 0
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Cooking Water',
                                    data: cookingWaterData
                                }]
                            };
                            $scope.laundryWater = {
                                chart: {
                                    renderTo: 'laundry_water',
                                    backgroundColor: 'transparent',
                                    plotBorderWidth: 0,
                                    plotShadow: false,
                                    spacingTop: 7,
                                    marginTop: 30,
                                    marginBottom: 0,
                                    height: 220,
                                    width: 540
                                },
                                title: {
                                    useHTML: true,
                                    text: 'Source of Water for Laundry/Bathing',
                                    style: {
                                        fontSize: "16px",
                                        textAlign: "center"
                                    },
                                },
                                colors: ['#95c15f', '#2d8bbe', '#f19506', '#ff6060', '#c3f4fe', '#885159',
                                        '#645188', '#886451', '#528881', '#ff00a9', '#c79dd7', '#1ba1e2'],
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    itemStyle: {
                                        fontSize: '10px'
                                    },
                                    align: 'right',
                                    layout: 'vertical',
                                    verticalAlign: 'bottom',
                                    symbolHeight: 10,
                                    symbolPadding: 2,
                                    symbolWidth: 10,
                                    margin: 0
                                },
                                tooltip: {
                                    useHTML: true,
                                    headerFormat: '{point.key}<br>',
                                    pointFormat: '<b><span style="color:{point.color}">{point.percentage:.1f}%</span></b>'
                                },
                                plotOptions: {
                                    pie: {
                                        size: '100%',
                                        dataLabels: {
                                            enabled: true,
                                            distance: -30,
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '9px',
                                                color: 'white',
                                                textShadow: '0px 1px 2px black'
                                            },
                                            format: '{point.percentage:.1f}%'
                                        },
                                        showInLegend: true
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    name: 'Laundry/Bathing Water',
                                    data: laundryWaterData
                                }]
                            };

                        } else {
                            $scope.templateUrl = 'buildingResults.html';
                            seriesName = 'Buildings Affected';
                            $scope.exposure_text = 'buildings';
                            // $scope.impact_text = 'be flooded';
                            if (hazard_data.id <= 5){
                                $scope.impact_text = "be flooded";
                            } else {
                                $scope.impact_text = "be affected";
                            }
                            $scope.residential = result.data.summary.buildings_list.Residential;
                            $scope.government = result.data.summary.buildings_list["Public building"];
                            $scope.school = result.data.summary.buildings_list.School;
                            $scope.collapsed = result.data.summary.buildings_list.Collapsed;
                            $scope.hospital = result.data.summary.buildings_list.Hospital;
                            $scope.church = result.data.summary.buildings_list.Church;
                            $scope.others = result.data.summary.buildings_list.Other;
                            $scope.hospitalNames = result.data.summary.affected_hospitals;
                            $scope.schoolNames = result.data.summary.affected_schools;
                            $scope.governmentNames = result.data.summary.affected_government;
                            $scope.residentialNames = result.data.summary.affected_residential;
                            $scope.churchNames = result.data.summary.affected_churches;
                            $scope.affectedNames = [];
                            console.log($scope.schoolNames);

                            $scope.toggleNames = function(buildingType){
                                switch(buildingType) {
                                    case "school":
                                        $scope.affectedNames = $scope.schoolNames;
                                        break;
                                    case "hospital":
                                        $scope.affectedNames = $scope.hospitalNames;
                                        break;
                                    case "government":
                                        $scope.affectedNames = $scope.governmentNames;
                                        break;
                                    case "residential":
                                        $scope.affectedNames = $scope.residentialNames;
                                        break;
                                    case "church":
                                        $scope.affectedNames = $scope.churchNames;
                                        break;
                                }
                                //content = document.getElementById('affected-popup').innerHTML;
                                var content = '<p style="color#3295d3;font-weight:bold;padding: 5px;">Affected Buildings</p><ul style="color: #3295d3;">';
                                for(var i = 0; i < $scope.affectedNames.length;i++){
                                    content = content + "<li>"+$scope.affectedNames[i]+"</li>";
                                }
                                content = content + '</ul><a style="color: #3295d3;padding: 5px 0 0 5px;position:fixed;right:5%;top:32%" href="#" onclick="popClose()">Close</a>'

                                console.log('content');

                                document.getElementById('affected-popup').innerHTML = content;
                                document.getElementById('affected-popup').style.display='block';
                            }

//                            $scope.popClose = function(){
//                                document.getElementById("affected-popup").style.display="none";
//                            }

                            $scope.materialsBarChart = {
                                chart: {
                                    renderTo: 'materials_chart',
                                    type: 'column',
                                    height: 150,
                                    width: 300
                                },
                                title: {
                                    text: null
                                },
                                exporting: {
                                    enabled: false
                                },
                                credits: {
                                    enabled: false
                                },
                                legend: {
                                    enabled: false
                                },
                                tooltip: {
                                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                                    footerFormat: '</table>',
                                    shared: true,
                                    useHTML: true
                                },
                                xAxis: {
                                    categories: [
                                        'Wood',
                                        'Bamboo',
                                        'Makeshift',
                                        'Others'
                                    ],
                                    crosshair: true
                                },
                                yAxis: {
                                    min: 0,
                                    title: {
                                        text: '# of bldgs.'
                                    }
                                },
//                                series: [{
//                                    name: 'Material',
//                                    data: [3006, 454, 206, 27]
//                                }]
                            }

                        }

                        $scope.affectedPieChart = {
                            chart: {
                                renderTo: 'affected_chart',
                                backgroundColor: 'transparent',
                                plotBorderWidth: 0,
                                plotShadow: false,
                                margin: [15,0,0,0],
                                spacingTop: 0,
                                spacingBottom: 0,
                                spacingLeft: 0,
                                spacingRight: 0,
                                height: 260,
                                width: 230,
                            },
                            colors: ['#D9534F', '#f0ad4e', '#fcfc64'],
                            title: {
                                useHTML: true,
                                text: '<center><span style="font-size:24px;font-weight:600;display:block;margin-bottom:-6px;">' + $scope.total_impact + '</span><span style="font-size:14px;">' + seriesName + '</span></center>',
                                style: {
                                    zIndex: -1
                                },
                                align: 'center',
                                verticalAlign: 'middle',
                                y: -10
                            },
                            exporting: {
                                enabled: false
                            },
                            credits: {
                                enabled: false
                            },
                            legend: {
                                itemStyle: {
                                    fontSize: '10px'
                                },
                                verticalAlign: 'top',
                                itemMarginTop: 10,
                                padding: 0
                            },
                            tooltip: {
                                useHTML: true,
                                headerFormat: '{point.key} Hazard Area<br>',
                                pointFormat: '<b><span style="color:{point.color}">{point.y}</span> ({point.percentage:.1f}%)</b>'
                            },
                            plotOptions: {
                                pie: {
                                    size: '100%',
                                    dataLabels: {
                                        enabled: true,
                                        distance: -20,
                                        style: {
                                            fontWeight: 'bold',
                                            fontSize: '10px',
                                            color: 'white',
                                            textShadow: '0px 1px 2px black'
                                        },
                                        format: '{point.y:,.0f}'
                                    },
                                    startAngle: -180,
                                    endAngle: 180,
                                    center: ['50%', '50%'],
                                    showInLegend: true
                                }
                            },
                            series: [{
                                type: 'pie',
                                name: seriesName,
                                innerSize: '65%',
                                data: [
                                    ['High', $scope.high],
                                    ['Medium', $scope.medium],
                                    ['Low', $scope.low],
                                ]
                            }]
                        }
                        $scope.open(); // open the modal for result
                    }


                    /*

                    $scope.impact.name = data.resource;
                    $scope.impact.impact_resource = 'impact:' + data.resource;

                    var impact_layer = MapFunctions.fetchWMSLayer(data.resource);
                    $scope.impact.legend = MapFunctions.getLegend(data.resource);
                    $rootScope.map.addLayer(impact_layer);
                    $scope.impact.showLegend = true;

                    MapFunctions.fetchBbox(impact_layer.resource_name)
                    .then(function(extent){
                        MapFunctions.zoomToExtent(extent);
                    });
                    */
                }, function(status){
                    $scope.l.stop();
                    alert('An internal server error(500) has occurred!');
                });
            }

        };

        $scope.initQtip = function() {
            $('area').qtip({
                content:{
                    text: function(event, api) {
                        var letter = $(this).attr('alt');
                        var text = ''
                        switch (letter) {
                            case 'A':
                                api.set('content.title', 'BOX A: LIST OF DIRECTIVES DURING A DISASTER');
                                text = "<ul>\
                                            <li>Cancellation of Travel Authorities of Personnel</li>\
                                            <li>Preparation of pre-disaster risk assessment</li>\
                                            <li>Heightening response and early warning</li>\
                                            <li>Monitoring typhoon path and intensity</li>\
                                        </ul>";
                                break;
                            case 'B':
                                api.set('content.title', 'BOX B: MEETING AGENDA IN CONVENING THE LDRRMC');
                                text = "<ul>\
                                            <li>Typhoon path and possible impact/span</li>\
                                            <li>Number of possible affected communities</li>\
                                            <li>Incident Command System\
                                                <ul>\
                                                    <li>Identify Incident Commander</li>\
                                                </ul>\
                                            </li>\
                                            <li>Composition and Tasking\
                                                <ul>\
                                                    <li>Administrative and logistical support</li>\
                                                    <li>Security, lifeline and SRR Cluster</li>\
                                                    <li>Humanitarian Cluster</li>\
                                                    <li>Information and Awareness Cluster</li>\
                                                </ul>\
                                            </li>\
                                            <li>Availability of the LDRRM Fund</li>\
                                            <li>Prepositioning and readiness of resources</li>\
                                            <li>Daily briefi ng, debriefi ng updates and schedules</li>\
                                        </ul>";
                                break;
                            case 'C':
                                api.set('content.title', 'BOX C: LIST OF RESOURCES NEEDED BY CLUSTER 1 (SRR TEAM)');
                                text = "<ul class='two-columns'>\
                                            <li><strong>Supplies</strong>\
                                                <ul>\
                                                    <li>First aid kits and vaccines</li>\
                                                    <li>Cadaver bags</li>\
                                                </ul>\
                                            </li>\
                                            <li><strong>Equipment</strong>\
                                                <ul>\
                                                    <li>Boats/vans/trucks/buses</li>\
                                                    <li>Ambulance/amphibian vehicle/backhoe/dump truck/fire trucks/crawler/tractor/scoop loader (may be borrowed from other LGUs or NGAs)</li>\
                                                    <li>Siren</li>\
                                                    <li>Megaphone</li>\
                                                    <li>Whistle</li>\
                                                    <li>Two-way radio, GPS device, and other communication equipment (consider satellite phone)</li>\
                                                    <li>Ropes and throw bags</li>\
                                                    <li>Search light</li>\
                                                    <li>Ladders</li>\
                                                    <li>Protective gears (helmet and life vest)</li>\
                                                    <li>Reflectorized vest</li>\
                                                    <li>Extrication kit (spine board, shovel, chainsaw, jack hammer or alternative digging device)</li>\
                                                    <li>Chainsaw, bolo, shovel, water pump</li>\
                                                    <li>Mobile water treatment</li>\
                                                    <li>Caution tape</li>\
                                                    <li>K9 unit (if available)</li>\
                                                    <li>Barricade</li>\
                                                </ul>\
                                            </li>\
                                            <li><strong>Stockpile</strong>\
                                                <ul>\
                                                    <li>Gasoline and extra batteries\
                                                    <li>Portable generator, solar-powered generator, and flashlights\
                                                    <li>Potable water\
                                                    <li>Food packs (rice, canned goods, noodles, ready-to-eat meals)\
                                                </ul>\
                                            </li>\
                                        </ul>";
                                break;
                            case 'D':
                                api.set('content.title', 'BOX D: LIST OF RESOURCES NEEDED BY CLUSTER 2 (HUMANITARIAN TEAM)');
                                text = "<ul class='two-columns'>\
                                            <li><strong>Supplies</strong>\
                                                <ul>\
                                                    <li>Registration logbook</li>\
                                                </ul>\
                                            </li>\
                                            <li><strong>Equipment</strong>\
                                                <ul>\
                                                    <li>Standby vehicles</li>\
                                                    <li>Megaphone</li>\
                                                    <li>Whistle</li>\
                                                    <li>Two-way radio and other communication equipment</li>\
                                                    <li>Flashlight</li>\
                                                    <li>TV or radio</li>\
                                                </ul>\
                                            </li>\
                                            <li><strong>Stockpile</strong>\
                                                <ul>\
                                                    <li>First aid kits/medicines</li>\
                                                    <li>Food packs (rice, canned goods, noodles, ready-to-eat meals)</li>\
                                                    <li>Potable water</li>\
                                                    <li>Hygiene kit (soap, shampoo, alcohol, toothbrush, toothpaste, sanitary pads, deodorant)</li>\
                                                    <li>Clothing (jacket, raincoat, hard hat, boots)</li>\
                                                    <li>Gasoline and extra batteries</li>\
                                                    <li>Portable generator and flashlights</li>\
                                                    <li>Beds and beddings</li>\
                                                    <li>Portable toilets</li>\
                                                    <li>Mosquito nets</li>\
                                                </ul>\
                                            </li>\
                                        </ul>";
                                break;
                            case 'E':
                                api.set('content.title', 'BOX E: LIST OF RESOURCES NEEDED BY CLUSTER 3 (INFORMATION AND AWARENESS TEAM)');
                                text = "<ul class='two-columns'>\
                                            <li><strong>Data and Information</strong>\
                                                <ul>\
                                                    <li>Hazard and risk maps to include Social Vulnerability Assessment, and potential flush points maps</li>\
                                                    <li>Directory/contact numbers of key local and national DRRM officials, TV, and radio stations, school principals/administrators</li>\
                                                    <li>Advisory from PAGASA</li>\
                                                    <li>Template of PSAs (Public Service Announcements)</li>\
                                                </ul>\
                                            </li>\
                                            <li><strong>Equipment</strong>\
                                                <ul>\
                                                    <li>Centralized Hotline (operated and monitored by the Command Center)</li>\
                                                    <li>Vehicles</li>\
                                                    <li>Siren/Batingaw</li>\
                                                    <li>Telephone/fax machine/internet connection</li>\
                                                    <li>Megaphone</li>\
                                                    <li>Two-way radio, GPS device, and other communication equipment (consider  satellite phone)</li>\
                                                    <li>Flashlight</li>\
                                                    <li>Transistor Radio (single frequency)</li>\
                                                </ul>\
                                            </li>\
                                            <li><strong>Stockpile</strong>\
                                                <ul>\
                                                    <li>Gasoline and extra batteries</li>\
                                                    <li>Portable generator and flashlights</li>\
                                                </ul>\
                                            </li>\
                                        </ul>";
                                break;
                            case 'F':
                                api.set('content.title', 'BOX F: GUIDELINES IN UTILIZING THE LDRRM FUND');
                                text = "<ul>\
                                            <li>Section 21 of RA No. 10121 provides that the General Fund amounting to not less than five percent (5%) of the estimated revenue from regular sources shall be set aside for LDRRM Fund. Thirty percent (30%) of the LDRRMF shall be set aside for the Quick Response Fund (QRF) and 70% for disaster prevention and mitigation, response, rehabilitation and recovery.</li>\
                                            <li>The release and use of the 30% QRF shall be supported by the local sanggunian declaring LGU under the state of calamity or a Presidential declaration of state of calamity upon recommendation of the NDRRMC.</li>\
                                        </ul>";
                                break;
                        }
                        return text;
                    }
                },
                position: {
                    my: 'top left',
                    at: 'center center'
                }
            });
        };

        // these are temporary code for changing the basemap until the
        // issue of google maps as base map is resolved
        var layer_select = angular.element('#layer-select');
        var bingmaps = layer_select.scope().basemaps[5];
        layer_select.scope().basemap = bingmaps;
        layer_select.scope().changeMap(bingmaps);


        // initialize the websafe window height
        var mapHeight = $window.innerHeight -
                        $rootScope.navbar.height() -
                        $rootScope.footer.height();
        var websafeHeight = mapHeight - $rootScope.toolbar.height();
        $('.websafe_window').css({'height': websafeHeight});
    }
]);

})();


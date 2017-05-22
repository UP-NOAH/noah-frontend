'use strict';

var module = angular.module('toolbar_module', [
    'map_module',
    'ol3_service',
    'toolbar_service'
]);

module.config([
    '$compileProvider',
    function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data|chrome-extension):/);
    }
]);

//module.controller('SearchCtrl', function($scope, $rootScope){
//    //var map = $rootScope.map;
//
//    // for autocomplete of search item
//	google.maps.event.addListener(
//		new google.maps.places.Autocomplete(
//            document.getElementById('area')),
//        'place_changed',
//		showSearchResult
//	);
//
//    function CenterMap() {
//        $rootScope.map.getView().setCenter(ol.proj.transform([121.0, 15.0], 'EPSG:4326', 'EPSG:3857'));
//        $rootScope.map.getView().setZoom(22);
//    }
//    // function for search button
//    function showSearchResult() {
//        var place = this.getPlace();
//        var duration = 5000;
//        var start = +new Date();
//        var viewMap2d = $rootScope.map.getView();
//
//        /*var pan = ol.animation.pan({
//            duration: duration,
//            source: viewMap2d.getCenter(),
//            start: start
//        });
//
//        var bounce = ol.animation.bounce({
//            duration: duration,
//            resolution: 4 * viewMap2d.getResolution(),
//            start: start
//        });
//
//        $rootScope.map.beforeRender(pan, bounce);*/
//
//        viewMap2d.setCenter(
//            ol.proj.transform( [
//                    place.geometry.location[Object.keys(place.geometry.location)[1]](),
//                    place.geometry.location[Object.keys(place.geometry.location)[0]]()
//                ],
//                'EPSG:4326',
//                'EPSG:3857'
//            )
//        );
//        console.log(place.geometry.location[Object.keys(place.geometry.location)[1]]);
//        console.log(place.geometry.location[Object.keys(place.geometry.location)[0]]);
//        viewMap2d.setZoom(13);
//    }
//});

module.controller('ToolsCtrl', [
    '$scope',
    '$rootScope',
    'Draw',
    '$timeout',
    function($scope, $rootScope, Draw, $timeout){

        $scope.radioModel = 'off';


        $scope.measureLength = function() {
            //console.log('event: ', event.target.attributes.id.value);
            Draw.cleanDrawLayer();
            Draw.measure('LineString');
        };

        $scope.measureArea = function(){
            //console.log('event: ', event.target.attributes.id.value);
            Draw.cleanDrawLayer();
            Draw.measure('Polygon');
        };

        $scope.dragMode = function(){
            //console.log('event: ', event.target.attributes.id.value);;
            Draw.closeDrawLayer();
        };


        $scope.exportMap = function() {
            //get transform value
            var transform = $(".gm-style>div:first>div").css("transform");
            var comp = transform.split(","); //split up the transform matrix
            var mapleft = parseFloat(comp[4]); //get left value
            var maptop = parseFloat(comp[5]);  //get top value
            $(".gm-style>div:first>div").css({ //get the map container. not sure if stable
              "transform":"none",
              "left":mapleft,
              "top":maptop,
            });
            $('.ol-zoom, .ol-zoomslider, .ol-zoomslider-thumb').css('visibility', 'hidden');

                html2canvas($('#map'), {
                    useCORS: true,
                    onrendered: function(canvas) {

                        // var img = new Image();
                        // var newCanvas = document.createElement('canvas');
                        // var newContext = newCanvas.getContext('2d');
                        // img.src = canvas.toDataURL('image/png');
                        // img.width *= 0.65;
                        // img.height *= 0.65;
                        // newCanvas.width = img.width;
                        // newCanvas.height = img.height;
                        // newContext.drawImage(img, 0, 0, img.width, img.height);

                        var finalImg = canvas.toDataURL('image/png'); //.replace('image/png', 'image/octet-stream');
                        var link = document.createElement('a');
                        document.body.appendChild(link);
                        link.id = "myImg";
                        angular.element(link)
                            .attr('href', finalImg)
                            .attr('download', 'map.png')
                            .attr('target', '_blank');

                        link.click();
                        var linked = document.getElementById('myImg');
                        linked.parentNode.removeChild(linked);

                        $(".gm-style>div:first>div").css({
                            left:0,
                            top:0,
                            "transform":transform
                        });
                        $('.ol-zoom, .ol-zoomslider, .ol-zoomslider-thumb').css('visibility', 'visible');

                        // console.log('linked: ', linked);
                        // if(linked==null) {
                        //     console.log('cleared!');
                        // }
                        //angular.element('#export-png').click();
                        //clear img and newCanvas from memory after initializing download to browser
                        //img = null;
                        //newCanvas = null;
                    }
                });
            //});
            //     var canvas = event.context.canvas;

            //     var img = new Image();
            //     var newCanvas = document.createElement('canvas');
            //     img.src = canvas.toDataURL('image/png');

            //     img.width *= 0.65;
            //     img.height *= 0.65
            //     newCanvas.width = img.width;
            //     newCanvas.height = img.height;
            //     var newContext = newCanvas.getContext('2d');
            //     newContext.drawImage(img, 0, 0, img.width, img.height);

            //     $scope.mapLink = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            //     //clear img and newCanvas from memory after initializing download to browser
            //     img = null;
            //     newCanvas = null;
            //});
            //$rootScope.map.renderSync();
            //$('#export-png').click();
                //angular.element('#export-png').triggerHandler('click');
        };


        $scope.triggerClick = function() {
            //$timeout(function() {
                console.log('here clicked!');
                //angular.element('#export-png').triggerHandler('click');
                angular.element('#export-png').click();
            //});

        }


        $scope.$watch('radioModel', function(newValue, oldValue) {
            if (newValue == 'dist') {
                $scope.measureLength();
            } else if(newValue == 'area') {
                $scope.measureArea();
            } else {
                $scope.dragMode();
            }
        });

    }
]);

module.controller('TickerCtrl', [
    '$scope',
    '$rootScope',
    'TickerService',
    '$timeout',
    function($scope, $rootScope, TickerService, $timeout) {
        var getData = function() {
            $('#weather_news li').remove();
            var news_items = [];
            $scope.errorStatus = false;
            $scope.errorMsg = 'The Ticker Service is Currently Down.';

            TickerService.getTicks()
                .then(function(data) {
                    if(data['error']) {
                        $scope.errorStatus = true;
                    } else {
                        var date = data['date'];
                        var news = data['news'];

                        $scope.date = date;
                        for (var i = 0; i < news.length; i++) {
                            // if (i % 2 == 0) {
                            //     news_items[news_items.length-1] = '';
                            // }
                            // news_items[news_items.length-1] = news_items[news_items.length-1] +
                            // '<span>' + news[i] + '</span>';
                            // if ((i + 1) % 2 == 0 || i == news.length-1) {
                            //     $('#weather_news').append($('<li>').html(news_items[news_items.length-1]));
                            // }
                            $('#weather_news').append($('<li>').html(news[i]));
                        }
                        $scope.errorStatus = false;
                        $timeout(getData, 5 * 60 * 1000);
                    }

                }, function(data) {
                    console.log('Error: ', data);
                });

        }

        var animate_ticker = function() {
            $('#weather_news li:first').slideUp(function() {
                $(this).appendTo($('#weather_news')).slideDown(200);
            });
            $timeout(animate_ticker, 7000);
        }

        getData();
        animate_ticker();
}]);

module.controller('TwitterCtrl', [
    '$scope',
    '$rootScope',
    '$timeout',
    function($scope, $rootScope, $timeout) {
        var new_tweets = [];
        var tweet_state = true;
        $scope.latest_tweets = [];

        var ws = new WebSocket("#####");

        ws.onopen = function() {
            //console.log('twitter connection opened!');
        }

        ws.onerror = function(event) {
            var error = JSON.parse(event.data);
            //console.log('error! : ', error);
        }

        ws.onmessage = function(event) {
           var tweets = JSON.parse(event.data);
           var latest_tweets = tweets['latest_tweets'];
           //console.log('tweets length: ', latest_tweets.length);
           //$scope.latest_tweets = latest_tweets.reverse();
           for (var i = 0; i < latest_tweets.length; i++) {
                var html = '<a target="_blank" href="http://twitter.com/' + latest_tweets[i].username +
                    '">@' + latest_tweets[i].username + '</a>&nbsp;' + latest_tweets[i].text;
                if ($.inArray(latest_tweets[i].id, new_tweets) == -1) {
                    new_tweets.push(latest_tweets[i].id);
                    $('<li>').html(html).hide().prependTo('#twitter ul').fadeIn('slow');

                    $('#twitter_panel span').html(panel_html).hide();
                    var panel_html = '<a target="_blank" href="http://twitter.com/' + latest_tweets[latest_tweets.length-1].username +
                    '">@' + latest_tweets[latest_tweets.length-1].username + '</a>&nbsp;' + latest_tweets[latest_tweets.length-1].text;
                    if(!tweet_state) $('#twitter_panel span').html(panel_html).fadeIn('slow');
                }
           }
           //$scope.latest_tweets = tweets['latest_tweets'];
           //console.log('tweets: ', latest_tweets);
        }

        ws.onclose = function() {
            //console.log('twitter connection closed!');
        }

        $('#twitter h4').on('click', function(e) {
            e.preventDefault();
            $('#twitter_panel span').fadeIn('slow');
            $('#twitter_button').fadeIn('slow');
            $('#twitter').fadeToggle('fast', function() {
                tweet_state = $('#twitter').is(':visible');
            });
        });

        $('#twitter_panel, #twitter_button').on('click', function(e) {
            //e.preventDefault();
            $('#twitter_panel span').fadeOut('slow');
            $('#twitter_button').fadeOut('slow');
            $('#twitter').fadeToggle('fast', function() {
                tweet_state = $('#twitter').is(':visible');
            });
        });
    }

]);


/*module.directive('appClick', [function() {
    return {
        priority: -1,
        restrict: 'A',
        scope: true,
        template: '<a id="export-png" download="map.png">download</a>',
        // controller: function($scope) {
        //     //$('#export-png').on('click', function() {
        //         console.log('href: ', $('#export-png').attr('href'));
        //         html2canvas($('#map'), {
        //             useCORS: true,
        //             onrendered: function(canvas) {
        //                 var img = canvas.toDataURL('image/png'); //.replace('image/png', 'image/octet-stream');
        //                 img = img.replace('data:image/png;base64,', '');
        //                 var finalImg = 'data:image/png;base64,' + img;
        //                 $('#export-png').attr('href', finalImg);
        //                 return false;
        //             }
        //         });
        //     //});
        // },
        link: function(scope, element, attrs) {
            element.on('click', function(e) {
                console.log('there!');
                html2canvas($('#map'), {
                    useCORS: true,
                    onrendered: function(canvas) {
                        var img = new Image();
                        var newCanvas = document.createElement('canvas');
                        img.src = canvas.toDataURL('image/png');

                        img.width *= 0.65;
                        img.height *= 0.65
                        newCanvas.width = img.width;
                        newCanvas.height = img.height;
                        var newContext = newCanvas.getContext('2d');
                        newContext.drawImage(img, 0, 0, img.width, img.height);
                        console.log('src: ', img.src);
                        console.log('newCanvas width: ', newCanvas.width);
                        console.log('newCanvas: ', newCanvas.toDataURL('image/png'));
                        var finalImg = newCanvas.toDataURL('image/png'); //.replace('image/png', 'image/octet-stream');
                        $('#export-png').attr('href', finalImg);
                        //clear img and newCanvas from memory after initializing download to browser
                        //img = null;
                        //newCanvas = null;
                        /*var img = canvas.toDataURL('image/png'); //.replace('image/png', 'image/octet-stream');
                        img = img.replace('data:image/png;base64,', '');
                        var finalImg = 'data:image/png;base64,' + img;
                        $('#export-png').attr('href', finalImg);*/
                        //return true;
                    /*}
                });
            });
        }
    }
}]);
*/



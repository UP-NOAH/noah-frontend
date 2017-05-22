'use strict';

// Dependency Injections
//
var module = angular.module('noahApp', [
    'map_module',
    'ol3_module',
    'window_module',
    'toolbar_module',
    'sidebar_module',
    'websafe_module',
    'ngRoute',
    'ngAnimate',
    'angular-data.DSCacheFactory'
]);

// Route Configurations
//
module.config([
    '$routeProvider',
    'DSCacheFactoryProvider',
    function($routeProvider, DSCacheFactoryProvider){
        $routeProvider.
        when('/', {
            controller: 'SidebarCtrl'
        }).when('/:component/:section', {
            controller: 'Menu1Ctrl',
            templateUrl:'/noahapi/menulevel1'
        }).when('/section/:component/:section', {
            controller: 'Menu1Ctrl',
            templateUrl:'/noahapi/menulevel2',
        }).when('', {
            controller: '',
            templateUrl:''
        }).when('/websafe', {
            controller: 'WebsafeCtrl',
            templateUrl:'/websafe'
        }).otherwise({
            redirectTo:'/'
        });

        DSCacheFactoryProvider.setCacheDefaults({
            maxAge: 86400000,
            deleteOnExpire: 'aggressive',
            storageMode: 'localStorage',
        });

    }
]);

module.run(
    function($rootScope, $window, $location){
        // On window onload
        //
        $location.url('/');
        $rootScope.$apply();

        // Set some global defaults
        //
        $rootScope.map = null;
        $rootScope.gmap = null;
	    $rootScope.allData = {};
        $rootScope.navbar = $('.navbar');
        $rootScope.footer = $('#footer');
        $rootScope.mapdiv = $('#map');
        $rootScope.toolbar = $('#toolbar');
        $rootScope.layers = [];
        $rootScope.markers = {};
        $rootScope.facilityMarkers = {};
        $rootScope.hazardMaps = {};

        // Draw Functions
        $rootScope.draw = null;
        $rootScope.drawVector = null;

        function initWindowSize(){
            $rootScope.windowHeight = $window.innerHeight;
            $rootScope.windowWidth = $window.innerWidth;
            // var menubarWidth = document.getElementById('menubar').clientWidth;
            // document.getElementById('sidemenu').style.width = menubarWidth + 'px';
        };

        angular.element($window).bind('resize', function(){
            initWindowSize();
            $rootScope.$apply();
        });

        // HighChartsJS Configurations
        //
        $("#charts, .tables").draggable();
        $("#charts").draggable("disable");


        //this updates the map and other UI size when the window is resized
        //
        $rootScope.$watch('windowHeight', function(newVal, oldVal){
            var mapHeight = newVal -
                            $rootScope.navbar.height()  + 'px'; //-
                            // $rootScope.footer.height() + 'px';
            //var sideMenuHeight = mapHeight - $rootScope.toolbar.height();
            //var websafeHeight = mapHeight - $rootScope.toolbar.height() + 'px';

            $rootScope.mapdiv.height(mapHeight);
            //$('#sidemenu').css('height', sideMenuHeight);
            //$('.websafe_window').css('height', websafeHeight);
            $rootScope.map.updateSize();
            // if ($('#sidemenu')) {
            //     $('#sidemenu').css('height', sideMenuHeight);
            // }

            // if ($('.websafe_window')) {
            //     $('.websafe_window').css('height', websafeHeight);
            // }
        });

        initWindowSize();
    }
);



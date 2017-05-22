'use strict';

var module = angular.module('sidebar_service', [
	'ngResource'
]);

module.factory('SectionService', ['$resource',
	function($resource) {

		// Make HTTP GET requests to retrieve the data
		// of the corresponding component
		//
		return $resource('/:component/:section', {}, {
			query: {
				method: 'GET',
				params: {
						component: 'floodweather',
						section: 'all'
					},
				isArray: false,
				cache: true
			}
		});
	}
]);

module.factory('ReqService', [
	'$http',
	'$q',
	'$resource',
	function($http, $q, $resource) {

		// Make HTTP GET requests regarding of the
		// method's name
		//
		return {

			getSplash: function(location) {
				return $http.get('/splash/' + location)
					.then(function(response) {
						if (typeof response.data !== 'undefined') {
							return response.data;
						} else {
							return $q.reject(response.data);
						}
					}, function(response) {
						return $q.reject(response.data);
					})
			},

			getSevenday: function(id) {
				return $http.get('/sevenday/' + id)
					.then(function(response) {
						if (typeof response.data !== 'undefined') {
							return response.data;
						} else {
							return $q.reject(response.data);
						}
					}, function(response) {
						return $q.reject(response.data);
					})
			},

			getIcons: function(callback) {
				$http.get('/sidebar').success(callback);
			},

			getLinks: function() {
				return $http.get('/links')
					.then(function(response) {
						if (typeof response.data !== 'undefined') {
							return response.data;
						} else {
							return $q.reject(response.data);
						}
					}, function(response) {
						return $q.reject(response.data);
					})
			},

			getReports: function(year) {
				return $http.get('/flood/reports/' + year)
					.then(function(response) {
						if (typeof response.data !== 'undefined') {
							return response.data;
						} else {
							return $q.reject(response.data);
						}
					}, function(response) {
						return $q.reject(response.data);
					})
			},

			getLocations: function(type) {
				return $http.get('/location/' + type)
					.then(function(response) {
						if (typeof response.data !== 'undefined') {
							return response.data;
						} else {
							return $q.reject(response.data);
						}
					}, function(response) {
						return $q.reject(response.data);
					})
			},

//			getMapboxLayers: function(callback) {
//				$http.get('/mapbox_layers').success(callback);
//			},

			getForecasts: function(type) {
				return $http.get('/weather/' + type)
					.then(function(response) {
						if (typeof response.data !== 'undefined') {
							return response.data;
						} else {
							return $q.reject(response.data);
						}
					}, function(response) {
						return $q.reject(response.data);
					})
			}

		}
}]);

module.factory('VariableService', ['', function(){
	return function name(){

	};
}]);




'use strict';

var module = angular.module('toolbar_service', [

]);

module.factory('TickerService', [
    '$http',
    '$q',
    function($http, $q) {
        return {
            getTicks: function() {
                return $http.get('/ticker')
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
    }
]);
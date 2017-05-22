'use strict';

var module = angular.module('window_service', [

]);

module.factory('_', function() {
    return window._;
})

module.filter(
    'reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    }
);

module.directive('eatClick', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.preventDefault();
        });
    }
});
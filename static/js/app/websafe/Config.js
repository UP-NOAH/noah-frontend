(function(){

var module = angular.module('websafe_config', []);

module.factory('WebsafeConfig', function() {
    return {

        geoserver_url : '######',
        hazard_url : 'hazards',
        exposure_url : 'exposures',
        calculate_url : 'calculate',
        data_url : 'websafe/data',
        metadata_url : 'websafe/metadata',
        profile_url: 'websafe/profile',


        impact_functions : [
            {label: 'Be Flooded', value: 'structure'},
            {label: 'Need Evacuation', value: 'population'}
        ]

    };
});
})();
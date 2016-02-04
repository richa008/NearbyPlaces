var placesApp = angular.module('placesApp', ["ngResource"]);

//CONTROLLERS
placesApp.controller('searchPlacesController', function($scope, mapServices, $rootScope, placeDetailsService){
    
    //Sets the height of the window
    $("#searchPlaces").height($(window).height());
    $("#placeDetails").height($(window).height());
    
    //Submits the keyword for searching
    $scope.submitForm = function(){
        
        function callback(results, status){
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                $scope.nearbyPlaces = {};
                $scope.nearbyPlaces.list = results;
                $scope.$apply();
                
                mapServices.clearMarkers();
                for (var i = 0; i < results.length; i++) {
                    mapServices.createMarker(results[i]);
                }
            }
        };
        
        mapServices.searchNearby($scope.searchString, callback);
    };
    
    //Selected item in list of places
    $scope.selected = -1;
   
    //Gets details of the selected place
    $scope.getPlaceDetails = function(placeId, index){                
        $scope.selected = index;               
        function callback(result, status){
            if (status === google.maps.places.PlacesServiceStatus.OK) {
    
                mapServices.clearMarkers();
                mapServices.createMarker(result);
                placeDetailsService.placeDetails = result;
                $rootScope.$broadcast('data:updated',result);
            }
        }
        mapServices.getPlaceDetails(placeId, callback);
    };
});

placesApp.controller('placeDetailsController', function($scope, mapServices, placeDetailsService){
   
    mapServices.initMap();
    $scope.details = {};
    
    //When place is selected, display the details
    $scope.$on('data:updated', function(event, data) {
        $scope.details = placeDetailsService.placeDetails;
        $scope.$apply();
   });
});


//SERVICES
placesApp.service('placeDetailsService', function(){
    this.placeDetails = {};
});


placesApp.service('mapServices', function(){
    
    var map, pos, infoWindow, markersArray = [];
        
    //Initialize google map
    this.initMap = function(){  
          map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 12
        });
        infoWindow = new google.maps.InfoWindow({map: map});

        //HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('Location found.');
                map.setCenter(pos);
                
            });
        }
    };
    
    //Google textSearch Javascript api
    this.searchNearby = function(searchString, callback){        
        var service = new google.maps.places.PlacesService(map);
        service.textSearch({
            location: pos,
            radius: 500,
            query: searchString
        }, callback);
    };
    
    //Google getDetails Javascript api
    this.getPlaceDetails = function(id, callback){
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: id
        }, callback);
    };
    
    //Creates a marker on the map
    this.createMarker = function(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
        markersArray.push(marker);

        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(place.name);
            infoWindow.open(map, this);
        });
    };
    
    //Clears all markers on the map
    this.clearMarkers = function(){
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    };
});

//FILTERS
placesApp.filter('isEmpty', [function() {
  return function(object) {
    return angular.equals({}, object);
  }
}])

$(window).on('resize', function(){
    $("#searchPlaces").height($(window).height());
    $("#placeDetails").height($(window).height());
});
    
    
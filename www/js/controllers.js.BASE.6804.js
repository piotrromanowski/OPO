angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading, $compile, $state, $http) {
      $scope.submitLocations = function () {
          var start = $scope.location.start;
          var end = $scope.location.end;
          var googleKey = "AIzaSyDOeBvCcjFxfGnvcrS4a4RZ7dgqi3kbGKc";
          var source = "https://maps.googleapis.com/maps/api/geocode/json?address=" + start + "&key=" + googleKey;
          var origin, destination;
          $http.get(source).success(function (data1) {
              if(data1 && data1.results) {
                origin = data1.results[0].geometry.location;
                var source = "https://maps.googleapis.com/maps/api/geocode/json?address=" + end + "&key=" + googleKey;
                $http.get(source).success(function (data2) {
                  if(data2 && data2.results) {
                    destination = data2.results[0].geometry.location;
                    $scope.listUber = $scope.getListUber(origin, destination);
                  }
                });
              }
          });
      };
      $scope.getListUber = function (origin, destination) {

          var url = 'https://api.uber.com/v1/estimates/price?server_token=yaxyXHwMLN6-xh8EOuP3LMmQbDSYR2UP3aQCGeNB&start_latitude=' + origin.lat;
          url += '&start_longitude=' + origin.long;
          url += '&end_latitude=' + destination.lat;
          url += '&end_longitude=' + destination.long;

          var req = {
             'method': 'GET',
             'url': url,
             'dataType' : 'json'
          }

          $http(req).then(function(resp) {
              console.log('Success', resp);
            }, function(err) {
              console.error('ERR', err);
            });
      };
      $scope.location = {};
      function initialize() {
        var mapOptions = {
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
        $scope.map = map;
        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        $ionicLoading.hide();
        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
            map: map,
            title: 'Uluru (Ayers Rock)'
          });

          var geocoder = new google.maps.Geocoder();
          var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          var contentString;
          geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              contentString = "<div>" + results[0].formatted_address + "</div>";
              $scope.location.start = results[0].formatted_address;
              $scope.$apply();
            } else {
              contentString = "<div>Your current location!</div>";
            }
            //Marker + infowindow + angularjs compiled ng-click
            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
                content: compiled[0]
              });
              infowindow.open(map,marker);
            }, function(error) {
              alert('Unable to get location: ' + error.message);
          });
        });
      }
      google.maps.event.addDomListener(window, 'load', initialize);
});

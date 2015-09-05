angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading, $compile, $state) {
      $scope.submitLocations = function () {
          $state.go('app.flist');

      };
      $scope.getUberResults = function (orig, dest) {
            url = 'https://api.uber.com/v1/estimates/price'
            parameters = {
              start_latitude: 51.5033630,
              start_longitude: -0.1276250,
              end_latitude: 53.5033630,
              end_longitude: -0.1276250
            }

            var config = {headers:  {
                    'Authorization': 'Token yaxyXHwMLN6-xh8EOuP3LMmQbDSYR2UP3aQCGeNB'
                }
            };

            $http.get(url, config).then(function(resp) {
                console.log('Success', resp);
                // For JSON responses, resp.data contains the result
              }, function(err) {
                console.error('ERR', err);
                // err.status will contain the status code
              });

      }
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

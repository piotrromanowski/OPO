angular.module('starter.controllers', [])

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $compile, $state, $http) {
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
                    $rootScope.listUber = $scope.getListUber(origin, destination);
                    $state.go('app.flist');
                  }
                });
              }
          });
      };
      $scope.getListUber = function (origin, destination) {
          //var origin = {lat: 51.5033630, long: -0.1276250};
          //var destination = {lat: 51.5033830, long: -0.1276250};

          var url = 'https://api.uber.com/v1/estimates/price?server_token=yaxyXHwMLN6-xh8EOuP3LMmQbDSYR2UP3aQCGeNB&start_latitude=' + origin.lat;
          url += '&start_longitude=' + origin.lng;
          url += '&end_latitude=' + destination.lat;
          url += '&end_longitude=' + destination.lng;

          var req = {
             'method': 'GET',
             'url': url,
             'dataType' : 'json'
          }

          $http(req).then(function(uberPrice) {
              $rootScope.uberPrice = uberPrice.data.prices;
              url = 'https://api.uber.com/v1/estimates/time?server_token=yaxyXHwMLN6-xh8EOuP3LMmQbDSYR2UP3aQCGeNB&start_latitude=' + origin.lat;
              url += '&start_longitude=' + origin.lng;
              req = {
                 'method': 'GET',
                 'url': url,
                 'dataType' : 'json'
              };

                  origin = new google.maps.LatLng(origin.lat, origin.lng);
                  destination = new google.maps.LatLng(destination.lat, destination.lng);

                  var service = new google.maps.DistanceMatrixService();
                  service.getDistanceMatrix({
                      origins: [origin],
                      destinations: [destination],
                      travelMode: google.maps.TravelMode.DRIVING
                    }, function(response, status) {
                      var rows = response.rows;
                      var row = rows[0];
                      var duration = row["elements"][0].duration;
                      var second = duration.value;
                      var data = [];
                      for(var price in $rootScope.uberPrice) {
                        data.push({
                          image: "Uber.jpg",
                          name: $rootScope.uberPrice[price].display_name,
                          price: $rootScope.uberPrice[price].estimate,
                          duration: $rootScope.uberPrice[price].duration + second
                        });
                      }
                      $rootScope.datas = data;
                      $rootScope.$apply();
                  });
                } , function(err) {
                  console.error('ERR2', err);
              });
      };

      var totalRails = [];
      function getPublicTransport(transitMode, getNextPublic, onFinalTransit) {
          var origin = {lat: 51.5033630, long: -0.1276250};
          var destination = {lat: 51.5033830, long: -0.1276250};

          origin = new google.maps.LatLng(origin.lat, origin.lng);
          destination = new google.maps.LatLng(destination.lat, destination.lng);

          var service = new google.maps.DistanceMatrixService();
          service.getDistanceMatrix({
              origins: [origin],
              destinations: [destination],
              travelMode: google.maps.TravelMode.TRANSIT
              ,transitOptions: {modes: [transitMode]}
            }, callback);

          function callback(response, status) {
            var rows = response.rows;
            var row = rows[0];
            var duration = row["elements"][0];
            if (typeof duration.status === "string") {
                console.log("woops nothing for " + transitMode);
            } else {
                console.log("Your route for " + transitMode + " is ");
                console.log(duration);
                // push the type and time
                var second = duration.value;
                totalRails.push({name: transitMode, time: second})
            }
            if (getNextPublic && (typeof getNextPublic !== "string")) {
                getNextPublic();
            } else if (onFinalTransit){
                onFinalTransit(totalRails);
            }
          }
      }

      function getAllPublicTransport(callback) {
          totalRails = [];
          getPublicTransport(google.maps.TransitMode.BUS,
            getPublicTransport(google.maps.TransitMode.RAIL,
              getPublicTransport(google.maps.TransitMode.SUBWAY,
                getPublicTransport(google.maps.TransitMode.TRAIN), "", callback)));
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

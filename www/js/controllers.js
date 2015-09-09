angular.module('starter.controllers', [])

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $compile, $state, $http, $timeout, $ionicPopup) {

      $rootScope.items = ["price", "duration", "distance"];
      $rootScope.data = {};
      $rootScope.data.index = 1;

      $rootScope.resort = function($scope) {
          var index = $rootScope.data.index;
          if (index === 0) {
              $rootScope.datas = $rootScope.datas.sort(function(a, b) { return a.priceVal - b.priceVal});
          } else if (index === 1) {
              $rootScope.datas = $rootScope.datas.sort(function(a, b) { return a.durationVal - b.durationVal});
          } else {
              $rootScope.datas = $rootScope.datas.sort(function(a, b) { return a.distanceVal - b.distanceVal});
          }
      }

      $scope.submitLocations = function () {
          var start = $scope.location.start;
          var end = $scope.location.end;
          $rootScope.startLocation = start;
          $rootScope.endLocation = end;
          var googleKey = "AIzaSyDOeBvCcjFxfGnvcrS4a4RZ7dgqi3kbGKc";
          var source = "https://maps.googleapis.com/maps/api/geocode/json?address=" + start + "&key=" + googleKey;
          var origin, destination;
          $http.get(source).success(function (data1) {
              if(data1 && data1.results) {
                origin = data1.results[0].geometry.location;
                var source = "https://maps.googleapis.com/maps/api/geocode/json?address=" + end + "&key=" + googleKey;
                $http.get(source).success(function (data2) {
                  if(data2 && data2.results) {
                    if(data2.results[0] === undefined) {
                        var myPopup1 = $ionicPopup.show({
                          title: 'Invalid locations',
                          subTitle: 'Please re-enter the correct locations',
                          scope: $scope,
                          buttons: [
                            { text: 'Return!',
                            type: 'button-positive' }
                          ]
                        });
                        myPopup1.then(function(res) {
                          $state.go('app.start');
                        });
                    } else {
                      destination = data2.results[0].geometry.location;
                      $rootScope.listUber = $scope.getListUber(origin, destination);
                      getAllPublicTransport(origin, destination);
                      $state.go('app.flist');
                    }
                  }
                });
              }
          });
      };
      $rootScope.getDetail = function(data) {
        if(data.name.toLowerCase().indexOf('uberxl') > -1) $state.go('app.uberxl');
        else if(data.name.toLowerCase().indexOf('uberx') > -1) $state.go('app.uberx');
        else if(data.name.toLowerCase().indexOf('uberblack') > -1) $state.go('app.uberblack');
        else if(data.name.toLowerCase().indexOf('ubersuv') > -1) $state.go('app.ubersuv');
        else if(data.name.toLowerCase().indexOf('uberfamily') > -1) $state.go('app.uberfamily');
      };

      $rootScope.isUber = function (data) {
        return data.name.toLowerCase().indexOf('uber') > -1;
      };
      $scope.getListUber = function (origin, destination) {
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

                  var originUber = new google.maps.LatLng(origin.lat, origin.lng);
                  var destinationUber = new google.maps.LatLng(destination.lat, destination.lng);
                  var service = new google.maps.DistanceMatrixService();
                  var data = [];
                  service.getDistanceMatrix({
                      origins: [originUber],
                      destinations: [destinationUber],
                      travelMode: google.maps.TravelMode.DRIVING
                    }, function(response, status) {
                      var rows = response.rows;
                      var row = rows[0];
                      var duration = row["elements"][0].duration;
                      var second = duration.value;

                      for(var price in $rootScope.uberPrice) {
                        var result = "";
                        result += Number(($rootScope.uberPrice[price].duration + second)/60).toFixed(2);

                        if (result >= 60) {
                            hours = Math.floor(result/60);
                            minutes = Math.floor(result % 60);
                            result = hours + (hours > 1 ? " hours " : " hour ") + (minutes > 0 ? minutes + (minutes > 1 ? " minutes" : " minute") : "");
                        } else {
                          result += (result > 1 ? " minutes" : " minute");
                        }

                        if (typeof $rootScope.datas === 'undefined' || !$rootScope.datas) {
                            $rootScope.datas = [];
                        }

                        $rootScope.datas.push({
                          image: "Uber.jpg",
                          name: $rootScope.uberPrice[price].display_name,
                          price: $rootScope.uberPrice[price].estimate,
                          priceVal : $rootScope.uberPrice[price].low_estimate,
                          distance: $rootScope.uberPrice[price].distance + " miles",
                          distanceVal: $rootScope.uberPrice[price].distance,
                          duration: result,
                          durationVal: $rootScope.uberPrice[price].duration + second
                        });
                        $rootScope.$apply();
                      }
                  });
                } , function(err) {
                  var myPopup = $ionicPopup.show({
                    title: 'Invalid locations',
                    subTitle: 'Please re-enter the correct locations',
                    scope: $scope,
                    buttons: [
                      { text: 'Go back!',
                      type: 'button-positive' }
                    ]
                  });
                  myPopup.then(function(res) {
                    $state.go('app.start');
                  });
              });
      };

      function getPublicTransport(transitMode, origin, destination) {
          var originMap = new google.maps.LatLng(origin.lat, origin.lng);
          var destinationMap = new google.maps.LatLng(destination.lat, destination.lng);

          var service = new google.maps.DistanceMatrixService();
          service.getDistanceMatrix({
              origins: [originMap],
              destinations: [destinationMap],
              travelMode: google.maps.TravelMode.TRANSIT
              ,transitOptions: {modes: [transitMode]}
            }, callback);

          function callback(response, status) {
            var rows = response.rows;
            var row = rows[0];
            var route = row.elements[0];

            if (route && route.status === "ZERO_RESULTS") {
                console.log("woops nothing for " + transitMode);
            } else {
                var duration = route.duration.text;
                var durationVal = route.duration.value;
                var fare = (typeof route.fare !== 'undefined' ? route.fare.text: "check website");
                var priceVal = (typeof route.fare !== 'undefined' ? route.fare.value: 0)
                var distance = (Number((route.distance.value /1000)) * 0.6).toFixed(2);
                var distanceVal = distance;
                distance = distance > 1 ? + distance + " miles" : distance + " mile";

                if (typeof $rootScope.datas === 'undefined' || !$rootScope.datas) {
                    $rootScope.datas = [];
                }
                $rootScope.datas.push({
                  name: transitMode,
                  image: transitMode + ".jpg",
                  duration: duration,
                  durationVal: durationVal,
                  price: fare,
                  priceVal : priceVal,
                  distance: distance,
                  distanceVal: distanceVal
                });
                $rootScope.$apply();
            }
          }
      }

      function getAllPublicTransport(origin, destination) {
          getPublicTransport(google.maps.TransitMode.BUS, origin, destination);
          // getPublicTransport(google.maps.TransitMode.RAIL, origin, destination);
          getPublicTransport(google.maps.TransitMode.SUBWAY, origin, destination);
          getPublicTransport(google.maps.TransitMode.TRAIN, origin, destination);
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

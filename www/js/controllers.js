angular.module('starter.controllers', [])

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $compile, $state, $http, $timeout, $ionicPopup) {
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
                        result += Number(($rootScope.uberPrice[price].duration + second)/60).toFixed(2) + " mins";



                        data.push({
                          image: "Uber.jpg",
                          name: $rootScope.uberPrice[price].display_name,
                          price: $rootScope.uberPrice[price].estimate,
                          distance: $rootScope.uberPrice[price].distance + " miles",
                          duration: result
                        });
                      }

                      //populate data for Septa by google API
                      var originMap = new google.maps.LatLng(origin.lat, origin.lng);
                      var destinationMap = new google.maps.LatLng(destination.lat, destination.lng);
                      var service = new google.maps.DistanceMatrixService();
                      service.getDistanceMatrix({
                          origins: [originMap],
                          destinations: [destinationMap],
                          travelMode: google.maps.TravelMode.TRANSIT
                          ,transitOptions: {modes: [google.maps.TransitMode.BUS]}
                        }, function(response, status) {
                          if(response.rows[0].elements.length > 0) {
                            for(var i in response.rows[0].elements) {
                              if(response.rows[0].elements[i].status !== 'ZERO_RESULTS') {
                                  data.push({
                                name: "Septa Bus " + Math.floor((Math.random() * 125) + 1),
                                image: "septaBus.jpg",
                                distance: response.rows[0].elements[i].distance.text,
                                duration: response.rows[0].elements[i].duration.text,
                                price: response.rows[0].elements[i].fare ? response.rows[0].elements[i].fare.text : "$2.25"
                              });
                              }
                            }
                            //populate data for Septa by google API
                            originMap = new google.maps.LatLng(origin.lat, origin.lng);
                            destinationMap = new google.maps.LatLng(destination.lat, destination.lng);
                            service = new google.maps.DistanceMatrixService();
                            service.getDistanceMatrix({
                                origins: [originMap],
                                destinations: [destinationMap],
                                travelMode: google.maps.TravelMode.TRANSIT
                                ,transitOptions: {modes: [google.maps.TransitMode.SUBWAY]}
                              }, function(response, status) {
                                if(response.rows[0].elements.length > 0) {
                                  for(var i in response.rows[0].elements) {
                                    data.push({
                                      name: "Septa Subway",
                                      image: "subway.jpg",
                                      distance: response.rows[0].elements[i].distance.text,
                                      duration: response.rows[0].elements[i].duration.text,
                                      price: response.rows[0].elements[i].fare ? response.rows[0].elements[i].fare.text : "$2.25"
                                    });
                                  }
                                  //populate data for Septa by google API
                                  originMap = new google.maps.LatLng(origin.lat, origin.lng);
                                  destinationMap = new google.maps.LatLng(destination.lat, destination.lng);
                                  service = new google.maps.DistanceMatrixService();
                                  service.getDistanceMatrix({
                                      origins: [originMap],
                                      destinations: [destinationMap],
                                      travelMode: google.maps.TravelMode.TRANSIT
                                      ,transitOptions: {modes: [google.maps.TransitMode.SUBWAY]}
                                    }, function(response, status) {
                                      if(response.rows[0].elements.length > 0) {
                                        for(var i in response.rows[0].elements) {
                                          data.push({
                                            name: "Septa Trolley",
                                            image: "trolley.jpg",
                                            distance: response.rows[0].elements[i].distance.text,
                                            duration: response.rows[0].elements[i].duration.text,
                                            price: response.rows[0].elements[i].fare ? response.rows[0].elements[i].fare.text : "$2.25"
                                          });
                                        }
                                        $rootScope.datas = data;
                                        $rootScope.$apply();
                                      }
                                    });
                                  $rootScope.datas = data;
                                  $rootScope.$apply();
                                }
                              });
                            $rootScope.datas = data;
                            $rootScope.$apply();
                          }
                        });
                      $rootScope.datas = data;
                      $rootScope.$apply();
                  });
                } , function(err) {
                  // An elaborate, custom popup
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

      // var totalRails = [];
      // function getPublicTransport(transitMode, getNextPublic, onFinalTransit) {
      //     var origin = {lat: 51.5033630, long: -0.1276250};
      //     var destination = {lat: 51.5033830, long: -0.1276250};

      //     var originMap = new google.maps.LatLng(origin.lat, origin.lng);
      //     var destinationMap = new google.maps.LatLng(destination.lat, destination.lng);

      //     var service = new google.maps.DistanceMatrixService();
      //     service.getDistanceMatrix({
      //         origins: [originMap],
      //         destinations: [destinationMap],
      //         travelMode: google.maps.TravelMode.TRANSIT
      //         ,transitOptions: {modes: [transitMode]}
      //       }, callback);

      //     function callback(response, status) {
      //       var rows = response.rows;
      //       var row = rows[0];
      //       var duration = row["elements"][0];
      //       if (typeof duration.status === "string" && duration.status === "ZERO_RESULTS") {
      //           console.log("woops nothing for " + transitMode);
      //       } else {
      //           console.log("Your route for " + transitMode + " is ");
      //           console.log(duration);
      //           // push the type and time
      //           var second = duration.value;
      //           totalRails.push({name: transitMode, time: second, image: 'septa.jpg'})
      //       }
      //       if (getNextPublic && (typeof getNextPublic !== "string")) {
      //           getNextPublic();
      //       } else if (onFinalTransit){
      //           onFinalTransit(totalRails);
      //       }
      //     }
      // }

      // $scope.getAllPublicTransport = function() {
      //     totalRails = [];
      //     $scopegetPublicTransport(google.maps.TransitMode.BUS,
      //       $scopegetPublicTransport(google.maps.TransitMode.RAIL,
      //         $scopegetPublicTransport(google.maps.TransitMode.SUBWAY,
      //           $scopegetPublicTransport(google.maps.TransitMode.TRAIN), "", callback)));
      // }

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

angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/social/menu.html"
    })

    .state('app.uberblack', {
      url: "/uberblack",
      views: {
        'menuContent' : {
          templateUrl: "templates/social/uberblack.html"
        }
      }
    })

    .state('app.uberxl', {
      url: "/uberxl",
      views: {
        'menuContent' : {
          templateUrl: "templates/social/uberxl.html"
        }
      }
    })

    .state('app.ubersuv', {
      url: "/ubersuv",
      views: {
        'menuContent' : {
          templateUrl: "templates/social/ubersuv.html"
        }
      }
    })

    .state('app.uberfamily', {
      url: "/uberfamily",
      views: {
        'menuContent' : {
          templateUrl: "templates/social/uberfamily.html"
        }
      }
    })

    .state('app.uberx', {
      url: "/uberx",
      views: {
        'menuContent' : {
          templateUrl: "templates/social/uberx.html"
        }
      }
    })

    .state('app.start', {
      url: "/start",
      views: {
        'menuContent' :{
          templateUrl: "templates/social/start-panel.html"
        }
      },
      controller: 'MapCtrl'
    })

    .state('app.flist', {
      url: "/flist",
      views: {
        'menuContent' :{
          templateUrl: "templates/social/friends.html"
        }
      }
    })
    
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/start');
});


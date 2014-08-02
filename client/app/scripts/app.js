'use strict';
/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
  .module('clientApp', [
    'angularCharts',
    'btford.socket-io',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/:roomid', { 
        //Always put this route AFTER other major routes otherwise it will override them 
        //e.g. it will think /about is a room with id "about"
        templateUrl: 'views/session.html',
        controller: 'SessionCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('mySocket', function (socketFactory) {
    var myIoSocket = io.connect('http://172.18.1.251:3000');

    var mySocket = socketFactory({
      ioSocket: myIoSocket
    });

    return mySocket;
  });
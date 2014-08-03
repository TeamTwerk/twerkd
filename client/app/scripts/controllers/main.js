'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('MainCtrl', function ($scope, mySocket) {
    mySocket.emit('data', {m: "getRooms"});
    mySocket.on('data', function (data) {
      switch(data.m) {
        case "rooms":
          $scope.rooms = data.c.rooms;
          break;
      }
    });
  });

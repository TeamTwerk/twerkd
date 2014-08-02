'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:SessionCtrl
 * @description
 * # SessionCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('SessionCtrl', function (mySocket,$scope) {  	
  	mySocket.on('data', function(data) {
  		$scope.tpm = data.c['tpm'];
  		$scope.t = Math.round(data.c['t']);
  		console.log(data);
  	});
});
'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:SessionCtrl
 * @description
 * # SessionCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('SessionCtrl', function (mySocket,$scope,$routeParams) {  	
  $scope.page = 0;

  //Join the room that was passed in the url (route params)
	mySocket.emit('join', {c:{ roomId: $routeParams.roomid} });
  	
  	mySocket.on('data', function(data) {
  		switch(data.m) {
  			case 'twerk':
  				handleTwerk(data.c);
  				break;
  		}
  	});

  	function handleTwerk(data) {
		$scope.tpm = data['tpm'];
		$scope.t = Math.round(data['t']);
	}
});
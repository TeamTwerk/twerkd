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

  $scope.numPages = 3; //todo update this with the number of pages in the switch statement in session.html

  initDebugData();

  //Join the room that was passed in the url (route params)
	mySocket.emit('join', {c:{ roomId: $routeParams.roomid} });
  	
  	mySocket.on('data', function(data) {
  		switch(data.m) {
  			case 'twerk':
  				handleTwerk(data.c);
  				break;
  		}
  	});

    //Simple pagination function
    $scope.pageLeft = function pageLeft() {
      $scope.page = Math.max($scope.page - 1, 0);
    }

    $scope.pageRight = function pageRight() {
      $scope.page = Math.min($scope.page + 1, $scope.numPages-1);
    }

  	function handleTwerk(data) {
  		$scope.tpm = data['tpm'];
  		$scope.t = Math.round(data['t']);
    }

    function initDebugData() {
       $scope.graphData = {
        "series": [
          "Player 45",
          "Player 51"
        ],
        "data": [
          {
            "x": "15",
            "y": [
              5,12
            ]
          },
          {
            "x": "30",
            "y": [
              30,15
            ]
          },
          {
            "x": "45",
            "y": [
              61,56
            ]
          }
        ]
      }

      $scope.graphConfig = {
        title: 'Twerk-O-Meter',
        tooltips: true,
        labels: false,
        legend: {
          display: true,
          position: 'left'
        },
        lineLegend: 'lineEnd' // can be also 'traditional'
      }

      $scope.chartType = 'line';
    }
});
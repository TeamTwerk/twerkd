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

  var players = [];

  $scope.page = 0;
  $scope.numPages = 3; //todo update this with the number of pages in the switch statement in session.html

  var userData = {};
  var twerkHistory = [{"x": "1", "y": [0,0]}];


  initGraph(twerkHistory);

  //Join the room that was passed in the url (route params)
	joinRoom(mySocket,$routeParams.roomid);
  listenToSocket(mySocket);

  /* Scope functions */

  //Simple pagination function
  $scope.pageLeft = function pageLeft() {
    $scope.page = Math.max($scope.page - 1, 0);
  }

  $scope.pageRight = function pageRight() {
    $scope.page = Math.min($scope.page + 1, $scope.numPages-1);
  }

  /* Controller functions */

  function joinRoom(io,roomid) {
    io.emit('join', {c:{ roomId: roomid, spectator: true} });
  }

  function listenToSocket(io) {
    io.on('data', function(data) {
      console.log(data);
      switch(data.m) {
        case 'updateRoom':
          handleRoomUpdate(data.c);
          break;
        case 'twerk':
          handleTwerk(data.c);
          break;
      }
    });
  }

  $scope.playerData = function(index) {
    if(players.length-1 < index) return  { 't' : 0, 'tpm' : 0};

    var dat = userData[players[index].id];

    if(dat == null || dat.length == 0) return  { 't' : 0, 'tpm' : 0};

    var last = dat[dat.length-1];

    return last;
  }

  $scope.barProgress = function() {
    var player1Twerks = $scope.playerData(0).t;
    var player2Twerks = $scope.playerData(1).t;

    return (player1Twerks / (player1Twerks + player2Twerks)) * 640; //magic number bar width!
  }

  function handleRoomUpdate(data) {
    players = data['users'].filter(filterSpectators);
  }

  function filterSpectators(value,index,ar) {
    return value['spectator'] != true;
  }

	function handleTwerk(data) {
    var twerk = data['twerk'];
		$scope.tpm = twerk['tpm'];
		$scope.t = Math.round(twerk['t']);
    var id = data['id'];

    if(userData[id] == null) userData[id] = [];
    userData[id].push(twerk);

    twerkHistory.push({'x': twerkHistory.length, 'y': [data['t'],data['t']]});
  }

  function initGraph(data) {
     $scope.graphData = {
      "series": [
        "Player 45",
        "Player 51"
      ],
      "data": data
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
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
  var column1Data = ['player1',0];
  var column2Data = ['player2',0];

  $scope.chart = null;

  //Join the room that was passed in the url (route params)
	joinRoom(mySocket,$routeParams.roomid);
  listenToSocket(mySocket);

  setInterval(updateChart, 1000);

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
        case 'gameOver':
          handleGameOver(data.c);
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
    $scope.players = players;
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

    //update graph collumns
    (id == players[0].id) ? column1Data.push(twerk.t) : column2Data.push(twerk.t);

    //updateChart();
  }

  function handleGameOver() {
    var player1Twerks = $scope.playerData(0).t;
    var player2Twerks = $scope.playerData(1).t;
    var winnerIndex =  player1Twerks > player2Twerks ? 0 : 1;

    if(players[winnerIndex].name != null) {
      $scope.winnerName = players[winnerIndex].name;
    } else {
      $scope.winnerName = (winnerIndex == 0) ? 'Player 1' : 'Player 2';
    }

    $scope.gameOver = true;
  }

  $scope.initGraph = function() {
    $scope.chart = c3.generate({
      bindto: '#twerkGraph',
      data: {
        columns: [
            column1Data,
            column2Data
          ],
          type: 'spline',
          colors: {
            player1: '#4385BD',
            player2: '#BD4343'
        }
        }
      }); 
    }

  function updateChart() {
    if($scope.chart == null) return;
    
     $scope.chart.load({
        columns: [
           column1Data,
           column2Data
        ]
    });
  }
});
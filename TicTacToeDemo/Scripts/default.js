/// <reference path="jquery-3.1.1.min.js" />

var squareCount = 9;
var player;
var turnsLeft;
var resultX = 0;
var resultO = 0;
var totalPlayedRounds = 0;

$(document).ready(function () {
    jQuery.event.addProp('dataTransfer');
    initializeRound();
    $('.player').on('dragstart', dragStarted);
    $('.player').on('dragend', dragEnded);
    $('#gameBoard').on('dragenter', preventDefault);
    $('#gameBoard').on('dragover', preventDefault);
    $('#gameBoard').on('drop', drop);
    $('#gameBoard').on('dragstart', preventDefault);
    $("#btnPlayAgain").css("display", "none");
    $('#btnPlayAgain').click(playAgain);
});

function initializeRound() {
    turnsLeft = 9;
    resetBoard();
    createBoard();
    if (player == "X") {
        initializePlayer("O");
    }
    else {
        initializePlayer("X");
    }
    displayResults();
    $("#btnPlayAgain").css("display", "none");
}

function resetBoard() {
    $('#gameBoard').children().remove();
    $('.square').children().remove();
}

function createBoard() {
    for (var i = 0; i < squareCount; i++) {
        var $square = $('<div id="square' + i + '" data-square="' + i + '" class="square" ></div>');
        $square.appendTo($('#gameBoard'));
    }
}

function displayResults() {
    $('#resultX').text(resultX);
    $('#resultO').text(resultO);
    $('#totalRounds').text(totalPlayedRounds);
    $("#btnPlayAgain").css("display", "");
}

function playAgain() {
   initializeRound();
}

function dragStarted(e) {
    var $tile = $(e.target);
    $tile.addClass("dragged");
    var sourceLocation = $tile.parent().data('square');
    e.dataTransfer.setData('text', sourceLocation.toString());
    e.dataTransfer.effectAllowed = 'move';
}


function dragEnded(e) {
    $(e.target).removeClass("dragged");
}

function preventDefault(e) {
    e.preventDefault();
}

function drop(e) {
    var $square = $(e.target);
    if ($square.hasClass('square')) {
        var destinationLocation = $square.data('square');
        var sourceLocation = e.dataTransfer.getData('text');
        moveTile(sourceLocation, destinationLocation);
    }
}

function initializePlayer(player) {
    var $square = $('#square' + player);
    var $tile = $('<div id="tile' + player +'"  draggable="true" class="tile" >' + player + '</div>');
    $tile.appendTo($square);
    turnsLeft--;
}

function moveTile(sourceLocation, destinationLocation) {
    var $draggedItem = $('#square' + sourceLocation).children();
    $draggedItem.detach();
    var $target = $('#square' + destinationLocation);
    $draggedItem.appendTo($target);
    var winningGame = checkForWinner(sourceLocation, destinationLocation);
    if (winningGame) {
        alert("Player " + sourceLocation + " has won!");
        updateResults(sourceLocation);
    }
    else if (turnsLeft > 0) {
        changePlayerTurn(sourceLocation);
    }
    else {
        endCurrentRound();
    }
}

function updateResults(wonPlayer) {
    if (wonPlayer == "X")
        resultX++;
    else
        resultO++;
    totalPlayedRounds++;
    displayResults();
}

function changePlayerTurn(previousPlayer) {
    if (previousPlayer == "X")
        player = "O";
    else
        player = "X";
    initializePlayer(player);
}

function endCurrentRound() {
    alert("No player has won! Try again");
    totalPlayedRounds++;
    displayResults();
}

function checkForWinner(player, squareTile) {
    var $square = $('#square' + squareTile);
    var result;
    switch(true) {
        case checkHorizontalTiles(player, squareTile): 
            result = true;
            break;
        case checkVerticalTiles(player, squareTile) :
            result = true;
            break;
        case checkDiagonalTiles(player, squareTile):
            result = true;
            break;
        default: 
            result = false;
    }
    return result;
}

function checkHorizontalTiles(player, squareTile) {
    var secondTile;
    var thirdTile;

    // tile is in the first column
    if (squareTile % 3 == 0) {
        secondTile = squareTile + 1;
        thirdTile = secondTile + 1;
    }
    else if (squareTile % 3 == 1) { // tile is in the middle column
        secondTile = squareTile - 1;
        thirdTile = squareTile + 1;
    }
    else if (squareTile % 3 == 2) { // tile is in the third column
        secondTile = squareTile -1;
        thirdTile =  secondTile -1 ;
    }

    return checkWinningTiles(player, squareTile, secondTile, thirdTile);
}

function checkVerticalTiles(player, squareTile) {
    var secondTile;
    var thirdTile;

    // tile is in the first row
    if (squareTile < 3) {
        secondTile = squareTile + 3;
        thirdTile = secondTile + 3;
    }
    else if (squareTile < 6) { // tile is in the middle row
        secondTile = squareTile - 3;
        thirdTile = squareTile + 3;
    }
    else  { // tile is in the third row
        secondTile = squareTile - 3;
        thirdTile = secondTile - 3;
    }

    return checkWinningTiles(player, squareTile, secondTile, thirdTile);
}

function checkDiagonalTiles(player, squareTile) {
    var secondTile;
    var thirdTile;

    // tile is in the first row
    if (squareTile < 3) {
        if (squareTile == 0) { // left corner tile
            secondTile = squareTile + 4;
            thirdTile = secondTile + 4;
        }
        else if (squareTile == 2) { // right corner tile
            secondTile = squareTile + 2;
            thirdTile = secondTile + 2;
        }
        else
            return;
    }
    else if (squareTile > 5) { // tile is in the third row
        if (squareTile == 6) {
            secondTile = squareTile - 2;
            thirdTile = secondTile - 2;
        }
        else if (squareTile == 8) {
            secondTile = squareTile - 4;
            thirdTile = secondTile - 4;
        }
        else
            return;
    }
    else
        return;

    return checkWinningTiles(player, squareTile, secondTile, thirdTile);
}

function checkWinningTiles(player, firstTile, secondTile, thirdTile) {
    if ($('#square' + secondTile).children().text() != player) {
        return false;
    }
    if ($('#square' + thirdTile).children().text() != player) {
        return false;
    }
    $('#square' + firstTile).children().addClass("won-tile");
    $('#square' + secondTile).children().addClass("won-tile");
    $('#square' + thirdTile).children().addClass("won-tile");
    return true;
}
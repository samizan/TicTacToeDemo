﻿/// <reference path="jquery-3.1.1.min.js" />

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
    displayResults("");
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

function displayResults(wonPlayer) {
    $('#resultX').text(resultX);
    $('#resultO').text(resultO);
    $('#totalRounds').text(totalPlayedRounds);
    $("#btnPlayAgain").css("display", "");
    switch (wonPlayer) {
        case "X":
            $('#message').text("Player 1 has won this round!");
            toggleResultColor(wonPlayer);
            break;
        case "O":
            $('#message').text("Player 2 has won this round!");
            toggleResultColor(wonPlayer);
            break;
        case "0":
            $('#message').text("No player has won! Try again");
            toggleResultColor(wonPlayer);
            break;
    }
}

function toggleResultColor(player) {
    if (player == "X") {
        $('#resultX').css("color", "red");
        $('#resultO').css("color", "black");
    }
    else if (player == "O") {
        $('#resultX').css("color", "black");
        $('#resultO').css("color", "red");
    }
    else {
        $('#resultX').css("color", "black");
        $('#resultO').css("color", "black");
    }
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
    displayResults(wonPlayer);
}

function changePlayerTurn(previousPlayer) {
    if (previousPlayer == "X")
        player = "O";
    else
        player = "X";
    initializePlayer(player);
}

function endCurrentRound() {
    totalPlayedRounds++;
    displayResults("0");
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
    else if (squareTile == 4) { // middle tile in second row -- exceptional case
            secondTile = [squareTile - 2, squareTile - 4]; // outmost right or outmost left tiles in first row
            thirdTile = [squareTile  + 2, squareTile + 4];  // outmost right or outmost left tiles in third row
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
    if (secondTile.length > 1 && thirdTile.length > 1) {
        var secondTileDiagonal;
        var thirdTileDiagonal;
        var diagonalWon = false;

        if ($('#square' + secondTile[0]).children().text() == player && $('#square' + thirdTile[0]).children().text() == player) {
            secondTileDiagonal = secondTile[0];
            thirdTileDiagonal = thirdTile[0];
            diagonalWon = true;
        }

        if ($('#square' + secondTile[1]).children().text() == player && $('#square' + thirdTile[1]).children().text() == player) {
            secondTileDiagonal = secondTile[1];
            thirdTileDiagonal = thirdTile[1];
            diagonalWon = true;
        }

        if (diagonalWon) {
            $('#square' + firstTile).children().addClass("won-tile");
            $('#square' + secondTileDiagonal).children().addClass("won-tile");
            $('#square' + thirdTileDiagonal).children().addClass("won-tile");
            return true;
        }
        else {
            return false;
        }

    }
    else {
        if ($('#square' + secondTile).children().text() != player) {
            return false;
        }
        if ($('#square' + thirdTile).children().text() != player) {
            return false;
        }

        $('#square' + firstTile).children().addClass("won-tile");
        $('#square' + secondTile).children().addClass("won-tile");
        $('#square' + thirdTile).children().addClass("won-tile");
    }
    return true;
}
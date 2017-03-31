/// <reference path="jquery-3.1.1.min.js" />

var squareCount = 9;
var player;

$(document).ready(function () {
    jQuery.event.addProp('dataTransfer');
    createBoard();
    initializePlayer("X");
    $('.player').on('dragstart', dragStarted);
    $('.player').on('dragend', dragEnded);
    $('#gameBoard').on('dragenter', preventDefault);
    $('#gameBoard').on('dragover', preventDefault);
    $('#gameBoard').on('drop', drop);
    $('#gameBoard').on('dragstart', preventDefault);
});

function createBoard() {
    for (var i = 0; i < squareCount; i++) {
        var $square = $('<div id="square' + i + '" data-square="' + i + '" class="square" ></div>');
        $square.appendTo($('#gameBoard'));
    }
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
       // checkForWinner();
    }
}

function initializePlayer(player) {
    var $square = $('#square' + player);
    var $tile = $('<div id="tile' + player +'"  draggable="true" class="tile" >' + player + '</div>');
    $tile.appendTo($square);
}

function moveTile(sourceLocation, destinationLocation) {
    console.log(sourceLocation);
    console.log(destinationLocation);
    var $draggedItem = $('#square' + sourceLocation).children();
    $draggedItem.detach();
    var $target = $('#square' + destinationLocation);
    $draggedItem.appendTo($target);
    changePlayerTurn(sourceLocation);
}

function changePlayerTurn(previousPlayer) {
    if (previousPlayer == "X")
        player = "O";
    else
        player = "X";
    initializePlayer(player);
}
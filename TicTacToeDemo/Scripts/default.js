/// <reference path="jquery-3.1.1.min.js" />
var MyTicTacToe = (function ($) {
    var _squareCount = 9;
    var _player;
    var _turnsLeft;
    var _resultX = 0;
    var _resultO = 0;
    var _totalPlayedRounds = 0;
    var _isMobile;

    var startGame = function () {
        initializeRound();
        $("#btnPlayAgain").css("display", "none");
        $('#btnPlayAgain').click(playAgain);
        if (checkIfMobile()) {
            $('#gameBoard').css("cursor", "pointer");
            $('.tile').css("cursor", "default");
            $('#gameBoard').on('click', createMobileTile);
        }
        else {
            jQuery.event.addProp('dataTransfer');
            $('.player').on('dragstart', dragStarted);
            $('.player').on('dragend', dragEnded);
            $('#gameBoard').on('dragenter', preventDefault);
            $('#gameBoard').on('dragover', preventDefault);
            $('#gameBoard').on('drop', drop);
            $('#gameBoard').on('dragstart', preventDefault);
        }
    }

    return {
        startGame: startGame
    };

    function checkIfMobile() {
        if (screen.width <= 550)
            _isMobile = true;
        else
            _isMobile = false;

        return _isMobile;
    }

    function createMobileTile(e) {
        $tileHolder = $(e.target);
        var tileNumber = $tileHolder.data('square');
        moveTile(_player, tileNumber);
    }

    function initializeRound() {
        _turnsLeft = 9;
        resetBoard();
        createBoard();
        if (_player == "X") {
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
        for (var i = 0; i < _squareCount; i++) {
            var $square = $('<div id="square' + i + '" data-square="' + i + '" class="square" ></div>');
            $square.appendTo($('#gameBoard'));
        }
    }

    function displayResults(wonPlayer) {
        $('#resultX').text(_resultX);
        $('#resultO').text(_resultO);
        $('#totalRounds').text(_totalPlayedRounds);
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
        e.preventDefault();
        var $square = $(e.target);
        if ($square.hasClass('square')) {
            var destinationLocation = $square.data('square');
            var sourceLocation = e.dataTransfer.getData('text');
            moveTile(sourceLocation, destinationLocation);
        }
    }

    function initializePlayer(player) {
        _player = player;
        var $square = $('#square' + player);
        var $tile = $('<div id="tile' + player + '"  draggable="true" class="tile" >' + player + '</div>');
        $tile.appendTo($square);
        _turnsLeft--;
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
        else if (_turnsLeft > 0) {
            changePlayerTurn(sourceLocation);
        }
        else {
            endCurrentRound();
        }
    }

    function updateResults(wonPlayer) {
        if (wonPlayer == "X")
            _resultX++;
        else
            _resultO++;
        _totalPlayedRounds++;
        displayResults(wonPlayer);
    }

    function changePlayerTurn(previousPlayer) {
        if (previousPlayer == "X")
            _player = "O";
        else
            _player = "X";
        initializePlayer(_player);
    }

    function endCurrentRound() {
        _totalPlayedRounds++;
        displayResults("0");
    }

    function checkForWinner(player, squareTile) {
        var $square = $('#square' + squareTile);
        var result;
        switch (true) {
            case checkHorizontalTiles(player, squareTile):
                result = true;
                break;
            case checkVerticalTiles(player, squareTile):
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
            secondTile = squareTile - 1;
            thirdTile = secondTile - 1;
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
        else { // tile is in the third row
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
            thirdTile = [squareTile + 2, squareTile + 4];  // outmost right or outmost left tiles in third row
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

})(jQuery);


$(document).ready(function () {
    MyTicTacToe.startGame();
});
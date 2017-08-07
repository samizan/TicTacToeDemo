/// <reference path="jquery-3.1.1.min.js" />
var MyTicTacToe = (function ($) {
    var GAME_HUB = $.connection.ticTacToeHub;
    var SQUARE_COUNT = 9;
    var INITIAL_TURNS = 9;
    var MOBILE_SCREEN_SIZE = 550;

    var _player;
    var _turnsLeft;
    var _resultX = 0;
    var _resultO = 0;
    var _totalPlayedRounds = 0;
    var _isMobile;
    var _currentTile;
    var _currentPlayer;
    var _firstPlayer;
    var _secondPlayer;

    var getWinningTiles = function () {
        return function (currentTile) {
            var winning_tiles;
            if (currentTile == 0 || currentTile == 8) {
                winning_tiles = [["-4", "-8"], ["-3", "-6"], ["-1", "-2"], ["1", "2"], ["3", "6"], ["4", "8"]];
            }
            else if (currentTile == 1 || currentTile == 7) {
                winning_tiles = [["-3", "-6"], ["-1", "1"], ["3", "6"]];
            }
            else if (currentTile == 2 || currentTile == 6) {
                winning_tiles = [["-3", "-6"], ["-2", "-4"], ["-1", "-2"], ["1", "2"], ["2", "4"], ["3", "6"]];
            }
            else if (currentTile == 3 || currentTile == 5) {
                winning_tiles = [["-3", "3"], ["-1", "-2"], ["1", "2"]];
            }
            else {
                winning_tiles = [ ["-4", "4"], ["-3", "3"], ["-2", "2"], ["-1", "1"]];
            }

            return winning_tiles;
        }         
    };

    var setGame = function () {
        setPlayButton();
        setBoard();        
    }
    return {
        setGame: setGame,
        startGame: startGame,
        playTurn: playTurn,
        updatePlayerNames: updatePlayerNames
    };

    function setPlayButton() {
        $("#btnPlayAgain").css("display", "none");
        $('#btnPlayAgain').click(playAgain);
    }

    function setBoard() {
        if (isMobile()) {
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

    function isMobile() {
        if (screen.width <= MOBILE_SCREEN_SIZE)
            _isMobile = true;
        else
            _isMobile = false;

        return _isMobile;
    }

    function createMobileTile(e) {
        var firstPlayerTile = $('#tileX');
        var secondPlayerTile = $('#tileO');
        if (isOwnTurn(firstPlayerTile, _firstPlayer) || isOwnTurn(secondPlayerTile, _secondPlayer)) {
            GAME_HUB.server.executeTurn("square" + $(e.target).data('square'), _player);
        }
    }

    function isOwnTurn(playerTile, currentPlayer) {
        if (playerTile.length && _currentPlayer == currentPlayer) {
            return true;
        }
        else
            return false;
    }

    function drop(e) {
        e.preventDefault();
        GAME_HUB.server.executeTurn(e.target.id, e.dataTransfer.getData('text'));
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

    function startGame(currentPlayer, firstPlayer, secondPlayer) {
        _currentPlayer = currentPlayer;
        _firstPlayer = firstPlayer;
        _secondPlayer = secondPlayer;

        GAME_HUB.server.updatePlayerNames(_firstPlayer, _secondPlayer);

        setRound();
    }

    function updatePlayerNames(firstPlayer, secondPlayer) {
        var firstPlayerLabel = $('#firstPlayer');
        var secondPlayerLabel = $('#secondPlayer');
        firstPlayerLabel.text(firstPlayer);
        if (secondPlayer.length > 0) {
            secondPlayerLabel.text(secondPlayer);
        }
        if (_currentPlayer == firstPlayer) {
            firstPlayerLabel.text(firstPlayerLabel.text() + " (Me)");
        }
        else {
            secondPlayerLabel.text(secondPlayerLabel.text() + " (Me)");
        }
    }

    function setRound() {        
        resetBoard();

        if (_player == "X") {
            setPlayer("O");
        }
        else {
            setPlayer("X");
        }

        setTurn();       
    }

    function resetBoard() {
        _turnsLeft = INITIAL_TURNS;
        displayRoundResults("");
        $("#btnPlayAgain").css("display", "none");
        $('#gameBoard').children().remove();
        $('.square').children().remove();
        for (var i = 0; i < SQUARE_COUNT; i++) {
            var square = $('<div id="square' + i + '" data-square="' + i + '" class="square" ></div>');
            square.appendTo($('#gameBoard'));
        }
    }

    function setPlayer(player) {
        _player = player;
        var square = $('#square' + player);
        var tile = $('<div id="tile' + player + '"  draggable="true" class="tile" >' + player + '</div>');
        tile.appendTo(square);
        _turnsLeft--;
    }

    function setTurn() {
        if (_currentPlayer == _firstPlayer) {
            $('#squareO').on('dragstart', preventDefault);
        }
        else {
            $('#squareX').on('dragstart', preventDefault);
        }
    }

    function playTurn(target, tileType) {
        var square = $('#' + target);
        if (square.hasClass('square')) {
            var destination = square.data('square');
            var source = tileType;
            moveTile(source, destination);
        }
    }

    function moveTile(source, destination) {
        var draggedItem = $('#square' + source).children();
        draggedItem.detach();
        var target = $('#square' + destination);
        draggedItem.appendTo(target);
        var isWinner = checkForWinner(source, destination);

        if (isWinner) {
            updateResults(source);
        }
        else if (_turnsLeft > 0) {
            changeTurn(source);
        }
        else {
            endCurrentRound();
        }
    }

    function checkForWinner(player, firstTile) {
        var isWon = false;
        var tilesToCheck;
        var winning_tiles = getWinningTiles();
        tilesToCheck = winning_tiles(firstTile);

        for (var i = 0; i < tilesToCheck.length; i++) {
            secondTile = firstTile + parseInt(tilesToCheck[i].shift());
            thirdTile = firstTile + parseInt(tilesToCheck[i].shift());
            if ($('#square' + secondTile).children().text() != player) {
                isWon = false;
            }
            else if ($('#square' + thirdTile).children().text() != player) {
                isWon = false;
            }
            else {
                highlightWinningTiles([firstTile, secondTile, thirdTile]);
                return true;
            }
                
        }
        return isWon;                
    }

    function highlightWinningTiles(winningTiles) {
        for (var i = 0; i < winningTiles.length; i++) {
            $('#square' + winningTiles[i]).children().addClass("won-tile");
        }
    }

    function updateResults(winner) {
        if (winner == "X")
            _resultX++;
        else
            _resultO++;
        _totalPlayedRounds++;
        displayRoundResults(winner);
    }

    function displayRoundResults(winner) {
        $('#resultX').text(_resultX);
        $('#resultO').text(_resultO);
        $('#totalRounds').text(_totalPlayedRounds);
        $("#btnPlayAgain").css("display", "");
        switch (winner) {
            case "X":
                $('#message').text($('#firstPlayer').text() + " has won this round!");
                toggleResultColor(winner);
                break;
            case "O":
                $('#message').text($('#secondPlayer').text() + " has won this round!");
                toggleResultColor(winner);
                break;
            case "0":
                $('#message').text("It's a tie! Try again.");
                toggleResultColor(winner);
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

    function changeTurn(previousPlayer) {
        if (previousPlayer == "X")
            _player = "O";
        else
            _player = "X";
        setPlayer(_player);
    }

    function endCurrentRound() {
        _totalPlayedRounds++;
        displayRoundResults("0");
    }    

    function playAgain() {
        GAME_HUB.server.initializeRound();
    }

})(jQuery);

$(document).ready(function () {
    MyTicTacToe.setGame();
});
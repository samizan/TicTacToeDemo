using System;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TicTacToeDemo
{
    // server
    public class TicTacToeHub : Hub
    {
        static List<UserDetail> ConnectedUsers = new List<UserDetail>();
        static List<GroupDetail> CreatedGames = new List<GroupDetail>();


        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.broadcastMessage(name, message);
        }

        public void Connect(string playerName)
        {
            GroupDetail game =  Join(playerName);
            // send to caller
            string firstPlayer = (game.FirstPlayer != null) ? game.FirstPlayer.Name : "" ;
            string secondPlayer = (game.SecondPlayer != null) ? game.SecondPlayer.Name : "";
            Clients.Caller.onConnected(game.GroupId, firstPlayer, secondPlayer, game.Participants);
            
        }

        public GroupDetail Join(string playerName)
        {
            var id = Context.ConnectionId;
            UserDetail connectedUser;

            // create connected user or get existing one
            if (ConnectedUsers.FindAll(u => u.ConnectionId == id).Count == 0)
            {
                connectedUser = new UserDetail { ConnectionId = id, Name = playerName };
                ConnectedUsers.Add(connectedUser);
            }
            else
            {
                connectedUser = ConnectedUsers.Find(u => u.ConnectionId == id);
            }

            // join a group or create new one 
            GroupDetail game;
            if (CreatedGames.FindAll(g => g.Participants == 1).Count == 0)
            {
                // create a new game
                game = new GroupDetail { GroupId = id, FirstPlayer = connectedUser, Participants = 1 };
                CreatedGames.Add(game);
                Groups.Add(id, id);
            }
            else
            {
                // join an existing game
                game = CreatedGames.Find(g => g.Participants == 1);
                if (game.FirstPlayer == null)
                {
                    game.FirstPlayer = connectedUser;
                }
                else
                {
                    game.SecondPlayer = connectedUser;
                }
                game.Participants = 2;
                Groups.Add(id, game.GroupId);
            }

            return game;
        }

        public Task LeaveRoom(string gameName)
        {
            var id = Context.ConnectionId;
            GroupDetail playedGame = CreatedGames.Find(g => g.GroupId == gameName);
            if (playedGame.FirstPlayer.ConnectionId == id)
            {
                playedGame.FirstPlayer = null;

            }
            else
            {
                playedGame.SecondPlayer = null;
            }
            playedGame.Participants = playedGame.Participants - 1;
            return Groups.Remove(id, gameName);
        }

        public void InitializeRound()
        {
            // Broad cast message
            Clients.All.initializeRound();
        }

        public void ExecuteTurn(string target, string tileType)
        {
            // Broad cast message
            Clients.All.playTurn(target, tileType);
        }
    }
}
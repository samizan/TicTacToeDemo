using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TicTacToeDemo
{
    public class GroupDetail
    {
        public string GroupId { get; set; }
        public UserDetail FirstPlayer { get; set; }
        public UserDetail SecondPlayer { get; set; }
        public int Participants { get; set; }
    }
}
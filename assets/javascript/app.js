var currentPlayer;
var numPlayers;
var gameStarted = false;

var config = {
  apiKey: "AIzaSyCX2ImGsjGfs3lM1z534rqg064WLNKsiIY",
  authDomain: "rock-paper-scissors-game-18b10.firebaseapp.com",
  databaseURL: "https://rock-paper-scissors-game-18b10.firebaseio.com",
  projectId: "rock-paper-scissors-game-18b10",
  storageBucket: "rock-paper-scissors-game-18b10.appspot.com",
  messagingSenderId: "453054696616",
  appId: "1:453054696616:web:40447bdd8402fbb0b4469d"
};
firebase.initializeApp(config);
var database = firebase.database();

$(window).on("load", function() {
  database.ref().on("value", function(snapshot) {
    console.log("Event Database");
    // This will occur when first loading the window
    if (numPlayers === undefined) {
      console.log("First Initiliazing number of players");
      numPlayers = snapshot.val().numPlayers + 1;
      console.log("Player " + numPlayers + " has joined");
      database.ref().set({
        numPlayers: numPlayers
      });
    } else {
      numPlayers = snapshot.val().numPlayers;
    }

    if (numPlayers == 2 && !gameStarted) {
      $("#lobby-status").text("Other player has connected!!!");
      gameStarted = true;
    } else if (numPlayers < 2 && !gameStarted) {
      $("#lobby-status").text("Please wait for player 2");
    }
    // Scenario when player 3 joins, gamestarted is first false
    // so player 3 would no be able to start the game and this
    // would not affect player 1 and 2
    else if (numPlayers > 2 && !gameStarted) {
      $("#lobby-status").text("Please wait, two players are already playing");
    }
  });
  //     console.log("Entering database event");)
  //   database.ref().on("value", function(snapshot) {
  //     console.log("Entering database event");
  //     numPlayers = snapshot.val().numPlayers + 1;

  //     console.log("New Player has joined: " + numPlayers);

  //     if (numPlayers == 2) {
  //       $("#lobby-status").text("Other player has connected!!!");
  //     } else if (numPlayers < 2) {
  //       $("#lobby-status").text("Please wait for player 2");
  //     } else {
  //       alert("Please wait, two players are already playing");
  //     }
  //     currentPlayer = numPlayers;
  //     console.log("Current Player: " + currentPlayer);
  //   });

  //RPS chosen
  $(".choice-image").on("click", function() {
    console.log("Choice: " + $(this).attr("id"));
  });

  //
});

// Before the user leaves reduce the number of players connected in the database
window.addEventListener("beforeunload", function(event) {
  database.ref().set({
    numPlayers: numPlayers - 1
  });
});
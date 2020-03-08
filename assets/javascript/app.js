var currentPlayer;
var opposingPlayer;
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
  database.ref().on(
    "value",
    function(snapshot) {
      console.log("Event Database");
      // This will occur when first loading the window
      if (numPlayers === undefined) {
        console.log("First Initiliazing number of players");
        console.log(snapshot.val());
        numPlayers = snapshot.val().numPlayers + 1;
        var queueArray = snapshot.val().queue.split(",");
        queueArray[0] = "Connected";
        console.log("Queue index: " + queueArray.indexOf("empty"));
        //Assuming two players only for now
        currentPlayer = numPlayers === 1 ? "Player 1" : "Player 2";
        opposingPlayer = numPlayers === 1 ? "Player 2" : "Player 1";
        console.log("Player " + numPlayers + " has joined");

        //Update the total number of players
        database.ref().update({
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
    },
    function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );

  database.ref(opposingPlayer).on(
    "value",
    function(snapshot) {
      console.log(opposingPlayer);
      console.log(snapshot.child(opposingPlayer).val());
    },
    function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );
  //RPS chosen
  $(".choice-image").on("click", function() {
    console.log("Choice: " + $(this).attr("id"));
    database.ref(currentPlayer).update({
      playersChoice: $(this).attr("id")
    });
  });

  //
});

// Before the user leaves reduce the number of players connected in the database
window.addEventListener("beforeunload", function(event) {
  database.ref().update({
    numPlayers: numPlayers - 1
  });
});

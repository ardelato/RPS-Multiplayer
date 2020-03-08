var currentPlayer;
var opposingPlayer;

var numPlayers;
var queueArray;
var queueNum;

var gameStarted = false;
var roundTimer = 10;
var timerID;

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

function decreaseTime() {
  roundTimer--;
  if (roundTimer === 0) {
    alert("Time's Up");
    roundTimer = 10;
  } else {
    console.log(roundTimer);
  }
  $("#lobby-status").text("Get Ready");
  $("#round-timer").text("Time Left: " + roundTimer);
}

function updateLobbyStatus() {
  // Scenario when player 3 joins, gamestarted is first false
  // so player 3 would no be able to start the game and this
  // would not affect player 1 and 2
  if (numPlayers > 2 && !gameStarted) {
    $("#lobby-status").text("Please wait, two players are already playing");
  }
  // Scenario when it's just two players connected
  else if (queueArray.join() === "Connected,Connected" && !gameStarted) {
    $("#lobby-status").text("Other player has connected!!!");
    gameStarted = true;
    console.log("Game Starting");

    timerID = setInterval(function() {
      decreaseTime();
    }, 1000);
  }
  // Scenario when one of the two players leaves a current game and now we need
  // reset the current game status
  else if (queueArray.join() !== "Connected,Connected") {
    console.log("Game Restarting");
    gameStarted = false;
    clearInterval(timerID);
    roundTimer = 10;
    $("#round-timer").text("");
    $("#lobby-status").text("Please wait for player 2");
  }
}

$(window).on("load", function() {
  database.ref().on(
    "value",
    function(snapshot) {
      // This will occur when first loading the window
      if (numPlayers === undefined) {
        console.log("First Initiliazing number of players");
        //Sync current number of players
        numPlayers = snapshot.val().numPlayers + 1;

        //Update lobby queue
        queueArray = snapshot.val().queue.split(",");
        queueNum = queueArray.indexOf("empty");
        queueArray[queueNum] = "Connected";

        //Register Player number
        currentPlayer = "Player " + (queueNum + 1);
        opposingPlayer = queueNum === 0 ? "Player 2" : "Player 1";
        console.log(currentPlayer + " has joined");
        console.log("Players in queue: " + queueArray.join());

        //Update the total number of players
        database.ref().update({
          queue: queueArray.join(),
          numPlayers: numPlayers
        });
      } else {
        numPlayers = snapshot.val().numPlayers;
        queueArray = snapshot.val().queue.split(",");
      }
      updateLobbyStatus();
    },
    function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );

  // Read opposing player's choice;
  database.ref(opposingPlayer).on(
    "value",
    function(snapshot) {
      console.log(
        "Opponent: " +
          opposingPlayer +
          " choose " +
          snapshot.child(opposingPlayer).val().playersChoice
      );
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
  // Update Queue array
  queueArray[queueNum] = "empty";
  database.ref().update({
    numPlayers: numPlayers - 1,
    queue: queueArray.join()
  });
});

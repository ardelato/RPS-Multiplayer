var currentPlayer;
var playersChoice;
var choiceSelected = false;
var wins = 0;
var losses = 0;
var draws = 0;

var opposingPlayer;
var opponentsChoice;

var numPlayers;
var queueArray;
var queueNum;

var gameStarted = false;

var round = 1;
var roundTimer = 10;
var roundEnded = false;

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

//Show the Outcome
function outCome() {
  if (playersChoice === opponentsChoice) {
    alert("Draw, no winner");
    database.ref(currentPlayer).update({
      draws: ++draws
    });
  } else if (playersChoice === "rock" && opponentsChoice === "scissors") {
    alert("You Win");
    database.ref(currentPlayer).update({
      wins: ++wins
    });
  } else if (playersChoice === "scissors" && opponentsChoice === "paper") {
    alert("You Win");
    database.ref(currentPlayer).update({
      wins: ++wins
    });
  } else if (playersChoice === "paper" && opponentsChoice === "rock") {
    alert("You Win");
    database.ref(currentPlayer).update({
      wins: ++wins
    });
  } else {
    alert("You lose");
    database.ref(currentPlayer).update({
      losses: ++losses
    });
  }
}

// Decrease Round Timer
function decreaseTime() {
  roundTimer--;
  if (roundTimer === 0) {
    roundEnded = true;
    alert("Time's Up");
    outCome();
    roundTimer = 10;
    roundEnded = false;
    choiceSelected = false;
  } else {
    console.log(roundTimer);
  }
  $("#lobby-status").text("Get Ready");
  $("#round-timer").text("Time Left: " + roundTimer);
}

// Reset Game Variables
function resetGame() {
  console.log("Game Restarting");
  gameStarted = false;
  clearInterval(timerID);
  roundTimer = 10;
  $("#round-timer").text("");
  $("#lobby-status").text("Please wait for player 2");
}

// Connection Status Update
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
    $(".choice-container").show();
    console.log("Game Starting");

    timerID = setInterval(function() {
      decreaseTime();
    }, 1000);
  }
  // Scenario when one of the two players leaves a current game and now we need
  // reset the current game status
  else if (queueArray.join() !== "Connected,Connected") {
    resetGame();
    $(".choice-container").hide();
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

        //Reset Player Stats
        database.ref(currentPlayer).update({
          draws: draws,
          losses: losses,
          wins: wins
        });
      }
      // Otherwise player has already established a connection
      else {
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
      if (roundEnded) {
        console.log("Answer is Locked in");
      } else {
        opponentsChoice = snapshot.child(opposingPlayer).val().playersChoice;
        console.log(
          "Opponent: " + opposingPlayer + " choose " + opponentsChoice
        );
      }
    },
    function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );

  //RPS chosen
  $(".choice-image").on({
    click: function() {
      console.log("Choice: " + $(this).attr("id"));
      if (!roundEnded) {
        playersChoice = $(this).attr("id");
        database.ref(currentPlayer).update({
          playersChoice: $(this).attr("id")
        });
        //Update CSS to show current selection
        $(".choice-image").css("opacity", "0.5");
        $(this).css("opacity", 1);
        choiceSelected = true;
      }
    },
    mouseenter: function() {
      if (!choiceSelected) {
        console.log("Entered mouse enter Event");
        $(".choice-image").css("opacity", "0.5");
        $(this).css("opacity", 1);
      }
    },
    mouseleave: function() {
      if (!choiceSelected) {
        console.log("Entered Mouseleave event");
        $(".choice-image").css("opacity", "0.5");
      }
    }
  });
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

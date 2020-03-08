var currentPlayer;
var numPlayers;

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
  database
    .ref()
    .once("value")
    .then(function(snapshot) {
      console.log(snapshot.val());
      numPlayers = snapshot.val().numPlayers;
      console.log(numPlayers);
      if (numPlayers < 2) {
        currentPlayer = ++numPlayers;
        console.log(numPlayers);
        database.ref().set({
          numPlayers: numPlayers
        });
      }
    });
});

window.addEventListener("beforeunload", function(event) {
  database.ref().set({
    numPlayers: numPlayers - 1
  });
});

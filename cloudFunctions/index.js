const functions = require('firebase-functions');
const firebase = require('firebase');
const { getLowestPlayableCards } = require('../functions/AIFunctions');

exports.computerTakeTurn = functions.firestore.document('/CustomGames/{gameName}')
  .onWrite((snap, context) => {
    const gameData = snap.data();
    const gameName = context.params.gameName;
    const currentPlayerUID = (Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex));
    const computerPlaysNext = ['AIEasy', 'AIMedi', 'AIHard', 'AIMast'].includes(currentPlayerUID.slice(0, 6));

    if (computerPlaysNext) {
      const player = gameData.currentPlayerTurnIndex;
      let hands = gameData.hands;
      const AIDifficulty = currentPlayerUID.slice(2, currentPlayerUID.length - 1);
      const selectedCards = getLowestPlayableCards(hands[player], gameData.currentHandType, gameData.lastPlayed, AIDifficulty === 'Easy' ? false : true);
      hands[player].cards = hands[player].cards.filter(card => !selectedCards.includes(card));

      let overallTurnHistory = gameData.overallTurnHistory;
      const turnsTaken = Object.keys(overallTurnHistory).length;
      overallTurnHistory[turnsTaken] = selectedCards;
      let playersTurnHistory = gameData.playersTurnHistory;
      playersTurnHistory[currentPlayerUID][turnsTaken] = selectedCards;

      const handIsEmpty = hands[player].cards.length === 0;

      const data = {
        playedCards: firebase.firestore.FieldValue.arrayUnion(...selectedCards),
        lastPlayed: selectedCards,
        lastPlayerToPlay: { [currentPlayerUID]: gameData.displayNames[currentPlayerUID] },
        hands: hands,
        currentPlayerTurnIndex: getNextNonEmptyHandIndexLocal(),
        currentHandType: playedHandType,
        playersTurnHistory: playersTurnHistory,
        overallTurnHistory: overallTurnHistory
      };
      if (handIsEmpty) {
        data['places'] = firebase.firestore.FieldValue.arrayUnion(currentPlayerUID);

        if (!gameData.places.length) {
          data[`gamesWon.${currentPlayerUID}`] = firebase.firestore.FieldValue.increment(1);
          data['gamesPlayed'] = firebase.firestore.FieldValue.increment(1);
        }

        if (gameData.places.length === gameData.numberOfPlayers - 2) {
          const lastPlaceUID = Object.keys(gameData.players).find((playerUid) => playerUid !== currentPlayerUID && !gameData.places.includes(playerUid));
          data['places'] = firebase.firestore.FieldValue.arrayUnion(currentPlayerUID, lastPlaceUID);
        }
      }

      let updatedHandsPlayed = handsPlayed;
      updatedHandsPlayed[playedHandType] = (handsPlayed[playedHandType] || 0) + 1;
      setHandsPlayed(updatedHandsPlayed);


      return firebase.firestore().collection('CustomGames').doc(gameName).update(data);
    }
  })


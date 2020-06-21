import functions from 'firebase-functions';
import firebase from 'firebase';
import { getLowestPlayableCards } from '../functions/AIFunctions';
import { getNextNonEmptyHandIndex, getHandType } from '../functions/HelperFunctions';

exports.computerTakeTurn = functions.firestore.document('/CustomGames/{gameName}')
  .onWrite((change, context) => {
    const gameData = change.after.exists ? change.after.data() : null;
    const gameName = context.params.gameName;
    const currentPlayerUID = (Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex));
    const computerPlaysNext = ['BotEasy', 'BotMedi', 'BotHard', 'BotMast'].includes(currentPlayerUID.slice(0, 7));

    if (computerPlaysNext) {
      const player = gameData.currentPlayerTurnIndex;
      let hands = gameData.hands;
      const AIDifficulty = currentPlayerUID.slice(3, 7);
      const exclusive = AIDifficulty === 'Easy' ? false : true;
      const selectedCards = getLowestPlayableCards(hands[player].cards, gameData.cardsPerPlayer, gameData.currentHandType, gameData.lastPlayed, exclusive);
      const playedHandType = getHandType(selectedCards);
      hands[player].cards = hands[player].cards.filter(card => !selectedCards.includes(card));

      let overallTurnHistory = gameData.overallTurnHistory;
      let playersTurnHistory = gameData.playersTurnHistory;
      const turnsTaken = Object.keys(overallTurnHistory).length;
      overallTurnHistory[turnsTaken] = selectedCards;
      playersTurnHistory[currentPlayerUID][turnsTaken] = selectedCards;

      const handIsEmpty = hands[player].cards.length === 0;

      const data = {
        playedCards: firebase.firestore.FieldValue.arrayUnion(...selectedCards),
        lastPlayed: selectedCards,
        lastPlayerToPlay: { [currentPlayerUID]: gameData.displayNames[currentPlayerUID] },
        hands: hands,
        currentPlayerTurnIndex: getNextNonEmptyHandIndex(gameData.hands, gameData.currentPlayerTurnIndex, gameData.numberOfPlayers) % gameData.numberOfPlayers,
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

      firebase.firestore().collection('CustomGames').doc(gameName).update(data)
        .then(() => {
          alert('Computer played!');
        })
        .catch((error) => {
          alert('Error with computer playing: ' + error);
        });
    }
  })


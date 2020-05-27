import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View, Text } from 'react-native';
import firebase from 'firebase';
import store from '../redux/store';

import Loader from '../components/Loader';
import {
  FaceDownCardsContainer,
  PlayedCardsContainer,
  UserCardContainer
} from '../components/CardContainer';
import {
  getAvatarImage,
  getHandType, getLowestCard,
  getNextEmptyHandIndex,
  HAND_TYPES,
  isBetterHand, isLegalPlay,
  dealCards, findStartingPlayer
} from '../functions/HelperFunctions';
import PopUpMessage from '../components/PopUpMessage';
import TrophyPlaceDisplay from '../components/TrophyPlaceDisplay';

export default function GameScreen({ route, navigation }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCards, setErrorCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(route.params);
  const [gameEnded, setGameEnded] = useState(false);
  const user = store.getState().userData.user;
  const db = firebase.firestore();

  useEffect(() => {
    return db.collection('CustomGames').doc(gameData.gameName)
      .onSnapshot((doc) => {
        setGameData(doc.data())
      });
  }, []);

  useEffect(() => {
    if ((!gameStarted) && gameData.playersLeftToJoin === 0 && Object.keys(gameData.playersPlayingAgain).length === 0) {
      setGameStarted(true);
    }
  }, [gameData.playersLeftToJoin, gameData.playersPlayingAgain]);

  useEffect(() => {
    if (gameData.numberOfPlayers === gameData.places.length && Object.keys(gameData.playersPlayingAgain).length === 0)
      setGameEnded(true);
    //else if ((gameData.numberOfPlayers !== gameData.places.length) && gameEnded)
    //  setGameEnded(false);
  }, [gameData.places]);

  useEffect(() => {
    const playersPlayingAgainLength = Object.keys(gameData.playersPlayingAgain).length;
    const lastUIDPlayingAgain = playersPlayingAgainLength ? Object.keys(gameData.playersPlayingAgain)[playersPlayingAgainLength - 1] : null;
    const allRemainingPlayersPlayingAgain = playersPlayingAgainLength === Object.keys(gameData.players).length;

    if (allRemainingPlayersPlayingAgain && lastUIDPlayingAgain === user.uid) {
      const hands = dealCards(gameData.useJoker, gameData.numberOfPlayers, gameData.cardsPerPlayer);
      let players = {};
      let playersTurnHistory = {};
      let displayNames = {};
      let playersLeftToJoin = gameData.numberOfPlayers;
      Object.keys(gameData.playersPlayingAgain).map((key, index) => {
        players[key] = index;
        playersTurnHistory[key] = {};
        displayNames[key] = gameData.playersPlayingAgain[key];
        playersLeftToJoin--;
      });

      const updates = {
        players: players,
        playersLeftToJoin: playersLeftToJoin,
        hands: hands,
        lastPlayed: [],
        lastPlayerToPlay: '',
        playedCards: [],
        currentPlayerTurnIndex: findStartingPlayer(hands),
        currentHandType: HAND_TYPES.START_OF_GAME,
        places: [],
        playersTurnHistory: playersTurnHistory,
        overallTurnHistory: {},
        displayNames: displayNames,
        playersPlayingAgain: {}
      };

      firebase.firestore().collection('CustomGames').doc(gameData.gameName).update(updates)
        .then(() => {
          setGameEnded(false);
          setGameStarted(!playersLeftToJoin);
        })
        .catch(() => {
          alert('Error trying to play again. Please check your connection and try again.')
        });
    }
  }, [gameData.playersPlayingAgain, gameData.players])

  useEffect(() => {
    return navigation.addListener('blur', () => {
      if (!gameStarted) {
        console.log(gameStarted);
        let updates = {};
        updates[`players.${user.uid}`] = firebase.firestore.FieldValue.delete();
        updates[`playersPlayingAgain.${user.uid}`] = firebase.firestore.FieldValue.delete();
        updates['playersLeftToJoin'] = firebase.firestore.FieldValue.increment(1);
        db.collection('CustomGames').doc(gameData.gameName).update(updates);
      }
    });
  }, [navigation]);

  function getNextEmptyHandIndexLocal() {
    return getNextEmptyHandIndex(gameData.hands, gameData.currentPlayerTurnIndex, gameData.numberOfPlayers);
  }

  function everyonePassAfterWinner() {
    if (gameData.places.length === 0)
      return false;

    const lastUIDToPlay = Object.keys(gameData.lastPlayerToPlay)[0];
    const lastUIDToPlayTurnIndex = gameData.players[lastUIDToPlay];
    if (gameData.hands[lastUIDToPlayTurnIndex].cards.length)
      return false;

    const lastPlayTurnNum = Object.keys(gameData.playersTurnHistory[lastUIDToPlay]).pop();
    gameData.hands.forEach((hand, index) => {
      if (hand.cards.length) {
        const remainingPlayerUID = Object.keys(gameData.players).find(key => gameData.players[key] === index);
        const remainingPlayerLastPlayTurnNum = Object.keys(gameData.playersTurnHistory[remainingPlayerUID]).pop();
        const remainingPlayerLastPlay = gameData.playersTurnHistory[remainingPlayerUID][remainingPlayerLastPlayTurnNum];

        if (remainingPlayerLastPlayTurnNum < lastPlayTurnNum || remainingPlayerLastPlay !== 'PASS')
          return false;
      }
    });

    return true;
  }

  function playCards(selectedCards) {
    setErrorMessage('');
    setErrorCards([]);

    const playedHandType = getHandType(selectedCards);
    const everyonePassed = user.displayName === gameData.lastPlayerToPlay[user.uid] || everyonePassAfterWinner();
    const isFirstPlayOfGame = gameData.currentHandType === HAND_TYPES.START_OF_GAME;
    const currentHand = gameData.hands[gameData.players[user.uid]].cards;

    if (playedHandType === HAND_TYPES.INVALID) {
      setErrorMessage('Invalid hand type');
      return false;
    } else if (isFirstPlayOfGame && !selectedCards.includes(getLowestCard(currentHand))) {
      setErrorMessage('Hand must include ');
      setErrorCards([getLowestCard(currentHand)]);
      return false;
    } else if (!everyonePassed && !isLegalPlay(playedHandType, gameData.currentHandType)) {
      setErrorMessage('Must play ' + gameData.currentHandType);
      return false;
    } else if (!everyonePassed && !isBetterHand(selectedCards, gameData.lastPlayed)) {
      setErrorMessage('Get that weak shit out');
      return false;
    }

    const player = gameData.currentPlayerTurnIndex;
    let hands = gameData.hands;
    hands[player].cards = hands[player].cards.filter(card => !selectedCards.includes(card));

    let overallTurnHistory = gameData.overallTurnHistory;
    const turnsTaken = Object.keys(overallTurnHistory).length;
    overallTurnHistory[turnsTaken] = selectedCards;
    let playersTurnHistory = gameData.playersTurnHistory;
    playersTurnHistory[user.uid][turnsTaken] = selectedCards;

    const handIsEmpty = hands[player].cards.length === 0;

    const data = {
      playedCards: firebase.firestore.FieldValue.arrayUnion(...selectedCards),
      lastPlayed: selectedCards,
      lastPlayerToPlay: { [user.uid]: user.displayName },
      hands: hands,
      // REMOVE FOR PROD. Allows tester to play every hand in a game.
      // players: {
      //   [user.uid]: getNextEmptyHandIndexLocal() % (gameData.numberOfPlayers)
      // },
      currentPlayerTurnIndex: getNextEmptyHandIndexLocal() % (gameData.numberOfPlayers),
      currentHandType: playedHandType,
      playersTurnHistory: playersTurnHistory,
      overallTurnHistory: overallTurnHistory
    };
    if (handIsEmpty) {
      data['places'] = firebase.firestore.FieldValue.arrayUnion(user.uid);
      if (gameData.places.length === gameData.numberOfPlayers - 2) {
        const lastPlaceUID = Object.keys(gameData.players).find((playerUid) => playerUid !== user.uid || !gameData.places.includes(playerUid));
        data['places'] = firebase.firestore.FieldValue.arrayUnion(user.uid, lastPlaceUID);
      }
    }

    db.collection('CustomGames').doc(gameData.gameName).update(data);

    return true;
  }

  function pass() {
    const isFirstPlayOfGame = gameData.currentHandType === HAND_TYPES.START_OF_GAME;
    const currentHand = gameData.hands[gameData.players[user.uid]].cards;

    if (isFirstPlayOfGame) {
      setErrorMessage('Must start game with ');
      setErrorCards([getLowestCard(currentHand)]);
      return true;
    }

    let overallTurnHistory = gameData.overallTurnHistory;
    const turnsTaken = Object.keys(overallTurnHistory).length;
    overallTurnHistory[turnsTaken] = 'PASS';
    let playersTurnHistory = gameData.playersTurnHistory;
    playersTurnHistory[user.uid][Object.keys(playersTurnHistory[user.uid]).length] = 'PASS';
    //REMOVE FOR PROD> ALLOWS TESTER TO PASS
    /* if (gameData.lastPlayerToPlay[user.uid] === user.displayName) {
      setErrorMessage('Must start a new hand');
      setErrorCards([]);
      return true;
    } */
    db.collection('CustomGames').doc(gameData.gameName).update({
      currentPlayerTurnIndex: getNextEmptyHandIndexLocal() % (gameData.numberOfPlayers),
      playersTurnHistory: playersTurnHistory,
      overallTurnHistory: overallTurnHistory
      // REMOVE FOR PROD. Allows tester to play every hand in a game.
      // players: {
      //   [user.uid]: getNextEmptyHandIndexLocal() % (gameData.numberOfPlayers)
      // },

    });

    setErrorMessage('');
    setErrorCards([]);
    return true;
  }

  function getStyle(index) {
    switch (index) {
      case 2:
        return styles.player2Hand;
      case 3:
        return styles.player3Hand;
      case 4:
      default:
        return styles.player4Hand;
    }
  }

  function playAgain() {
    let updates = {};
    updates[`playersPlayingAgain.${user.uid}`] = user.displayName;

    db.collection('CustomGames').doc(gameData.gameName).update(updates)
      .then(() => {
        setGameEnded(false);
        setGameStarted(false);
      })
      .catch(() => {
        alert('Error trying to play again. Please check your connection and try again.')
      });
  }

  function dontPlayAgain() {
    if (Object.keys(gameData.players).length === 1) {
      db.collection('CustomGames').doc(gameData.gameName).delete()
        .then(() => navigation.goBack())
        .catch(() => {
          alert('Error trying to exit. Please check your connection and try again.')
        });
    } else {
      const update = {};
      update[`players.${user.uid}`] = firebase.firestore.FieldValue.delete();

      db.collection('CustomGames').doc(gameData.gameName).update(update)
        .then(() => navigation.goBack())
        .catch((error) => {
          alert('Error trying to exit. Please check your connection and try again.')
        });
    }
  }

  function getAvatarRotation(index) {
    return (270 - 90 * index) + 'deg';
  }

  return (
    <ImageBackground source={require('../assets/images/felt.jpg')} style={styles.headerImage}>

      <Loader loading={!gameStarted}
        message={`Waiting for ${(Object.keys(gameData.playersPlayingAgain).length ? gameData.numberOfPlayers - Object.keys(gameData.playersPlayingAgain).length : false) || gameData.playersLeftToJoin} more player${gameData.playersLeftToJoin === 1 ? '' : 's'}`}
        exitAction={navigation.goBack}
      />
      <PopUpMessage showPopUp={gameEnded} exitAction={dontPlayAgain} exitMessage='No' confirmAction={playAgain} confirmMessage='Yes' >
        {gameData.places.map((player, index) => {
          const displayName = gameData.displayNames[player];
          const currentUser = player === user.uid;
          return <TrophyPlaceDisplay key={index} place={index} displayName={displayName} currentUser={currentUser} />
        })}
        <Text style={{ textAlign: 'center', fontSize: 30, marginTop: 50, fontFamily: 'gang-of-three', }}>Play again?</Text>
      </PopUpMessage>

      <PlayedCardsContainer cards={gameData.playedCards}
        lastPlayedCards={gameData.lastPlayed}
        lastPlayerToPlay={gameData.lastPlayerToPlay[user.uid]}
        avatarImage={getAvatarImage(gameData.hands[gameData.currentPlayerTurnIndex].avatar)}
        style={styles.playedCards} />
      {gameStarted && <View style={styles.container}>
        <UserCardContainer cards={gameData.hands[gameData.players[user.uid]].cards}
          place={gameData.places.indexOf(user.uid)}
          errorMessage={errorMessage}
          errorCards={errorCards}
          isCurrentPlayer={gameData.players[user.uid] === gameData.currentPlayerTurnIndex}
          avatarImage={getAvatarImage(gameData.hands[gameData.players[user.uid]].avatar)}
          playCards={playCards}
          pass={pass}
          style={styles.player1Hand} />
        {Array.from({ length: gameData.numberOfPlayers - 1 }).map((value, index) => {
          const playerIndex = (gameData.players[user.uid] + index + 1) % gameData.numberOfPlayers;

          return <FaceDownCardsContainer key={playerIndex} numberOfCards={gameData.hands[playerIndex].cards.length}
            style={[styles.opposingPlayerHand, getStyle(index + 2)]}
            avatarImage={getAvatarImage(gameData.hands[playerIndex].avatar)}
            avatarStyling={{ transform: [{ rotateZ: getAvatarRotation(index) }] }}
            isCurrentPlayer={playerIndex === gameData.currentPlayerTurnIndex} />
        })}
      </View>}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  playedCards: {
    width: 80,
    height: 106,
    borderWidth: 3,
    borderRadius: 10,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [
      { translateX: -40 },
      { translateY: -53.75 }
    ],
    alignItems: 'center',
  },
  player1Hand: {
    bottom: 40,
    width: '80%'
  },
  opposingPlayerHand: {
    position: 'absolute',
    width: '40%',
  },
  player2Hand: {
    left: -30,
    top: '50%',
    transform: [
      { rotateZ: '90deg' },
      { translateX: '-50%' }
    ],
  },
  player3Hand: {
    top: 55,
    right: '50%',
    flexDirection: 'row',
    transform: [
      { rotateZ: '180deg' },
      { translateX: '-100%' }
    ],
  },
  player4Hand: {
    right: -30,
    top: '50%',
    transform: [
      { rotateZ: '-90deg' },
    ],
  }

});

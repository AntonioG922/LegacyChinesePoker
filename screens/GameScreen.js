import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import firebase from 'firebase';
import store from '../redux/store';

import Loader from '../components/Loader';
import {
  FaceDownCardsContainer,
  PlayedCardsContainer,
  UserCardContainer
} from '../components/CardContainer';
import {
  getHandType, getLowestCard,
  HAND_TYPES,
  isBetterHand
} from '../functions/HelperFunctions';
import { SuitAndRank } from '../components/Card';

export default function GameScreen({ route, navigation }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCards, setErrorCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(route.params);
  const user = store.getState().userData.user;
  const db = firebase.firestore();

  useEffect(() => {
    return db.collection('CustomGames').doc(gameData.gameName)
      .onSnapshot((doc) => {
        setGameData(doc.data());
      });
  }, []);

  useEffect(() => {
    if (gameStarted) {
      //****** Add in game logic here (playing cards, opponents hands shrinking, etc.) *******/
    } else {
      if (!gameData.playersLeftToJoin) {
        setGameStarted(true);
        //***** Add game start logic here (deal/render cards, show other players, etc.) ******/

      }
    }
  }, [gameData]);

  useEffect(() => {
    return navigation.addListener('blur', () => {
      if (!gameStarted) {
        let updates = {};
        updates[`players.${user.uid}`] = firebase.firestore.FieldValue.delete();
        updates['playersLeftToJoin'] = firebase.firestore.FieldValue.increment(1);
        db.collection('CustomGames').doc(gameData.gameName).update(updates)
      }
      setGameStarted(true);
    });
  }, [navigation]);

  function playCards(selectedCards) {
    setErrorMessage('');
    setErrorCards([]);

    const playedHandType = getHandType(selectedCards);
    const everyonePassed = user.displayName === gameData.lastPlayerToPlay;
    const isFirstPlayOfGame = gameData.currentHandType === HAND_TYPES.START_OF_GAME;
    const currentHand = gameData.hands[gameData.players[user.uid]].cards;

    if (playedHandType === HAND_TYPES.INVALID) {
      setErrorMessage('Invalid hand type');
      return false;
    } else if (isFirstPlayOfGame && !selectedCards.includes(getLowestCard(currentHand))) {
      setErrorMessage('Hand must include ');
      setErrorCards([getLowestCard(currentHand)]);
      return false;
    } else if (!everyonePassed && !isFirstPlayOfGame && playedHandType !== gameData.currentHandType) {
      setErrorMessage('Must play ' + gameData.currentHandType);
      return false;
    } else if (!everyonePassed && !isBetterHand(selectedCards, gameData.lastPlayed)) {
      setErrorMessage('Get that weak shit out');
      return false;
    }


    const player = gameData.currentPlayerTurnIndex;
    let hands = gameData.hands;
    hands[player].cards = hands[player].cards.filter(card => !selectedCards.includes(card));

    db.collection('CustomGames').doc(gameData.gameName).update({
      playedCards: firebase.firestore.FieldValue.arrayUnion(...selectedCards),
      lastPlayed: selectedCards,
      lastPlayerToPlay: user.displayName,
      hands: hands,
      // REMOVE FOR PROD. Allows tester to play every hand in a game.
      players: {
        [user.uid]: (gameData.currentPlayerTurnIndex + 1) % (gameData.numberOfPlayers)
      },
      currentPlayerTurnIndex: (gameData.currentPlayerTurnIndex + 1) % (gameData.numberOfPlayers),
      currentHandType: getHandType(selectedCards),
    });

    return true;
  }

  function pass() {
    db.collection('CustomGames').doc(gameData.gameName).update({
      currentPlayerTurnIndex: (gameData.currentPlayerTurnIndex + 1) % (gameData.numberOfPlayers),
      // REMOVE FOR PROD. Allows tester to play every hand in a game.
      players: {
        [user.uid]: (gameData.currentPlayerTurnIndex + 1) % (gameData.numberOfPlayers)
      },

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

  return (
    <ImageBackground source={require('../assets/images/felt.jpg')} style={styles.headerImage}>
      <Loader loading={!gameStarted} message={`Waiting for ${gameData.playersLeftToJoin} more player${gameData.playersLeftToJoin === 1 ? '' : 's'}`} navigation={navigation} />
      <PlayedCardsContainer cards={gameData.playedCards}
        lastPlayedCards={gameData.lastPlayed}
        lastPlayerToPlay={gameData.lastPlayerToPlay}
        style={styles.playedCards} />
      {gameStarted && <View style={styles.container}>
        <UserCardContainer cards={gameData.hands[gameData.players[user.uid]].cards}
          errorMessage={errorMessage}
          errorCards={errorCards}
          playerIndex={gameData.players[user.uid]}
          currentPlayerTurnIndex={gameData.currentPlayerTurnIndex}
          playCards={playCards}
          pass={pass}
          style={styles.player1Hand} />
        {Array.from({ length: gameData.numberOfPlayers - 1 }).map((value, index) => {
          const playerIndex = (gameData.players[user.uid] + index) % gameData.numberOfPlayers;

          return <FaceDownCardsContainer numberOfCards={gameData.hands[playerIndex].cards.length}
            style={getStyle(index + 1)}
            isCurrentPlayer={playerIndex === gameData.currentPlayerTurnIndex} />
        })}
      </View>}
    </ImageBackground>
  );
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
  player2Hand: {
    position: 'absolute',
    left: -110,
    top: '50%',
    width: '80%',
    transform: [
      { rotateZ: '90deg' },
      { translateX: '-50%' }
    ],
  },
  player3Hand: {
    position: 'absolute',
    top: 55,
    right: '5%',
    width: '80%',
    flexDirection: 'row',
    transform: [
      { rotateZ: '180deg' },
    ],
  },
  player4Hand: {
    position: 'absolute',
    right: -110,
    top: '50%',
    width: '80%',
    transform: [
      { rotateZ: '-90deg' },
    ],
  }

});

// Have loser of the hand send the game data to the DB stats collector to minimize the # of writes

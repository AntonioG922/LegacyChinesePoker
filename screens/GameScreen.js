import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import firebase from 'firebase';

import Loader from '../components/Loader'

export default function GameScreen({ route, navigation }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(route.params);
  const db = firebase.firestore();

  let coll = gameData.numberOfPlayers === gameData.players ? 'CustomGames' : 'CustomGamesLobby';

  useEffect(() => {
    const unsubscribe = db.collection(coll).doc(gameData.gameName)
      .onSnapshot((doc) => {
        setGameData(doc.data());
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (gameStarted) {
      //****** Add in game logic here (playing cards, opponents hands shrinking, etc.) *******/
    } else {
      if (gameData.numberOfPlayers === gameData.players) {
        setGameStarted(true);
        //***** Add game start logic here (deal/render cards, show other players, etc.) ******/
      }
    }
  }, [gameData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setGameStarted(true);
      db.collection(coll).doc(gameData.gameName).update({
        players: firebase.firestore.FieldValue.increment(-1)
      })
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../assets/images/felt.jpg')}
      style={styles.headerImage}
    >
      <Loader loading={!gameStarted} message={`Waiting for ${gameData.numberOfPlayers - gameData.players} more players`} navigation={navigation} />
      <View style={styles.container}>
      </View>
    </ImageBackground>
  );
}

function dealCards(numberOfPlayers = 4, cardsDealtToEachPlayer = 13, deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]) {
  let playerCards = [];
  for (i = 0; i < numberOfPlayers; i++) {
    playerCards.push([]);
  }
  for (i = 0; i < numberOfPlayers * cardsDealtToEachPlayer; i++) {
    const randIndex = Math.floor(Math.random() * (deck.length));
    playerCards[i % numberOfPlayers].push(deck[randIndex]);
    deck.splice([randIndex], 1);
  }
  return playerCards;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 0,
    borderColor: "#a95555",
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
});

// Make cards go towards center of table when played but they are off from the center by a small random amount, so that it looks more scattered like a real game of cards

// Have loser of the hand send the game data to the DB stats collector to minimize the # of writes

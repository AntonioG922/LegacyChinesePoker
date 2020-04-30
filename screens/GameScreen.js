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

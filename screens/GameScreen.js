import React, { useState, useEffect } from 'react';
import { Text, ImageBackground, StyleSheet, View } from 'react-native';
import firebase from 'firebase';

import Loader from '../components/Loader';
import { dealCards } from '../components/helperFunctions';
import { Card, CardBack, HorizontalCardContainer, FanCardContainer } from '../components/card';

export default function GameScreen({ route, navigation }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(route.params);
  const db = firebase.firestore();

  useEffect(() => {
    const unsubscribe = db.collection('CustomGames').doc(gameData.gameName)
      .onSnapshot((doc) => {
        setGameData(doc.data());
      });

    return unsubscribe;
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
    const unsubscribe = navigation.addListener('blur', () => {
      setGameStarted(true);
      db.collection('CustomGames').doc(gameData.gameName).update({
        players: firebase.firestore.FieldValue.increment(-1),
        playersLeftToJoin: firebase.firestore.FieldValue.increment(1)
      })
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ImageBackground source={require('../assets/images/felt.jpg')} style={styles.headerImage}>
      <Loader loading={!gameStarted} message={`Waiting for ${gameData.playersLeftToJoin} more player${gameData.playersLeftToJoin === 1 ? '' : 's'}`} navigation={navigation} />
      <Text onPress={() => {

      }} style={styles.tapToPlay} >Tap here to play cards</Text>
      {gameStarted && <View style={styles.container}>
        <HorizontalCardContainer cards={gameData.hands[0].cards} style={{ ...styles.playerHand, ...styles.player1Hand }} />

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
  tapToPlay: {
    width: 80,
    height: 107.5,
    borderWidth: 3,
    borderRadius: 10,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [
      { translateX: -40 },
      { translateY: -53.75 }
    ],
    textAlign: 'center',
    fontSize: 21
  },
  playerHand: {
    position: 'absolute',
  },
  playerCards: {
    position: 'absolute',
  },
  player1Hand: {
    bottom: 100,
    width: '80%'
  },
  player2Hand: {
    left: -30,
    top: '20%',
    height: '40%'
  },
  player3Hand: {
    top: -30,
    right: '10%',
    width: '70%'
  },
  player4Hand: {
    right: -30,
    top: '20%',
    height: '40%'
  }

});

// Make cards go towards center of table when played but they are off from the center by a small random amount, so that it looks more scattered like a real game of cards

// Have loser of the hand send the game data to the DB stats collector to minimize the # of writes

import React, {useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import firebase from 'firebase';

import Loader from '../components/Loader';
import {
  PlayedCardsContainer,
  UserCardContainer
} from '../components/CardContainer';

export default function GameScreen({ route, navigation }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(route.params);
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

      db.collection('CustomGames').doc(gameData.gameName).set(gameData)
    } else {
      if (!gameData.playersLeftToJoin) {
        setGameStarted(true);
        //***** Add game start logic here (deal/render cards, show other players, etc.) ******/

      }
    }
  }, [gameData]);

  useEffect(() => {
    return navigation.addListener('blur', () => {
      setGameStarted(true);
      db.collection('CustomGames').doc(gameData.gameName).update({
        players: firebase.firestore.FieldValue.increment(-1),
        playersLeftToJoin: firebase.firestore.FieldValue.increment(1)
      })
    });
  }, [navigation]);

  function playCards(selectedCards, player) {
    let hands = gameData.hands;
    hands[player].cards = hands[player].cards.filter(card => !selectedCards.includes(card));

    db.collection('CustomGames').doc(gameData.gameName).update({
      playedCards: firebase.firestore.FieldValue.arrayUnion(...selectedCards),
      lastPlayed: selectedCards,
      hands: hands,
    });
  }

  return (
    <ImageBackground source={require('../assets/images/felt.jpg')} style={styles.headerImage}>
      <Loader loading={!gameStarted} message={`Waiting for ${gameData.playersLeftToJoin} more player${gameData.playersLeftToJoin === 1 ? '' : 's'}`} navigation={navigation} />
      <PlayedCardsContainer cards={gameData.playedCards} lastPlayed={gameData.lastPlayed} style={styles.playedCards} />
      {gameStarted && <View style={styles.container}>
        <UserCardContainer cards={gameData.hands[0].cards} player={gameData.hands[0].player} playCards={playCards} style={styles.player1Hand} />

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

// Have loser of the hand send the game data to the DB stats collector to minimize the # of writes

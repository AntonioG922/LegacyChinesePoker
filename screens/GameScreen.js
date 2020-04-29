import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import firebase from 'firebase';

export default function GameScreen({ route, navigation }) {
  const params = route.params;

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      let coll = params.numberOfPlayers === params.players ? 'CustomGames' : 'ActiveGames';
      firebase.firestore().collection(coll).doc(params.gameName).update({
        players: firebase.firestore.FieldValue.increment(-1)
      })
    });

    return unsubscribe;
  }, [navigation]);

  console.log(params);

  return (
    <ImageBackground
      source={require('../assets/images/felt.jpg')}
      style={styles.headerImage}
    >
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

import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import firebase from 'firebase';

import { HeaderText, TextButton } from '../components/StyledText';
import store from '../redux/store';
import Loader from '../components/Loader';
import { dealCards, sortCards, findStartingPlayer, HAND_TYPES } from '../functions/HelperFunctions';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(store.getState().userData.user);

  useEffect(() => {
    return store.subscribe(() => {
      setUser(store.getState().userData.user);
    })
  }, []);

  function generateUID() {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  function createNewPlayNowGame(collRef) {
    let hands = dealCards(false, 4, 13);
    hands.forEach(array => sortCards(array.cards));

    let randUID = generateUID();

    const gameData = {
      gameName: randUID,
      password: '',
      numberOfPlayers: 4,
      numberOfComputers: 0,
      useJoker: false,
      cardsPerPlayer: 13,
      players: { [user.uid]: 0 },
      playersLeftToJoin: 3,
      hands: hands,
      lastPlayed: [],
      lastPlayerToPlay: {},
      playedCards: [],
      currentPlayerTurnIndex: findStartingPlayer(hands),
      currentHandType: HAND_TYPES.START_OF_GAME,
      places: [],
      playersTurnHistory: { [user.uid]: {} },
      overallTurnHistory: {},
      displayNames: { [user.uid]: user.displayName },
      playersPlayingAgain: {},
      playersNotPlayingAgain: {},
      gamesPlayed: 0,
      gamesWon: { [user.uid]: 0 },
      turnLength: 30,
      isLocalGame: false,
      queue: { [user.uid]: firebase.firestore.FieldValue.serverTimestamp() },
      gameStartTime: Date.now(),
      gameCreationTime: Date.now(),
      rejoinablePlayers: {},
      rejoinedPlayers: {}
    };

    collRef.doc(randUID).set(gameData)
      .then((docRef) => {
        setLoading(false);
        navigation.navigate('Game', gameData);
      })
      .catch((error) => {
        setLoading(false);
        alert('Error uploading game to database. Please check your connection and try again.');
        console.log('Error creating game: ', error);
      });
  }

  function joinPlayNowGame() {
    setLoading(true);
    const collRef = firebase.firestore().collection('PlayNowGames');
    collRef.where('playersLeftToJoin', '>', 0).limit(1).get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          createNewPlayNowGame(collRef);
        } else {
          querySnapshot.forEach(doc => {
            const docRef = collRef.doc(doc.id);
            let queueUpdate = {};
            queueUpdate[`queue.${user.uid}`] = firebase.firestore.FieldValue.serverTimestamp();
            docRef.update(queueUpdate)
              .then(() => {
                docRef.get()
                  .then(doc => {
                    const data = doc.data();
                    const queueSpot = Object.entries(data.queue).sort((a, b) => { return a[1].toMilli() - b[1].toMilli() }).findIndex(array => array[0] === user.uid);

                    if (queueSpot < data.numberOfPlayers) {
                      let updates = {};
                      updates[`players.${user.uid}`] = queueSpot;
                      updates['playersLeftToJoin'] = firebase.firestore.FieldValue.increment(-1);
                      updates[`playersTurnHistory.${user.uid}`] = {};
                      updates[`displayNames.${user.uid}`] = user.displayName;
                      updates[`gamesWon.${user.uid}`] = 0;

                      docRef.update(updates)
                        .then(() => {
                          setLoading(false);
                          navigation.navigate('Game', data);
                        })
                        .catch((error) => {
                          setLoading(false);
                          alert('Error joining game. Please check your connection and try again.');
                          console.log('Error joining game: ', error);
                        });
                    } else {
                      createNewPlayNowGame(collRef);
                    }
                  })
                  .catch(error => {
                    setLoading(false);
                    alert('Error joining game. Please check your connection and try again.');
                    console.log('Error getting doc after adding to queue: ', error);
                  });
              })
              .catch(error => {
                setLoading(false);
                alert('Error joining game. Please check your connection and try again.');
                console.log('Error adding to queue: ', error);
              });

          })
        }
      })
      .catch((error) => {
        setLoading(false);
        alert('Error joining game. Please check your connection and try again.');
        console.log('Error retrieving Play Now games: ', error);
      })
  }

  useEffect(() => {
    // delete play now games older than 30 minutes
    const minutesTillDeletion = 30;
    const deleteTime = Date.now() - (minutesTillDeletion * 60 * 1000);
    firebase.firestore().collection('PlayNowGames')
      .where('gameStartTime', '<', deleteTime)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          firebase.firestore().collection('PlayNowGames').doc(doc.id).delete()
            .then(() => {
              console.log('Deleted game: ', doc.id)
            })
            .catch(error => {
              console.log('Error deleting game: ', doc.id, 'Error: ', error);
            })
        })
      })
  }, []);

  return (
    <View style={styles.container}>
      <Loader loading={loading} message={'Joining Game'} style={{ top: 0 }} />
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../assets/images/dragon.png')}
          style={styles.headerImage}
        >
          <HeaderText style={styles.title} >Chinese Poker</HeaderText>
          <HeaderText style={[styles.title, styles.title2]}>Chinese Poker</HeaderText>
          <HeaderText style={[styles.title, styles.title3]}>Chinese Poker</HeaderText>
          <HeaderText style={[styles.title, styles.title4]}>Chinese Poker</HeaderText>
        </ImageBackground>
      </View>

      <View style={styles.menuOptionContainer}>
        <TextButton onPress={() => joinPlayNowGame()}>Play Now</TextButton>
        <TextButton onPress={() => navigation.navigate('HostGameOptions')}>Host Game</TextButton>
        <TextButton onPress={() => navigation.navigate('JoinGameMenu')}>Join Game</TextButton>
        <TextButton onPress={() => navigation.navigate('Stats')}>Stats</TextButton>
        <TextButton onPress={() => navigation.navigate('HowToPlay')}>How To Play</TextButton>
      </View>
      <SafeAreaView style={styles.logoutIconContainer} >
        <TouchableOpacity style={styles.logoutIconEvent} onPress={() => navigation.navigate('Settings')} >
          <FontAwesome5 name={'cog'} style={{ color: 'rgb(96,100,109)', fontSize: 30 }} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    backgroundColor: '#fafafa'
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 50
  },
  headerImage: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOptionContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 65,
    color: 'rgb(96,100,109)',
    lineHeight: 65,
    position: 'absolute',
    textAlign: 'center',
    textShadowColor: '#fafafa',
    textShadowOffset: ({ width: 2, height: 2 }),
    textShadowRadius: 0
  },
  title2: {
    position: 'absolute',
    textShadowColor: '#fafafa',
    textShadowOffset: ({ width: -2, height: 2 }),
    textShadowRadius: 0
  },
  title3: {
    position: 'absolute',
    textShadowColor: '#fafafa',
    textShadowOffset: ({ width: 2, height: -2 }),
    textShadowRadius: 0
  },
  title4: {
    position: 'absolute',
    textShadowColor: '#fafafa',
    textShadowOffset: ({ width: -2, height: -2 }),
    textShadowRadius: 0
  },
  logoutIconContainer: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 50,
    height: 50
  },
  logoutIconEvent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  }
});

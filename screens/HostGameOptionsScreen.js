import * as firebase from 'firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';

import { dealCards } from '../functions/HelperFunctions';

import {
  HeaderText, FlatTextInput,
  TextButton
} from '../components/StyledText';
import { TitledPage } from '../components/Template';
import Loader from '../components/Loader';

export default function HostGameOptionsScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [gameName, setGameName] = useState('');
  const [password, setPassword] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [useJoker, setUseJoker] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        setUserId(user.uid);
      } else {
        // No user is signed in.
      }
    });
  }, []);

  function createGame(gameName, password, numberOfPlayers, useJoker) {
    setLoading(true);
    const gameData = {
      gameName: gameName,
      password: password,
      numberOfPlayers: numberOfPlayers,
      useJoker: useJoker,
      players: {[userId]: 0},
      currentPlayerTurn: 0,
      playersLeftToJoin: numberOfPlayers - 1,
      hands: dealCards(numberOfPlayers, useJoker),
      lastPlayerToPlay: '',
      playedCards: [],
    };
    firebase.firestore().collection('CustomGames').doc(gameName).set(gameData)
      .then(() => {
        setLoading(false);
        navigation.navigate('Game', gameData);
      })
      .catch((error) => {
        alert('Error uploading game to database. Please try again.')
      });
  }

  return (
    <TitledPage pageTitle={'Host Game'} navigation={navigation} contentContainerStyle={styles.container}>
      <Loader loading={loading} message={'Creating Game'} />
      <View style={styles.form}>
        <FlatTextInput label={'Game Name'} onChangeText={text => setGameName(text)} />
        <FlatTextInput label={'Password'} placeholder={'Optional'} textContentType={'password'} onChangeText={text => setPassword(text)} />
        <View style={styles.row}>
          <HeaderText style={styles.rowText} >Players:</HeaderText>
          <Button disabled={numberOfPlayers <= 3} onPress={() => setNumberOfPlayers(numberOfPlayers - 1)}><FontAwesome5 name={'chevron-down'} style={styles.rowText} /></Button>
          <HeaderText style={styles.rowText} >{numberOfPlayers}</HeaderText>
          <Button disabled={numberOfPlayers >= 5} onPress={() => setNumberOfPlayers(numberOfPlayers + 1)}><FontAwesome5 name={'chevron-up'} style={styles.rowText} /></Button>
        </View>
        <View style={styles.row}>
          <HeaderText style={styles.rowText} >Use Joker:</HeaderText>
          <Checkbox color={'rgb(217, 56, 27)'} status={useJoker ? 'checked' : 'unchecked'} onPress={() => setUseJoker(!useJoker)} />
        </View>
      </View>
      <TextButton style={styles.createButton} onPress={() => createGame(gameName, password, numberOfPlayers, useJoker)} >Create Game</TextButton>
    </TitledPage>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
  },
  createButton: {
    marginTop: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rowText: {
    paddingHorizontal: 5,
    fontSize: 24,
  }
});

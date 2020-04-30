import * as firebase from 'firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, TextInput, Title } from 'react-native-paper';

import { dealCards } from '../components/helperFunctions';

import {
  HeaderText, FlatTextInput,
  OutlineTextInput,
  TextButton
} from '../components/StyledText';
import { TitledPage } from '../components/Template';
import Loader from '../components/Loader';

export default function HostGameOptionsScreen({ navigation }) {
  const [gameName, setGameName] = useState('');
  const [password, setPassword] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [useJoker, setUseJoker] = useState(true);
  const [loading, setLoading] = useState(false);

  function createGame(gameName, password, numberOfPlayers, useJoker) {
    setLoading(true);
    let deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
      37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
    if (useJoker)
      deck.push(53);
    const dealtCards = dealCards(numberOfPlayers, Math.floor(deck.length / numberOfPlayers), deck);
    const gameData = {
      gameName: gameName,
      password: password,
      numberOfPlayers: numberOfPlayers,
      useJoker: useJoker,
      players: 1,
      playersLeftToJoin: numberOfPlayers - 1,
      hands: dealtCards
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

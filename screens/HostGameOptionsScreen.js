import * as firebase from 'firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, TextInput, Title } from 'react-native-paper';

import {
  HeaderText, FlatTextInput,
  OutlineTextInput,
  TextButton
} from '../components/StyledText';
import { TitledPage } from '../components/Template';

export default function HostGameOptionsScreen() {
  const [gameName, setGameName] = useState('');
  const [password, setPassword] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [useJoker, setUseJoker] = useState(true);

  return (
    <TitledPage pageTitle={'Host Game'} contentContainerStyle={styles.container}>
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

function createGame(gameName, password, numberOfPlayers, useJoker) {
  firebase.firestore().collection('CustomGamesLobby').doc(gameName).set({
    gameName: gameName,
    password: password,
    numberOfPlayers: numberOfPlayers,
    useJoker: useJoker,
    players: 1
  }).then(() => {
    console.log('Game added!');
  });
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

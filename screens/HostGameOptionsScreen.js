import * as firebase from 'firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import store from '../redux/store';

import {
  dealCards,
  findStartingPlayer, getRandomAvatars,
  HAND_TYPES
} from '../functions/HelperFunctions';

import {
  HeaderText, FlatTextInput,
  TextButton
} from '../components/StyledText';
import { TitledPage } from '../components/Template';
import Loader from '../components/Loader';

export default function HostGameOptionsScreen({ navigation }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [gameName, setGameName] = useState('');
  const [password, setPassword] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(13);
  const [useJoker, setUseJoker] = useState(true);
  const [loading, setLoading] = useState(false);
  const user = store.getState().userData.user;

  function gameExists(gameName) {
    const gameRef = firebase.firestore().collection('CustomGames').doc(gameName);

    return gameRef.get().then((docSnapshot) => docSnapshot.exists);
  }

  async function createGame() {
    const exists = await gameExists(gameName);
    if (exists) {
      setErrorMessage(' Game ' + gameName + ' already exists');
      return false;
    }

    setErrorMessage('');
    setLoading(true);
    const hands = dealCards(numberOfPlayers, cardsPerPlayer, useJoker);
    const gameData = {
      gameName: gameName,
      password: password,
      numberOfPlayers: numberOfPlayers,
      useJoker: useJoker,
      players: { [user.uid]: 0 },
      playersLeftToJoin: numberOfPlayers - 1,
      hands: hands,
      lastPlayed: [],
      lastPlayerToPlay: '',
      playedCards: [],
      currentPlayerTurnIndex: findStartingPlayer(hands),
      currentHandType: HAND_TYPES.START_OF_GAME,
      places: [],
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
        <HeaderText style={styles.errorMessage}>{errorMessage}</HeaderText>
        <FlatTextInput label={'Game Name'} onChangeText={text => setGameName(text)} />
        <FlatTextInput label={'Password'} placeholder={'Optional'} textContentType={'password'} onChangeText={text => setPassword(text)} />
        <View style={styles.row}>
          <HeaderText style={styles.rowText} >Players:</HeaderText>
          <Button disabled={numberOfPlayers <= 3} onPress={() => setNumberOfPlayers(numberOfPlayers - 1)}><FontAwesome5 name={'chevron-down'} style={styles.rowText} /></Button>
          <HeaderText style={styles.rowText} >{numberOfPlayers}</HeaderText>
          <Button disabled={numberOfPlayers >= 5} onPress={() => setNumberOfPlayers(numberOfPlayers + 1)}><FontAwesome5 name={'chevron-up'} style={styles.rowText} /></Button>
        </View>
        <View style={styles.row}>
          <HeaderText style={styles.rowText} >Cards / Player:</HeaderText>
          <Button disabled={cardsPerPlayer <= 1} onPress={() => setCardsPerPlayer(cardsPerPlayer - 1)}><FontAwesome5 name={'chevron-down'} style={styles.rowText} /></Button>
          <HeaderText style={styles.rowText} >{cardsPerPlayer}</HeaderText>
          <Button disabled={cardsPerPlayer >= 20} onPress={() => setCardsPerPlayer(cardsPerPlayer + 1)}><FontAwesome5 name={'chevron-up'} style={styles.rowText} /></Button>
        </View>
        <View style={styles.row}>
          <HeaderText style={styles.rowText} >Use Joker:</HeaderText>
          <Checkbox color={'rgb(217, 56, 27)'} status={useJoker ? 'checked' : 'unchecked'} onPress={() => setUseJoker(!useJoker)} />
        </View>
      </View>
      <TextButton style={styles.createButton} onPress={createGame} >Create Game</TextButton>
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
  errorMessage: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  rowText: {
    paddingHorizontal: 5,
    fontSize: 24,
  }
});

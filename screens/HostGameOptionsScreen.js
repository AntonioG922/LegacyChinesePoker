import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import firebase from 'firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import store from '../redux/store';

import {
  dealCards,
  findStartingPlayer,
  HAND_TYPES, JOKER_DECK, MAX_NUMBER_PLAYERS, MIN_NUMBER_PLAYERS, STANDARD_DECK, sortCards,
  AI_DIFFICULTIES
} from '../functions/HelperFunctions';

import {
  HeaderText, FlatTextInput,
  TextButton, DividerLine
} from '../components/StyledText';
import TitledPage from '../components/TitledPage';
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
  const [maxCardsAllowed, setMaxCardsAllowed] = useState(13);
  const [turnLength, setTurnLength] = useState(30);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [numberOfComputers, setNumberOfComputers] = useState(0);
  const [computerDifficulties, setComputerDifficulties] = useState([]);

  const computerPossibleDifficulties = Object.keys(AI_DIFFICULTIES).map(key => AI_DIFFICULTIES[key]);

  const scrollRef = useRef();
  const advancedOptionsHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setMaxCardsAllowed(useJoker ? Math.floor(JOKER_DECK.length / numberOfPlayers) : Math.floor(STANDARD_DECK.length / numberOfPlayers));
  }, [numberOfPlayers, cardsPerPlayer, useJoker]);

  useEffect(() => {
    if (cardsPerPlayer > maxCardsAllowed)
      setCardsPerPlayer(maxCardsAllowed);
  }, [maxCardsAllowed]);

  useEffect(() => {
    if (numberOfComputers >= numberOfPlayers) {
      updateComputerDifficulties(computerDifficulties.length - 1, 'delete');
    }
  }, [numberOfPlayers]);

  useEffect(() => {
    const duration = 300;
    const height = 160 + ((numberOfComputers - 1) * 33) - (numberOfComputers === (numberOfPlayers - 1) ? 33 : 0);
    Animated.parallel([
      Animated.timing(advancedOptionsHeight, {
        toValue: showAdvancedOptions ? height : 0,
        duration: duration
      })
    ]).start();

    scrollRef.current.scrollTo({ y: showAdvancedOptions ? height : 0, animated: true });
  }, [showAdvancedOptions, numberOfComputers, numberOfPlayers]);

  async function gameExists(gameName) {
    const gameRef = firebase.firestore().collection('CustomGames').doc(gameName);

    return gameRef.get().then((docSnapshot) => docSnapshot.exists);
  }

  async function createGame() {
    if (gameName) {
      const localGame = (numberOfComputers === numberOfPlayers - 1) ? true : false;

      if (!localGame) {
        const exists = await gameExists(gameName);
        if (exists) {
          setErrorMessage(' Game ' + gameName + ' already exists');
          return false;
        }
      }

      setErrorMessage('');
      setLoading(true);

      let hands = dealCards(useJoker, numberOfPlayers, cardsPerPlayer);
      hands.forEach(array => sortCards(array.cards));
      let players = { [user.uid]: 0 };
      let displayNames = { [user.uid]: user.displayName };
      let playersTurnHistory = { [user.uid]: {} };
      let gamesWon = { [user.uid]: 0 };
      let numOfEachDifficulty = {};
      computerPossibleDifficulties.forEach((difficulty) => {
        numOfEachDifficulty[difficulty] = 0;
      });
      computerDifficulties.forEach((difficulty, index) => {
        const thisDifficultyCount = ++numOfEachDifficulty[difficulty];
        const cpuUID = 'Bot' + difficulty + String(thisDifficultyCount);
        const cpuDisplayName = 'Bot ' + (difficulty === 'Medium' ? 'Med' : difficulty) + ' ' + String(thisDifficultyCount);
        players[cpuUID] = index + 1;
        displayNames[cpuUID] = cpuDisplayName;
        playersTurnHistory[cpuUID] = {};
        gamesWon[cpuUID] = 0;
      });

      const gameData = {
        gameName: gameName,
        password: password,
        numberOfPlayers: numberOfPlayers,
        numberOfComputers: numberOfComputers,
        useJoker: useJoker,
        cardsPerPlayer: cardsPerPlayer,
        players: players,
        playersLeftToJoin: numberOfPlayers - numberOfComputers - 1,
        hands: hands,
        lastPlayed: [],
        lastPlayerToPlay: {},
        playedCards: [],
        currentPlayerTurnIndex: findStartingPlayer(hands),
        currentHandType: HAND_TYPES.START_OF_GAME,
        places: [],
        playersTurnHistory: playersTurnHistory,
        overallTurnHistory: {},
        displayNames: displayNames,
        playersPlayingAgain: {},
        playersNotPlayingAgain: {},
        gamesPlayed: 0,
        gamesWon: gamesWon,
        turnLength: turnLength,
        localGame: localGame
      };

      if (localGame) {
        setLoading(false);
        navigation.navigate('Game', gameData)
      } else {
        firebase.firestore().collection('CustomGames').doc(gameName).set(gameData)
          .then(() => {
            setLoading(false);
            navigation.navigate('Game', gameData);
          })
          .catch(() => {
            alert('Error uploading game to database. Please check your connection and try again.')
          });
      }
    }
  }

  function updateComputerDifficulties(index, action) {
    // inputs:
    //    index: index in computerDifficulties array that needs to be updated
    //    action: string containing action to be performed

    let temp = [...computerDifficulties];

    if (action === 'increment') {
      temp[index] = computerPossibleDifficulties[computerPossibleDifficulties.indexOf(temp[index]) + 1];
    } else if (action === 'decrement') {
      temp[index] = computerPossibleDifficulties[computerPossibleDifficulties.indexOf(temp[index]) - 1];
    } else if (action === 'add') {
      temp.push(computerDifficulties.length ? computerDifficulties[computerDifficulties.length - 1] : 'Medium');
      setNumberOfComputers(numberOfComputers + 1);
    } else if (action === 'delete') {
      temp.splice(index, 1);
      setNumberOfComputers(numberOfComputers - 1);
    }


    setComputerDifficulties(temp);
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ height: '100%' }} ref={scrollRef}>
        <Loader loading={loading} message={'Creating Game'} />
        <TitledPage pageTitle={'Host Game'} navigation={navigation}>
          <View style={styles.form}>

            <View style={{ paddingHorizontal: 30 }}>
              <HeaderText style={styles.errorMessage}>{errorMessage}</HeaderText>
              <FlatTextInput label={'Game Name'} onChangeText={text => setGameName(text)} />
              <FlatTextInput label={'Password'} placeholder={'Optional'} textContentType={'password'} onChangeText={text => setPassword(text)} />
            </View>

            <View style={styles.row}>
              <View style={styles.optionText}>
                <HeaderText style={styles.rowText} >Players:</HeaderText>
              </View>

              <View style={[styles.row, styles.optionButtons, { marginVertical: 0 }]}>
                <Button disabled={numberOfPlayers <= MIN_NUMBER_PLAYERS}
                  onPress={() => {
                    setNumberOfPlayers(numberOfPlayers - 1);
                  }}>
                  <FontAwesome5 name={'chevron-down'} style={styles.rowText} />
                </Button>
                <HeaderText style={styles.rowText} >{numberOfPlayers}</HeaderText>
                <Button disabled={numberOfPlayers >= MAX_NUMBER_PLAYERS}
                  onPress={() => {
                    setNumberOfPlayers(numberOfPlayers + 1);
                  }}>
                  <FontAwesome5 name={'chevron-up'} style={styles.rowText} />
                </Button>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.optionText}>
                <HeaderText style={styles.rowText} >Cards / Player:</HeaderText>
              </View>

              <View style={[styles.row, styles.optionButtons, { marginVertical: 0 }]}>
                <Button disabled={cardsPerPlayer <= 1} onPress={() => setCardsPerPlayer(cardsPerPlayer - 1)}><FontAwesome5 name={'chevron-down'} style={styles.rowText} /></Button>
                <HeaderText style={styles.rowText} >{cardsPerPlayer}</HeaderText>
                <Button disabled={cardsPerPlayer >= maxCardsAllowed}
                  onPress={() => setCardsPerPlayer(cardsPerPlayer + 1)}>
                  <FontAwesome5 name={'chevron-up'} style={styles.rowText} />
                </Button>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.optionText}>
                <HeaderText style={styles.rowText} >Use Joker:</HeaderText>
              </View>

              <TouchableOpacity style={[styles.row, styles.optionButtons, { marginVertical: 0 }]} onPress={() => setUseJoker(!useJoker)} >
                <Checkbox color={'rgb(217, 56, 27)'} status={useJoker ? 'checked' : 'unchecked'} />
              </TouchableOpacity>
            </View>

            <DividerLine />

            <View style={styles.row}>
              <HeaderText>Advanced Options</HeaderText>
              <Button onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                <FontAwesome5 name={showAdvancedOptions ? 'chevron-up' : 'chevron-down'} style={[styles.rowText, { fontSize: 18 }]} />
              </Button>
            </View>

            <Animated.View style={[{ height: advancedOptionsHeight, overflow: 'hidden' }]}>
              <View style={styles.row}>
                <View style={styles.optionText}>
                  <HeaderText style={styles.rowText} >Turn Length:</HeaderText>
                </View>

                <View style={[styles.row, styles.optionButtons, { marginVertical: 0 }]}>
                  <Button disabled={turnLength <= 5} onPress={() => setTurnLength(turnLength - 5)}>
                    <FontAwesome5 name={'chevron-down'} style={[styles.rowText, { paddingHorizontal: 0 }]} />
                  </Button>

                  <HeaderText style={styles.rowText} >{turnLength}<HeaderText style={{ fontSize: 15 }}> s</HeaderText></HeaderText>

                  <Button disabled={turnLength >= 60}
                    onPress={() => setTurnLength(turnLength + 5)}>
                    <FontAwesome5 name={'chevron-up'} style={[styles.rowText, { bottom: 0 }]} />
                  </Button>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[{ alignSelf: 'flex-start', flex: 2 }]}>
                  <HeaderText style={[styles.rowText, { textAlign: 'center' }]} >CPU<HeaderText style={{ fontSize: 18 }}>s</HeaderText>:</HeaderText>
                </View>

                <View style={{ flex: 3 }}>
                  {Array.from({ length: numberOfComputers }).map((value, index) => {
                    return (
                      <View key={index} style={[styles.row, { marginVertical: 0 }]}>
                        <View style={[styles.row, { marginVertical: 0, flex: 5 }]}>
                          <Button disabled={computerDifficulties[index] === computerPossibleDifficulties[0]} onPress={() => updateComputerDifficulties(index, 'decrement')}>
                            <FontAwesome5 name={'chevron-down'} style={styles.computerDifficultyText} />
                          </Button>

                          <HeaderText style={styles.computerDifficultyText} >{computerDifficulties[index]}</HeaderText>

                          <Button disabled={computerDifficulties[index] === computerPossibleDifficulties[computerPossibleDifficulties.length - 1]}
                            onPress={() => updateComputerDifficulties(index, 'increment')}>
                            <FontAwesome5 name={'chevron-up'} style={styles.computerDifficultyText} />
                          </Button>
                        </View>
                        <View style={{ flex: 1 }}>
                          <TouchableOpacity style={{ width: 35, height: 30, justifyContent: 'center', alignItems: 'center' }} onPress={() => updateComputerDifficulties(index, 'delete')} >
                            <FontAwesome5 name={'minus'} style={{ fontSize: 20 }} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )
                  })}

                  {(numberOfPlayers - numberOfComputers - 1) > 0 &&
                    <View style={[styles.row, { marginVertical: 0 }]}>
                      <TouchableOpacity style={styles.row} onPress={() => { updateComputerDifficulties(null, 'add') }}>
                        <HeaderText style={{ fontSize: 20 }}>Add  </HeaderText>
                        <FontAwesome5 name='plus' style={{ fontSize: 20, color: 'rgb(217, 56, 27)' }} />
                      </TouchableOpacity>
                    </View>
                  }
                </View>
              </View>

            </Animated.View>

            <DividerLine />
          </View>

          <TextButton style={styles.createButton} onPress={createGame} >Create Game</TextButton>
        </TitledPage>
      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  createButton: {
    marginTop: 25
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
  },
  computerDifficultyText: {
    fontSize: 15
  },
  optionText: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionButtons: {
    flex: 2,
  }
});

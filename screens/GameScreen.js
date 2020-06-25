import React, { useEffect, useState, useRef } from 'react';
import { ImageBackground, StyleSheet, View, Text, SafeAreaView, Animated, TouchableOpacity, Vibration, TouchableHighlight, Image } from 'react-native';
import firebase from 'firebase';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import store from '../redux/store';

import Loader from '../components/Loader';
import {
  FaceDownCardsContainer,
  FaceUpCardContainer,
  PlayedCardsContainer,
  UserCardContainer
} from '../components/CardContainer';
import {
  getAvatarImage,
  getHandType, getLowestCard,
  getNextNonEmptyHandIndex,
  HAND_TYPES,
  isBetterHand, isLegalPlay,
  dealCards, findStartingPlayer, GAME_TYPE_BY_NUMBER_OF_PLAYERS, GAME_TYPES,
  AI_UID_PREFIXES, AVATARS
} from '../functions/HelperFunctions';
import PopUpMessage from '../components/PopUpMessage';
import TrophyPlaceDisplay from '../components/TrophyPlaceDisplay';
import { HeaderText, DividerLine } from '../components/StyledText';
import { getLowestPlayableCards } from '../functions/AIFunctions';

export default function GameScreen({ route, navigation }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCards, setErrorCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(route.params);
  const [gameEnded, setGameEnded] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [handsPlayed, setHandsPlayed] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [showDisplayNames, setShowDisplayNames] = useState(true);
  const [vibrateOnTurn, setVibrateOnTurn] = useState(true);
  const [leavingGame, setLeavingGame] = useState(false);
  const [showRejoinScreen, setShowRejoinScreen] = useState(false);
  const [isLocalGame, setIsLocalGame] = useState(gameData.isLocalGame);

  const gameLobby = gameData.gameName.length > 20 ? 'PlayNowGames' : 'CustomGames';
  const user = store.getState().userData.user;
  const db = firebase.firestore();

  const menuPosition = useRef(new Animated.Value(-225)).current;
  const screenShaderOpacity = useRef(new Animated.Value(0)).current;
  const screenShaderZindex = useRef(new Animated.Value(-1)).current;
  const hamButtonOpacity = useRef(new Animated.Value(1)).current;
  const hamButtonRotation = useRef(new Animated.Value(0)).current;
  const hamButtonY1 = useRef(new Animated.Value(0)).current;
  const hamButtonY2 = useRef(new Animated.Value(0)).current;
  const hamButtonWidth = useRef(new Animated.Value(26)).current;

  let hamButtonRotationDeg1 = hamButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });
  let hamButtonRotationDeg2 = hamButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg']
  });

  useEffect(() => {
    let unsubscribe;
    if (!isLocalGame) {
      unsubscribe = db.collection(gameLobby).doc(gameData.gameName)
        .onSnapshot((doc) => {
          const docData = doc.data();
          const leavingGame = docData === undefined || (!Object.keys(docData.players).includes(user.uid) && !Object.keys(docData.rejoinablePlayers).includes(user.uid));

          const currentPlayerIsRejoinable = Object.keys(docData.rejoinablePlayers).includes(user.uid);
          if (currentPlayerIsRejoinable) {
            setShowRejoinScreen(true);
          }

          if (!leavingGame) {
            // if (docData.currentPlayerTurnIndex === docData.players[user.uid]) console.log(getLowestPlayableCards(docData.hands[docData.players[user.uid]].cards, docData.cardsPerPlayer, docData.currentHandType, docData.lastPlayed, true));
            setGameData(docData);
          }
        });
    } else {
      console.log('We local bitch: ', gameData)
    }

    return () => { unsubscribe ? unsubscribe() : true };
  }, []);

  useEffect(() => {
    const isCurrentPlayer = gameData.players[user.uid] === gameData.currentPlayerTurnIndex;
    if (isCurrentPlayer && vibrateOnTurn) {
      Vibration.vibrate();
    }
  }, [gameData.currentPlayerTurnIndex])

  useEffect(() => {
    if ((!gameStarted) && gameData.playersLeftToJoin <= 0 && Object.keys(gameData.playersPlayingAgain).length === 0) {
      setGameStarted(true);
      maybeSetGameStartTime();
    }
  }, [gameData.playersLeftToJoin, gameData.playersPlayingAgain]);

  useEffect(() => {
    if (gameData.numberOfPlayers === gameData.places.length && Object.keys(gameData.playersPlayingAgain).length === 0) {
      if (!isLocalGame) {
        updateUserStats();
      }
      let playersPlayingAgain = gameData.playersPlayingAgain;
      Object.keys(gameData.displayNames).forEach(uid => {
        if (AI_UID_PREFIXES.includes(uid.slice(0, 7))) {
          playersPlayingAgain[uid] = gameData.displayNames[uid];
        }
      });
      let updates = {
        playersPlayingAgain: playersPlayingAgain
      };
      setGameData({ ...gameData, ...updates });
      setGameEnded(true);
    }
  }, [gameData.places]);

  useEffect(() => {
    gameEnded ? setTimeout(() => { setShowPopUp(true) }, 2000) : setShowPopUp(false);
  }, [gameEnded]);

  useEffect(() => {
    const playersPlayingAgainLength = Object.keys(gameData.playersPlayingAgain).length;
    const lastUIDPlayingAgain = playersPlayingAgainLength ? Object.keys(gameData.playersPlayingAgain)[playersPlayingAgainLength - 1] : null;
    const allRemainingPlayersPlayingAgain = playersPlayingAgainLength === Object.keys(gameData.players).length;

    if (allRemainingPlayersPlayingAgain && lastUIDPlayingAgain === user.uid) {
      const hands = dealCards(gameData.useJoker, gameData.numberOfPlayers, gameData.cardsPerPlayer);
      let players = {};
      let playersTurnHistory = {};
      let displayNames = {};
      let queue = {};
      let playersLeftToJoin = gameData.numberOfPlayers;
      let gamesWon = gameData.gamesWon;
      Object.keys(gameData.playersPlayingAgain).forEach((uid, index) => {
        players[uid] = index;
        hands[index].avatar = gameData.hands[gameData.players[uid]].avatar;
        playersTurnHistory[uid] = {};
        displayNames[uid] = gameData.playersPlayingAgain[uid];
        gamesWon[uid] = gameData.gamesWon[uid];
        queue[uid] = firebase.firestore.FieldValue.serverTimestamp();
        playersLeftToJoin--;
      });

      const updates = {
        players: players,
        playersLeftToJoin: playersLeftToJoin,
        hands: hands,
        lastPlayed: [],
        lastPlayerToPlay: '',
        playedCards: [],
        currentPlayerTurnIndex: findStartingPlayer(hands),
        currentHandType: HAND_TYPES.START_OF_GAME,
        places: [],
        playersTurnHistory: playersTurnHistory,
        overallTurnHistory: {},
        displayNames: displayNames,
        playersPlayingAgain: {},
        playersNotPlayingAgain: {},
        gamesWon: gamesWon,
        queue: queue,
        isLocalGame: gameData.numberOfPlayers === (gameData.numberOfComputers + 1),
        rejoinablePlayers: {},
        rejoinedPlayers: {}
      };

      if (isLocalGame) {
        setGameData({ ...gameData, ...updates });
      } else {
        db.collection(gameLobby).doc(gameData.gameName).update(updates)
          .then(() => {
            setGameStarted(!playersLeftToJoin);
            maybeSetGameStartTime();
          })
          .catch(() => {
            alert('Error trying to play again. Please check your connection and try again.')
          });
      }
    }
  }, [Object.keys(gameData.playersPlayingAgain).length, Object.keys(gameData.players).length]);

  useEffect(() => {
    const duration = 250;
    Animated.parallel([
      Animated.timing(menuPosition, {
        toValue: showMenu ? 0 : -225,
        duration: duration
      }),
      Animated.timing(screenShaderOpacity, {
        toValue: showMenu ? .5 : 0,
        duration: duration
      }),
      Animated.timing(screenShaderZindex, {
        toValue: showMenu ? 3 : -1,
        duration: duration
      }),
      //hamburger button
      Animated.timing(hamButtonOpacity, {
        toValue: showMenu ? 0 : 1,
        duration: duration
      }),
      Animated.timing(hamButtonRotation, {
        toValue: showMenu ? 1 : 0,
        duration: duration
      }),
      Animated.timing(hamButtonY1, {
        toValue: showMenu ? 7.3 : 0,
        duration: duration
      }),
      Animated.timing(hamButtonY2, {
        toValue: showMenu ? -7.3 : 0,
        duration: duration
      }),
      Animated.timing(hamButtonWidth, {
        toValue: showMenu ? 0 : 26,
        duration: duration
      })
    ]).start();
  }, [showMenu]);

  useEffect(() => {
    const lastPlayerLeft = gameData.places.length === gameData.numberOfPlayers;
    if (isLocalGame && !lastPlayerLeft) {
      const currentPlayerUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex);
      const computerPlaysNext = AI_UID_PREFIXES.includes(currentPlayerUID.slice(0, 7));

      if (computerPlaysNext) {
        const AIDifficulty = currentPlayerUID.slice(3, 7);
        const exclusive = AIDifficulty === 'Easy' ? false : true;
        const computerSelectedCards = getLowestPlayableCards(gameData.hands[gameData.players[currentPlayerUID]].cards, gameData.cardsPerPlayer, gameData.currentHandType, gameData.lastPlayed, exclusive);
        setTimeout(() => {
          if (computerSelectedCards) {
            playCards(computerSelectedCards);
          } else {
            pass();
          }
        }, gameData.places.find(uid => user.uid === uid) ? 500 : 1500);
      }
    }
  }, [gameData.currentPlayerTurnIndex, gameData.currentHandType]);

  useEffect(() => {
    setIsLocalGame(gameData.isLocalGame);
  }, [gameData.isLocalGame])

  function updateUserStats() {
    const gameType = GAME_TYPE_BY_NUMBER_OF_PLAYERS[gameData.numberOfPlayers];
    const userPlacement = gameData.places.indexOf(user.uid) + 1;
    let allGamesUpdates = {
      totalGames: firebase.firestore.FieldValue.increment(1),
      playtime: firebase.firestore.FieldValue.increment(Date.now() - gameData.gameStartTime),
      placements: {
        1: userPlacement === 1 ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(0),
        last: userPlacement === gameData.numberOfPlayers ? firebase.firestore.FieldValue.increment(1) : firebase.firestore.FieldValue.increment(0),
      }
    };
    let specificGameTypeUpdates = {
      totalGames: firebase.firestore.FieldValue.increment(1),
      playtime: firebase.firestore.FieldValue.increment(Date.now() - gameData.gameStartTime),
    };

    let place = {};
    place[userPlacement] = firebase.firestore.FieldValue.increment(1);
    specificGameTypeUpdates.placements = place;

    if (Object.keys(handsPlayed).length > 0) {
      let hands = {};
      Object.keys(handsPlayed).forEach((handType) => {
        hands[handType] = firebase.firestore.FieldValue.increment(handsPlayed[handType]);
      });
      allGamesUpdates.hands = hands;
      specificGameTypeUpdates.hands = hands;
    }

    const updates = {};
    updates[GAME_TYPES.ALL_GAMES] = allGamesUpdates;
    updates[gameType] = specificGameTypeUpdates;

    db.collection('Stats').doc(user.uid).set(updates, { merge: true }).then(() => setHandsPlayed({}));
  }

  function maybeSetGameStartTime() {
    const isLastPlayer = Object.keys(gameData.players).find(key => gameData.players[key] === gameData.numberOfPlayers - 1) === user.uid;

    if (isLastPlayer) {
      db.collection(gameLobby).doc(gameData.gameName).update({
        gameStartTime: Date.now()
      }).then(() => true);
    }

    return false;
  }

  function getNextNonEmptyHandIndexLocal() {
    return getNextNonEmptyHandIndex(gameData.hands, gameData.currentPlayerTurnIndex, gameData.numberOfPlayers) % gameData.numberOfPlayers;
  }

  function everyonePassAfterWinner() {
    // called while last player needed to pass is passing
    if (gameData.places.length === 0)
      return false;

    const lastUIDToPlay = Object.keys(gameData.lastPlayerToPlay)[0];
    const lastUIDToPlayTurnIndex = gameData.players[lastUIDToPlay];
    if (lastUIDToPlayTurnIndex && gameData.hands[lastUIDToPlayTurnIndex].cards.length)
      return false;

    const lastPlayTurnNum = Number(Object.keys(gameData.playersTurnHistory[lastUIDToPlay]).pop());
    let index = 0;
    for (let hand of gameData.hands) {
      if (hand.cards.length) {
        const remainingPlayerUID = Object.keys(gameData.players).find(key => gameData.players[key] === index);
        const remainingPlayerLastPlayTurnNum = Number(Object.keys(gameData.playersTurnHistory[remainingPlayerUID]).pop());
        const remainingPlayerLastPlay = gameData.playersTurnHistory[remainingPlayerUID][remainingPlayerLastPlayTurnNum];
        const currentPlayerUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex);

        if ((remainingPlayerLastPlayTurnNum < lastPlayTurnNum ||
          (remainingPlayerLastPlayTurnNum > lastPlayTurnNum && remainingPlayerLastPlay !== 'PASS')) &&
          remainingPlayerUID !== currentPlayerUID) {
          return false;
        }
      }
      index++;
    };

    return true;
  }

  function playCards(selectedCards) {
    setErrorMessage('');
    setErrorCards([]);

    const currentPlayerUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex);
    const playedHandType = getHandType(selectedCards);
    const everyonePassed = gameData.currentHandType === HAND_TYPES.START_OF_ROUND;
    const isFirstPlayOfGame = gameData.currentHandType === HAND_TYPES.START_OF_GAME;
    const currentHand = gameData.hands[gameData.players[currentPlayerUID]].cards;

    if (playedHandType === HAND_TYPES.INVALID) {
      setErrorMessage('Invalid hand type');
      return false;
    } else if (isFirstPlayOfGame && !selectedCards.includes(getLowestCard(currentHand))) {
      setErrorMessage('Hand must include ');
      setErrorCards([getLowestCard(currentHand)]);
      return false;
    } else if (!everyonePassed && !isLegalPlay(playedHandType, gameData.currentHandType)) {
      setErrorMessage('Must play ' + gameData.currentHandType);
      return false;
    } else if (!everyonePassed && !isBetterHand(selectedCards, gameData.lastPlayed)) {
      setErrorMessage('Get that weak shit out');
      return false;
    }

    const player = gameData.currentPlayerTurnIndex;
    let hands = gameData.hands;
    hands[player].cards = hands[player].cards.filter(card => !selectedCards.includes(card));

    let overallTurnHistory = gameData.overallTurnHistory;
    let playersTurnHistory = gameData.playersTurnHistory;
    const turnsTaken = Object.keys(overallTurnHistory).length;
    overallTurnHistory[turnsTaken] = selectedCards;
    playersTurnHistory[currentPlayerUID][turnsTaken] = selectedCards;

    const handIsEmpty = hands[player].cards.length === 0;
    let places = gameData.places;
    let gamesWon = gameData.gamesWon;
    let gamesPlayed = gameData.gamesPlayed;

    if (handIsEmpty) {
      places = isLocalGame ? [...places, currentPlayerUID] : firebase.firestore.FieldValue.arrayUnion(user.uid);

      if (!gameData.places.length) {
        gamesWon[currentPlayerUID] += 1;
        gamesPlayed = isLocalGame ? (gameData.gamesPlayed + 1) : firebase.firestore.FieldValue.increment(1);
      }

      if (gameData.places.length === gameData.numberOfPlayers - 2) {
        const lastPlaceUID = Object.keys(gameData.players).find((playerUid) => playerUid !== currentPlayerUID && !gameData.places.includes(playerUid));
        places = isLocalGame ? [...gameData.places, currentPlayerUID, lastPlaceUID] : firebase.firestore.FieldValue.arrayUnion(user.uid, lastPlaceUID);
      }
    }

    const data = {
      playedCards: isLocalGame ? [...gameData.playedCards, ...selectedCards] : firebase.firestore.FieldValue.arrayUnion(...selectedCards),
      lastPlayed: selectedCards,
      lastPlayerToPlay: { [currentPlayerUID]: gameData.displayNames[currentPlayerUID] },
      hands: hands,
      currentPlayerTurnIndex: getNextNonEmptyHandIndexLocal(),
      currentHandType: playedHandType,
      playersTurnHistory: playersTurnHistory,
      overallTurnHistory: overallTurnHistory,
      places: places,
      gamesWon: gamesWon,
      gamesPlayed: gamesPlayed
    };

    let updatedHandsPlayed = handsPlayed;
    updatedHandsPlayed[playedHandType] = (handsPlayed[playedHandType] || 0) + selectedCards.length;
    setHandsPlayed(updatedHandsPlayed);
    console.log(gameData);

    if (isLocalGame) {
      setGameData({ ...gameData, ...data });
    } else {
      db.collection(gameLobby).doc(gameData.gameName).update(data);
    }

    return true;
  }

  function pass() {
    const isFirstPlayOfGame = gameData.currentHandType === HAND_TYPES.START_OF_GAME;
    const currentPlayerUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex);
    const currentHand = gameData.hands[gameData.players[currentPlayerUID]].cards;

    if (isFirstPlayOfGame) {
      setErrorMessage('Must start game with ');
      setErrorCards([getLowestCard(currentHand)]);
      return true;
    }

    const nextPlayerStillInUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === getNextNonEmptyHandIndexLocal());
    const nextPlayerPlayedLast = nextPlayerStillInUID === Object.keys(gameData.lastPlayerToPlay)[0];
    const nextPlayerHadBotPlayForThemLast = gameData.rejoinedPlayers[nextPlayerStillInUID] === Object.keys(gameData.lastPlayerToPlay)[0];
    const everyonePassed = nextPlayerPlayedLast || nextPlayerHadBotPlayForThemLast || everyonePassAfterWinner();

    let overallTurnHistory = gameData.overallTurnHistory;
    const turnsTaken = Object.keys(overallTurnHistory).length;
    overallTurnHistory[turnsTaken] = 'PASS';
    let playersTurnHistory = gameData.playersTurnHistory;
    playersTurnHistory[currentPlayerUID][turnsTaken] = 'PASS';
    const update = {
      currentHandType: everyonePassed ? HAND_TYPES.START_OF_ROUND : gameData.currentHandType,
      currentPlayerTurnIndex: getNextNonEmptyHandIndexLocal(),
      playersTurnHistory: playersTurnHistory,
      overallTurnHistory: overallTurnHistory
    };

    if (isLocalGame) {
      setGameData({ ...gameData, ...update });
    } else {
      db.collection(gameLobby).doc(gameData.gameName).update(update)
        .then(() => {

        })
        .catch(error => {
          setErrorMessage('Error passing. Please try again.');
          console.log('Error passing: ', error);
        });
    }

    setErrorMessage('');
    setErrorCards([]);
    return true;
  }

  function getStyle(index) {
    switch (index) {
      case 2:
        if (gameData.numberOfPlayers === 2) {
          return styles.player3Hand;
        }
        return styles.player2Hand;
      case 3:
        if (gameData.numberOfPlayers === 3) {
          return styles.player4Hand;
        }
        return styles.player3Hand;
      case 4:
      default:
        return styles.player4Hand;
    }
  }

  function playAgain() {
    let playersPlayingAgain = gameData.playersPlayingAgain;
    playersPlayingAgain[user.uid] = user.displayName;
    let updates = {};
    if (isLocalGame) {
      updates = { playersPlayingAgain: playersPlayingAgain };
    } else {
      updates[`playersPlayingAgain.${user.uid}`] = user.displayName;
      let tempNumComps = gameData.numberOfComputers;
      let usedBotUIDs = [];
      while (tempNumComps--) {
        const botUID = Object.keys(gameData.players).find(uid => AI_UID_PREFIXES.includes(uid.slice(0, 7) && !usedBotUIDs.includes(uid)));
        const botDisplayName = gameData.displayNames[botUID];
        usedBotUIDs.push(botUID);
        updates[`playersPlayingAgain.${botUID}`] = botDisplayName;
      }
    }

    if (isLocalGame) {
      setGameEnded(false);
      setGameData({ ...gameData, ...updates });
    } else {
      db.collection(gameLobby).doc(gameData.gameName).update(updates)
        .then(() => {
          setGameEnded(false);
          setGameStarted(false);
        })
        .catch(() => {
          alert('Error trying to play again. Please check your internet connection and try again.')
        });
    }
  }

  function dontPlayAgain() {
    setGameEnded(false);
    setLeavingGame(true);
    if (isLocalGame) {
      navigation.goBack();
    } else {
      if (Object.keys(gameData.players).length === 1) {
        db.collection(gameLobby).doc(gameData.gameName).delete()
          .then(() => {
            console.log('Game successfully deleted');
          })
          .catch((error) => {
            alert('Error exiting game. Please check your connection and try again.');
            console.log('Error trying to delete game: ', error);
          })
        navigation.goBack();
      } else {
        const update = {};
        update[`players.${user.uid}`] = firebase.firestore.FieldValue.delete();
        update[`playersNotPlayingAgain.${user.uid}`] = user.displayName;

        db.collection(gameLobby).doc(gameData.gameName).update(update)
          .then(() => {
            console.log('Successfully exited game');
          })
          .catch((error) => {
            alert('Error exiting game. Please check your connection and try again.');
            console.log('Error trying to exit game: ', error);
          });
        navigation.goBack();
      }
    }
  }

  function loaderExitFunction() {
    if (!gameStarted) {
      setLeavingGame(true);
      let updates = {};
      updates[`players.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates[`playersPlayingAgain.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates[`playersTurnHistory.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates[`gamesWon.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates[`displayNames.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates[`queue.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates['playersLeftToJoin'] = firebase.firestore.FieldValue.increment(1);
      db.collection(gameLobby).doc(gameData.gameName).update(updates)
        .then(() => {
          navigation.goBack();
        });
    }
  }

  function leaveGame() {
    navigation.goBack();
  }

  function getAvatarRotation(index) {
    if (gameData.numberOfPlayers === 2) {
      return '180deg';
    }
    if (gameData.numberOfPlayers === 3 && index === 1) {
      return '90deg';
    }
    return (270 - 90 * index) + 'deg';
  }

  function getDisplayNameRotation(index) {
    if (gameData.numberOfPlayers === 2 || gameData.numberOfPlayers === 4 && index == 1) {
      return '180deg';
    }

    return '0deg';
  }

  function Menu() {
    const [currentAvatar, setCurrentAvatar] = useState(gameStarted ? gameData.hands[gameData.players[user.uid]].avatar : null);
    const [loading, setLoading] = useState(false);

    const styles = StyleSheet.create({
      menu: {
        backgroundColor: '#fafafa',
        position: 'absolute',
        height: '100%',
        width: 225,
        padding: 20,
        zIndex: 4
      },
      mainContent: {
        flex: 1,
        justifyContent: 'space-around',
        marginTop: 50,
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15
      },
      text: {
        fontSize: 20
      },
      iconContainer: {
        marginLeft: 20
      },
      avatarsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
      },
      avatarImage: {
        height: 40,
        width: 40,
        margin: 10
      },
      currentAvatar: {
        borderWidth: 3,
        borderColor: 'rgb(217, 56, 27)',
        borderRadius: 20
      },
      takenAvatar: {
        opacity: .3
      }
    });

    function setPlayerAvatar(avatar) {
      if (isLocalGame) {
        gameData.hands[gameData.players[user.uid]].avatar = avatar;
        setCurrentAvatar(avatar);
      } else {
        setLoading(true);
        let hands = gameData.hands;
        hands[gameData.players[user.uid]].avatar = avatar;
        db.collection(gameLobby).doc(gameData.gameName).update({ hands: hands })
          .then(() => {
            setCurrentAvatar(avatar);
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            alert('Error changing avatar. Please check your internet connection and try again.');
            console.log('Error changing avatar: ', error);
          })
      }
    }

    function isTakenAvatar(avatar) {
      return gameData.hands.some((hand, index) => hand.avatar === avatar && index !== gameData.players[user.uid]);
    }

    return (
      <Animated.View style={[styles.menu, { right: menuPosition }]}>

        {typeof (gameData.players[user.uid]) === 'number' &&
          <View style={{ flex: 1 }}>
            <View style={styles.mainContent}>
              <View>
                <HeaderText style={[styles.text, { alignSelf: 'center' }]} >Favorite Icon</HeaderText>
                <DividerLine width={140} />
                <View style={styles.avatarsContainer}>
                  <Loader loading={loading} style={{ width: loading ? '100%' : 0, height: loading ? '100%' : 0 }} />
                  {Object.keys(AVATARS).map((avatar) => {
                    return <TouchableOpacity key={avatar} disabled={isTakenAvatar(avatar)} onPress={() => { setPlayerAvatar(avatar) }}>
                      <Image source={getAvatarImage(avatar)}
                        style={[styles.avatarImage, currentAvatar === AVATARS[avatar] ? styles.currentAvatar : null, isTakenAvatar(avatar) ? styles.takenAvatar : null]} />
                    </TouchableOpacity>
                  })}
                </View>
              </View>

              <View>
                <TouchableOpacity style={styles.row} onPress={() => setVibrateOnTurn(!vibrateOnTurn)}>
                  <HeaderText style={[styles.text]} >Vibrate</HeaderText>
                  <HeaderText style={styles.iconContainer}>
                    <FontAwesome5 name={vibrateOnTurn ? 'check' : 'times'} style={[styles.text, { color: vibrateOnTurn ? 'rgb(80, 189, 68)' : 'rgb(217, 56, 27)' }]} />
                  </HeaderText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.row} onPress={() => setShowDisplayNames(!showDisplayNames)}>
                  <HeaderText style={[styles.text]} >Display Names</HeaderText>
                  <HeaderText style={styles.iconContainer}>
                    <FontAwesome5 name={showDisplayNames ? 'check' : 'times'} style={[styles.text, { color: showDisplayNames ? 'rgb(80, 189, 68)' : 'rgb(217, 56, 27)' }]} />
                  </HeaderText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HowToPlay')}>
                  <HeaderText style={[styles.text]} >How To Play</HeaderText>
                  <HeaderText style={styles.iconContainer}>
                    <FontAwesome5 name={'question'} style={styles.text} />
                  </HeaderText>
                </TouchableOpacity>
              </View>
            </View>

            <DividerLine width={140} />

            <TouchableOpacity style={styles.row} onPress={() => leaveGame()}>
              <HeaderText style={[styles.text]} >Exit Game</HeaderText>
              <HeaderText style={styles.iconContainer}>
                <MaterialCommunityIcons name={'logout'} style={styles.text} />
              </HeaderText>
            </TouchableOpacity>
          </View>}

      </Animated.View>
    )
  }

  function ScreenShader() {
    return (
      <Animated.View style={{ height: '100%', width: '100%', position: 'absolute', backgroundColor: 'black', opacity: screenShaderOpacity, zIndex: screenShaderZindex }} >
        <TouchableHighlight style={{ height: '100%', width: '100%' }} onPress={() => setShowMenu(false)} >
          <View />
        </TouchableHighlight>
      </Animated.View>
    )
  }

  function RejoinScreen() {
    const [loading, setLoading] = useState(false);

    function rejoinGame() {
      setLoading(true);

      const botUID = gameData.rejoinablePlayers[user.uid];

      const updates = {};
      // delete bot data
      updates[`displayNames.${botUID}`] = firebase.firestore.FieldValue.delete();
      updates[`gamesWon.${botUID}`] = firebase.firestore.FieldValue.delete();
      updates[`players.${botUID}`] = firebase.firestore.FieldValue.delete();
      updates[`playersTurnHistory.${botUID}`] = firebase.firestore.FieldValue.delete();
      updates[`queue.${botUID}`] = firebase.firestore.FieldValue.delete();

      // add player data
      updates[`displayNames.${user.uid}`] = user.displayName;
      updates[`gamesWon.${user.uid}`] = gameData.gamesWon[botUID];
      updates[`players.${user.uid}`] = gameData.players[botUID];
      updates[`queue.${user.uid}`] = gameData.queue[botUID];
      updates['numberOfComputers'] = gameData.numberOfComputers - 1;
      updates[`playersTurnHistory.${user.uid}`] = gameData.playersTurnHistory[botUID];
      updates[`rejoinablePlayers.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates[`rejoinedPlayers.${user.uid}`] = gameData.rejoinablePlayers[user.uid];
      if (Object.keys(gameData.lastPlayerToPlay)[0] === botUID) {
        updates[`lastPlayerToPlay`] = { [user.uid]: user.displayName };
      }
      let tempPlaces = gameData.places;
      if (gameData.places.includes(botUID)) {
        tempPlaces[gameData.places.findIndex(uid => uid === botUID)] = user.uid;
        updates['places'] = tempPlaces;
      }

      firebase.firestore().collection(gameLobby).doc(gameData.gameName).update(updates)
        .then(() => {
          setShowRejoinScreen(false);
          setLoading(false);
          console.log('Rejoined game!');
        })
        .catch(error => {
          setLoading(false);
          alert('Error rejoining game. Please check your internet connection and try again.');
          console.log('Error rejoining game: ', error);
        });
    }

    return (
      <View style={{ height: '100%', width: '100%', position: 'absolute', zIndex: 9990, justifyContent: 'center', alignItems: 'center' }} >
        <Loader loading={loading} message={'Rejoining Game'} style={{ width: loading ? '100%' : 0, height: loading ? '100%' : 0 }} />
        <View style={{ height: '100%', width: '100%', position: 'absolute', backgroundColor: 'black', opacity: .5 }} />
        <TouchableOpacity
          style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', padding: 30, borderRadius: 5 }}
          activeOpacity={.75}
          onPress={() => rejoinGame()}>
          <HeaderText style={{ fontSize: 30 }}>Rejoin Game</HeaderText>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ImageBackground source={require('../assets/images/felt.jpg')} style={styles.headerImage}>

      {!showRejoinScreen && <View style={{ flex: 1 }}>
        <Loader loading={!gameStarted}
          message={leavingGame ? 'Exiting Game' : `Waiting for ${(Object.keys(gameData.playersPlayingAgain).length ? (gameData.numberOfPlayers - Object.keys(gameData.playersPlayingAgain).length) : false) || gameData.playersLeftToJoin} more player${(Object.keys(gameData.playersPlayingAgain).length ? ((gameData.numberOfPlayers - Object.keys(gameData.playersPlayingAgain).length) === 1) : (gameData.playersLeftToJoin === 1)) ? '' : 's'}`}
          exitAction={leavingGame ? (() => { }) : loaderExitFunction}
        />
        <PopUpMessage showPopUp={showPopUp} exitAction={leavingGame ? (() => { }) : dontPlayAgain} exitMessage='No' confirmAction={playAgain} confirmMessage='Yes' >
          {gameData.places.map((player, index) => {
            const displayName = gameData.displayNames[player];
            const currentUser = player === user.uid;
            const gamesWon = gameData.gamesPlayed > 1 ? gameData.gamesWon[player] : null;
            return (
              <TrophyPlaceDisplay
                key={index}
                place={index}
                displayName={displayName}
                currentUser={currentUser}
                gamesWon={gamesWon}
                playersPlayingAgain={gameData.playersPlayingAgain}
                playersNotPlayingAgain={gameData.playersNotPlayingAgain} />
            )
          })}

          <DividerLine style={{ marginVertical: 25 }} />
          <Text style={{ textAlign: 'center', fontSize: 30, fontFamily: store.getState().globalFont, }}>Play again?</Text>
        </PopUpMessage>

        <PlayedCardsContainer
          cards={gameData.playedCards}
          currentHandType={gameData.currentHandType}
          lastPlayedCards={gameData.lastPlayed}
          lastPlayerToPlay={gameData.lastPlayerToPlay[Object.keys(gameData.lastPlayerToPlay)[0]]}
          avatarImage={getAvatarImage(gameData.hands[gameData.currentPlayerTurnIndex].avatar)}
          turnLength={gameData.turnLength}
          gameInProgress={gameStarted && !gameEnded}
          pass={pass}
          isCurrentPlayer={gameData.players[user.uid] === gameData.currentPlayerTurnIndex}
          style={styles.playedCards} />
        {gameStarted && <View style={styles.container}>
          <UserCardContainer cards={gameData.hands[gameData.players[user.uid]].cards}
            place={gameData.places.indexOf(user.uid)}
            currentHandType={gameData.currentHandType}
            errorMessage={errorMessage}
            errorCards={errorCards}
            isCurrentPlayer={gameData.players[user.uid] === gameData.currentPlayerTurnIndex}
            avatarImage={getAvatarImage(gameData.hands[gameData.players[user.uid]].avatar)}
            playCards={playCards}
            pass={pass}
            style={styles.player1Hand} />
          {Array.from({ length: gameData.numberOfPlayers - 1 }).map((value, index) => {
            const playerIndex = (gameData.players[user.uid] + index + 1) % gameData.numberOfPlayers;
            const displayName = showDisplayNames ?
              gameData.displayNames[Object.keys(gameData.players).find(key => gameData.players[key] === playerIndex)]
              : '';

            return <FaceDownCardsContainer key={playerIndex} numberOfCards={gameData.hands[playerIndex].cards.length}
              style={[styles.opposingPlayerHand, getStyle(index + 2)]}
              displayName={displayName}
              displayNameStyling={{ transform: [{ rotateZ: getDisplayNameRotation(index) }] }}
              avatarImage={getAvatarImage(gameData.hands[playerIndex].avatar)}
              avatarStyling={{ transform: [{ rotateZ: getAvatarRotation(index) }] }}
              isCurrentPlayer={playerIndex === gameData.currentPlayerTurnIndex} />

            /* <FaceUpCardContainer key={playerIndex}
            cards={gameData.hands[playerIndex].cards}
            style={[styles.opposingPlayerHand, getStyle(index + 2), { width: '60%' }]}
            displayName={displayName}
            displayNameStyling={{ transform: [{ rotateZ: getDisplayNameRotation(index) }] }}
            avatarImage={getAvatarImage(gameData.hands[playerIndex].avatar)}
            avatarStyling={{ transform: [{ rotateZ: getAvatarRotation(index) }] }}
            isCurrentPlayer={playerIndex === gameData.currentPlayerTurnIndex} /> */
          })}
        </View>}

        <Menu />
        <ScreenShader />
        <SafeAreaView style={styles.menuContainer}>
          <TouchableOpacity onPress={() => { setShowMenu(!showMenu) }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', width: 50, height: 50 }}>
              <Animated.View style={[styles.hamburgerButton, { opacity: hamButtonOpacity, width: hamButtonWidth, transform: [{ translateY: hamButtonY1 }] }]} />
              <Animated.View style={[styles.hamburgerButton, { transform: [{ rotateZ: hamButtonRotationDeg1 }] }]} />
              <Animated.View style={[styles.hamburgerButton, { transform: [{ rotateZ: hamButtonRotationDeg2 }], position: 'absolute' }]} />
              <Animated.View style={[styles.hamburgerButton, { opacity: hamButtonOpacity, width: hamButtonWidth, transform: [{ translateY: hamButtonY2 }] }]} />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </View>}
      {showRejoinScreen && <RejoinScreen />}
    </ImageBackground>
  )
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
    bottom: 40,
    width: '80%'
  },
  opposingPlayerHand: {
    position: 'absolute',
    width: '40%',
  },
  player2Hand: {
    left: -30,
    top: '50%',
    transform: [
      { rotateZ: '90deg' },
      { translateX: '-50%' }
    ],
  },
  player3Hand: {
    top: 55,
    right: '50%',
    flexDirection: 'row',
    transform: [
      { rotateZ: '180deg' },
      { translateX: '-100%' }
    ],
  },
  player4Hand: {
    right: -30,
    top: '50%',
    transform: [
      { rotateZ: '-90deg' },
    ],
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 5,
    zIndex: 5
  },
  hamburgerButton: {
    backgroundColor: 'black',
    height: 4.5,
    width: 26,
    borderRadius: 4,
    marginVertical: 2.8
  }
});

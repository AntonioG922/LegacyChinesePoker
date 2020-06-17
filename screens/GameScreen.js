import React, { useEffect, useState, useRef } from 'react';
import { ImageBackground, StyleSheet, View, Text, SafeAreaView, Animated, TouchableOpacity, Vibration, TouchableHighlight } from 'react-native';
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
  AI_DIFFICULTIES
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

  const user = store.getState().userData.user;
  const db = firebase.firestore();
  const isLocalGame = gameData.localGame;
  const computerDifficulties = Object.keys(AI_DIFFICULTIES).map(key => AI_DIFFICULTIES[key]);
  const computerPrefixUID = computerDifficulties.map(difficulty => 'Bot' + difficulty.slice(0, 4));

  const menuPosition = useRef(new Animated.Value(0)).current;
  const screenShaderOpacity = useRef(new Animated.Value(0)).current;
  const screenShaderZindex = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (!isLocalGame) {
      return db.collection('CustomGames').doc(gameData.gameName)
        .onSnapshot((doc) => {
          const docData = doc.data();
          const leavingGame = docData === undefined || Boolean(docData.playersNotPlayingAgain[user.uid]);

          if (!leavingGame) {
            if (docData.currentPlayerTurnIndex === docData.players[user.uid]) console.log(getLowestPlayableCards(docData.hands[docData.players[user.uid]].cards, docData.cardsPerPlayer, docData.currentHandType, docData.lastPlayed, true));
            setGameData(docData);
            const isCurrentPlayer = docData.players[user.uid] === docData.currentPlayerTurnIndex;
            if (isCurrentPlayer) {
              Vibration.vibrate();
            }
          }
        });
    } else {
      console.log('We local bitch: ', gameData)
    }
  }, []);

  useEffect(() => {
    if ((!gameStarted) && gameData.playersLeftToJoin === 0 && Object.keys(gameData.playersPlayingAgain).length === 0) {
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
        if (computerPrefixUID.includes(uid.slice(0, 6))) {
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
      let playersLeftToJoin = gameData.numberOfPlayers;
      Object.keys(gameData.playersPlayingAgain).forEach((uid, index) => {
        players[uid] = index;
        playersTurnHistory[uid] = {};
        displayNames[uid] = gameData.playersPlayingAgain[uid];
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
        playersPlayingAgain: {}
      };

      if (isLocalGame) {
        setGameData({ ...gameData, ...updates });
      } else {
        firebase.firestore().collection('CustomGames').doc(gameData.gameName).update(updates)
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
      })
    ]).start();
  }, [showMenu]);

  useEffect(() => {
    const lastPlayerLeft = gameData.places.length === gameData.numberOfPlayers;
    if (isLocalGame && !lastPlayerLeft) {
      const currentPlayerUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex);
      const computerPlaysNext = computerPrefixUID.includes(currentPlayerUID.slice(0, 7));

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
      db.collection('CustomGames').doc(gameData.gameName).update({
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
    if (gameData.hands[lastUIDToPlayTurnIndex].cards.length)
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
        gamesWon[currentPlayerUID] = isLocalGame ? (gameData.gamesWon[currentPlayerUID] + 1) : firebase.firestore.FieldValue.increment(1);
        gamesPlayed = isLocalGame ? (gameData.gamesPlayed + 1) : firebase.firestore.FieldValue.increment(1);
      }

      if (gameData.places.length === gameData.numberOfPlayers - 2) {
        const lastPlaceUID = Object.keys(gameData.players).find((playerUid) => playerUid !== currentPlayerUID && !gameData.places.includes(playerUid));
        places = isLocalGame ? [...gameData.places, currentPlayerUID, lastPlaceUID] : firebase.firestore.FieldValue.arrayUnion(user.uid, lastPlaceUID);
      }
    }
    console.log(gamesWon);

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
    updatedHandsPlayed[playedHandType] = (handsPlayed[playedHandType] || 0) + 1;
    setHandsPlayed(updatedHandsPlayed);

    if (isLocalGame) {
      setGameData({ ...gameData, ...data });
    } else {
      db.collection('CustomGames').doc(gameData.gameName).update(data);
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
    const everyonePassed = nextPlayerStillInUID === Object.keys(gameData.lastPlayerToPlay)[0] || everyonePassAfterWinner();

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
      db.collection('CustomGames').doc(gameData.gameName).update(update);
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
    isLocalGame ? updates = { playersPlayingAgain: playersPlayingAgain } : updates[`playersPlayingAgain.${user.uid}`] = user.displayName;

    if (isLocalGame) {
      setGameEnded(false);
      setGameData({ ...gameData, ...updates });
    } else {
      db.collection('CustomGames').doc(gameData.gameName).update(updates)
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
    if (isLocalGame) {
      navigation.goBack();
    } else {
      if (Object.keys(gameData.players).length === 1/*Change to 1 to delete*/) {
        db.collection('CustomGames').doc(gameData.gameName).delete()
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

        db.collection('CustomGames').doc(gameData.gameName).update(update)
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
      let updates = {};
      updates[`players.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates[`playersPlayingAgain.${user.uid}`] = firebase.firestore.FieldValue.delete();
      updates['playersLeftToJoin'] = firebase.firestore.FieldValue.increment(1);
      db.collection('CustomGames').doc(gameData.gameName).update(updates)
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
        justifyContent: 'center',
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
      }
    });

    return (
      <Animated.View style={[styles.menu, { right: menuPosition }]}>

        <View style={styles.mainContent}>
          <TouchableOpacity style={styles.row} onPress={() => setShowDisplayNames(!showDisplayNames)}>
            <HeaderText style={[styles.text]} >Display Names</HeaderText>
            <HeaderText style={styles.iconContainer}>
              <FontAwesome5 name={showDisplayNames ? 'check-square' : 'square'} style={styles.text} />
            </HeaderText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HowToPlay')}>
            <HeaderText style={[styles.text]} >How To Play</HeaderText>
            <HeaderText style={styles.iconContainer}>
              <FontAwesome5 name={'question'} style={styles.text} />
            </HeaderText>
          </TouchableOpacity>
        </View>

        <DividerLine width={140} />

        <TouchableOpacity style={styles.row} onPress={() => leaveGame()}>
          <HeaderText style={[styles.text]} >Exit Game</HeaderText>
          <HeaderText style={styles.iconContainer}>
            <MaterialCommunityIcons name={'logout'} style={styles.text} />
          </HeaderText>
        </TouchableOpacity>

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

  return (
    <ImageBackground source={require('../assets/images/felt.jpg')} style={styles.headerImage}>

      <Loader loading={!gameStarted}
        message={`Waiting for ${(Object.keys(gameData.playersPlayingAgain).length ? gameData.numberOfPlayers - Object.keys(gameData.playersPlayingAgain).length : false) || gameData.playersLeftToJoin} more player${gameData.playersLeftToJoin === 1 ? '' : 's'}`}
        exitAction={loaderExitFunction}
      />
      <PopUpMessage showPopUp={showPopUp} exitAction={dontPlayAgain} exitMessage='No' confirmAction={playAgain} confirmMessage='Yes' >
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
        <Text style={{ textAlign: 'center', fontSize: 30, fontFamily: 'gang-of-three', }}>Play again?</Text>
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
        <FontAwesome5 name={'bars'} style={{ fontSize: 30 }} onPress={() => setShowMenu(!showMenu)} />
      </SafeAreaView>
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
    top: 30,
    right: 20,
    zIndex: 5
  },

});

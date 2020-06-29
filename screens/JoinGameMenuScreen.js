import React, { useEffect, useRef, useReducer, useState } from "react";
import { Animated, StyleSheet, Text, View, LayoutAnimation, KeyboardAvoidingView, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from 'firebase';
import store from '../redux/store';

import {
  HeaderText,
  PasswordTextInput,
  TextButton,
  DividerLine
} from "../components/StyledText";
import TitledPage from '../components/TitledPage';
import { ScrollView } from "react-native-gesture-handler";
import Loader from '../components/Loader';

export default function JoinGameMenuScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [gamesFetched, setGamesFetched] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeGames, dispatch] = useReducer((activeGames, { type, value }) => {
    switch (type) {
      case "add":
        return [...activeGames, value];
      case "modified":
        const index = activeGames.findIndex(x => x.gameName === value.gameName);
        activeGames.splice(index, 1, value);
        return [...activeGames];
      case "remove":
        return activeGames.filter((doc) => doc.gameName !== value.gameName);
      default:
        return activeGames;
    }
  }, []);
  const [rejoinableGames, dispatchRejoin] = useReducer((rejoinableGames, { type, value }) => {
    switch (type) {
      case "add":
        return [...rejoinableGames, value];
      case "modified":
        const index = rejoinableGames.findIndex(x => x.gameName === value.gameName);
        rejoinableGames.splice(index, 1, value);
        return [...rejoinableGames];
      case "remove":
        return rejoinableGames.filter((doc) => doc.gameName !== value.gameName);
      default:
        return rejoinableGames;
    }
  }, []);

  const db = firebase.firestore();
  const user = store.getState().userData.user;

  function joinGame(game) {
    // add player to queue; check that they entered queue before game full; add to game
    setLoading(true);
    const gameName = game.gameName;
    const docRef = db.collection('CustomGames').doc(gameName);
    let queueUpdate = {};
    queueUpdate[`queue.${user.uid}`] = firebase.firestore.FieldValue.serverTimestamp();

    docRef.update(queueUpdate)
      .then(() => {
        docRef.get()
          .then(doc => {
            const data = doc.data();
            const queueSpot = Object.entries(data.queue).sort((a, b) => { return a[1].toMillis() - b[1].toMillis() }).findIndex(array => array[0] === user.uid);

            if (queueSpot < data.numberOfPlayers) {
              let updates = {};
              updates[`players.${user.uid}`] = queueSpot;
              updates['playersLeftToJoin'] = firebase.firestore.FieldValue.increment(-1);
              updates[`playersTurnHistory.${user.uid}`] = {};
              updates[`displayNames.${user.uid}`] = user.displayName;
              updates[`gamesWon.${user.uid}`] = 0;

              db.collection('CustomGames').doc(gameName).update(updates)
                .then(() => {
                  const index = activeGames.findIndex(x => x.gameName === gameName);
                  setLoading(false);
                  navigation.navigate('Game', activeGames[index]);
                })
                .catch(error => {
                  setLoading(false);
                  alert('Error joining game. Please check your connection and try again.');
                  console.log('Error joining game: ', error);
                });
            } else {
              setLoading(false);
              alert(`Game is full.${'\n'}Ya gotta be quicker then that!`);
            }
          })
          .catch(error => {
            setLoading(false);
            alert('Error joining game. Please check your connection and try again.');
            console.log('Error getting doc after adding to queue: ', error);
          })
      })
      .catch(error => {
        setLoading(false);
        alert('Error joining game. Please check your connection and try again.');
        console.log('Error adding to queue: ', error);
      })

    return true;
  }

  function RejoinableGame({ game }) {
    function rejoinGame(gameData) {
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

      db.collection('CustomGames').doc(gameData.gameName).update(updates)
        .then(() => {
          db.collection('CustomGames').doc(gameData.gameName).get()
            .then(doc => {
              setLoading(false);
              navigation.navigate('Game', doc.data());
              console.log('Rejoined game!');
            })
            .catch(error => {
              setLoading(false);
              alert('Error rejoining game. Please check your internet connection and try again.');
              console.log('Error getting document after rejoining game: ', error);
            });
        })
        .catch(error => {
          setLoading(false);
          alert('Error rejoining game. Please check your internet connection and try again.');
          console.log('Error rejoining game: ', error);
        });
    }

    return (
      <View style={styles.game} >
        <TextButton labelStyle={styles.menuOption} onPress={() => rejoinGame(game)}>{game.gameName}</TextButton>
      </View>
    )
  }

  useEffect(() => {
    // get joinable games
    return db.collection('CustomGames')
      .where('playersLeftToJoin', '>', 0)
      .onSnapshot((snapshot) => {
        setGamesFetched(true);
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            dispatch({ type: "add", value: change.doc.data() });
          }
          if (change.type === "modified") {
            dispatch({ type: "modified", value: change.doc.data() });
          }
          if (change.type === "removed") {
            dispatch({ type: "remove", value: change.doc.data() });
          }
        });
      });
  }, []);

  useEffect(() => {
    // get rejoinable games
    return db.collection('CustomGames')
      .orderBy(`rejoinablePlayers.${user.uid}`)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          console.log(change.doc.data().gameName);
          if (change.type === "added") {
            dispatchRejoin({ type: "add", value: change.doc.data() });
          }
          if (change.type === "modified") {
            dispatchRejoin({ type: "modified", value: change.doc.data() });
          }
          if (change.type === "removed") {
            dispatchRejoin({ type: "remove", value: change.doc.data() });
          }
        });
      });
  }, []);

  useEffect(() => {
    // delete games older than 30 minutes
    const minutesTillDeletion = 30;
    const deleteTime = Date.now() - (minutesTillDeletion * 60 * 1000);
    return db.collection('CustomGames')
      .where('gameStartTime', '<', deleteTime)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          const gameName = change.doc.data().gameName;
          db.collection('CustomGames').doc(gameName).delete()
            .then(() => {
              console.log('Deleted game: ', gameName)
            })
            .catch(error => {
              console.log('Error deleting game: ', gameName, 'Error: ', error);
            })
        })
      })
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fafafa', flexDirection: 'column', justifyContent: 'center', }} behavior={Platform.OS == "ios" ? "padding" : "height"}>
      <ScrollView
        scrollEnabled={!loading}
        onScroll={event => { setScrollY(event.nativeEvent.contentOffset.y) }}
        scrollEventThrottle={16}
      >
        <Loader loading={loading} message={'Entering Game'} style={{ top: scrollY }} />
        <TitledPage pageTitle={"Join Game"} navigation={navigation} contentStyleContainer={styles.container}>
          <View style={styles.iconInfo}>
            <HeaderText style={styles.useJoker}><MaterialCommunityIcons size={15} name={'cards-playing-outline'} /> {'\uFF1D'} Joker </HeaderText>
            <HeaderText style={styles.password}><MaterialCommunityIcons size={15} name={'lock'} /> {'\uFF1D'} Password </HeaderText>
          </View>
          {(gamesFetched && Boolean(rejoinableGames.length)) &&
            <View>
              <HeaderText style={{ fontSize: 35, alignSelf: 'center' }}>Rejoin Game:</HeaderText>
              {rejoinableGames.map(game => <RejoinableGame key={game.gameName} game={game} />)}
              <DividerLine />
            </View>
          }
          {gamesFetched ? activeGames.length ? activeGames.filter(game => game.playersLeftToJoin !== 0).map((game) =>
            <JoinableGame key={game.gameName} game={game} joinGame={joinGame} />)
            : <HeaderText style={styles.noGames}>No active games. Try making one in the 'Host Game' menu!</HeaderText>
            : <HeaderText style={styles.noGames}>Fetching Games...</HeaderText>}
        </TitledPage>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function JoinableGame({ game, joinGame }) {
  const [password, setPassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  function maybeJoinGame(game) {
    if (game.password) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowPasswordInput(!showPasswordInput);
      setShowPasswordError(false);
      return false;
    }

    joinGame(game);
  }

  function checkPassword() {
    if (game.password === password) {
      joinGame(game);
      return true;
    }

    setShowPasswordError(true);
  }


  const passwordAnim = useRef(new Animated.Value(0)).current;
  const otherIconAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        passwordAnim,
        {
          toValue: showPasswordInput ? 1 : 0,
          duration: 500,
        }
      ),
      Animated.timing(
        otherIconAnim,
        {
          toValue: showPasswordInput ? 0 : 1,
          duration: 250,
          delay: showPasswordInput ? 0 : 500
        }
      ),
    ]).start();
  }, [showPasswordInput]);

  const passwordInputContainerStyle = {
    justifyContent: showPasswordInput ? 'center' : 'flex-end'
  };

  const passwordInputStyle = {
    opacity: passwordAnim,
    width: passwordAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 250]
    }),
  };

  const gameIconsStyle = {
    opacity: otherIconAnim,
  };

  return (
    <View style={styles.game}>
      <TextButton labelStyle={styles.menuOption} onPress={() => maybeJoinGame(game)}>
        {game.gameName}
      </TextButton>
      <View style={styles.menuOptionIcons}>
        <Animated.View style={[gameIconsStyle]}>
          <HeaderText style={styles.numPlayers}>{Object.keys(game.players).length} <Text style={{ fontSize: 15 }}>of</Text> {game.numberOfPlayers}</HeaderText>
        </Animated.View>
        <Animated.View style={[gameIconsStyle]}>
          <HeaderText style={[!game.useJoker && styles.hidden, styles.useJoker]}>
            <MaterialCommunityIcons size={25} name={'cards-playing-outline'} />
          </HeaderText>
        </Animated.View>
        <HeaderText style={styles.hidden}>
          <MaterialCommunityIcons size={25} name={'lock'} />
        </HeaderText>
        {Boolean(game.password) && <Animated.View style={[styles.passwordInputContainer, passwordInputContainerStyle]}>
          <Animated.View>
            <HeaderText style={styles.password}>
              <MaterialCommunityIcons size={25} name={'lock'} />
            </HeaderText>
          </Animated.View>
          <Animated.View style={passwordInputStyle}>
            <PasswordTextInput disabled={!showPasswordInput} onChangeText={text => { setShowPasswordError(false); setPassword(text); }} submit={checkPassword} />
          </Animated.View>
        </Animated.View>}
      </View>
      {showPasswordError && <HeaderText style={styles.passwordErrorText}>
        Incorrect password
        </HeaderText>}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    minHeight: '100vh',
    alignItems: "center",
    justifyContent: "center",
  },
  game: {
    marginBottom: 25,
  },
  iconInfo: {
    position: "relative",
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  menuOption: {
    marginBottom: 15,
    marginTop: 15
  },
  menuOptionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hidden: {
    opacity: 0,
  },
  numPlayers: {
    color: '#A27035',
    fontSize: 25
  },
  password: {
    color: '#273043'
  },
  modal: {
    alignItems: 'center',
  },
  passwordInputContainer: {
    position: 'absolute',
    left: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  passwordErrorText: {
    textAlign: 'center',
    marginTop: 30
  },
  useJoker: {
    color: 'purple'
  },
  noGames: {
    fontSize: 30,
    textAlign: 'center',
    marginTop: '30%'
  },
  disabled: {
    color: "rgb(96,100,109)",
  },
});

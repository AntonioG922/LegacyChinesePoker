import React, { useEffect, useRef, useReducer, useState } from "react";
import { Animated, StyleSheet, Text, View, LayoutAnimation } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from 'firebase';
import store from '../redux/store';

import {
  HeaderText,
  PasswordTextInput,
  TextButton
} from "../components/StyledText";
import TitledPage from '../components/TitledPage';
import { ScrollView } from "react-native-gesture-handler";
import Loader from '../components/Loader';

export default function JoinGameMenuScreen({ navigation }) {
  const db = firebase.firestore();
  const user = store.getState().userData.user;

  const [loading, setLoading] = useState(false);
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

  function joinGame(game) {
    setLoading(true);
    const gameName = game.gameName;
    const playerNumber = game.numberOfPlayers - game.playersLeftToJoin;

    let updates = {};
    updates[`players.${user.uid}`] = playerNumber;
    updates['playersLeftToJoin'] = firebase.firestore.FieldValue.increment(-1);
    updates[`playersTurnHistory.${user.uid}`] = {};
    updates[`displayNames.${user.uid}`] = user.displayName;
    db.collection('CustomGames').doc(gameName).update(updates)
      .then(() => {
        const index = activeGames.findIndex(x => x.gameName === gameName);
        if (activeGames[index].playersLeftToJoin === 0) {
          setLoading(false);
          navigation.navigate('Game', activeGames[index]);
        } else {
          setLoading(false);
          navigation.navigate('Game', activeGames[index]);
        }
      })
      .catch(() => {
        setLoading(false);
        alert('Error joining game. Please check your connection and try again.');
      })
  }

  useEffect(() => {
    return db.collection('CustomGames')
      .where('playersLeftToJoin', '>', 0)
      .onSnapshot((snapshot) => {
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Loader loading={loading} message={'Entering Game'} />
      <TitledPage pageTitle={"Join Game"} navigation={navigation} contentStyleContainer={styles.container}>
        <View style={styles.iconInfo}>
          <HeaderText style={styles.useJoker}><MaterialCommunityIcons size={15} name={'cards-playing-outline'} /> {'\uFF1D'} Joker </HeaderText>
          <HeaderText style={styles.password}><MaterialCommunityIcons size={15} name={'lock'} /> {'\uFF1D'} Password </HeaderText>
        </View>
        {activeGames.length && activeGames.filter(game => game.playersLeftToJoin !== 0).map((game) =>
          <JoinableGame key={game.gameName} game={game} joinGame={joinGame} />) || <HeaderText style={styles.noGames}>No active games. Try making one in the 'Host Game' menu!</HeaderText>}
      </TitledPage>
    </ScrollView>
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
            <PasswordTextInput onChangeText={text => { setShowPasswordError(false); setPassword(text); }} submit={checkPassword} />
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

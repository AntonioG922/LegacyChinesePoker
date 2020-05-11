import React, { useEffect, useReducer, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from 'firebase';
import store from '../redux/store';

import { HeaderText, TextButton } from "../components/StyledText";
import { TitledPage } from "../components/Template";
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
        alert('Error joining game. Please try again.');
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
          (<View key={game.gameName}>
            <TextButton labelStyle={styles.menuOption} onPress={() => joinGame(game)}>
              {game.gameName}
            </TextButton>
            <View style={styles.menuOptionIcons}>
              <HeaderText style={styles.numPlayers}>{Object.keys(game.players).length} <Text style={{ fontSize: 15 }}>of</Text> {game.numberOfPlayers}</HeaderText>
              {game.useJoker && <HeaderText style={styles.useJoker}>
                <MaterialCommunityIcons size={25} name={'cards-playing-outline'} />
              </HeaderText> || <Text>      </Text>}
              {Boolean(game.password) && <HeaderText style={styles.password}>
                <MaterialCommunityIcons size={25} name={'lock'} />
              </HeaderText> || <Text>      </Text>}
            </View>
          </View>
          )) || <HeaderText style={styles.noGames}>No active games. Try making one in the 'Host Game' menu!</HeaderText>}
      </TitledPage>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  container: {
    flex: 1,
    minHeight: '100vh',
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 25
  },
  numPlayers: {
    color: '#A27035',
    fontSize: 25
  },
  password: {
    color: '#273043'
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

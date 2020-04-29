import React, { useState, useReducer, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import firebase from 'firebase'

import { TextButton, HeaderText } from "../components/StyledText";
import { TitledPage } from "../components/Template";
import { ScrollView } from "react-native-gesture-handler";
import Loader from '../components/Loader'

export default function JoinGameMenuScreen({ navigation }) {
  const db = firebase.firestore();

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

  function joinGame(gameName) {
    setLoading(true);
    const doc = db.collection('CustomGamesLobby').doc(gameName);

    doc.update({
      players: firebase.firestore.FieldValue.increment(1)
    })
      .then(() => {
        doc.get()
          .then(doc => {
            if (doc.data().players === doc.data().numberOfPlayers) {
              const newDoc = db.collection('CustomGames').doc(gameName);
              moveFBDocument(db.collection('CustomGamesLobby').doc(gameName), newDoc).then(() => {
                db.collection('CustomGames').doc(gameName).get().then((doc) => {
                  setLoading(false);
                  navigation.navigate('Game', doc.data());
                });
              }).catch((error) => {
                setLoading(false);
                alert(error);
              });
            }
            db.collection('CustomGamesLobby').doc(gameName).get().then((doc) => {
              setLoading(false);
              navigation.navigate('Game', doc.data());
            });
          })
          .catch(() => {
            setLoading(false);
            alert('Error getting game data. Please try again.');
          });
      })
      .catch(() => {
        setLoading(false);
        alert('Error joining game. Please try again.');
      })
  }

  useEffect(() => {
    db.collection('CustomGamesLobby')
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
    <ScrollView contentContainerStyle={{ flex: 1 }}>
      <Loader loading={loading} message={'Entering Game'} />
      <TitledPage pageTitle={"Join Game"} contentStyleContainer={styles.container}>
        <View style={styles.iconInfo}>
          <HeaderText><MaterialCommunityIcons size={15} name={'cards-playing-outline'} /> {'\uFF1D'} Joker </HeaderText>
          <HeaderText><MaterialCommunityIcons size={15} name={'lock'} /> {'\uFF1D'} Password </HeaderText>
        </View>
        {activeGames.length && activeGames.map((game) =>
          (<View key={game.gameName}>
            <TextButton labelStyle={styles.menuOption} onPress={() => joinGame(game.gameName)}>
              {game.gameName}
            </TextButton>
            <View style={styles.menuOptionIcons}>
              <HeaderText style={styles.menuOptionIcon}>{game.players} : {game.numberOfPlayers}</HeaderText>
              {game.useJoker && <HeaderText style={styles.menuOptionIcon}>
                <MaterialCommunityIcons size={25} name={'cards-playing-outline'} />
              </HeaderText> || <Text>      </Text>}
              {Boolean(game.password) && <HeaderText style={styles.menuOptionIcon}>
                <MaterialCommunityIcons size={25} name={'lock'} />
              </HeaderText> || <Text>      </Text>}
            </View>
          </View>
          )) || <HeaderText style={styles.noGames}>No active games. Try making one in the 'Host Game' menu!</HeaderText>}
      </TitledPage>
    </ScrollView>
  );
}


function moveFBDocument(fromPath, toPath) {
  return new Promise((resolve, reject) => {
    fromPath.get().then((doc) => {
      toPath.set(doc.data()).then(() => {
        fromPath.delete().then(() => {
          resolve();
        })
          .catch(() => {
            reject('Error deleting document')
          });
      })
        .catch(() => {
          reject('Error setting document')
        });
    })
      .catch(() => {
        reject('Error getting document')
      });
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInfo: {
    justifyContent: "center",
    position: "relative",
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  menuOption: {
    marginBottom: 15,
    marginTop: 15,
  },
  menuOptionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25
  },
  menuOptionIcon: {
    fontSize: 25
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

import React, { useReducer, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import firebase from 'firebase'

import { TextButton, HeaderText } from "../components/StyledText";
import { TitledPage } from "../components/Template";
import { ScrollView } from "react-native-gesture-handler";

export default function JoinGameMenuScreen({ navigation }) {
  const [activeGames, dispatch] = useReducer((activeGames, { type, value }) => {
    switch (type) {
      case "add":
        return [...activeGames, value];
      case "remove":
        return activeGames.filter((doc) => doc.gameName !== value.gameName);
      default:
        return activeGames;
    }
  }, []);

  useEffect(() => {
    firebase.firestore().collection("ActiveGames")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            dispatch({ type: "add", value: change.doc.data() });
          }
          if (change.type === "modified") {
            console.log("Fuck you: ", change.doc.data());
          }
          if (change.type === "removed") {
            dispatch({ type: "remove", value: change.doc.data() });
          }
        });
      });
  }, []);


  return (
    <ScrollView>
      <TitledPage pageTitle={"Join Game"} contentStyleContainer={styles.container}>
        <View style={styles.iconInfo}>
          <HeaderText><MaterialCommunityIcons size={15} name={'cards-playing-outline'} /> {'\uFF1D'} Joker </HeaderText>
          <HeaderText><MaterialCommunityIcons size={15} name={'lock'} /> {'\uFF1D'} Password </HeaderText>
        </View>
        {activeGames.length && activeGames.map((game) =>
          (<View>
            <TextButton key={game.gameName} labelStyle={styles.menuOption} onPress={() => joinGame(game.gameName)}>
              {game.gameName}
            </TextButton>
            <View style={styles.menuOptionIcons}>
              <HeaderText style={styles.menuOptionIcon} key={game.numberOfPlayers}>{game.numberOfPlayers}</HeaderText>
              {game.useJoker && <HeaderText style={styles.menuOptionIcon} key={game.useJoker}>
                <MaterialCommunityIcons size={25} name={'cards-playing-outline'} />
              </HeaderText> || <Text>      </Text>}
              {Boolean(game.password) && <HeaderText style={styles.menuOptionIcon} key={game.password}>
                <MaterialCommunityIcons size={25} name={'lock'} />
              </HeaderText> || <Text>      </Text>}
            </View>
          </View>
          )) || <HeaderText style={styles.noGames}>No active games. Try making one in the 'Host Game' menu!</HeaderText>}

      </TitledPage>
    </ScrollView>
  );
}

function joinGame() { }

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

import React, { useReducer, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import firebase from 'firebase'

import { TextButton } from "../components/StyledText";
import { TitledPage } from "../components/Template";

export default function JoinGameMenuScreen({ navigation }) {
  const [activeGames, dispatch] = useReducer((activeGames, { type, value }) => {
    switch (type) {
      case "add":
        return [...activeGames, value];
      case "remove":
        return activeGames.filter((doc) => doc !== value);
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
    <TitledPage pageTitle={"Join Game"} contentStyleContainer={styles.container}>
      {activeGames.map((game) => (<TextButton key={game.gameName} labelStyle={styles.menuOption} onPress={() => joinGame(game.gameName)}> {game.gameName} </TextButton>))}
    </TitledPage>
  );
}

function joinGame() { }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingTop: 15,
  },
  menuOption: {
    marginBottom: 15,
    marginTop: 15,
  },
  disabled: {
    color: "rgb(96,100,109)",
  },
});

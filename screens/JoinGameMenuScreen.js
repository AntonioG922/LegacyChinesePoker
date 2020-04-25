import * as firebase from 'firebase';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { TextButton } from '../components/StyledText';
import {TitledPage} from '../components/Template';

export default async function JoinGameMenuScreen({navigation}) {
  return (
      <TitledPage pageTitle={'Join Game'}
                  contentStyleContainer={styles.container}>
        {await getActiveGames().map(gameTitle => (
            <TextButton key={gameTitle} labelStyle={styles.menuOption}
                        onPress={() => joinGame(
                            gameTitle)}>{gameTitle}</TextButton>))}
      </TitledPage>
  );
}

function getActiveGames() {
  let activeGames = [];
  firebase.firestore().collection('ActiveGames')
      .limit(20)
      .get()
      .then(querySnapshot => {
            querySnapshot.forEach(function (doc) {
              activeGames.push(doc.id);
            });
          });
  console.log(activeGames);

  return activeGames;
}

function joinGame() {

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingTop: 15,
  },
  menuOption: {
    marginBottom: 15,
    marginTop: 15,
  },
  disabled: {
    color: 'rgb(96,100,109)',
  }
});

import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import {PageTitle, TextButton} from '../components/StyledText';
import {TitledPage} from '../components/Template';
import {ScrollView} from "react-native-gesture-handler";

export default function PlayMenuScreen({ navigation }) {
  return (
      <TitledPage pageTitle={'Play'} contentContainerStyle={styles.container}>
        <TextButton labelStyle={styles.menuOption} onPress={() => navigation.navigate('HostGameOptions')}>Host Game</TextButton>
        <TextButton labelStyle={styles.menuOption} onPress={() => navigation.navigate('JoinGameMenu')}>Join Game</TextButton>
        <TextButton disabled={true} labelStyle={[styles.menuOption, styles.disabled]}>Vs. AI</TextButton>
      </TitledPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOption: {
    marginBottom: 15,
    marginTop: 15,
  },
  disabled: {
    color: 'rgb(96,100,109)',
  }
});

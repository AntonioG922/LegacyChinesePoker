import * as React from 'react';
import { StyleSheet } from 'react-native';

import {TextButton} from '../components/StyledText';
import {TitledPage} from '../components/Template';

export default function CustomGameMenuScreen({ navigation }) {
  return (
      <TitledPage pageTitle={'Custom Game'} contentContainerStyle={styles.container}>
        <TextButton labelStyle={styles.menuOption} onPress={() => navigation.navigate('HostGameOptions')}>Host Game</TextButton>
        <TextButton labelStyle={styles.menuOption} onPress={() => navigation.navigate('JoinGameMenu')}>Join Game</TextButton>
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
});

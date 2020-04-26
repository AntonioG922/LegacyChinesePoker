import * as React from 'react';
import { StyleSheet } from 'react-native';

import {TextButton} from '../components/StyledText';
import {TitledPage} from '../components/Template';

export default function PlayMenuScreen({ navigation }) {
  return (
      <TitledPage pageTitle={'Play'} contentContainerStyle={styles.container}>
        <TextButton labelStyle={styles.menuOption} onPress={() => navigation.navigate('HostGameOptions')}>Play Now</TextButton>
        <TextButton labelStyle={styles.menuOption} onPress={() => navigation.navigate('CustomGameMenu')}>Custom Game</TextButton>
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

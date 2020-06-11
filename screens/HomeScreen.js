import React from 'react';
import { ImageBackground, StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { HeaderText, TextButton } from '../components/StyledText';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../assets/images/dragon.png')}
          style={styles.headerImage}
        >
          <HeaderText style={styles.title}>Chinese Poker</HeaderText>
        </ImageBackground>
      </View>

      <View style={styles.menuOptionContainer}>
        <TextButton onPress={() => navigation.navigate('Game')}>Play Now</TextButton>
        <TextButton onPress={() => navigation.navigate('HostGameOptions')}>Host Game</TextButton>
        <TextButton onPress={() => navigation.navigate('JoinGameMenu')}>Join Game</TextButton>
        <TextButton onPress={() => navigation.navigate('Stats')}>Stats</TextButton>
        <TextButton onPress={() => navigation.navigate('HowToPlay')}>How To Play</TextButton>
      </View>
      <SafeAreaView style={styles.logoutIconContainer} >
        <TouchableOpacity style={styles.logoutIconEvent} onPress={() => navigation.navigate('Settings')} >
          <FontAwesome5 name={'cog'} style={{ color: 'rgb(96,100,109)', fontSize: 30 }} />
        </TouchableOpacity>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    backgroundColor: '#fafafa',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 50
  },
  headerImage: {
    width: 250,
    height: 250,
    justifyContent: 'center',
  },
  menuOptionContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 65,
    color: 'rgb(96,100,109)',
    lineHeight: 65,
    textAlign: 'center',
  },
  logoutIconContainer: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 50,
    height: 50
  },
  logoutIconEvent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  }
});

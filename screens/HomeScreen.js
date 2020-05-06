import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { NavigationActions } from '@react-navigation/native';
import { StackActions } from '@react-navigation/stack';
import firebase from 'firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HeaderText, TextButton } from '../components/StyledText';

export default function HomeScreen({ navigation }) {
  function signOut() {
    firebase.auth().signOut().then(() => {
      console.log('Sign out successful!');
    }).catch(function (error) {
      alert(error);
    });
  }

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
        <TextButton>Stats</TextButton>
        <TextButton onPress={() => navigation.navigate('HowToPlay')}>How To Play</TextButton>
      </View>

      <MaterialCommunityIcons name={'logout'} size={30} style={styles.logoutIcon} onPress={() => { signOut() }} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50,
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
  logoutIcon: {
    color: 'rgb(96,100,109)',
    position: 'absolute',
    top: 30,
    right: 10
  }
});

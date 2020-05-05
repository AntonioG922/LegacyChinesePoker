import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import firebase from 'firebase';

import { HeaderText, TextButton, LogInOptionButton } from '../components/StyledText';

export default function HomeScreen({ navigation }) {
  const [loggedIn, setLoggedIn] = useState(false);

  function signOut() {
    firebase.auth().signOut().then(() => {
      console.log('Sign out successful!');
    }).catch(function (error) {
      alert(error);
    });
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log(user);
        setLoggedIn(true);
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        // ...
      } else {
        setLoggedIn(false);
      }
    });
  }, [])

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
        <TextButton onPress={() => {
          loggedIn ? signOut() :
            navigation.navigate('LoginOptions')
        }}>
          {loggedIn ? 'Logout' : 'Login'}
        </TextButton>
      </View>
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
});

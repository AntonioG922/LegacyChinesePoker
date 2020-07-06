import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import firebase from 'firebase';
import store from '../redux/store';
import { setUserData } from '../redux/store';

export default function InitialLoaderScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      let displayName;
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log(user);
          const { email, photoURL, providerData, uid } = user;
          displayName = user.displayName;
          store.dispatch(setUserData({
            displayName: displayName,
            email: email,
            photoURL: photoURL,
            providerData: providerData,
            uid: uid
          }));
          if (displayName) {
            navigation.navigate('Home');
          } else {
            navigation.navigate('Welcome');
          }
        } else {
          firebase.auth().signInAnonymously()
            .catch((error) => {
              alert('Error connecting. Attempting to connect again.');
              console.log('First connection attempt error: ', error);
              setTimeout(() => {
                firebase.auth().signInAnonymously()
                  .catch((error) => {
                    alert('Error connecting. Please check your internet connection and reopen the app.');
                    console.log('Second connection attempt error: ', error);
                  });
              }, 10000)
            });
        }
      });
    }, 1000)
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' />
      <Image
        source={require('../assets/images/dragon_1350x2400.png')}
        style={styles.loaderImage}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderImage: {
    width: 400,
    height: 400,
  }
})
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import firebase from 'firebase';
import store from '../redux/store';
import { setUserData } from '../redux/store';

export default function InitialLoaderScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log(user);
          const { displayName, email, photoURL, providerData, uid } = user;
          store.dispatch(setUserData({
            displayName: displayName,
            email: email,
            photoURL: photoURL,
            providerData: providerData,
            uid: uid
          }));
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
      navigation.navigate('Home');
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
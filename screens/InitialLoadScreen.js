import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import firebase from 'firebase';
import store from '../redux/store';
import { setUserData, clearUserData } from '../redux/store';

export default function InitialLoaderScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const { displayName, email, photoURL, uid } = user;
          store.dispatch(setUserData({
            displayName: displayName,
            email: email,
            photoURL: photoURL,
            uid: uid
          }));
          navigation.navigate('Home');
        } else {
          store.dispatch(clearUserData());
          navigation.navigate('LoginOptions');
        }
      });
    }, 1000)
  }, []);

  return (
    <View style={styles.container}>
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
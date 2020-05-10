import React, { useEffect, componentDidMount } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import firebase from 'firebase';

export default function InitialLoaderScreen({ navigation }) {

  useEffect(() => {
    setTimeout(() => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          navigation.navigate('Home');
        } else {
          navigation.navigate('LoginOptions');
        }
      });
    }, 1000)
  }, [])

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
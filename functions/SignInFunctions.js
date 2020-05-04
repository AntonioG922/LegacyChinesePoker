import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';

export async function signInWithFacebook(setLoadStatus, navigation) {
  try {
    await Facebook.initializeAsync(
      '335846934057579',
    );

    const { type, token } = await Facebook.logInWithReadPermissionsAsync(
      { permissions: ['public_profile'] }
    );

    if (type === 'success') {
      setLoadStatus(true);
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      firebase.auth().signInWithCredential(credential)
        .then(() => {
          setLoadStatus(false);
          navigation.navigate('Home');
        })
        .catch((error) => {
          setLoadStatus(false);
          alert(error);
        });
    }
  } catch ({ error }) {
    alert(error);
  }
}

export async function signInWithGoogle(setLoadStatus, navigation) {
  try {
    const result = await Google.logInAsync({
      androidClientId: '602907791506-bsslqf0jonrtt6t489ct4q7hm8f7iibu.apps.googleusercontent.com',
      iosClientId: '602907791506-trasibveo69o02ublilqc0b4ln0ur77j.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    });

    if (result.type === 'success') {
      setLoadStatus(true);
      console.log(result);
      const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
      firebase.auth().signInWithCredential(credential)
        .then(() => {
          setLoadStatus(false);
          navigation.navigate('Home');
        })
        .catch((error) => {
          setLoadStatus(false);
          alert(error);
        });
    }
  } catch (e) {
    return { error: true };
  }
}
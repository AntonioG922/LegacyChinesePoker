import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import firebase from 'firebase';

import { LogInOptionButton, HeaderText } from '../components/StyledText';
import { TitledPage } from '../components/Template';
import Loader from '../components/Loader';
import { signInWithFacebook, signInWithGoogle } from '../functions/SignInFunctions';

export default function LoginOptions({ navigation }) {
  const [loading, setLoading] = useState(false);

  return (
    <TitledPage pageTitle={'Sign in'} >
      <Loader loading={loading} message={'Signing In'} />
      <LogInOptionButton
        icon={'google'}
        textColor={'gray'}
        message={'Sign in with Google'}
        style={[styles.logInOptionButton, { backgroundColor: '#fbfbfb' }]}
        onPress={() => signInWithGoogle(setLoading)}
      />
      <LogInOptionButton
        icon={'facebook'}
        textColor={'white'}
        message={'Sign in with Facebook'}
        style={[styles.logInOptionButton, { backgroundColor: '#3b5998' }]}
        onPress={() => signInWithFacebook(setLoading)}
      />
      <LogInOptionButton
        icon={'twitter'}
        textColor={'white'}
        message={'Sign in with Twitter'}
        style={[styles.logInOptionButton, { backgroundColor: '#00acee' }]}
      />
      <LogInOptionButton
        icon={'email'}
        textColor={'white'}
        message={'Sign in with Email'}
        style={[styles.logInOptionButton, { backgroundColor: '#ce0211' }]}
        onPress={() => navigation.navigate('EmailLogin', { signingUp: false })}
      />
      <Text
        style={styles.signUpButton}
        onPress={() => navigation.navigate('EmailLogin', { signingUp: true })}
      >Don't have any of these accounts?{'\n'} Sign Up</Text>
    </TitledPage>
  )
}

const styles = StyleSheet.create({
  logInOptionButton: {
    marginBottom: 15,
    maxWidth: 360
  },
  signUpButton: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    fontFamily: 'gang-of-three',
    color: 'rgb(217, 56, 27)',
  }
})
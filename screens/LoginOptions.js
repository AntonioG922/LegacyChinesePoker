import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import firebase from 'firebase';

import { FlatTextInput, TextButton, HeaderText, PasswordTextInput, LogInOptionButton } from '../components/StyledText';
import { TitledPage } from '../components/Template';
import Loader from '../components/Loader';

export default function LoginOptions({ navigation }) {
  return (
    <TitledPage pageTitle={'Sign in'} navigation={navigation} >
      <LogInOptionButton
        icon={'google'}
        textColor={'gray'}
        message={'Sign in with Google'}
        style={[styles.logInOptionButton, { backgroundColor: '#fbfbfb' }]}
      />
      <LogInOptionButton
        icon={'facebook'}
        textColor={'white'}
        message={'Sign in with Facebook'}
        style={[styles.logInOptionButton, { backgroundColor: '#3b5998' }]}
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
      <LogInOptionButton
        icon={'email'}
        textColor={'white'}
        message={'Sign up with Email'}
        style={[styles.logInOptionButton, { backgroundColor: '#42aa68', marginTop: 50 }]}
        onPress={() => navigation.navigate('EmailLogin', { signingUp: true })}
      />
    </TitledPage>
  )
}

const styles = StyleSheet.create({
  logInOptionButton: {
    marginBottom: 15
  }
})
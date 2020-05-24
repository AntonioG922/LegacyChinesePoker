import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import firebase from 'firebase';

import { FlatTextInput, TextButton, HeaderText, PasswordTextInput } from '../components/StyledText';
import { TitledPage } from '../components/Template';
import Loader from '../components/Loader';
import { Card } from '../components/Card';

export default function Login({ route, navigation }) {
  const [signingUp, setSigningUp] = useState(route.params.signingUp);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function allFieldsFilled() {
    if (signingUp && !username) {
      setErrorMessage('Please enter a username');
      return false;
    } else if (!email) {
      setErrorMessage('Please enter an email');
      return false;
    } else if (!password) {
      setErrorMessage('Please enter a password');
      return false;
    } else if (signingUp && !passwordConfirm) {
      setErrorMessage('Please confirm your password');
      return false;
    }
    return true;
  }

  function logIn(email, password) {
    if (allFieldsFilled()) {
      setLoading(true);
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
          setLoading(false),
            navigation.navigate('Home')
        })
        .catch((error) => {
          setLoading(false);
          setErrorMessage(error.message);
        })
    }
  }

  function signUp(username, email, password, passwordConfirm) {
    if (allFieldsFilled()) {
      if (password === passwordConfirm) {
        setLoading(true);
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(() => {
            firebase.auth().currentUser.updateProfile({
              displayName: username
            }).then(() => {
              setLoading(false);
              navigation.navigate('Home');
            }).catch((error) => {
              setErrorMessage(error);
            })
          })
          .catch((error) => {
            setLoading(false);
            setErrorMessage(error.message);
          })
      } else {
        setErrorMessage('Passwords do not match');
      }
    }
  }

  return (
    <TitledPage
      pageTitle={' '}
      navigation={navigation}
      contentContainerStyle={styles.container}>
      <Loader loading={loading} message={signingUp ? 'Signing Up' : 'Logging In'} />
      <Image source={require('../assets/images/dragon4.png')} style={styles.backgroundImage} />
      <View style={styles.form}>
        {signingUp && <FlatTextInput label={'Username'} onChangeText={text => setUsername(text)} />}
        <FlatTextInput keyboardType={'email-address'} label={'Email'} onChangeText={text => setEmail(text)} textContentType={'emailAddress'} />
        <PasswordTextInput label={'Password'} onChangeText={text => setPassword(text)} textContentType={signingUp ? 'newPassword' : 'password'} />
        {signingUp && <PasswordTextInput label={'Password Confirm'} onChangeText={text => setPasswordConfirm(text)} />}
      </View>
      <TextButton style={styles.submitButton} onPress={() => signingUp ? signUp(username, email, password, passwordConfirm) : logIn(email, password)} >{signingUp ? 'Sign Up' : 'Log In'}</TextButton>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
    </TitledPage>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30
  },
  form: {
    flex: 4,
    justifyContent: 'center'
  },
  submitButton: {
    flex: 2,
    paddingTop: 60
  },
  errorMessage: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'gang-of-three',
    color: 'rgb(217, 56, 27)',
  },
  backgroundImage: {
    width: 120,
    height: 265,
    position: 'absolute',
    right: -20,
    top: -85,
    zIndex: 2
  },
  card1: {
    position: 'absolute',
    left: 100,
    top: -135,
    transform: [
      { rotate: '30deg' }
    ]
  },
  card2: {
    position: 'absolute',
    left: 0,
    bottom: 40,
    transform: [
      { rotate: '75deg' }
    ]
  },
  card3: {
    position: 'absolute',
    right: -50,
    bottom: 0,
    transform: [
      { rotate: '-40deg' }
    ]
  }
})
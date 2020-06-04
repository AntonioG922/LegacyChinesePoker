import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, KeyboardAvoidingView, Text, ScrollView, Keyboard, useWindowDimensions } from 'react-native';
import firebase from 'firebase';
import * as Google from 'expo-google-app-auth';
import { FontAwesome5 } from '@expo/vector-icons';
import store, { setUserData } from '../../redux/store';
import { TextButton, LogInOptionButton } from '../../components/StyledText';
import TitledPage from '../../components/TitledPage';
import Loader from '../../components/Loader';
import { TextInput } from 'react-native-paper';
import PopUpMessage from '../../components/PopUpMessage';

export default function AcountRecoveryScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkingEmail, setLinkingEmail] = useState(false);
  const [localUserData, setLocalUserData] = useState(store.getState().userData.user);
  const [googleLinkedEmail, setGoogleLinkedEmail] = useState(getUserGoogleLinkedEmail());
  const [linkedEmail, setLinkedEmail] = useState(getUserLinkedEmail());
  const [showPassword, setShowPassword] = useState(false);
  const [headerTextHeight, setHeaderTextHeight] = useState(0);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const scrollRef = useRef();
  const emailInput = useRef();
  const passwordInput = useRef();
  const windowHeight = useWindowDimensions().height;

  const buttonsAndInputsY = useRef(new Animated.Value(0)).current;
  const inputsOpacity = useRef(new Animated.Value(0)).current;
  const inputsY = useRef(new Animated.Value(0)).current;
  const headerTextY = useRef(new Animated.Value(0)).current;
  const headerTextOpacity = useRef(new Animated.Value(0)).current;
  const signOutOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const duration = 400;
    Animated.parallel([
      Animated.timing(buttonsAndInputsY, {
        toValue: linkingEmail ? -headerTextHeight : 0,
        duration: duration
      }),
      Animated.timing(inputsOpacity, {
        toValue: linkingEmail ? 1 : 0,
        duration: duration
      }),
      Animated.timing(inputsY, {
        toValue: linkingEmail ? 20 : 0,
        duration: duration
      }),
      Animated.timing(headerTextY, {
        toValue: linkingEmail ? -25 : 0,
        duration: duration
      }),
      Animated.timing(headerTextOpacity, {
        toValue: linkingEmail ? 0 : 1,
        duration: duration
      }),
      Animated.timing(signOutOpacity, {
        toValue: linkingEmail ? 0 : 1,
        duration: duration
      })
    ]).start();
  }, [linkingEmail]);

  useEffect(() => {
    return store.subscribe(() => {
      const updatedUser = store.getState().userData.user;
      const googleAccountData = updatedUser.providerData.find(element => element.providerId === 'google.com');
      const emailAccountData = updatedUser.providerData.find(element => element.providerId === 'password');

      setGoogleLinkedEmail(googleAccountData ? googleAccountData.email : '')
      setLinkedEmail(emailAccountData ? emailAccountData.email : '')
      setLocalUserData(updatedUser);
    })
  }, []);

  function getUserGoogleLinkedEmail() {
    let googleData = localUserData.providerData.find(element => element.providerId === 'google.com');
    return googleData ? googleData.email : '';
  }

  function getUserLinkedEmail() {
    let emailData = localUserData.providerData.find(element => element.providerId === 'password');
    return emailData ? emailData.email : '';
  }

  function onLayoutHeader(event) {
    setHeaderTextHeight(event.nativeEvent.layout.height);
  }

  function scrollToY(y) {
    scrollRef.current.scrollTo({ y: y, animated: true });
  }

  function updateUserData(userData) {
    const { displayName, email, photoURL, providerData, uid } = userData;
    store.dispatch(setUserData({
      displayName: displayName,
      email: email,
      photoURL: photoURL,
      providerData: providerData,
      uid: uid
    }));
  }

  async function linkGoogleAccount() {
    try {
      const result = await Google.logInAsync({
        androidClientId: '602907791506-bsslqf0jonrtt6t489ct4q7hm8f7iibu.apps.googleusercontent.com',
        iosClientId: '602907791506-trasibveo69o02ublilqc0b4ln0ur77j.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });

      if (result.type === 'success') {
        setLoading(true);
        const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
        firebase.auth().currentUser.linkWithCredential(credential)
          .then((usercred) => {
            setLoading(false);
            let user = usercred.user;
            console.log("Anonymous account successfully upgraded", user);
            updateUserData(user);
          }).catch((error) => {
            if (error.code === 'auth/credential-already-in-use') {
              signInWithCredential(credential);
            } else {
              setLoading(false);
              alert('Error linking account. Please check your internet connection and try again.');
              console.log("Google account linking error: ", error);
            }
          });
      }
    } catch (error) {
      if (error.code !== '-3') {
        alert('Error linking google account. Please check your internet connection and try again.');
        console.log('Error linking google account: ', error);
      }
    }
  }

  function linkEmail() {
    setLoading(true);
    var credential = firebase.auth.EmailAuthProvider.credential(email, password);
    firebase.auth().currentUser.linkWithCredential(credential)
      .then(function (usercred) {
        setLoading(false);
        setLinkingEmail(false);
        let user = usercred.user;
        console.log("Account linking success: ", user);
        updateUserData(user);
      }).catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          signInWithCredential(credential);
        } else {
          setLoading(false);
          alert('Error linking account. Please check your internet connection and try again.');
          console.log("Email/password account linking error: ", error, Object.keys(error), error.code);
        }
      });
  }

  function signInWithCredential(credential) {
    firebase.auth().signInWithCredential(credential)
      .then((user) => {
        setLinkingEmail(false);
        console.log('Successfully signed in with google: ', user);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        alert('Error signing into previously linked account. Please check your internet connection and try again.');
        console.log('Error signing into already linked account: ', error)
      });
  }

  function signOut() {
    setLoading(true);
    firebase.auth().signOut().then(() => {
      setLoading(false);
      console.log('Sign out successful!');
    }).catch(function (error) {
      setLoading(false);
      alert('Error siging out. Please check your internet connection and try again.')
      console.log('Error signing out: ', error);
    });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container} >
      <ScrollView scrollEnabled={false} ref={scrollRef} >
        <Loader loading={loading} />
        <TitledPage pageTitle='Link Account' navigation={navigation} >
          <Animated.View style={{ opacity: headerTextOpacity, transform: [{ translateY: headerTextY }] }} onLayout={(event) => onLayoutHeader(event)} >
            <Text style={styles.infoText}>Linking allows you to use the same account across all your devices</Text>
          </Animated.View>

          <Animated.View style={{ marginTop: 10, transform: [{ translateY: buttonsAndInputsY }] }}>
            <View>
              <LogInOptionButton
                icon={'google'}
                textColor={'gray'}
                disabled={Boolean(googleLinkedEmail)}
                check={Boolean(googleLinkedEmail)}
                message={googleLinkedEmail ? googleLinkedEmail : 'Link with Google'}
                style={[styles.logInOptionButton, { backgroundColor: '#fbfbfb' }]}
                onPress={() => { setLinkingEmail(false); linkGoogleAccount(); }}
              />
              <LogInOptionButton
                icon={'email'}
                textColor={'white'}
                disabled={Boolean(linkedEmail)}
                check={Boolean(linkedEmail)}
                message={linkedEmail ? linkedEmail : 'Link with Email'}
                style={[styles.logInOptionButton, { backgroundColor: '#3b4498' }]}
                onPress={() => setLinkingEmail(!linkingEmail)}
              />
            </View>
            <Animated.View style={{ opacity: inputsOpacity, transform: [{ translateY: inputsY }], alignItems: 'center' }}>
              <TextInput
                ref={emailInput}
                mode={'outlined'}
                keyboardType={'email-address'}
                label={'Email'}
                textContentType={'emailAddress'}
                returnKeyType={'next'}
                disabled={!linkingEmail}
                style={styles.linkEmailField}
                onFocus={() => { scrollToY((1140 - windowHeight) / 2) }}
                onBlur={() => { passwordInput.current.isFocused() ? null : scrollToY(0) }}
                onSubmitEditing={() => passwordInput.current.focus()}
                blurOnSubmit={false}
                onChangeText={text => setEmail(text)} />
              <View>
                <TextInput
                  ref={passwordInput}
                  mode={'outlined'} secureTextEntry={!showPassword}
                  label={'New Password'}
                  textContentType={'password'}
                  returnKeyType={'send'}
                  disabled={!linkingEmail}
                  outline={true}
                  style={styles.linkEmailField}
                  onFocus={() => { scrollToY((1140 - windowHeight) / 2) }}
                  onBlur={() => { emailInput.current.isFocused() ? null : scrollToY(0) }}
                  onSubmitEditing={() => linkEmail()}
                  onChangeText={text => setPassword(text)} />
                <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={20} onPress={() => setShowPassword(!showPassword)} style={styles.passwordIcon} />
              </View>
              <TextButton labelStyle={styles.linkEmailSubmit} disabled={!linkingEmail} onPress={() => linkEmail()}>Link Email</TextButton>
            </Animated.View>
          </Animated.View>
          {(Boolean(googleLinkedEmail) || Boolean(linkedEmail)) && <Animated.View style={{ opacity: signOutOpacity, position: 'absolute', top: windowHeight - 250, left: 0, right: 0 }} >
            <TextButton labelStyle={styles.signOut} onPress={() => setShowSignOutConfirm(true)}>
              Sign Out
            </TextButton>
          </Animated.View>}
          <PopUpMessage showPopUp={showSignOutConfirm} exitAction={() => setShowSignOutConfirm(false)} exitMessage={'No'} confirmAction={() => { setShowSignOutConfirm(false); signOut() }} confirmMessage={'Yes'} >
            <Text style={{ textAlign: 'center', fontSize: 25, fontWeight: 'bold' }}>Are you sure you want to sign out of your linked accounts?</Text>
          </PopUpMessage>
        </TitledPage>
        <View style={{ height: 500 }}></View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  linkEmailSubmit: {
    color: '#3b4498',
    fontSize: 20,
    marginTop: 20
  },
  linkEmailField: {
    marginVertical: 10,
    width: 250,
    backgroundColor: '#fbfbfb'
  },
  logInOptionButton: {
    marginVertical: 10,
    maxWidth: 360
  },
  infoText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold'
  },
  passwordIcon: {
    position: 'absolute',
    right: '5%',
    top: '40%'
  },
  signOut: {
    color: 'rgb(96,100,109)',
    fontSize: 20
  },
})
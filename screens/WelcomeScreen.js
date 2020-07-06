import React, { useState, useRef } from 'react';
import TitledPage from '../components/TitledPage';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { OutlineTextInput, TextButton } from '../components/StyledText';
import firebase from 'firebase';
import store, { updateUserData } from '../redux/store';
import Filter from 'bad-words';

export default function WelcomeScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const windowWidth = useWindowDimensions().width;
  const scrollRef = useRef();

  function saveDisplayName() {
    if (!displayName) {
      setErrorMessage('Please enter a display name');
    } else if (displayNameContainsBadWord()) {
      setErrorMessage('Please refrain from using bad words')
    } else {
      setErrorMessage('');
      firebase.auth().currentUser.updateProfile({
        displayName: displayName
      })
        .then(() => {
          store.dispatch(updateUserData({
            displayName: displayName
          }));
          scrollRef.current.scrollTo({ x: windowWidth, animated: true });
        })
        .catch((error) => {
          if (error.message === 'Attempting to change configurable attribute of unconfigurable property.') {
            store.dispatch(updateUserData({
              displayName: displayName
            }));
            scrollRef.current.scrollTo({ x: windowWidth, animated: true });
          } else {
            alert('Error saving display name. Please make sure you have an internet connection and try again.');
            console.log('Error saving preferences: ', error);
          }
        });
    }
  }

  function displayNameContainsBadWord() {
    const displayNameWords = displayName.split(' ');
    let flag = false;
    let filter = new Filter();
    displayNameWords.forEach(word => {
      if (filter.isProfane(word)) {
        flag = true;
      }
    })
    return flag;
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled={true}
      decelerationRate={'fast'}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
      ref={scrollRef}
    >
      <View style={{ width: windowWidth }}>
        <TitledPage pageTitle={'Welcome!'} contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', bottom: 50 }}>
          <Text style={styles.text} >
            Welcome to Chinese Poker!{'\n'}Go ahead and choose a <Text style={{ fontWeight: 'bold' }}>Display Name</Text> to get started!
            {'\n\n'}You can change this anytime in the future
          </Text>
          <OutlineTextInput
            maxLength={12}
            style={{ marginTop: 50, width: 250 }}
            placeholder={'Display Name'}
            onChangeText={text => setDisplayName(text)}
            onSubmitEditing={() => saveDisplayName()}
          />
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TextButton onPress={() => saveDisplayName()}>Next</TextButton>
        </TitledPage>
      </View>
      <View style={{ width: windowWidth }}>
        <TitledPage pageTitle={'Enjoy!'} contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[styles.text, { marginBottom: 100 }]}>
            You're all set! Have fun!
            {'\n\n\n'}If this is your first time playing, check out the <Text style={{ fontWeight: 'bold' }}>How To Play</Text> on the Home Screen
          </Text>
          <TextButton onPress={() => navigation.navigate('Home')}>Finish</TextButton>
        </TitledPage>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center'
  },
  errorMessage: {
    color: 'rgb(217, 56, 27)',
    marginBottom: 50,
    marginTop: 10
  }
})
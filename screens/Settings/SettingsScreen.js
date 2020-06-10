import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import store, { setUserData, updateUserData } from '../../redux/store';
import { FontAwesome5 } from '@expo/vector-icons';
import { HeaderText, OutlineTextInput, TextButton } from '../../components/StyledText';
import TitledPage from '../../components/TitledPage';

export default function SettingsScreen({ navigation }) {
  const user = store.getState().userData.user;
  const [displayName, setDisplayName] = useState(user.displayName);

  function saveSettings() {
    if (displayName && displayName !== store.getState().userData.user.displayName) {
      firebase.auth().currentUser.updateProfile({
        displayName: displayName
      })
        .then(() => {
          store.dispatch(updateUserData({
            displayName: displayName
          }));
        })
        .catch((error) => {
          alert('Error saving preferences. Please check your internet connection and try again.');
          console.log('Error saving preferences: ', error, typeof (error));
        });
    }
  }

  function signOut() {
    firebase.auth().signOut().then(() => {
      console.log('Sign out successful!');
    }).catch(function (error) {
      alert(error);
    });
  }

  function SettingsLink({ icon, text, linkScreen }) {
    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
      },
      text: {
        fontSize: 20
      }
    })

    return (
      <TouchableOpacity style={styles.container} onPress={() => navigation.navigate(linkScreen)}>
        <HeaderText style={{ flex: 1 }}>
          <FontAwesome5 name={icon} style={styles.text} />
        </HeaderText>
        <HeaderText style={[styles.text, { flex: 8 }]} >{text}</HeaderText>
        <FontAwesome5 name={'chevron-right'} style={[styles.text, { color: 'rgb(96,100,109)' }]} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <TitledPage
        pageTitle='Settings'
        containerStyle={{ height: '100%' }}
        contentContainerStyle={{ height: '75%', justifyContent: 'space-between' }}
        navigation={navigation}
        exitFunction={saveSettings}
      >
        <View style={styles.inputFields} >
          <View style={styles.row}>
            <HeaderText style={styles.headerText}>Display Name: </HeaderText>
            <OutlineTextInput maxLength={12} style={styles.input} value={displayName} placeholder={user.displayName} onChangeText={text => setDisplayName(text)} />
          </View>
        </View>

        <View style={styles.links}>
          <SettingsLink icon={'link'} text={'Link Account'} linkScreen={'LinkAccount'} />
        </View>

        <View style={[styles.row, { justifyContent: 'center', marginVertical: 0 }]}>
        </View>
      </TitledPage>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20
  },
  column: {
    flexDirection: 'column'
  },
  headerText: {
    fontSize: 25
  },
  input: {
    width: 200
  },
  subText: {
    fontSize: 10
  },
})
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import store, { setUserData } from '../../redux/store';
import { FontAwesome5 } from '@expo/vector-icons';
import { HeaderText, OutlineTextInput, TextButton } from '../../components/StyledText';
import TitledPage from '../../components/TitledPage';

export default function SettingsScreen({ navigation }) {
  const user = store.getState().userData.user;
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);

  function saveSettings() {
    firebase.auth().currentUser.updateProfile({
      displayName: displayName,
      email: email
    })
      .then(() => {
        const tempDisplayName = displayName || user.displayName;
        const tempEmail = email || user.email;
        store.dispatch(setUserData({
          displayName: tempDisplayName,
          email: tempEmail,
          photoURL: user.photoURL,
          uid: user.uid
        }));
        navigation.goBack();
      })
      .catch((error) => {
        alert('Error saving preferences. Please check your internet connection and try again.');
        console.log(error);
      })
  }

  function recoverAccount() {

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
          <FontAwesome5 name='sync' style={styles.text} />
        </HeaderText>
        <HeaderText style={[styles.text, { flex: 8 }]} >{text}</HeaderText>
        <FontAwesome5 name={'chevron-right'} style={[styles.text, { color: 'rgb(96,100,109)' }]} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <TitledPage pageTitle='Settings' containerStyle={{ height: '100%' }} contentContainerStyle={{ height: '75%', justifyContent: 'space-between' }} navigation={navigation}>
        <View style={styles.inputFields} >
          <View style={styles.row}>
            <HeaderText style={styles.headerText}>Display Name: </HeaderText>
            <OutlineTextInput style={styles.input} value={displayName} placeholder={user.displayName} onChangeText={text => setDisplayName(text)} />
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <HeaderText style={styles.headerText}>
                Email:
            </HeaderText>
              <HeaderText style={styles.subText}>
                Used to recover account{'\n'}and sync account across{'\n'}devices
            </HeaderText>
            </View>
            <OutlineTextInput style={styles.input} value={email} placeholder={user.email} onChangeText={text => setEmail(text)} />
          </View>
        </View>

        <View style={styles.links}>
          <SettingsLink icon={'sync'} text={'Recover/Sync Account'} linkScreen={'AccountRecoverySync'} />
        </View>

        <View style={[styles.row, { justifyContent: 'center', marginVertical: 0 }]}>
          <TextButton labelStyle={styles.save} onPress={() => saveSettings()}>
            Save
          </TextButton>
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
  save: {
    color: 'rgb(96,100,109)',
    fontSize: 20
  },
})
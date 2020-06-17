import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import store, { updateUserData, toggleStyledText, setGlobalFont } from '../../redux/store';
import { FontAwesome5 } from '@expo/vector-icons';
import { HeaderText, OutlineTextInput, DividerLine } from '../../components/StyledText';
import TitledPage from '../../components/TitledPage';

export default function SettingsScreen({ navigation }) {
  const user = store.getState().userData.user;
  const [displayName, setDisplayName] = useState(user.displayName);
  const [styledText, setStyledText] = useState(store.getState().globalFont);

  useEffect(() => {
    store.dispatch(setGlobalFont(styledText));
  }, [styledText]);

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
          if (error.message === 'Attempting to change configurable attribute of unconfigurable property.') {
            store.dispatch(updateUserData({
              displayName: displayName
            }));
          } else {
            alert('Error saving preferences. Please check your internet connection and try again.');
            console.log('Error saving preferences: ', error);
          }
        });
    }
  }

  function SettingsLink({ icon, text, linkScreen }) {
    const styles = StyleSheet.create({
      container: {
        alignItems: 'center',
        marginVertical: 10
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20
      },
      text: {
        fontSize: 25
      }
    })

    return (
      <TouchableOpacity style={styles.container} onPress={() => navigation.navigate(linkScreen)}>
        <HeaderText style={styles.text} >{text}</HeaderText>
        <View style={styles.row}>
          <FontAwesome5 name={'chevron-right'} style={[styles.text, { color: 'rgb(96,100,109)' }]} />
        </View>
      </TouchableOpacity>
    )
  }

  function SettingsLink2({ icon, text, linkScreen }) {
    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
      },
      text: {
        fontSize: 25
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
    <TitledPage
      pageTitle='Settings'
      contentContainerStyle={{ height: '75%', justifyContent: 'space-between' }}
      navigation={navigation}
      exitFunction={saveSettings}
    >
      <View style={styles.center} >
        <HeaderText style={styles.headerText}>Display Name</HeaderText>
        <OutlineTextInput maxLength={12} style={[styles.input, styles.beneathHeader]} value={displayName} placeholder={user.displayName} onChangeText={text => setDisplayName(text)} />
      </View>


      <View style={styles.center}>
        <HeaderText style={styles.headerText}>Styled Text</HeaderText>
        <TouchableOpacity onPress={() => setStyledText(styledText === 'gang-of-three' ? 'System' : 'gang-of-three')}>
          <FontAwesome5
            name={styledText === 'gang-of-three' ? 'check-square' : 'square'}
            style={[styles.beneathHeader, { fontSize: 35, color: 'rgb(96,100,109)' }]}
          />
        </TouchableOpacity>
      </View>

      <DividerLine />

      <View style={styles.links}>
        <SettingsLink icon={'link'} text={'Link Account'} linkScreen={'LinkAccount'} />
      </View>

      <View style={[styles.row, { justifyContent: 'center', marginVertical: 0 }]}>
      </View>
    </TitledPage>
  )
}

const styles = StyleSheet.create({
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20
  },
  beneathHeader: {
    marginTop: 15
  }
})
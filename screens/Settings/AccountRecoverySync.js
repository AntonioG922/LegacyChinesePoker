import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import firebase from 'firebase';
import store, { setUserData } from '../../redux/store';
import { FontAwesome5 } from '@expo/vector-icons';
import { HeaderText, OutlineTextInput, TextButton, Divider } from '../../components/StyledText';
import TitledPage from '../../components/TitledPage';

export default function AcountRecoveryScreen({ navigation }) {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <TitledPage pageTitle='Account Recovery/Sync' navigation={navigation} contentContainerStyle={{ flex: 1 }} >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <HeaderText style={{ fontSize: 25, marginBottom: 10 }}>
            Enter Email Below
          </HeaderText>
          <HeaderText style={{ fontSize: 13, textAlign: 'center' }}>
            Must have previously{'\n'}entered a recovery email
          </HeaderText>
          <OutlineTextInput style={{ marginVertical: 50, width: 250 }} onChangeText={text => setEmail(text)} />
          <TextButton labelStyle={styles.recover} onPress={() => recoverAccount()}>
            Recover
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
    backgroundColor: '#fafafa'
  },
  recover: {
    color: 'rgb(96,100,109)',
    fontSize: 20
  },
})
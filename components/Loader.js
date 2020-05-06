import React from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { ActivityIndicator, Colors } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { HeaderText } from "../components/StyledText";

export default function Loader(props) {
  const {
    loading,
    message,
    ...attributes
  } = props;

  return (
    <Modal
      transparent={true}
      animationType={'fade'}
      statusBarTranslucent={true}
      visible={loading}
      onRequestClose={() => loading = false}>
      <View style={styles.modalBackground}>
        {props.navigation && <HeaderText style={styles.backArrow}><Ionicons size={40} name='md-arrow-round-back' onPress={() => props.navigation.goBack()} /></HeaderText>}
        <HeaderText style={styles.loaderMessage}>{message}</HeaderText>
        <ActivityIndicator
          animating={loading}
          color={Colors.red800}
          size={150}
          style={styles.activityIcon} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  loaderMessage: {
    fontSize: 50,
    textAlign: 'center'
  },
  activityIcon: {
    position: 'relative',
    bottom: '20%'
  },
  backArrow: {
    position: 'absolute',
    top: 30,
    left: 30
  }
});
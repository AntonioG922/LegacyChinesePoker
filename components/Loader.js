import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Colors } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { HeaderText } from "../components/StyledText";

export default function Loader({ loading, message, exitAction }) {
  const windowDimensions = useWindowDimensions();

  return (
    <View style={{ position: 'absolute', zIndex: 99999, elevation: 99999, width: loading ? windowDimensions.width : 0, height: loading ? windowDimensions.height : 0 }}>
      {loading && <View style={styles.modalBackground}>
        {navigation && <HeaderText style={styles.backArrow}><Ionicons size={40} name='md-arrow-round-back' onPress={() => exitAction()} /></HeaderText>}
        <HeaderText style={styles.loaderMessage}>{message}</HeaderText>
        <ActivityIndicator
          animating={loading}
          color={Colors.red800}
          size={150}
          style={styles.activityIcon} />
      </View>}
    </View>
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
import React from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { ActivityIndicator, Colors } from 'react-native-paper';

export default function Loader(props) {
  const {
    loading,
    ...attributes
  } = props;

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}>
      <View style={styles.modalBackground}>
        <ActivityIndicator
          animating={loading}
          color={Colors.red800}
          size={150} />
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
  }
});
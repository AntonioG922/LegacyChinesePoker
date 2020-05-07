import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'

import { HeaderText } from './StyledText';

export function TitledPage(props) {
  return <View style={[styles.container, props.containerStyle]}>
    {props.navigation &&
      <HeaderText style={styles.backArrow}>
        <Ionicons size={40} name='md-arrow-round-back' onPress={() => props.navigation.goBack()} />
      </HeaderText>}
    <HeaderText style={[styles.pageTitle, props.titleStyle]} >{props.pageTitle}</HeaderText>
    <View style={props.contentContainerStyle}>
      {props.children}
    </View>
  </View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: 75,
    marginBottom: 50,
  },
  backArrow: {
    position: 'absolute',
    top: 30,
    left: 30
  }
});

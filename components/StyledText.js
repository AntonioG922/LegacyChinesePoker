import * as React from 'react';
import {Platform, StyleSheet, Text} from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export function HeaderText(props) {
  return <Text {...props} style={[ styles.styledText, props.style ]} />;
}

export function PageTitle(props) {
  return <HeaderText {...props} style={[ styles.pageTitle, props.style ]} />;
}

export function TextButton(props) {
  return <Button {...props} labelStyle={[ styles.styledText, { fontSize: 32 }, props.labelStyle ]} />;
}

export function ContainedButton(props) {
  return <Button {...props} mode='contained' labelStyle={[ styles.styledText, styles.containedButtonText, { fontSize: 32 }, props.labelStyle ]} />;
}

export function FlatTextInput(props) {
  return <TextInput {...props} underlineColor={'rgb(217, 56, 27)'}style={styles.flatTextInput} />;
}

export function OutlineTextInput(props) {
  return <TextInput {...props} mode={'outlined'} />;
}

const styles = StyleSheet.create({
  flatTextInput: {
    backgroundColor: '#fbfbfb',
  },
  styledText: {
    fontFamily: 'gang-of-three',
    color: 'rgb(217, 56, 27)',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 2,
  },
  containedButtonText: {
    color: '#bbb'
  },
  pageTitle: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: 75,
    marginBottom: 50,
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});

import React, { useState } from 'react';
import { View, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export function HeaderText(props) {
  return <Text {...props} style={[styles.styledText, props.style]} />;
}

export function PageTitle(props) {
  return <HeaderText {...props} style={[styles.pageTitle, props.style]} />;
}

export function TextButton(props) {
  return <Button {...props} labelStyle={[styles.styledText, { fontSize: 32 }, props.labelStyle]} />;
}

export function ContainedButton(props) {
  return <Button {...props} mode='contained' labelStyle={[ styles.styledText, styles.containedButtonText, { fontSize: 32 }, props.labelStyle ]} />;
}

export function FlatTextInput(props) {
  return <TextInput {...props} underlineColor={'rgb(217, 56, 27)'} style={styles.flatTextInput} />;
}

export function OutlineTextInput(props) {
  return <TextInput {...props} mode={'outlined'} />;
}

export function PasswordTextInput(props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View>
      <FlatTextInput {...props} secureTextEntry={!showPassword} >
      </FlatTextInput>
      <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={20} onPress={() => setShowPassword(!showPassword)} style={styles.passwordVisibilityIcon} />
    </View>
  )
}

export function LogInOptionButton({ textColor, icon, style, message, ...rest }) {
  return (
    <TouchableOpacity {...rest} style={[styles.logInOptionButton, style]}>
      {icon === 'email' && <MaterialCommunityIcons name={icon} size={30} style={[styles.logInOptionIcon, { color: textColor }]} />
        || <FontAwesome5 name={icon} size={30} style={[styles.logInOptionIcon, { color: textColor }]} />}
      <Text style={[styles.logInOptionMessage, { color: textColor }]}>{message}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  flatTextInput: {
    backgroundColor: '#fbfbfb',
  },
  styledText: {
    fontFamily: 'gang-of-three',
    color: 'rgb(217, 56, 27)',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
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
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  passwordVisibilityIcon: {
    position: 'absolute',
    right: '5%',
    top: '50%'
  },
  logInOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    padding: 20,
    borderWidth: .5,
    borderColor: 'lightgray',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  logInOptionIcon: {
    flex: 1,
    marginTop: 5,
    color: 'white'
  },
  logInOptionMessage: {
    flex: 3,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  }
});

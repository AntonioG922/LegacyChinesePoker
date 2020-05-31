import React, { useState } from 'react';
import { View, Platform, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { PLACE_SUFFIX } from '../functions/HelperFunctions';

export function HeaderText(props) {
  return <Text {...props} style={[styles.styledText, props.center && styles.centerText, props.fontSize && { fontSize: props.fontSize }, props.style]} />;
}

export function PageTitle(props) {
  return <HeaderText {...props} style={[styles.pageTitle, props.style]} />;
}

export function TextButton(props) {
  return <TouchableOpacity {...props} style={[{ paddingVertical: 10, paddingHorizontal: 20 }, props.style]}>
    <HeaderText center style={[styles.styledText, { fontSize: 32 }, props.labelStyle]}>{props.children}</HeaderText>
  </TouchableOpacity>;
}

export function ContainedButton(props) {
  return <Button {...props} mode='contained' labelStyle={[styles.styledText, styles.noShadow, styles.containedButtonText, { fontSize: 32 }, props.labelStyle]} />;
}

export function FlatTextInput(props) {
  return <TextInput {...props} underlineColor={'rgb(217, 56, 27)'} style={[styles.textInput, props.style]} />;
}

export function OutlineTextInput(props) {
  return <TextInput {...props} mode={'outlined'} style={[styles.textInput, props.style]} />;
}

export function PasswordTextInput(props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[props.style]}>
      {!props.outline && <FlatTextInput {...props} secureTextEntry={!showPassword} onSubmitEditing={props.submit} />}
      {props.outline && <OutlineTextInput {...props} secureTextEntry={!showPassword} />}
      {!props.submit && <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={20} onPress={() => setShowPassword(!showPassword)} style={styles.passwordIcon} />}
      {props.submit && <FontAwesome5 name={'arrow-right'} size={20} onPress={props.submit} style={[styles.passwordIcon, { color: 'rgb(217, 56, 27)' }]} />}
    </View>
  )
}

export function PlaceAndSuffix({ place, style }) {
  return (
    <View style={styles.placeAndSuffix}>
      <HeaderText style={[styles.place, style]}>{place}</HeaderText>
      <HeaderText style={[styles.placeSuffix, style]}>{PLACE_SUFFIX[place - 1]}</HeaderText>
    </View>
  )
}

export function LogInOptionButton({ textColor, icon, style, message, ...rest }) {
  return (
    <TouchableOpacity {...rest} style={[styles.logInOptionButton, style]}>
      {icon === 'email' && <MaterialCommunityIcons name={icon} size={30} style={[styles.logInOptionIcon, { color: textColor }]} />
        || icon === 'google' && <View style={styles.logInOptionIcon}><Image source={require('../assets/images/google-icon.png')} style={styles.googleImage} /></View>
        || <FontAwesome5 name={icon} size={30} style={[styles.logInOptionIcon, { color: textColor }]} />}
      <Text style={[styles.logInOptionMessage, { color: textColor }]}>{message}</Text>
    </TouchableOpacity>
  )
}

export function Divider({ subtitle, style }) {
  const styles = StyleSheet.create({
    divider: {
      paddingTop: 50,
      paddingBottom: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: 250,
      alignSelf: 'center',
      overflow: 'hidden'
    },
    dividerLine: {
      height: 1,
      backgroundColor: 'grey',
      width: '35%',
      marginHorizontal: 20,
    },
  })


  return (
    <View style={[styles.divider, style]}>
      <View style={styles.dividerLine} />
      <HeaderText style={{ fontSize: 32, textAlign: 'center' }}>{subtitle}</HeaderText>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#fbfbfb',
  },
  styledText: {
    fontFamily: 'gang-of-three',
    color: 'rgb(217, 56, 27)',
  },
  centerText: {
    textAlign: 'center',
  },
  containedButtonText: {
    color: '#ddd'
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
  passwordIcon: {
    position: 'absolute',
    right: '5%',
    top: '40%'
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
  },
  placeAndSuffix: {
    flexDirection: 'row',
  },
  place: {
    fontSize: 25,
  },
  placeSuffix: {
    fontSize: 15,
    lineHeight: 20
  },
  googleImage: {
    width: 27,
    height: 28
  },
});

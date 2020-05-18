import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';

import { HeaderText } from './StyledText';

export default function HowToPlaySection({ pageTitle, sectionText, children, bottomSpacer = true }) {
  const windowWidth = useWindowDimensions().width;

  return (
    <View style={[styles.container, { width: windowWidth }]}>
      <View style={styles.spacer} />
      <View style={styles.pageTitle} >
        <HeaderText style={{ fontSize: 55 }}>{pageTitle}</HeaderText>
      </View>
      {Boolean(sectionText) && <View style={styles.sectionTextContainer}>
        <Text style={styles.sectionText}>{sectionText}</Text>
      </View>}
      <View style={[styles.children, { flex: sectionText ? (bottomSpacer ? 4 : 5) : (bottomSpacer ? 6 : 7) }]}>
        {children}
      </View>
      {bottomSpacer && <View style={styles.spacer} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
    paddingHorizontal: 30
  },
  pageTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTextContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionText: {
    fontFamily: 'gang-of-three',
    fontSize: 22,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center'
  },
  children: {
    justifyContent: 'space-around',
  },
  backArrow: {
    position: 'absolute',
    top: 30,
    left: 30
  },
  spacer: {
    flex: 1
  }
});
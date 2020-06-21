import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import store from '../redux/store';

export default function NavBar({ numPages, scrollRef }) {
  const windowWidth = useWindowDimensions().width;
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentSection(store.getState().howToPlaySection)
    })
  }, [])

  function getName(section) {
    return currentSection == section ? 'circle' : 'circle-o';
  }

  return (
    <View style={styles.navBar}>
      {[...Array(numPages)].map((num, index) => {
        return <TouchableOpacity key={index} onPress={() => { scrollRef(index * windowWidth) }} style={[styles.navBarItem, { backgroundColor: currentSection === index ? 'rgb(217, 56, 27)' : 'rgba(96,100,109, 1)' }]} />
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navBarItem: {
    marginRight: 10,
    width: 12,
    height: 12,
    borderRadius: 6
  }
})
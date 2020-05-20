import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
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
        return <FontAwesome key={index} name={getName(index)} color={'red'} onPress={() => { scrollRef(index * windowWidth) }} size={15} style={styles.navBarItem} />
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navBarItem: {
    marginRight: 10
  }
})
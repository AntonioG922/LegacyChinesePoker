import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import store from '../redux/store';

export default function NavBar({ numPages, scrollRef }) {
  const windowWidth = useWindowDimensions().width;
  const [currentSection, setCurrentSection] = useState(0);
  let sectionArray = [];
  for (i = 0; i < numPages; i++) {
    sectionArray.push(i);
  }

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentSection(store.getState().howToPlaySection)
    })
  }, [])

  function getName(section) {
    return currentSection == section ? 'circle' : 'circle-o';
  }

  function getSize(section) {
    return currentSection == section ? 16 : 12;
  }

  return (
    <View style={styles.navBar}>
      {sectionArray.map((num) => {
        return <FontAwesome key={num} name={getName(num)} color={'red'} onPress={() => { scrollRef(num * windowWidth) }} size={getSize(num)} style={styles.navBarItem} />
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
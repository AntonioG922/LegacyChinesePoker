import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TrophyPlaceDisplay({ place, displayName, currentUser }) {
  const PLACE_SUFFIX = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'];

  return (
    <View style={styles.container}>
      <View style={styles.trophyAndPlace}>
        <View style={styles.trophy}>
          {place < 3 && <Ionicons name={'md-trophy'} size={30} color={place === 0 ? 'gold' : place === 1 ? 'gray' : 'brown'} />}
        </View>
        <View style={styles.placeAndSuffix}>
          <Text style={[styles.place, { color: currentUser ? 'rgb(217, 56, 27)' : null }]}>{place + 1}</Text>
          <Text style={[styles.placeSuffix, { color: currentUser ? 'rgb(217, 56, 27)' : null }]}>{PLACE_SUFFIX[place]}</Text>
        </View>
      </View>
      <Text style={[styles.displayName, { color: currentUser ? 'rgb(217, 56, 27)' : null }]}>{displayName}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 5
  },
  trophyAndPlace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '35%'
  },
  trophy: {
    width: '50%'
  },
  placeAndSuffix: {
    flexDirection: 'row',
    width: '50%'
  },
  place: {
    fontFamily: 'gang-of-three',
    fontSize: 25,
    fontWeight: 'bold'
  },
  placeSuffix: {
    fontFamily: 'gang-of-three',
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 20
  },
  displayName: {
    flex: 1,
    fontFamily: 'gang-of-three',
    fontSize: 22,
    marginLeft: 25
  }
})

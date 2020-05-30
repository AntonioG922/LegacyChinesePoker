import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TrophyPlaceDisplay({ place, displayName, currentUser, gamesWon }) {
  const PLACE_SUFFIX = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'];

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
      fontSize: 25,
    },
    placeSuffix: {
      fontSize: 15,
      lineHeight: 20
    },
    displayName: {
      flex: 1,
      fontSize: 22,
      marginLeft: 20
    },
    gamesWon: {
      fontSize: 20,
      marginLeft: 10
    },
    text: {
      fontFamily: 'gang-of-three',
      color: currentUser ? 'rgb(217, 56, 27)' : null
    }
  })

  return (
    <View style={styles.container}>
      <View style={styles.trophyAndPlace}>
        <View style={styles.trophy}>
          {place < 3 && <Ionicons name={'md-trophy'} size={30} color={place === 0 ? 'gold' : place === 1 ? 'gray' : 'brown'} />}
        </View>
        <View style={styles.placeAndSuffix}>
          <Text style={[styles.place, styles.text]}>{place + 1}</Text>
          <Text style={[styles.placeSuffix, styles.text]}>{PLACE_SUFFIX[place]}</Text>
        </View>
      </View>
      <Text style={[styles.displayName, styles.text]}>{displayName}</Text>
      <Text style={[styles.gamesWon, styles.text]}>{gamesWon}</Text>
    </View>
  )
}

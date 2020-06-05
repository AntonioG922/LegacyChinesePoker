import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function TrophyPlaceDisplay({ place, displayName, currentUser, gamesWon, playersPlayingAgain, playersNotPlayingAgain }) {
  const PLACE_SUFFIX = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      width: gamesWon !== null ? 275 : 250,
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
      marginLeft: 20,
      minWidth: 100
    },
    gamesWon: {
      fontSize: 20,
      marginLeft: 10
    },
    text: {
      fontFamily: 'gang-of-three',
      color: currentUser ? 'rgb(217, 56, 27)' : null
    },
    playingAgainIcon: {
      marginLeft: 15
    }
  });

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
      {gamesWon !== null && <Text style={[styles.gamesWon, styles.text]}>{gamesWon}</Text>}
      {Object.keys(playersPlayingAgain).find(key => playersPlayingAgain[key] === displayName)
        && <FontAwesome5 name={'check'} size={30} style={[styles.playingAgainIcon, { color: '#47ba00' }]} />
        || Object.keys(playersNotPlayingAgain).find(key => playersPlayingAgain[key] === displayName)
        && <FontAwesome5 name={'times'} size={30} style={[styles.playingAgainIcon, { color: 'rgb(150, 56, 27)' }]} />
        || <FontAwesome5 name={'check'} size={30} style={[styles.playingAgainIcon, { color: '#fff' }]} />}
    </View>
  )
}

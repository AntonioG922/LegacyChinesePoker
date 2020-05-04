import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight } from 'react-native';
import {getCardInfo} from './helperFunctions';

export function Card({rank, style, toggleSelected, }) {
  // cards are positioned based off their center
  const [cardInfo, setSuitAndNum] = useState(getCardInfo(rank));
  const [selected, setSelected] = useState(false);
  const [played, setPlayed] = useState(false);

  return (
    <TouchableHighlight underlayColor='#ddd' style={[styles.card, selected && styles.selected, style]} onPress={selectCard}>
      <View style={styles.cardWrapper}>
        <SuitAndRank cardNumber={rank} containerStyle={styles.upperIcon} numberStyle={styles.cardNumber} />
        <SuitAndRank cardNumber={rank} containerStyle={styles.bottomIcon} numberStyle={styles.cardNumber} />
      </View>
    </TouchableHighlight>
  );

  function selectCard() {
    setSelected(!selected);
    toggleSelected(rank);
  }
}

export function SuitAndRank({cardNumber, containerStyle, numberStyle}) {
  const cardInfo = getCardInfo(cardNumber);

  return (
      <View style={containerStyle}>
        <Text style={[{ color: cardInfo.color }, numberStyle ]}>{cardInfo.number}</Text>
        <MaterialCommunityIcons name={`cards-${cardInfo.suit}`} style={{ color: cardInfo.color }} size={20} />
      </View>
  );
}

export function CardBack(props) {
  return (
    <Image source={require('../assets/images/cardBacks/redDragon.png')} style={styles.cardBack} />
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: 75,
    height: 100,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1.5,
    borderRadius: 10,
    transform: [
      { translateY: -50 },
      { translateX: -37.5 }
    ]
  },
  upperIcon: {
    position: 'absolute',
    top: 5,
    left: 5
  },
  bottomIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    transform: [
      { rotateX: '180deg' },
      { scaleX: -1 }
    ]
  },
  cardNumber: {
    fontSize: 25
  },
  cardBack: {
    width: 75,
    height: 100,
    borderWidth: 1.5,
    borderRadius: 10
  },
  selected: {
    top: -25
  },
  cardWrapper: {
    height: 100,
  }
});

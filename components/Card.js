import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getCardInfo, SUITS } from '../functions/HelperFunctions';
import store from '../redux/store';

const SUIT_TO_ICON_NAME_MAP = {
  [SUITS.CLUB]: 'cards-club',
  [SUITS.DIAMOND]: 'cards-diamond',
  [SUITS.HEART]: 'cards-heart',
  [SUITS.SPADE]: 'cards-spade',
};

export function Card({ rank, style, toggleSelected, played = false }) {
  // cards are positioned based off their center
  const maxOffset = 50;
  const verticalOffset = Math.floor(Math.random() * maxOffset * (Math.random() * 2 - 1));
  const horizontalOffset = Math.floor(Math.random() * maxOffset * (Math.random() * 2 - 1));
  const rotation = Math.floor(Math.random() * 90 * (Math.random() * 2 - 1)) + 'deg';
  const [selected, setSelected] = useState(false);

  return (
    <TouchableHighlight
      underlayColor='#ddd'
      style={[styles.card, selected && styles.selected, style, played && [{ top: verticalOffset, left: horizontalOffset, transform: [{ rotateZ: rotation }] }]]}
      onPress={toggleSelected ? selectCard : null}>
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

export function SuitAndRank({ cardNumber, containerStyle, numberStyle }) {
  const cardInfo = getCardInfo(cardNumber);

  return (
    <View style={containerStyle}>
      <Text style={[{ color: cardInfo.color }, numberStyle]}>{cardInfo.number}</Text>
      <MaterialCommunityIcons name={SUIT_TO_ICON_NAME_MAP[cardInfo.suit]} style={{ color: cardInfo.color }} size={20} />
    </View>
  );
}

export function CardBack({ style }) {
  return (
    <Image source={require('../assets/images/cardBacks/redDragon.png')} style={[styles.cardBack, style]} />
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

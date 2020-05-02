import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export function Card(props) {
  const [cardInfo, setSuitAndNum] = useState(getCardInfo(props.rank));

  return (
    <View style={{ borderColor: cardInfo.color, ...styles.cardContainer, ...props.style }}>
      <View style={styles.upperIcon}>
        <Text style={{ color: cardInfo.color, ...styles.text }}>{cardInfo.number}</Text><MaterialCommunityIcons name={`cards-${cardInfo.suit}`} style={{ color: cardInfo.color }} size={20} />
      </View>
      <View style={styles.bottomIcon}>
        <Text style={{ color: cardInfo.color, ...styles.text }}>{cardInfo.number}</Text><MaterialCommunityIcons name={`cards-${cardInfo.suit}`} style={{ color: cardInfo.color }} size={20} />
      </View>
    </View>
  )
}

export function CardBack(props) {
  return (
    <Image source={require('../assets/images/cardBacks/redDragon.png')} style={styles.cardBack} />
  )
}


function getCardInfo(rank) {
  let cardInfo = { suit: '', number: '', color: 'black' };
  const suits = ['club', 'diamond', 'heart', 'spade'];
  const nums = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  if (rank === 53)
    return { suit: '$', number: '$', color: 'purple' }
  cardInfo.suit = suits[(rank - 1) % 4];
  if (cardInfo.suit === 'diamond' || cardInfo.suit === 'heart')
    cardInfo.color = 'red';
  cardInfo.number = nums[Math.floor((rank - 1) / 4)];
  return cardInfo;
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 75,
    height: 100.5,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderRadius: 10,
    transform: [
      { translateY: -50.25 },
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
  text: {
    fontSize: 25
  },

});
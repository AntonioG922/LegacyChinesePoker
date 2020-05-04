import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight } from 'react-native';

export function Card(props) {
  // cards are positioned based off their center
  const [cardInfo, setSuitAndNum] = useState(getCardInfo(props.rank));
  const [selected, setSelected] = useState(false);
  const [played, setPlayed] = useState(false);

  return (
    <TouchableHighlight underlayColor='#ddd' style={[styles.card, selected && styles.selected, props.style]} onPress={selectCard}>
      <View style={styles.cardWrapper}>
        <View style={styles.upperIcon}>
          <Text style={[{ color: cardInfo.color }, styles.cardNumber ]}>{cardInfo.number}</Text>
          <MaterialCommunityIcons name={`cards-${cardInfo.suit}`} style={{ color: cardInfo.color }} size={20} />
        </View>
        <View style={styles.bottomIcon}>
          <Text style={[{ color: cardInfo.color }, styles.cardNumber ]}>{cardInfo.number}</Text>
          <MaterialCommunityIcons name={`cards-${cardInfo.suit}`} style={{ color: cardInfo.color }} size={20} />
        </View>
      </View>
    </TouchableHighlight>
  );

  function selectCard() {
    setSelected(!selected);
  }
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
    return { suit: '$', number: 'J', color: 'purple' };
  cardInfo.suit = suits[(rank - 1) % 4];
  if (cardInfo.suit === 'diamond' || cardInfo.suit === 'heart')
    cardInfo.color = 'red';
  cardInfo.number = nums[Math.floor((rank - 1) / 4)];
  return cardInfo;
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
    top: 75,
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
    top: 50
  },
  cardWrapper: {
    height: 100,
  }
});

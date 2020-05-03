import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState } from 'react';
import { Button, View, Text, StyleSheet, Image, TouchableHighlight } from 'react-native';

import { ContainedButton } from './StyledText'

export function Card(props) {
  // cards are positioned based off their center
  const [cardInfo, setSuitAndNum] = useState(getCardInfo(props.rank));
  const [selected, setSelected] = useState(false);
  const [played, setPlayed] = useState(false);

  return (
    <TouchableHighlight underlayColor='#ddd' style={[styles.card, selected && styles.selected, props.style]} onPress={selectCard}>
      <View style={styles.cardWrapper}>
        <View style={styles.upperIcon}>
          <Text style={[{ color: cardInfo.color }, styles.cardNumber ]}>{cardInfo.number}</Text><MaterialCommunityIcons name={`cards-${cardInfo.suit}`} style={{ color: cardInfo.color }} size={20} />
        </View>
        <View style={styles.bottomIcon}>
          <Text style={[{ color: cardInfo.color }, styles.cardNumber ]}>{cardInfo.number}</Text><MaterialCommunityIcons name={`cards-${cardInfo.suit}`} style={{ color: cardInfo.color }} size={20} />
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

export function HorizontalCardContainer(props) {
  const [selectedCards, setSelectedCard] = useState([]);

  return (
    <View key={props.cards} style={[styles.horizontalContainer, props.style ]}>
      <View style={styles.actionsContainer}>
        <ContainedButton style={styles.actionButton}>Play</ContainedButton>
        <ContainedButton style={styles.actionButton}>Pass</ContainedButton>
      </View>
      <View style={styles.cardContainer}>
        {sortCards(props.cards).map((card, index) => (
          <Card key={card} rank={card} setSelected={setSelectedCard}
            style={{left: `${(100 / props.cards.length * (index + 1 / props.cards.length * index))}%`}}/>
        ))}
      </View>
    </View>
  )
}

export function FanCardContainer(props) {
  return (
    <View key={props.cards} style={{ ...styles.fanContainer, ...props.style }}>
      {props.cards.map((card, index) => (
        <Card key={card} rank={card}
          style={[{
            left: `${(80 / props.cards.length * index)}%`,
            bottom: Number(`${((Math.sin(Math.PI / props.cards.length * index)) * 60)}`),
            transform: [
              { rotate: `${-90 + (180 / props.cards.length * index)}deg` }
            ]}
          ]} />
      ))}
    </View>
  )
}

function sortCards(cards) {
  return cards.sort((a, b) => a - b);
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
  horizontalContainer: {
    alignItems: 'stretch',
    justifyContent: 'center',
    position: 'absolute',
    flexDirection: 'column',
  },
  cardContainer: {
    alignSelf: 'stretch',
    height: 75,
  },
  actionsContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButton: {
    margin: 10,
  },
  selected: {
    top: 50
  },
  cardWrapper: {
    height: 100,
  }
});
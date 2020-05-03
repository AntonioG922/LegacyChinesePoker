import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { ContainedButton } from './StyledText'
import { Card } from './Card'

export function UserCardContainer(props) {
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

const styles = StyleSheet.create({
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
});

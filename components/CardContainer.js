import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { ContainedButton } from './StyledText'
import {Card, SuitAndRank} from './Card'

export function UserCardContainer({cards, player, style, playCards}) {
  const [selectedCards, setSelectedCards] = useState([]);

  return (
      <View key={cards} style={[styles.horizontalContainer, style ]}>
        <View style={styles.actionsContainer}>
          <ContainedButton style={styles.actionButton} onPress={playSelectedCards}>Play</ContainedButton>
          <ContainedButton style={styles.actionButton}>Pass</ContainedButton>
        </View>
        <View style={styles.cardContainer}>
          {sortCards(cards).map((rank, index) => (
              <Card key={rank} rank={rank} toggleSelected={toggleSelected}
                    style={{left: `${(100 / cards.length * (index + 1 / cards.length * index))}%`}}/>
          ))}
        </View>
      </View>
  );

  function playSelectedCards() {
    if (selectedCards.length > 0) {
      playCards(selectedCards, player);
      setSelectedCards([]);
    }
  }

  function toggleSelected(rank) {
    if (selectedCards.includes(rank)) {
      setSelectedCards(selectedCards.filter((r) => r !== rank));
    } else {
      setSelectedCards(selectedCards.concat(rank));
    }
  }
}

export function PlayedCardsContainer({cards, lastPlayed, style}) {
  lastPlayed = Array.isArray(lastPlayed) ? lastPlayed : [];
  cards = Array.isArray(cards) ? cards : [];

  return (
      <View key={cards} style={style}>
        <View style={styles.lastPlayed}>
          {lastPlayed.map((card) =>
            <SuitAndRank key={card} cardNumber={card} containerStyle={styles.suitAndRank} numberStyle={styles.suitAndRankText} />
          )}
        </View>
        {cards.map((rank) => {
            const maxOffset = 50;
            const verticalOffset = Math.floor(Math.random() * maxOffset * (Math.random() * 2 - 1));
            const horizontalOffset = Math.floor(Math.random() * maxOffset * (Math.random() * 2 - 1));
            const rotation = Math.floor(Math.random() * 90 * (Math.random() * 2 - 1)) + 'deg';

            return <Card key={rank} rank={rank} style={{top: verticalOffset, left: horizontalOffset, transform: [{rotateZ: rotation}] }}/>
        })}
      </View>
  );
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
    top: 75,
    height: 75,
  },
  actionsContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButton: {
    margin: 10,
  },
  lastPlayed: {
    position: 'absolute',
    width: 250,
    top: -100,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suitAndRank: {
    flexDirection: 'row',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  suitAndRankText: {
    fontSize: 18
  }
});

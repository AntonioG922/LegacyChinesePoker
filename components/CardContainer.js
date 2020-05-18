import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { ContainedButton } from './StyledText'
import { Card, PlainCard, CardBack, SuitAndRank } from './Card'
import { HeaderText } from './StyledText';

export function UserCardContainer({ cards, errorMessage, errorCards, isCurrentPlayer, avatarImage, style, playCards, pass }) {
  const [selectedCards, setSelectedCards] = useState([]);

  return (
    <View key={cards} style={[styles.horizontalContainer, style]}>
      <Image source={avatarImage} style={[styles.avatar, { bottom: 60, right: -20 }, isCurrentPlayer && styles.currentPlayerAvatar]} />
      <View style={styles.errorMessage}>
        <HeaderText style={{ fontSize: 18 }}>{errorMessage}</HeaderText>
        {errorCards.map(cardNumber => <SuitAndRank cardNumber={cardNumber} containerStyle={styles.suitAndRank} numberStyle={styles.suitAndRankText} />)}
      </View>
      <View style={styles.actionsContainer}>
        <ContainedButton style={styles.actionButton} disabled={!isCurrentPlayer} onPress={pass}>Pass</ContainedButton>
        <ContainedButton style={styles.actionButton} disabled={!isCurrentPlayer} onPress={playSelectedCards}>Play</ContainedButton>
      </View>
      <View style={styles.cardContainer}>
        {sortCards(cards).map((rank, index) => (
          <Card key={rank} rank={rank} toggleSelected={toggleSelected}
            style={{ left: `${(100 / cards.length * (index + 1 / cards.length * index))}%` }} />
        ))}
      </View>
    </View>
  );

  function playSelectedCards() {
    if (selectedCards.length > 0) {
      if (playCards(selectedCards))
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

export function PlainCardContainer({ cards, style }) {
  return (
    <View key={cards} style={[styles.plainContainer, { left: 37.5 }, style]}>
      {sortCards(cards).map((rank, index) => (
        <Card key={rank} rank={rank} style={{ left: `${(100 / cards.length * (index + 1 / cards.length * index))}%` }} />
      ))}
    </View>
  )
}

export function FaceDownCardsContainer({ avatarImage, avatarStyling, numberOfCards, style, isCurrentPlayer }) {
  return (
    <View style={style}>
      {avatarImage && <Image source={avatarImage} style={[styles.avatar, isCurrentPlayer && styles.currentPlayerAvatar, avatarStyling]} />}
      {Array.from({ length: numberOfCards }, (v, i) => i).map(index =>
        <CardBack key={index} style={[{ borderColor: 'white', borderWidth: 3, position: 'absolute', left: `${(index / numberOfCards * 100)}%` }]} />)}
    </View>
  )
}

export function PlayedCardsContainer({ cards, avatarImage, lastPlayedCards, lastPlayerToPlay, style }) {
  lastPlayedCards = Array.isArray(lastPlayedCards) ? lastPlayedCards : [];
  cards = Array.isArray(cards) ? cards : [];

  return (
    <View style={style}>
      <View style={styles.lastPlayed}>
        <HeaderText style={styles.lastPlayedText}>{lastPlayerToPlay}</HeaderText>
        <View style={styles.lastPlayedCards}>
          {lastPlayedCards.length === 0 ?
            <View style={styles.suitAndRank}>
              <Image source={avatarImage} style={{ width: 20, height: 20, marginRight: 5 }} />
              <HeaderText> plays first</HeaderText>
            </View> :
            lastPlayedCards.map((card) =>
              <SuitAndRank key={card} cardNumber={card} containerStyle={styles.suitAndRank} numberStyle={styles.suitAndRankText} />
            )}
        </View>
      </View>
      {cards.map((rank) => {
        return <Card key={rank.toString()} rank={rank} played={true} />
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
            ]
          }
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
  plainContainer: {
  },
  animatedContainer: {
    justifyContent: 'center',
    flexDirection: 'column'
  },
  errorMessage: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  avatar: {
    position: 'absolute',
    right: -40,
    bottom: 10,
    width: 30,
    height: 30,
  },
  currentPlayerAvatar: {
    width: 45,
    height: 45,
  },
  currentPlayerChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: '#333',
    backgroundColor: '#444',
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 3,
    shadowOpacity: 1.0,
    position: 'absolute',
    bottom: 20,
    left: 20,
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
    top: -140,
  },
  lastPlayedCards: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lastPlayedText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  suitAndRank: {
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  suitAndRankText: {
    fontSize: 18
  }
});

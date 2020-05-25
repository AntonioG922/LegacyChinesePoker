import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

import HowToPlaySection from './HowToPlaySection';
import { PlainCardContainer } from '../components/CardContainer';
import { dealCards, releaseTheDragon, getRandomCard, getPair, getThreeOfAKind, getUnion, getStraight, getStraightFlush, getFullHouse, SUITS } from '../functions/HelperFunctions';
import { HeaderText } from '../components/StyledText';
import { Suit } from '../components/Card';

export function MainPage() {
  return (
    <HowToPlaySection
      pageTitle={'How To Play'}
      sectionText={'Swipe to navigate'}
    >
      <Text style={[styles.iconText, { fontSize: 25 }]}>Standard Game:</Text>
      <View style={{ textAlign: 'center', alignItems: 'center' }}>
        <FontAwesome name='group' size={50} style={{ marginBottom: 10 }} />
        <Text style={styles.iconText}>4 Players</Text>
      </View>
      <View style={{ textAlign: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name='cards' size={50} style={{ marginBottom: 10 }} />
        <Text style={styles.iconText}>13 Cards Each</Text>
      </View>
    </HowToPlaySection>
  )
}

export function Objective() {
  return (
    <HowToPlaySection
      pageTitle={'Objective'}
      sectionText={'The goal of the game is to get rid of all your cards before your opponents do'}
    >
      <PlainCardContainer cards={dealCards(false)[0].cards} style={{ width: '80%' }} />
    </HowToPlaySection>
  )
}

export function Rounds({ scrollToX }) {
  const windowWidth = useWindowDimensions().width;

  return (
    <HowToPlaySection
      pageTitle={'Rounds'}
    >
      <Text style={styles.iconText}>Play takes place in rounds{'\n\n'}A round starts with a player
           playing a playable hand type (see <Text style={{ textDecorationLine: 'underline' }}
          onPress={() => { scrollToX(windowWidth * 3) }}>"Hand Types"</Text>)
           {'\n\n'}Play continues clockwise and the next player must either play higher cards of the same hand type or pass
           {'\n'}(see <Text style={{ textDecorationLine: 'underline' }}
          onPress={() => { scrollToX(windowWidth * 4) }}>"Card Ranks"</Text>)
           {'\n\n'}Play continues like this until all other players pass on someones play, at which point the player
            with the winning hand starts a new round</Text>
    </HowToPlaySection>
  )
}

export function HandTypes({ scrollToX }) {
  const windowWidth = useWindowDimensions().width;

  return (
    <HowToPlaySection
      pageTitle={'Hand Types'}
      bottomSpacer={false}
    >
      <View style={styles.handTypeRow}>
        <View style={styles.handType}>
          <PlainCardContainer cards={getRandomCard()} style={{ left: 0 }} />
          <Text style={[styles.iconText, { top: 55 }]}>Single</Text>
        </View>
        <View style={[styles.handType, { left: 12 }]}>
          <PlainCardContainer cards={getPair()} style={{ left: 0, width: 35 }} />
          <Text style={[styles.iconText, { top: 55 }]}>Pair</Text>
        </View>
        <View style={styles.handType}>
          <PlainCardContainer cards={getThreeOfAKind()} style={{ left: 0, width: 60 }} />
          <Text style={[styles.iconText, { top: 55, flexShrink: 1 }]}>Three of a Kind</Text>
        </View>
      </View>
      <View style={[styles.handTypeRow, { justifyContent: 'space-around' }]}>
        <View style={[styles.handType, { left: -25 }]}>
          <PlainCardContainer cards={getUnion()} style={{ left: 0, width: 80 }} />
          <Text style={[styles.iconText, { top: 55, flexShrink: 1 }]}>Four of a Kind{'\n'}(See
              <Text style={{ textDecorationLine: 'underline' }} onPress={() => { scrollToX(windowWidth * 5) }}>"Unions"</Text>)</Text>
        </View>
        <View style={styles.handType}>
          <PlainCardContainer cards={getFullHouse()} style={{ left: 0, width: 100 }} />
          <Text style={[styles.iconText, { top: 55, flexShrink: 1 }]}>Full House</Text>
        </View>
      </View>
      <View style={[styles.handTypeRow, { justifyContent: 'space-around' }]}>
        <View style={[styles.handType, { left: 10 }]}>
          <PlainCardContainer cards={getStraight()} style={{ left: 0, width: 100 }} />
          <Text style={[styles.iconText, { top: 55, flexShrink: 1 }]}>Straight</Text>
        </View>
        <View style={[styles.handType, { left: 20 }]}>
          <PlainCardContainer cards={getStraightFlush()} style={{ left: 0, width: 100 }} />
          <Text style={[styles.iconText, { top: 55, flexShrink: 1 }]}>Straight Flush</Text>
        </View>
      </View>
    </HowToPlaySection>
  )
}

export function CardRanks() {
  const cardRankPair = getPair();

  return (
    <HowToPlaySection
      pageTitle={'Card Ranks'}
      bottomSpacer={false}
    >
      <View>
        <Text style={styles.iconText}>Cards are ranked in the following order from{'\n'}lowest(3) to highest(2)</Text>
      </View>
      <View style={{ marginVertical: 50 }}>
        <PlainCardContainer cards={releaseTheDragon()} style={{ width: '80%' }} />
      </View>
      <View>
        <Text style={styles.iconText}>Suits also matter. Suits are ranked alphabetically</Text>
      </View>
      <View style={styles.suitIcons} >
        <Suit suit={SUITS.CLUB} size={60} />
        <MaterialCommunityIcons name='less-than' style={styles.iconText} />
        <Suit suit={SUITS.DIAMOND} size={60} />
        <MaterialCommunityIcons name='less-than' style={styles.iconText} />
        <Suit suit={SUITS.HEART} size={60} />
        <MaterialCommunityIcons name='less-than' style={styles.iconText} />
        <Suit suit={SUITS.SPADE} size={60} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ marginVertical: 50, flexDirection: 'row', width: 150, justifyContent: 'space-between', alignItems: 'center' }}>
          <PlainCardContainer cards={[Math.min(...cardRankPair)]} style={{ left: 0 }} />
          <MaterialCommunityIcons name='less-than' style={styles.iconText} />
          <PlainCardContainer cards={[Math.max(...cardRankPair)]} style={{ left: 0 }} />
        </View>
      </View>
    </HowToPlaySection>
  )
}

export function Unions() {
  return (
    <HowToPlaySection
      pageTitle={'Unions'}
    >
      <View>
        <Text style={styles.iconText}>Unions are a Four of a Kind{'\n\n'}Unions are unique in that they
            can be played on any hand type and beat anything except for a higher union</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        <Text style={styles.iconText}>Any{'\n'}hand{'\n'}type</Text>
        <MaterialCommunityIcons name='less-than' style={[styles.iconText, { left: -25 }]} />
        <PlainCardContainer cards={getUnion()} style={{ left: 0, width: 120 }} />
      </View>
    </HowToPlaySection>
  )
}

export function Dragons() {
  return (
    <HowToPlaySection
      pageTitle={'Dragons'}
    >
      <View>
        <Text style={styles.iconText}>A Dragon is a 13 card straight{'\n\n'}If youre dealt a dragon
            you can immediately play your cards and win the game{'\n\n'}You can only play a dragon in a
            game with exactly 13 cards dealt</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <PlainCardContainer cards={releaseTheDragon()} style={{ left: 0, width: 300 }} />
      </View>
    </HowToPlaySection>
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 32,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionText: {
    fontFamily: 'gang-of-three',
    fontSize: 16,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
    fontWeight: '100',
  },
  cardContainer: {
    height: 140,
    transform: [
      { translateY: 70 }
    ]
  },
  iconText: {
    fontFamily: 'gang-of-three',
    fontSize: 22,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center'
  },
  handTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  handType: {
    alignItems: 'center',
    textAlign: 'center'
  },
  suitIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
})
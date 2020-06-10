import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Text, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ContainedButton } from './StyledText'
import { Card, CardBack, SuitAndRank, SuitedCard } from './Card'
import { HeaderText } from './StyledText';
import {
  getRank,
  JOKER,
  ORDERED_RANKS, ORDERED_SUITS, PLACE_SUFFIX,
  sortCards, SUITS
} from '../functions/HelperFunctions';

export function UserCardContainer({ cards, place, errorMessage, errorCards, isCurrentPlayer, avatarImage, style, playCards, pass }) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectingJoker, setSelectingJoker] = useState(false);
  const [jokerValue, setJokerValue] = useState(JOKER);

  return (
    <View key={cards} style={[styles.horizontalContainer, style]}>
      <Image source={avatarImage} style={[styles.avatar, { bottom: 60, right: -20 }, isCurrentPlayer && styles.currentPlayerAvatar]} />
      <View style={styles.errorMessage}>
        <HeaderText style={{ fontSize: 18 }}>{errorMessage}</HeaderText>
        {errorCards.map(cardNumber => <SuitAndRank cardNumber={cardNumber} containerStyle={styles.suitAndRank} numberStyle={styles.suitAndRankText} />)}
      </View>
      {place >= 0
        ? <Place place={place} />
        : <View>
          <View style={styles.actionsContainer}>
            {!selectingJoker && <ContainedButton style={styles.actionButton} disabled={!isCurrentPlayer} onPress={pass}>Pass</ContainedButton>}
            {!selectingJoker && <ContainedButton style={styles.actionButton} disabled={!isCurrentPlayer} onPress={playSelectedCards}>Play</ContainedButton>}
          </View>
          {selectingJoker && <JokerSelector setJoker={setJoker} />}
          <View style={styles.cardContainer}>
            {sortCards(cards).map((rank, index) => (
              <Card key={rank} rank={rank === JOKER ? jokerValue : rank} toggleSelected={toggleSelected}
                style={{ left: `${(100 / cards.length * (index + 1 / cards.length * index))}%` }} />
            ))}
          </View>
        </View>}

    </View>
  );

  function playSelectedCards() {
    if (selectedCards.length > 0) {
      if (selectedCards.includes(JOKER) && jokerValue === JOKER) {
        setSelectingJoker(true);
      } else if (playCards(selectedCards))
        setSelectedCards([]);
      setJokerValue(JOKER);
    }
  }

  function toggleSelected(rank) {
    if (selectedCards.includes(rank)) {
      setSelectedCards(selectedCards.filter((r) => r !== rank));
    } else {
      setSelectedCards(selectedCards.concat(rank));
    }
  }

  function setJoker(rank) {
    setJokerValue(rank);
    setSelectedCards(selectedCards.filter((rank) => rank !== JOKER).push(rank));
    // Update joker in DB to be selected card
    playSelectedCards();
    setSelectingJoker(false);
  }
}

function JokerSelector({ setJoker }) {
  const STATES = {
    SUIT: 0,
    RANK: 1
  };
  const [selectState, setSelectState] = useState(STATES.SUIT);
  const [selectedSuit, setSelectedSuit] = useState(SUITS.SPADE);

  function onSuitSelect(suit) {
    setSelectedSuit(suit);
    setSelectState(STATES.RANK);
  }

  function toggleSelected(rank) {
    setJoker(rank);
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {selectState === STATES.SUIT && ORDERED_SUITS.map((suit, index) =>
        <SuitedCard key={suit} suit={suit} onSelect={onSuitSelect} style={{ left: `${(100 / ORDERED_SUITS.length * (index + 1 / ORDERED_SUITS.length * index))}%` }} />)}
      {selectState === STATES.RANK && ORDERED_RANKS.slice(0, -1).map((rank, index) =>
        <Card key={rank} rank={getRank(rank, selectedSuit)} toggleSelected={toggleSelected} style={{ left: `${(100 / ORDERED_RANKS.length * (index + 1 / ORDERED_RANKS.length * index))}%` }} />)}
    </View>
  )
}

export function Place({ place }) {
  return (
    <View style={styles.placeContainer}>
      <HeaderText style={styles.place}>{place + 1}</HeaderText>
      <HeaderText style={styles.placeSuffix}>{PLACE_SUFFIX[place]}</HeaderText>
    </View>
  )
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

export function FaceDownCardsContainer({ avatarImage, avatarStyling, displayName, displayNameStyling, numberOfCards, style, isCurrentPlayer }) {
  return (
    <View style={style}>
      {avatarImage && <Image source={avatarImage} style={[styles.avatar, isCurrentPlayer && styles.currentPlayerAvatar, avatarStyling]} />}
      <HeaderText numberOfLines={1} style={[styles.displayName, displayNameStyling]}>{displayName}</HeaderText>
      {Array.from({ length: numberOfCards }, (v, i) => i).map(index =>
        <CardBack key={index} style={[{ borderColor: 'white', borderWidth: 3, position: 'absolute', left: `${(index / numberOfCards * 100)}%` }]} />)}
    </View>
  )
}

export function PlayedCardsContainer({ cards, avatarImage, lastPlayedCards, lastPlayerToPlay, style, turnLength, gameInProgress, pass, isCurrentPlayer }) {
  lastPlayedCards = Array.isArray(lastPlayedCards) ? lastPlayedCards : [];
  cards = Array.isArray(cards) ? cards : [];
  const showTimer = gameInProgress && lastPlayerToPlay && isCurrentPlayer;

  function Timer({ height, width, time, delay, borderWidth, color }) {
    function CountdownNum() {
      const [countdownNum, setCountdownNum] = useState(5);
      let reducingNum = 5;

      let fadeAnim = useRef(new Animated.Value(0)).current;
      let yPosAnim = useRef(new Animated.Value(-75)).current;
      const AnimatedText = Animated.createAnimatedComponent(Text);

      useEffect(() => {
        let interval;
        const intervalDelay = 1000;
        let timeout = setTimeout(() => {
          interval = setInterval(() => {
            Animated.sequence([
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 400
                }),
                Animated.timing(yPosAnim, {
                  toValue: -35,
                  duration: 400
                })
              ]),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 325,
                delay: 175
              }),
              Animated.timing(yPosAnim, {
                toValue: -75,
                duration: 75
              })
            ]).start();

            setCountdownNum(reducingNum);
            reducingNum--;
            if (reducingNum === -1) {
              clearInterval(interval);
              pass();
            }
          }, intervalDelay);
        }, time + delay - intervalDelay - countdownNum * 1000);
        return () => { clearTimeout(timeout), clearInterval(interval) };
      }, []);

      const styles = StyleSheet.create({
        countdownNum: {
          position: 'absolute',
          fontSize: 100,
          fontFamily: 'gang-of-three',
          color: 'rgb(217, 56, 27)',
          textShadowColor: 'black',
          textShadowRadius: 2,
          textShadowOffset: { width: 10, height: 10 }
        }
      })

      return (
        <AnimatedText style={[styles.countdownNum, { top: yPosAnim, opacity: fadeAnim }]}>{countdownNum}</AnimatedText>
      )
    }

    const AnimatedPath = Animated.createAnimatedComponent(Path);
    const strokeWidth = borderWidth;
    const { PI, cos, sin } = Math;
    const r = (height - strokeWidth) / 2;
    const cx = width - r - strokeWidth / 2;
    const cy = height / 2;
    const A = PI;
    const startAngle = 2 * PI * .75;
    const endAngle = 2 * PI * .25;
    const x1 = cx - r * cos(startAngle);
    const y1 = -r * sin(startAngle) + cy;
    const x2 = cx - r * cos(endAngle);
    const y2 = -r * sin(endAngle) + cy;
    const d = `
      M ${width / 2} ${0 + strokeWidth / 2}
      L ${width - x1} ${y2}
      A ${r} ${r} 0 1 0 ${width - x1} ${y1}
      L ${x2} ${y1}
      A ${r} ${r} 0 1 0 ${x2} ${y2}
      L ${width / 2} ${0 + strokeWidth / 2}
    `;

    const circumference = r * A;
    const strokePercentLeft = new Animated.Value(0);
    const length = (width - (2 * r + strokeWidth)) * 2 + (circumference * 2);

    let strokeDashoffset = strokePercentLeft.interpolate({
      inputRange: [0, 1],
      outputRange: [0, length],
      easing: Easing.linear
    });

    Animated.timing(strokePercentLeft, {
      toValue: 1,
      duration: time,
      delay: delay
    }).start();

    const styles = StyleSheet.create({
      container: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
      },
    })

    return (
      <View style={styles.container}>
        <Svg width={width} height={height}>
          <Path
            stroke={'black'}
            fill="none"
            strokeDasharray={`${length}`}
            {...{ d, strokeDashoffset, strokeWidth }}
          />
          <AnimatedPath
            key={borderWidth}
            stroke={color}
            fill="none"
            strokeDasharray={`${length}`}
            {...{ d, strokeDashoffset, strokeWidth }}
          />
        </Svg>
        <CountdownNum />
      </View>
    );
  }

  return (
    <View style={style}>
      <View style={styles.lastPlayed}>
        <HeaderText style={styles.lastPlayedText}>{lastPlayerToPlay}</HeaderText>
        <View style={[styles.lastPlayedCards, { borderWidth: showTimer ? 0 : 0 }]}>
          {lastPlayedCards.length === 0 ?
            <View style={styles.suitAndRank}>
              <Image source={avatarImage} style={{ width: 20, height: 20, marginRight: 5 }} />
              <HeaderText> plays first</HeaderText>
            </View> :
            lastPlayedCards.map((card) =>
              <SuitAndRank key={card} cardNumber={card} containerStyle={styles.suitAndRank} numberStyle={styles.suitAndRankText} />
            )}
          {showTimer && <Timer height={46} width={252} time={turnLength * 1000} delay={1000} color={'rgb(217, 56, 27)'} borderWidth={3} />}
        </View>
      </View>
      {cards.map((rank) => {
        return <Card key={rank} rank={rank} played={true} />
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
  displayName: {
    width: 150,
    position: 'absolute',
    left: 0,
    bottom: 10,
    fontSize: 30,
    textAlign: 'center'
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
  },
  placeContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '150%',
    marginLeft: '-30%',
    bottom: -50,
    borderColor: 'black',
    borderWidth: 2,
  },
  place: {
    textAlign: 'center',
    fontSize: 80
  },
  placeSuffix: {
    textAlign: 'center',
    fontSize: 48
  },
});

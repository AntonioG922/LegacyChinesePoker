import React, { useState, useEffect } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated
} from 'react-native';
import firebase from 'firebase';
import store from '../redux/store';

import { HeaderText, PlaceAndSuffix } from '../components/StyledText';
import TitledPage from '../components/TitledPage';
import { ScrollView } from "react-native-gesture-handler";
import {
  HAND_TYPES,
  MIN_NUMBER_PLAYERS, secondsToTime, GAME_TYPES, animateNextLayout
} from '../functions/HelperFunctions';
 const ALL = 'All';
const sliderValues = [ALL, 2, 3, 4, 5];
const sliderValueToGameTypeMap = {
  All: GAME_TYPES.ALL_GAMES,
  2: GAME_TYPES.TWO_PLAYER,
  3: GAME_TYPES.THREE_PLAYER,
  4: GAME_TYPES.FOUR_PLAYER,
  5: GAME_TYPES.FIVE_PLAYER,
};
const displayValueMap = {
  All: '',
  2: '2 player ',
  3: '3 player ',
  4: '4 player ',
  5: '5 player ',
};

export default function StatsScreen({ navigation }) {
  const user = store.getState().userData.user;
  const [userStats, setUserStats] = useState({});
  const [statsFetched, setStatsFetched] = useState(false);

  useEffect(() => {
    return firebase.firestore().collection('Stats').doc(user.uid)
      .onSnapshot((doc) => {
        setUserStats(doc.data());
        setStatsFetched(true);
      });
  }, []);

  return (
    <View style={{ flexGrow: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TitledPage navigation={navigation} pageTitle={'Stats'} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
          {statsFetched ? <Stats userStats={userStats} />
            : <HeaderText style={{ fontSize: 32 }}>Fetching Stats...</HeaderText>}
        </TitledPage>
      </ScrollView>
    </View>
  )
}

function Stats({ userStats }) {
  const [sliderValue, setSliderValue] = useState(ALL);
  const [hasPlayedGameType, setHasPlayedGameType] = useState(false);

  function onSliderSelect(sliderValue) {
    setSliderValue(sliderValue);
    setHasPlayedGameType(!!userStats && !!userStats[sliderValueToGameTypeMap[sliderValue]])
  }

  return (
    <View style={[{width: '100%'}]}>
      <Slider onSliderSelect={onSliderSelect} />
      {hasPlayedGameType &&
        <View>
          <UserPlacementStat userStats={userStats} gameType={sliderValueToGameTypeMap[sliderValue]} />
          <Divider subtitle={'Hands'} />
          <UserHandsStats handsStats={userStats[sliderValueToGameTypeMap[sliderValue]].hands} />
        </View>}
      {!hasPlayedGameType && <HeaderText fontSize={24} style={{ marginTop: 100, textAlign: 'center' }}>No {displayValueMap[sliderValue]}games played yet</HeaderText>}
    </View>
  )
}

function Slider({onSliderSelect}) {
  const [sliderValue, setSliderValue] = useState(ALL);
  const [sliderIndicatorMarginLeft, setSliderIndicatorMarginLeft] = useState(10);

  function onSelect(sliderValue) {
    setSliderValue(sliderValue);
    setSliderIndicatorMarginLeft(sliderValue === 'All' ? 10 :  10 + (sliderValue - MIN_NUMBER_PLAYERS + 1) * 60);
    onSliderSelect(sliderValue);
  }

  return (
      <View>
        <View style={styles.slider}>
          {sliderValues.map((sliderValue) =>
              <TouchableOpacity key={sliderValue} style={{ width: 60 }} onPress={() => onSelect(sliderValue)}>
                <HeaderText fontSize={24} center>{sliderValue}</HeaderText>
              </TouchableOpacity>)}
          <Animated.View style={[styles.sliderCurrentValue, { marginLeft: sliderIndicatorMarginLeft }]}>
            <HeaderText center fontSize={24} style={styles.sliderCurrentValueText}>{sliderValue}</HeaderText>
          </Animated.View>
        </View>
        <HeaderText center style={styles.sliderHelpText}>(Number of players)</HeaderText>
      </View>
  )
}

function UserPlacementStat({ userStats = {}, gameType }) {
  const [placements, setPlacements] = useState([]);
  const [totalGames, setTotalGames] = useState(1);
  const [playtime, setPlaytime] = useState(0);

  useEffect(() => {
    animateNextLayout();

    const gameTypeStats = userStats[gameType];
    const hasNotPlayedGamesForGameType = !gameTypeStats;
    if (hasNotPlayedGamesForGameType) {setTotalGames(0); return;}

    const p = gameType === GAME_TYPES.ALL_GAMES
        ? [1, 'last']
        : Array.from({length: Object.keys(sliderValueToGameTypeMap).find(key => sliderValueToGameTypeMap[key] === gameType)}).map((v, i) => i + 1);
    const placements = p.map((placement) => {return {place: placement, numberOfGames: gameTypeStats.placements && gameTypeStats.placements[placement] || 0}});

    setTotalGames(gameTypeStats.totalGames);
    setPlaytime(gameTypeStats.playtime);
    setPlacements(placements);
  }, [gameType]);

  return (
    <View>
      <NumberStat label={'Games'} number={totalGames} />
      <View style={styles.row}>
        {placements.map((placement) => {
          const label = typeof placement.place === 'string' ? <HeaderText fontSize={24}>{placement.place}</HeaderText> : <PlaceAndSuffix place={placement.place}/>;

          return <NumberStat key={placement.place}
                             label={label}
                             number={placement.numberOfGames}
                             percent={Math.floor(
                                 (placement.numberOfGames / Math.max(
                                     totalGames, 1)) * 100)}/>
        })}
      </View>
      <NumberStat label={'Playtime'} number={secondsToTime(playtime)} />
    </View>
  )
}

function UserHandsStats({ handsStats }) {
  const totalHands = Object.values(handsStats).reduce((n1, n2) => n1 + n2);

  function HandStat({ label, handType }) {
    const timesPlayed = handsStats[handType] || 0;

    return (
        <NumberStat label={label} number={timesPlayed} percent={Math.round((timesPlayed / totalHands) * 100)} style={{ flexGrow: 1 }} />
    )
  }

  return (
      <View>
        <NumberStat label={'Total Hands'} number={totalHands} />
        <View style={styles.row}>
          <HandStat label={'Singles'} handType={HAND_TYPES.SINGLE} />
          <HandStat label={'Pairs'} handType={HAND_TYPES.PAIR} />
        </View>
        <View style={styles.row}>
          <HandStat label={'3-of-a-Kind'} handType={HAND_TYPES.THREE_OF_A_KIND} />
          <HandStat label={'Full House'} handType={HAND_TYPES.FULL_HOUSE} />
        </View>
        <View style={styles.row}>
          <HandStat label={'Straight'} handType={HAND_TYPES.STRAIGHT} />
          <HandStat label={'Straight Flush'} handType={HAND_TYPES.STRAIGHT_FLUSH} />
        </View>
        <View style={styles.row}>
          <HandStat label={'Union'} handType={HAND_TYPES.UNION} />
        </View>
      </View>
  )
}

function NumberStat({ label, number, percent, inline, style }) {
  return (
    <View style={[{ paddingVertical: 10, alignItems: 'center' }, inline && { flexDirection: 'row-reverse', justifyContent: 'center' }, style]}>
      {typeof label === 'string' || typeof label === number ? <HeaderText center style={{ fontSize: 24 }}>{label}</HeaderText> : label}
      <HeaderText style={[{ fontSize: 24, color: 'grey', textAlign: 'center' }, inline && { marginLeft: 10 }]}>
        {number}
      </HeaderText>
      {percent !== undefined && <HeaderText center style={{ fontSize: 16, color: 'lightgrey' }}>
        ({percent}{'\uFE6A'})
          </HeaderText>}
    </View>
  )
}

function Divider({ subtitle, style }) {
  return (
    <View style={[styles.divider, style]}>
      <View style={styles.dividerLine} />
      <HeaderText style={{ fontSize: 32 }}>{subtitle}</HeaderText>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  divider: {
    paddingTop: 50,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    alignSelf: 'center',
    overflow: 'hidden'
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'grey',
    width: '35%',
    marginHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  slider: {
    backgroundColor: 'white',
    width: 320,
    height: 45,
    alignSelf: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'lightgrey'
  },
  sliderCurrentValue: {
    position: 'absolute',
    width: 60,
    height: 30,
    backgroundColor: 'rgb(217, 56, 27)',
    color: '#fff',
    borderRadius: 13,
    shadowColor: '#333',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 3,
    shadowOpacity: .3,
  },
  sliderCurrentValueText: {
    lineHeight: 30,
    color: '#fff',
  },
  sliderHelpText: {
    color: 'lightgrey',
    marginBottom: 30,
  },
});

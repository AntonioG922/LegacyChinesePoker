import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated
} from 'react-native';
import firebase from 'firebase';
import store from '../redux/store';

import { HeaderText, PlaceAndSuffix, Divider } from '../components/StyledText';
import TitledPage from '../components/TitledPage';
import { ScrollView } from "react-native-gesture-handler";
import {
  HAND_TYPES,
  MIN_NUMBER_PLAYERS, secondsToTime, GAME_TYPES, GAME_TYPE_BY_NUMBER_OF_PLAYERS, animateNextLayout
} from '../functions/HelperFunctions';

const ALL = 'All';
const sliderValues = [ALL, 2, 3, 4];
const displayValueMap = {
  All: '',
  2: '2 player ',
  3: '3 player ',
  4: '4 player ',
};

export default function StatsScreen({ navigation }) {
  const user = store.getState().userData.user;
  const [userStats, setUserStats] = useState({});
  const [statsFetched, setStatsFetched] = useState(false);
  const [sliderValue, setSliderValue] = useState(ALL);

  useEffect(() => {
    return firebase.firestore().collection('Stats').doc(user.uid)
      .onSnapshot((doc) => {
        setUserStats(doc.data());
        setStatsFetched(true);
      });
  }, []);

  return (
    <View style={{ flexGrow: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TitledPage navigation={navigation} pageTitle={'Stats'} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
          <Slider onSliderSelect={setSliderValue} />
          {statsFetched
            ? <View style={[{ width: '100%' }]}>
              {!!userStats && !!userStats[GAME_TYPE_BY_NUMBER_OF_PLAYERS[sliderValue]]
                ? <View>
                  <UserPlacementStat userStats={userStats} gameType={GAME_TYPE_BY_NUMBER_OF_PLAYERS[sliderValue]} />
                  <Divider subtitle={'Hands'} />
                  <UserHandsStats handsStats={userStats[GAME_TYPE_BY_NUMBER_OF_PLAYERS[sliderValue]].hands || {}} />
                </View>
                : <HeaderText style={styles.statusDisplayText}>No {displayValueMap[sliderValue]}games played yet</HeaderText>}
            </View>
            : <HeaderText style={styles.statusDisplayText}>Fetching Stats...</HeaderText>}
        </TitledPage>
      </ScrollView>
    </View>
  )
}

function Slider({ onSliderSelect }) {
  const [sliderValue, setSliderValue] = useState(ALL);
  const [sliderIndicatorMarginLeft, setSliderIndicatorMarginLeft] = useState(10);

  function onSelect(sliderValue) {
    setSliderValue(sliderValue);
    setSliderIndicatorMarginLeft(sliderValue === 'All' ? 10 : 10 + (sliderValue - MIN_NUMBER_PLAYERS + 1) * 60);
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
    if (hasNotPlayedGamesForGameType) { setTotalGames(0); return; }

    const p = gameType === GAME_TYPES.ALL_GAMES
      ? [1, 'last']
      : Array.from({ length: Object.keys(GAME_TYPE_BY_NUMBER_OF_PLAYERS).find(key => GAME_TYPE_BY_NUMBER_OF_PLAYERS[key] === gameType) }).map((v, i) => i + 1);
    const placements = p.map((placement) => { return { place: placement, numberOfGames: gameTypeStats.placements && gameTypeStats.placements[placement] || 0 } });

    setTotalGames(gameTypeStats.totalGames);
    setPlaytime(Math.round(gameTypeStats.playtime / 1000));
    setPlacements(placements);
  }, [gameType]);

  return (
    <View>
      <NumberStat label={'Games'} number={totalGames} />
      <View style={styles.row}>
        {placements.map((placement) => {
          const label = typeof placement.place === 'string' ? <HeaderText fontSize={24}>{placement.place}</HeaderText> : <PlaceAndSuffix place={placement.place} />;

          return <NumberStat key={placement.place}
            label={label}
            number={placement.numberOfGames}
            percent={Math.floor(
              (placement.numberOfGames / Math.max(
                totalGames, 1)) * 100)} />
        })}
      </View>
      <NumberStat label={'Playtime'} number={secondsToTime(playtime)} />
    </View>
  )
}

function UserHandsStats({ handsStats }) {
  let totalCards = 0;
  if (Object.keys(handsStats).length) {
    Object.keys(handsStats).forEach(key => {
      if (key === HAND_TYPES.PAIR) {
        totalCards += handsStats[key] * 2;
      } else if (key === HAND_TYPES.THREE_OF_A_KIND) {
        totalCards += handsStats[key] * 3;
      } else if (key === HAND_TYPES.FULL_HOUSE || key === HAND_TYPES.STRAIGHT || key === HAND_TYPES.STRAIGHT_FLUSH) {
        totalCards += handsStats[key] * 5;
      } else if (key === HAND_TYPES.UNION) {
        totalCards += handsStats[key] * 4;
      } else {
        totalCards += handsStats[key];
      }
    });
  }

  function HandStat({ label, handType }) {
    let timesPlayed = handsStats[handType] || 0;
    if (handType === HAND_TYPES.PAIR) {
      timesPlayed *= 2;
    } else if (handType === HAND_TYPES.THREE_OF_A_KIND) {
      timesPlayed *= 3;
    } else if (handType === HAND_TYPES.FULL_HOUSE || handType === HAND_TYPES.STRAIGHT || handType === HAND_TYPES.STRAIGHT_FLUSH) {
      timesPlayed *= 5;
    } else if (handType === HAND_TYPES.UNION) {
      timesPlayed *= 4;
    }

    return (
      <NumberStat label={label} number={timesPlayed} percent={Math.round((timesPlayed / (totalCards || 1)) * 100)} style={{ flexGrow: 1 }} />
    )
  }

  return (
    <View>
      <NumberStat label={'Cards Played'} number={totalCards} />
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

const styles = StyleSheet.create({
  statusDisplayText: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  slider: {
    backgroundColor: 'white',
    width: 260,
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

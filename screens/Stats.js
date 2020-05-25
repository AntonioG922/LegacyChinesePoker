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
  MAX_NUMBER_PLAYERS,
  MIN_NUMBER_PLAYERS, secondsToTime
} from '../functions/HelperFunctions';

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
  return (
      <View style={{width: '100%'}}>
        <Divider subtitle={'Lifetime'} style={{paddingTop: 0}} />
        <TotalStats userStats={userStats} />
        <Divider subtitle={'Per Game'} />
        <UserPlacementStat placementStats={userStats.placement} />
        <Divider subtitle={'Hands'} />
        <UserHandsStats handsStats={userStats.hands} />
        <Divider subtitle={'Time'} />
        <TimeStats userStats={userStats} />
      </View>
  )
}

function TotalStats({ userStats }) {
  return (
      <View>
        <View>
          <NumberStat label={'Total Games'} number={userStats.totalGames} />
          <View style={styles.row}>
            <NumberStat label={'Wins'} number={userStats.totalWins} percent={Math.round((userStats.totalWins / userStats.totalGames) * 100)} />
            <NumberStat label={'Losses'} number={userStats.totalLosses} percent={Math.round((userStats.totalLosses / userStats.totalGames) * 100)} />
          </View>
          <View style={{paddingVertical: 10}}>
            <HeaderText center style={{fontSize: 24}}>Playtime</HeaderText>
            <HeaderText  style={{fontSize: 24, color: 'grey', textAlign: 'center'}}>
              {secondsToTime(userStats.totalGameTime)}
            </HeaderText>
          </View>
        </View>
      </View>
  )
}

function UserHandsStats({ handsStats }) {
  const totalHands = Object.values(handsStats).reduce((n1, n2) => n1 + n2);

  function HandStat({ label, handType }) {
    return (
      <NumberStat label={label} number={handsStats[handType]} percent={Math.round((handsStats[handType] / totalHands) * 100)} style={{ flexGrow: 1 }} />
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

/**
 * Placement stats schema:
 *  # of players
 *  `-> placement (i.e. 1, 2, 3, 4, 5)
 *      `-> game finish timestamp
 *          `-> user's hand (arr)
 *
 */
function UserPlacementStat({ placementStats = {} }) {
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [filteredData, setFilteredData] = useState([]);
  const [totalGames, setTotalGames] = useState(1);

  useEffect(() => {
    if (Object.keys(placementStats).length === 0) {
      return;
    }
    const currentData = placementStats[numberOfPlayers];
    const td = Array.from({ length: numberOfPlayers }).map((v, i) => i + 1);

    const transformedCurrentData = td.map((placement) => {
      return {
        place: placement,
        numberOfGames: currentData === undefined || currentData[placement] === undefined ? 0 : Object.keys(currentData[placement]).length
      }
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilteredData(transformedCurrentData);
    setTotalGames(transformedCurrentData.map((placementData) => placementData.numberOfGames).reduce((n1, n2) => n1 + n2));
  }, [numberOfPlayers]);

  function Slider() {
    const fontSize = 24;
    const sliderOptions = Array.from({ length: MAX_NUMBER_PLAYERS - MIN_NUMBER_PLAYERS + 1 }).map((v, i) => i + MIN_NUMBER_PLAYERS);

    return (
      <View style={styles.slider}>
        {sliderOptions.map((sliderValue) =>
          <TouchableOpacity key={sliderValue} style={{ flexGrow: 1 }} onPress={() => setNumberOfPlayers(sliderValue)}>
            <HeaderText fontSize={fontSize} center>{sliderValue}</HeaderText>
          </TouchableOpacity>)}
        <Animated.View style={[styles.sliderCurrentValue, { marginLeft: 5 + (numberOfPlayers - MIN_NUMBER_PLAYERS) * 60 }]}>
          <HeaderText center fontSize={fontSize} style={styles.sliderCurrentValueText}>{numberOfPlayers}</HeaderText>
        </Animated.View>
      </View>
    )
  }

  return (
    <View>
      <Slider />
      {totalGames > 0
        ?
        <View>
          <NumberStat label={'Games'} number={totalGames} />
          <View style={styles.row}>
            {filteredData.map((placementInfo) =>
              <NumberStat key={placementInfo.place}
                label={<PlaceAndSuffix place={placementInfo.place} />}
                number={placementInfo.numberOfGames}
                percent={Math.floor((placementInfo.numberOfGames / Math.max(totalGames, 1)) * 100)} />
            )}
          </View>
        </View>
        : <HeaderText fontSize={24} style={{ paddingTop: 30 }}>No {numberOfPlayers} player games played yet</HeaderText>}
    </View>
  )
}

function TimeStats({ userStats }) {
  const totalHands = Object.values(userStats.hands).reduce((n1, n2) => n1 + n2);

  return (
      <View>
        <NumberStat label={'Average Time To Play'} number={secondsToTime(Math.round(userStats.totalPlayTime / totalHands))} />
      </View>
  )
}

function NumberStat({ label, number, percent, inline, style }) {
  return (
    <View style={[{ paddingVertical: 10 }, inline && { flexDirection: 'row-reverse', justifyContent: 'center' }, style]}>
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
      <HeaderText style={{ fontSize: 16, alignSelf: 'flex-start', textAlign: 'center', width: '35%' }}>{subtitle}</HeaderText>
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
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'grey',
    marginTop: 20,
    marginBottom: 10,
    width: '35%',
    marginLeft: -30,
    marginRight: 30,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  slider: {
    backgroundColor: 'white',
    width: 240,
    height: 45,
    alignSelf: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'lightgrey'
  },
  sliderCurrentValue: {
    position: 'absolute',
    width: 50,
    height: 30,
    backgroundColor: 'rgb(217, 56, 27)',
    color: '#fff',
    borderRadius: 20,
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
});

import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HeaderText } from '../components/StyledText';
import { MainPage, Objective, Rounds, HandTypes, CardRanks, Unions, Dragons } from '../components/HowToPlayPages';
import NavBar from '../components/NavBar';
import store, { setHowToPlaySection } from '../redux/store';

export default function HowToPlayScreen({ navigation }) {
  const windowWidth = useWindowDimensions().width;
  const scrollRef = useRef();

  function handleScroll(e) {
    let xPos = e.nativeEvent.contentOffset.x;
    if (xPos % windowWidth == 0) {
      store.dispatch(setHowToPlaySection(xPos / windowWidth));
    }
  }

  function scrollToX(x) {
    scrollRef.current.scrollTo({ x: x, animated: true });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled={true}
        decelerationRate={'fast'}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollRef}
      >
        <MainPage />
        <Objective />
        <Rounds scrollToX={scrollToX} />
        <HandTypes scrollToX={scrollToX} />
        <CardRanks />
        <Unions />
        <Dragons />
      </ScrollView>

      <NavBar numPages={7} scrollRef={scrollToX} />
      <HeaderText style={styles.backArrow}>
        <Ionicons size={40} name='md-arrow-round-back' onPress={() => navigation.goBack()} />
      </HeaderText>

    </View >

    /*
      <Text style={[styles.sectionText, styles.lastSection]}>
        Legends have been told of the dragon. Tales as tall as giants. It's
        been said to be an untameable beast with nothing that can possibly
        stop it. They say those who have seen it have never lived to tell the
        tale. Only the rider of the dragon can speak to its glory as they
        leave nothing but ash in their wake. To glimpse the dragon, one must
        be dealt 1 card of every rank, 3-through-2. The knave who manages
        this feat immediately claims victory over their opponents, leaving
        them in a bitter dusty trail of defeat.
        </Text> */
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingBottom: 20
  },
  backArrow: {
    position: 'absolute',
    top: 30,
    left: 30
  }
});

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';

import { HeaderText, PageTitle } from '../components/StyledText';
import { TitledPage } from '../components/Template';

export default function HowToPlayScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TitledPage pageTitle={'How To Play'} navigation={navigation}>
        <HeaderText style={styles.sectionHeader}>Objective</HeaderText>
        <Text style={styles.sectionText}>
          The goal of the game is to be the first player to get rid of all their cards.
        </Text>
        <HeaderText style={styles.sectionHeader}>Setup</HeaderText>
        <Text style={styles.sectionText}>
          Dealing begins with the player to the left of the dealer and proceeds
          clockwise. Each player is dealt 13 cards.
        </Text>
        <HeaderText style={styles.sectionHeader}>Gameplay</HeaderText>
        <Text style={styles.sectionText}>
          Play consists of rounds with a designated poker hand type. All  The
          player who has the 3<MaterialCommunityIcons name={'cards-club'} />
          will begin the game. They can play whatever type of poker they would
          like. Play then proceeds to the person to their left who must either
          1) play higher card(s) of the same type or 2) pass and play nothing.
          Play continues clockwise until all players pass on a given player.
        </Text>
        <HeaderText style={styles.sectionHeader}>Unions</HeaderText>
        <Text style={styles.sectionText}>
          A union is a 4-of-a-kind and is very powerful in the game. It can be
          played at any time, regardless of the current hand type, and will
          beat anything except for a higher union.
        </Text>
        <HeaderText style={styles.sectionHeader}>Dragon</HeaderText>
        <Text style={[styles.sectionText, styles.lastSection]}>
          Legends have been told of the dragon. Tales as tall as giants. It's
          been said to be an untameable beast with nothing that can possibly
          stop it. They say those who have seen it have never lived to tell the
          tale. Only the rider of the dragon can speak to its glory as it they
          leave nothing but ash in their wake. To glimpse the dragon, one must
          be dealt 1 card of every rank, 3-through-2. The knave who manages
          this feat immediately claims victory over their opponents, leaving
          them in a bitter dusty trail of defeat.
        </Text>
      </TitledPage>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingBottom: 30,
  },
  contentContainer: {
    paddingTop: 15,
  },
  lastSection: {
    paddingBottom: 30,
  },
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
});

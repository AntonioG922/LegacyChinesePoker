import { configureStore, getDefaultMiddleware, createSlice } from "@reduxjs/toolkit";
import {dealCards} from '../functions/HelperFunctions';

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: {
    user: {}
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.user = action.payload;
    },
    clearUserInfo: (state) => {
      state.user = {}
    }
  }
});

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState: {
    gameName: '',
    numberOfPlayers: 0,
    players: {},
    currentPlayerTurn: 0,
    playersLeftToJoin: 0,
    lastPlayerToPlay: '',
    playedCards: [],
    currentPlayerTurnIndex: 0,
  },
  reducers: {
    setGameState: (state, action) => {
      state.game = action.payload;
    },
    clearGameState: (state) => {
      state.user = {
        gameName: '',
        numberOfPlayers: 0,
        players: {},
        currentPlayerTurn: 0,
        playersLeftToJoin: 0,
        lastPlayerToPlay: '',
        playedCards: [],
        currentPlayerTurnIndex: 0,
      }
    },
  }
});

export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;
export const { setGameState, clearGameState } = gameStateSlice.actions;

export const store = configureStore({
  reducer: {
    userInfo: userInfoSlice.reducer,
    gameState: gameStateSlice.reducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  })
});

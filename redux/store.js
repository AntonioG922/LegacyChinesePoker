import { configureStore, getDefaultMiddleware, createSlice } from "@reduxjs/toolkit";
import { dealCards } from '../functions/HelperFunctions';

const userDataSlice = createSlice({
  name: 'userData',
  initialState: {},
  reducers: {
    setUserData(state, action) {
      state.user = action.payload;
    },
    clearUserData(state) {
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

export const { setUserData, clearUserData } = userDataSlice.actions;

export default store = configureStore({
  reducer: {
    userData: userDataSlice.reducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  })
});

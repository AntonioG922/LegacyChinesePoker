import { configureStore, getDefaultMiddleware, createSlice } from "@reduxjs/toolkit";

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
})

export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;

export const store = configureStore({
  reducer: {
    userInfo: userInfoSlice.reducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  })
});

import { configureStore, getDefaultMiddleware, createSlice } from "@reduxjs/toolkit";

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
})

export const { setUserData, clearUserData } = userDataSlice.actions;

export default store = configureStore({
  reducer: {
    userInfo: userDataSlice.reducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  })
});

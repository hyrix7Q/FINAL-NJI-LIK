import { createSlice } from "@reduxjs/toolkit";

const tokenSlice = createSlice({
  name: "tokenSlice",
  initialState: {
    token: null,
    fetched: false,
  },
  reducers: {
    setToken: (state, action) => {
      console.log(
        "DKHEL L REDUCERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR"
      );
      state.fetched = true;
      state.token = action.payload;
    },
  },
});

export const { setToken } = tokenSlice.actions;

export default tokenSlice.reducer;

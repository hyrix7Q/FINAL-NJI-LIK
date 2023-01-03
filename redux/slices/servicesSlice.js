import { createSlice } from "@reduxjs/toolkit";

const servicesSlice = createSlice({
  name: "servicesSlice",
  initialState: {
    services: [],
    fetched: false,
  },
  reducers: {
    setServices: (state, action) => {
      console.log(
        "ITI SIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
        action.payload
      );
      state.fetched = true;
      state.services = action.payload;
    },
  },
});

export const { setServices } = servicesSlice.actions;

export default servicesSlice.reducer;

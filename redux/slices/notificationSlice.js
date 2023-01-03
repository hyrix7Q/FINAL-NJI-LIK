import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notificationSlice",
  initialState: {
    notifications: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
  },
});

export const { setNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;

import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import notificationSlice from "./slices/notificationSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import servicesSlice from "./slices/servicesSlice";
import tokenSlice from "./slices/tokenSlice";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

export const persistConfig = {
  key: "expoToken",
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, tokenSlice);

export const store = configureStore(
  {
    reducer: {
      token: persistedReducer,
      services: servicesSlice,
      notifications: notificationSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  },
  applyMiddleware(thunk)
);
export const persistor = persistStore(store);

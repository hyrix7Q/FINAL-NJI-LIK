import { Alert, StyleSheet, Text, View } from "react-native";
import NavContainer from "./navigation/navigationContainer";
import Login from "./Screens/Authentication/Login";
import Register from "./Screens/Authentication/Register";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavContainer />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

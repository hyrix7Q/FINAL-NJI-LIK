import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { store } from "../redux/store";
import { setToken } from "../redux/slices/tokenSlice";

export const getExpoToken = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("TOKEN------------", token);
    store.dispatch(setToken(token));
  } else {
    alert("Must use physical device for Push Notifications");
  }
};

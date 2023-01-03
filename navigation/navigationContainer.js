import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import {
  AdminNavigator,
  AuthNavigator,
  DrawerNavigator,
} from "./navigationApp";
import { Alert } from "react-native";
// import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useNotifications } from "../useNotifications";
import { useSelector } from "react-redux";

const NavContainer = () => {
  const [user, setUser] = useState();
  const [isAdmin, setIsAdmin] = useState();
  const { registerForPushNotificationsAsync, handleNotificationResponse } =
    useNotifications();

  const tokenSlice = useSelector((state) => state.token);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("VERIFIED ???", user.emailVerified);

        if (user.emailVerified || user.email === "admin@gmail.com") {
          setUser(user);
        } else {
          signOut(auth);
          Alert.alert("Please verify your Email !", "Check the spam folder");
        }
      } else {
        setUser(null);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const getJobs = async () => {
      if (user) {
        if (auth.currentUser.email === "admin@gmail.com") setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    getJobs();
  }, [user]);

  // useEffect(() => {
  //   messaging()
  //     .getToken()
  //     .then((token) => {
  //       console.log(`TOKEN -------------> ${token}`);
  //     });
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
  //   });

  //   messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  //     Alert.alert(
  //       "Message handled in the background!",
  //       JSON.stringify(remoteMessage)
  //     );
  //   });

  //   return unsubscribe;
  // }, []);

  useEffect(() => {
    registerForPushNotificationsAsync(tokenSlice.fetched);
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    return () => {
      if (responseListener) {
        Notifications.removeNotificationSubscription(responseListener);
      }
    };
  }, []);
  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : isAdmin ? (
        <AdminNavigator />
      ) : (
        <DrawerNavigator />
      )}
    </NavigationContainer>
  );
};

export default NavContainer;

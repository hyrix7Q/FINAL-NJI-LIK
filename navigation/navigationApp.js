import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../firebase/firebaseConfig";
import { setNotifications } from "../redux/slices/notificationSlice";
import { setServices } from "../redux/slices/servicesSlice";
import Login from "../Screens/Authentication/Login";
import Register from "../Screens/Authentication/Register";
import AcceptedDates from "../Screens/Home/Admin/AcceptedDates";
import Dates from "../Screens/Home/Admin/Dates";
import EditDate from "../Screens/Home/Admin/editDate";
import EditService from "../Screens/Home/Admin/EditService";
import Home from "../Screens/Home/Admin/Home";
import DatePick from "../Screens/Home/DatePick";
import Intro from "../Screens/Home/Intro";
import MyDates from "../Screens/Home/MyDates";

//Auth Stacks
const AuthStack = createStackNavigator();
//Client Stacks
const ClientDrawer = createDrawerNavigator();
const ClientHomeStack = createStackNavigator();
//Admin Stacks
const AdminDrawer = createDrawerNavigator();
const AdminHomeStack = createStackNavigator();
const AdminDatesStack = createStackNavigator();
const AdminAcceptedDatesStack = createStackNavigator();

const ClientHomeNavigator = () => {
  return (
    <ClientHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientHomeStack.Screen name="Home" component={Intro} />
      <ClientHomeStack.Screen name="DatePick" component={DatePick} />
    </ClientHomeStack.Navigator>
  );
};

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
    </AuthStack.Navigator>
  );
};

export const DrawerNavigator = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );

  useEffect(() => {
    // const fetchServices = async () => {
    //   const coll = collection(db, "Services");
    //   const snap = await getDocs(coll);
    //   let Services = [];
    //   snap.docs.forEach((doc) => {
    //     Services.push({ serviceId: doc.id, ...doc.data() });
    //   });

    //   return Services;
    // };
    // fetchServices().then((res) => {
    //   dispatch(setServices(res));
    // });

    const unsub = onSnapshot(collection(db, "Services"), (querySnapShot) => {
      let services = [];
      querySnapShot.forEach((doc) => {
        services.push({ serviceId: doc.id, ...doc.data() });
      });

      dispatch(setServices(services));
    });
    return unsub;
  }, []);
  const [datesNotif, setDatesNotif] = useState();

  useEffect(() => {
    const fetchNewDatesNotif = async () => {
      const collRef = collection(db, "Dates");
      const q = query(
        collRef,
        where("accepted", "==", true),
        where("seen", "==", false),
        where("userId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      return snap.docs.length;
    };
    fetchNewDatesNotif().then((res) => {
      dispatch(setNotifications(res));
    });
  }, []);
  return (
    <ClientDrawer.Navigator
      screenOptions={{
        activeTintColor: "white",
        headerShown: false,
        drawerActiveTintColor: "#B08200",
        drawerInactiveTintColor: "black",
      }}
      drawerContent={(props) => <DeliveryCustomDrawerContent {...props} />}
    >
      <ClientDrawer.Screen name="Home" component={ClientHomeNavigator} />
      <ClientDrawer.Screen
        name="Mes Dates"
        component={MyDates}
        options={{
          drawerIcon: () => (
            <View style={{ position: "relative" }}>
              <Image
                source={require("../assets/notification.png")}
                style={{ height: 25, width: 25 }}
              />
              {notifications === 0 ? null : (
                <View
                  style={{
                    backgroundColor: "red",
                    position: "absolute",
                    left: -3,
                    top: -5,
                    width: 20,
                    height: 20,
                    alignItems: "center",
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white" }}>{notifications}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </ClientDrawer.Navigator>
  );
};

const AdminHomeNavigator = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    // const fetchServices = async () => {
    //   const coll = collection(db, "Services");
    //   const snap = await getDocs(coll);
    //   let Services = [];
    //   snap.docs.forEach((doc) => {
    //     Services.push({ serviceId: doc.id, ...doc.data() });
    //   });

    //   return Services;
    // };
    // fetchServices().then((res) => {
    //   dispatch(setServices(res));
    // });
    const unsub = onSnapshot(collection(db, "Services"), (querySnapShot) => {
      let services = [];
      querySnapShot.forEach((doc) => {
        services.push({ serviceId: doc.id, ...doc.data() });
      });
      console.log("SERVIIIIIIIIICE", services);
      dispatch(setServices(services));
    });
    return unsub;
  }, []);
  return (
    <AdminHomeStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminHomeStack.Screen name="Home" component={Home} />
      <AdminHomeStack.Screen name="EditService" component={EditService} />
    </AdminHomeStack.Navigator>
  );
};

const AdminDatesNavigator = () => {
  return (
    <AdminDatesStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminDatesStack.Screen name="DatesPage" component={Dates} />
      <AdminDatesStack.Screen name="EditDate" component={EditDate} />
    </AdminDatesStack.Navigator>
  );
};

const AdminAcceptedDatesNavigator = () => {
  return (
    <AdminAcceptedDatesStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminAcceptedDatesStack.Screen
        name="DatesPage"
        component={AcceptedDates}
      />
      <AdminAcceptedDatesStack.Screen name="EditDate" component={EditDate} />
    </AdminAcceptedDatesStack.Navigator>
  );
};

export const AdminNavigator = () => {
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchNewDatesNotif = async () => {
      const collRef = collection(db, "Dates");
      const q = query(
        collRef,
        where("accepted", "==", false),
        where("seen", "==", false)
      );
      const snap = await getDocs(q);
      return snap.docs.length;
    };
    fetchNewDatesNotif().then((res) => {
      console.log(res);
      dispatch(setNotifications(res));
    });
  }, []);
  return (
    <AdminDrawer.Navigator
      screenOptions={{
        activeTintColor: "white",
        headerShown: false,
        drawerActiveTintColor: "#B08200",
        drawerInactiveTintColor: "black",
      }}
      drawerContent={(props) => <DeliveryCustomDrawerContent {...props} />}
    >
      <AdminDrawer.Screen name="Home" component={AdminHomeNavigator} />
      <AdminDrawer.Screen
        name="Dates"
        component={AdminDatesNavigator}
        options={{
          drawerIcon: () => (
            <View style={{ position: "relative" }}>
              <Image
                source={require("../assets/notification.png")}
                style={{ height: 25, width: 25 }}
              />
              {notifications === 0 ? null : (
                <View
                  style={{
                    backgroundColor: "red",
                    position: "absolute",
                    left: -3,
                    top: -5,
                    width: 20,
                    height: 20,
                    alignItems: "center",
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white" }}>{notifications}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <AdminDrawer.Screen
        name="Dates Acceptées"
        component={AdminAcceptedDatesNavigator}
        options={{
          drawerIcon: () => (
            <View style={{ position: "relative" }}>
              <Image
                source={require("../assets/accepted.png")}
                style={{ height: 25, width: 25 }}
              />
            </View>
          ),
        }}
      />
    </AdminDrawer.Navigator>
  );
};

function DeliveryCustomDrawerContent(props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View
        style={{
          height: "20%",
          paddingLeft: 12,
          borderBottomWidth: 1,
          borderBottomColor: "grey",
          justifyContent: "center",
          marginBottom: 10,
          backgroundColor: "#D09A00",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginBottom: 10 }}>
            <Image
              source={require("../assets/avatar.png")}
              style={{ height: 60, width: 60, borderRadius: 25 }}
            />
          </View>
        </View>
        <Text style={{ fontSize: 20, color: "black", fontWeight: "bold" }}>
          {auth.currentUser.displayName}
        </Text>
      </View>
      <DrawerItemList {...props} />

      <View
        style={{
          position: "absolute",
          bottom: 30,
          width: "100%",
          alignSelf: "center",
          borderTopWidth: 1,
          borderTopColor: "grey",

          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setIsSubmitting(true);
            signOut(auth)
              .then(() => {
                setIsSubmitting(false);
              })
              .catch((error) => {
                setIsSubmitting(false);

                Alert.alert(
                  "Error has occurred",
                  "Signout did not complete , Try again",
                  [{ text: "Okay" }]
                );
              });
          }}
          style={{
            marginTop: 20,
            backgroundColor: "#D09A00",
            alignItems: "center",
            paddingVertical: 10,

            width: "60%",
            borderRadius: 25,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Déconnecter
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { setServices } from "../../redux/slices/servicesSlice";
import { setToken } from "../../redux/slices/tokenSlice";

const Intro = ({ navigation }) => {
  const servicesSlice = useSelector((state) => state.services);
  const [services, setServicesState] = useState(servicesSlice.services);
  const [error, setError] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    setServicesState(servicesSlice.services);
  }, [servicesSlice]);
  const fetchServices = async () => {
    setError(false);
    const coll = collection(db, "Serices");
    const snap = await getDocs(coll).catch((err) => {
      setError(err);
      Alert.alert("There was an error getting services !", err, [
        {
          text: "Try Again",
          onPress: () => {
            fetchServices().then((res) => {
              setServicesState(res);
              dispatch(setServices(res));
            });
          },
        },
      ]);
    });

    let Services = [];
    snap.docs.forEach((doc) => {
      Services.push({ serviceId: doc.id, ...doc.data() });
    });

    return Services;
  };

  useEffect(() => {
    if (!servicesSlice.fetched) {
      fetchServices().then((res) => {
        setServicesState(res);
        dispatch(setServices(res));
      });
    }
  }, []);

  return (
    <SafeAreaView
      style={{
        marginTop: "5%",
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 25,
      }}
    >
      {/* Texts*/}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.toggleDrawer();
          }}
        >
          <Image
            source={require("../../assets/menu.png")}
            style={{ height: 35, width: 35 }}
          />
        </TouchableOpacity>
        <View style={{ alignItems: "center", flex: 1, paddingRight: 30 }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#D09A00" }}>
            NJI LIK
          </Text>
          <Text style={{ color: "#D09A00" }}>
            Bonjour{" "}
            <Text style={{ fontWeight: "bold", color: "#D09A00" }}>
              {auth.currentUser.displayName}
            </Text>{" "}
            !
          </Text>
        </View>
      </View>
      {/* SERVICES */}
      <View style={{ alignItems: "center", flex: 1 }}>
        {error ? (
          <TouchableOpacity
            onPress={() => {
              fetchServices().then((res) => {
                setServicesState(res);
                dispatch(setServices(res));
              });
            }}
          >
            <Text>Retry</Text>
          </TouchableOpacity>
        ) : null}
        {services ? (
          <FlatList
            data={services}
            numColumns={1}
            renderItem={(order) => (
              <>
                <TouchableOpacity
                  style={{
                    marginHorizontal: 15,
                    marginVertical: 20,
                    height: 230,
                    width: 150,
                    borderRadius: 25,
                    overflow: "hidden",
                    backgroundColor: "#E9E9E9",
                  }}
                  onPress={() => {
                    navigation.navigate("DatePick", { service: order.item });
                  }}
                >
                  <Image
                    source={{ uri: order.item.image }}
                    style={{ height: "70%", width: "100%" }}
                  />
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 5,
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>
                      {order.item.serviceName}
                    </Text>
                    <Text>{order.item.price}DA</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default Intro;

import {
  View,
  Text,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseConfig";
import { TouchableOpacity } from "react-native-gesture-handler";
import { collection, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setServices } from "../../../redux/slices/servicesSlice";

const Home = ({ navigation }) => {
  const servicesSlice = useSelector((state) => state.services);
  const [services, setServicesState] = useState(servicesSlice.services);

  const dispatch = useDispatch();

  useEffect(() => {
    setServicesState(servicesSlice.services);
  }, [servicesSlice]);

  useFocusEffect(
    useCallback(() => {
      const fetchServices = async () => {
        const coll = collection(db, "Services");
        const snap = await getDocs(coll);
        let Services = [];
        snap.docs.forEach((doc) => {
          Services.push({ serviceId: doc.id, ...doc.data() });
        });

        return Services;
      };
      if (!servicesSlice.fetched) {
        fetchServices().then((res) => {
          setServicesState(res);
          dispatch(setServices(res));
        });
      }
    }, [])
  );

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
            source={require("../../../assets/menu.png")}
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

      {/* CONTENT */}
      <View style={{ alignSelf: "center", marginVertical: 30 }}>
        <Text style={{ color: "grey" }}>
          Bonjour admin , Vous éditez vos services ici !
        </Text>
      </View>
      <View style={{ width: "100%" }}>
        {services?.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: "row",
              marginBottom: 20,
              borderRadius: 20,
              overflow: "hidden",
              width: "90%",
              alignSelf: "center",
              backgroundColor: "#E9E9E9",
              height: 95,
            }}
            onPress={() => {
              navigation.navigate("EditService", { service });
            }}
          >
            <View>
              <Image
                source={{ uri: service.image }}
                style={{ height: "100%", width: 100 }}
              />
            </View>
            <View
              style={{
                paddingVertical: 5,
                paddingHorizontal: 5,
                flex: 1,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {service.serviceName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 40,
                  marginTop: 20,
                  marginLeft: "auto",
                }}
              >
                <Image
                  source={require("../../../assets/edit.png")}
                  style={{ height: 28, width: 28 }}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Home;

import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../redux/slices/notificationSlice";
import MyDatesComponent from "../../components/Client/MyDatesComponent";

const MyDates = ({ navigation }) => {
  const [dates, setDates] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const serviceSlice = useSelector((state) => state.services);

  const dispatch = useDispatch();

  const fetchMyDates = async () => {
    /* USE ONSNAPSHOT FOR BETTER USER EXPERIENCE */
    setIsRefreshing(true);
    const coll = collection(db, "Dates");
    const q = query(
      coll,
      where("userId", "==", auth.currentUser.uid),
      orderBy("Date", "desc")
    );
    const snap = await getDocs(q);
    let tempDates = [];
    snap.docs.forEach((doc) => {
      const service = serviceSlice.services.filter(
        (service) => service.serviceId === doc.data().serviceId
      );
      console.log(service);
      tempDates.push({
        dateId: doc.id,
        ...doc.data(),
        service: service[0],
      });

      console.log(new Date(doc.data().Date.seconds));
    });
    setIsRefreshing(false);
    return tempDates;
  };
  useEffect(() => {
    fetchMyDates().then(async (res) => {
      setDates(res);
      await Promise.all(
        res.map(async (date) => {
          if (!date.seen && date.accepted) {
            const docRef = doc(db, "Dates", date.dateId);
            await updateDoc(docRef, { seen: true });
            dispatch(setNotifications(0));
          }
        })
      );
    });
  }, []);

  //func to get new value of state on the child component
  const setNewDatesOnChild = (res) => {
    setDates(res);
  };

  return (
    <View
      style={{
        marginTop: "5%",
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 25,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.toggleDrawer();
          }}
          style={{ alignSelf: "center" }}
        >
          <Image
            source={require("../../assets/menu.png")}
            style={{ height: 35, width: 35 }}
          />
        </TouchableOpacity>
        <View style={{ alignItems: "center", flex: 1, paddingRight: 30 }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#D09A00" }}>
            Mes Dates
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              fetchMyDates().then((res) => {
                setDates(res);
              });
            }}
          />
        }
        style={{ alignSelf: "center", marginTop: 50 }}
      >
        {dates ? (
          dates.length === 0 ? (
            <View>
              <Text>Vous n'avez pas de dates !</Text>
            </View>
          ) : (
            dates?.map((date, index) =>
              isRefreshing ? (
                <ActivityIndicator size="large" color="#D09A00" key={index} />
              ) : (
                <MyDatesComponent
                  date={date}
                  key={index}
                  fetchMyDates={fetchMyDates}
                  setNewDatesOnChild={setNewDatesOnChild}
                />
              )
            )
          )
        ) : null}
      </ScrollView>
    </View>
  );
};

export default MyDates;

import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  collection,
  deleteDoc,
  doc,
  FieldPath,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../../firebase/firebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { setNotifications } from "../../../redux/slices/notificationSlice";
import AcceptedDatesComponent from "../../../components/Admin/AcceptedDatesComponent";
import { useFocusEffect } from "@react-navigation/native";

const AcceptedDates = ({ navigation }) => {
  const serviceSlice = useSelector((state) => state.services);
  const [services, setServices] = useState(serviceSlice.services);
  const [selectedService, setSelectedService] = useState(
    serviceSlice.services[0].serviceId
  );
  const [selectedServiceInfos, setSelectedServiceInfos] = useState(
    serviceSlice.services[0]
  );
  const [dates, setDates] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateToFetch, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullDate, setFullDate] = useState();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [time, setTime] = useState("");
  const [fetchAllDates, setFetchAllDates] = useState(true);
  const [lastDoc, setLastDoc] = useState();
  const [searchType, setSearchType] = useState("All");

  const dispatch = useDispatch();

  const fetchServices = async () => {
    const coll = collection(db, "Services");
    const snap = await getDocs(coll);
    let Services = [];
    snap.docs.forEach((doc) => {
      Services.push({ serviceId: doc.id, ...doc.data() });
    });

    return Services;
  };

  const fetchDates = async (date) => {
    setIsRefreshing(true);

    const collRef = collection(db, "Dates");
    if (searchType === "All") {
      var q = query(
        collRef,
        where("serviceId", "==", selectedService),
        where("accepted", "==", true),
        orderBy("Date", "desc"),
        limit(6)
      );
    } else {
      const year = new Date(date ? date : dateToFetch)
        .toISOString()
        .slice(0, 4);
      const month = new Date(date ? date : dateToFetch)
        .toISOString()
        .slice(5, 7);
      const day = new Date(date ? date : dateToFetch)
        .toISOString()
        .slice(8, 10);
      const datePicked = new Date(`${year}-${month}-${day}T00:00`);
      var q = query(
        collRef,
        where("serviceId", "==", selectedService),
        where("accepted", "==", true),
        where("Date", ">=", datePicked),
        where("Date", "<=", new Date(`${year}-${month}-${day}T23:59`)),
        orderBy("Date", "desc"),
        limit(6)
      );
    }
    const snap = await getDocs(q);
    let newDates = [];
    snap.docs.forEach((doc) => {
      newDates.push({
        dateId: doc.id,
        ...doc.data(),
        service: selectedServiceInfos,
      });
    });
    setIsRefreshing(false);
    setLastDoc(snap.docs[snap.docs.length - 1]);
    return newDates;
  };

  useFocusEffect(
    useCallback(() => {
      fetchDates().then(async (res) => {
        setDates(res);
        await Promise.all(
          res.map(async (date) => {
            if (!date.seen && !date.accepted) {
              const docRef = doc(db, "Dates", date.dateId);
              await updateDoc(docRef, { seen: true });
              dispatch(setNotifications(0));
            }
          })
        );
      });
    }, [selectedService, searchType])
  );

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setDate(date);
    hideDatePicker();
    fetchDates(date).then(async (res) => {
      setDates(res);
      await Promise.all(
        res.map(async (date) => {
          if (!date.seen && !date.accepted) {
            const docRef = doc(db, "Dates", date.dateId);
            await updateDoc(docRef, { seen: true });
            dispatch(setNotifications(0));
          }
        })
      );
    });
  };
  const fetchMore = async (date) => {
    setIsSubmitting(true);
    if (lastDoc) {
      const collRef = collection(db, "Dates");

      if (searchType === "All") {
        console.log("IT IS");
        var q = query(
          collRef,
          where("serviceId", "==", selectedService),
          where("accepted", "==", false),
          orderBy("Date", "desc"),
          limit(6),
          startAfter(lastDoc)
        );
      } else {
        const year = new Date(date ? date : dateToFetch)
          .toISOString()
          .slice(0, 4);
        const month = new Date(date ? date : dateToFetch)
          .toISOString()
          .slice(5, 7);
        const day = new Date(date ? date : dateToFetch)
          .toISOString()
          .slice(8, 10);
        const datePicked = new Date(`${year}-${month}-${day}T00:00`);
        var q = query(
          collRef,
          where("serviceId", "==", selectedService),
          where("accepted", "==", false),
          where("Date", ">=", datePicked),
          where("Date", "<=", new Date(`${year}-${month}-${day}T23:59`)),
          orderBy("Date", "desc"),
          limit(6),
          startAfter(lastDoc)
        );
      }

      const snap = await getDocs(q);
      let newDates = [];
      snap.docs.forEach((doc) => {
        newDates.push({
          dateId: doc.id,
          ...doc.data(),
          service: selectedServiceInfos,
        });
      });
      setDates((prev) => [...prev, ...newDates]);
      if (snap.docs.length !== 0) {
        setLastDoc(snap.docs[snap.docs.length - 1]);
      }
    }
    setIsSubmitting(false);
  };
  //updating state from child component
  const setNewDatesOnChild = (res) => {
    setDates(res);
  };
  return (
    <View style={styles.container}>
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
            Dates acceptées
          </Text>
        </View>
      </View>
      {/* FILTERS */}
      <View
        style={{
          width: 250,
          alignSelf: "center",
          marginTop: Platform.OS === "ios" ? 2 : 10,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: "grey",
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          Veuillez choisir un service
        </Text>
        <Picker
          selectedValue={selectedServiceInfos}
          onValueChange={(itemValue, itemIndex) => {
            console.log(itemValue);
            setSelectedService(itemValue.serviceId);
            setSelectedServiceInfos(itemValue);
          }}
        >
          {serviceSlice.services?.map((service, index) => (
            <Picker.Item
              key={index}
              label={service.serviceName}
              value={service}
            />
          ))}
        </Picker>
        <View
          style={{
            alignSelf: "center",
            flexDirection: "row",

            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 5,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSearchType("All");
            }}
            style={{
              backgroundColor: searchType === "All" ? "#D09A00" : null,
              paddingHorizontal: 10,
              paddingVertical: 1,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: searchType === "All" ? "white" : "black",
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              Avoir tout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSearchType("Date");
            }}
            style={{
              backgroundColor: searchType === "Date" ? "#D09A00" : null,
              paddingHorizontal: 10,
              paddingVertical: 1,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: searchType === "Date" ? "white" : "black",
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              Choisis une date
            </Text>
          </TouchableOpacity>
        </View>
        {searchType === "Date" ? (
          <View>
            <TouchableOpacity
              style={{
                marginTop: 10,
                flexDirection: "row",
                paddingHorizontal: 20,
                justifyContent: "space-between",
                backgroundColor: "#F0F0F0",
                borderRadius: 20,
                width: "80%",
                alignItems: "center",
              }}
              onPress={() => {
                showDatePicker();
                setTime("date");
              }}
            >
              <Text style={{ color: "grey", fontSize: 21 }}>
                {dateToFetch
                  ? dateToFetch.toISOString().slice(0, 10)
                  : "Pick a Date"}
              </Text>
              <Image
                source={require("../../../assets/date.png")}
                style={{ height: 25, width: 25 }}
              />
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode={time}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* DATES */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              fetchDates().then((res) => {
                setDates(res);
              });
            }}
          />
        }
        style={{ alignSelf: "center", marginTop: 20 }}
      >
        {dates?.map((date, index) =>
          isRefreshing ? (
            <ActivityIndicator size="large" color="#D09A00" key={index} />
          ) : (
            <AcceptedDatesComponent
              date={date}
              key={index}
              fetchDates={fetchDates}
              navigation={navigation}
              setNewDatesOnChild={setNewDatesOnChild}
            />
          )
        )}
      </ScrollView>
      {isSubmitting ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <Text
          onPress={() => {
            fetchMore();
          }}
          style={{
            alignSelf: "center",
            fontSize: 21,
            fontWeight: "bold",
            marginBottom: 10,
          }}
        >
          Plus
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: "5%",
    backgroundColor: "white",
    paddingHorizontal: 25,
  },
});
export default AcceptedDates;

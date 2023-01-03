import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { Wilayas } from "../../data/Wilayas";
import { Hours } from "../../data/Hours";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { sendNotification } from "../../functions/sendNotification";

const DatePick = ({ route, navigation }) => {
  const { service } = route.params;
  const [time, setTime] = useState("");
  const [fullDate, setFullDate] = useState();
  const [timeDate, setTimeDate] = useState();
  const [teamName, setTeamName] = useState();
  const [commune, setCommune] = useState();
  const [addressExact, setAddressExact] = useState();
  const [availableHoursState, setAvailableHoursState] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setFullDate(date);

    hideDatePicker();
    fetchAvailableHours(date);
  };
  const fetchAvailableHours = async (date) => {
    const year = new Date(date).toISOString().slice(0, 4);
    const month = new Date(date).toISOString().slice(5, 7);
    const day = new Date(date).toISOString().slice(8, 10);
    const datePicked = new Date(`${year}-${month}-${day}T00:00`);

    const q = query(
      collection(db, "Dates"),
      where("Date", ">=", datePicked),
      where("Date", "<=", new Date(`${year}-${month}-${day}T23:59`))
    );
    let busyHours = [];
    await getDocs(q).then((res) => {
      res.forEach((doc) => {
        busyHours.push(
          new Date(doc.data().Date.seconds * 1000).toISOString().slice(11, 13)
        );
        console.log("fetching", busyHours);
      });
    });
    let tempHours = Hours;
    let availableHours = [];

    availableHours = tempHours.filter(
      (item) => !busyHours.includes(item.slice(0, 2))
    );

    setAvailableHoursState(availableHours);
  };
  const onSubmit = async () => {
    setIsSubmitting(true);
    const year = new Date(fullDate).toISOString().slice(0, 4);
    const month = new Date(fullDate).toISOString().slice(5, 7);
    const day = new Date(fullDate).toISOString().slice(8, 10);
    const hour = timeDate.toString().slice(0, 2);
    console.log(fullDate.toString(), year, month, day, hour);
    addDoc(collection(db, "Dates"), {
      Date: new Date(`${year}-${month}-${day}T${hour}:00`),
      Commune: commune,
      AddressExact: addressExact,
      serviceId: service.serviceId,
      userId: auth.currentUser.uid,
      accepted: false,
      seen: false,
    })
      .then(async () => {
        const docRef = collection(db, "users");
        const q = query(docRef, where("isAdmin", "==", true));
        const snap = await getDocs(q);
        const adminsTokens = [];
        snap.docs.forEach((doc) => {
          if (doc.data().expoToken) {
            adminsTokens.push(doc.data().expoToken);
          }
        });
        return adminsTokens;
      })
      .then(async (adminsTokens) => {
        console.log("TOKEEEENS", adminsTokens);
        adminsTokens.forEach(async (token) => {
          const title = "New Order";
          const body = `You have a new order on ${new Date(
            `${year}-${month}-${day}T${hour}:00`
          ).toISOString()}!`;
          await sendNotification(token, title, body);
        });
        setIsSubmitting(false);
        Alert.alert(
          "Votre date a été fixée avec succès",
          "Un administrateur acceptera votre commande bientôt ! (Si l'administrateur modifie l'heure, vous recevrez une notification)",
          [
            {
              text: "Okay",
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      })
      .catch((err) => {
        setIsSubmitting(false);
        Alert.alert("Erreur en placement de rendez-vous", err, [
          { text: "Okay" },
        ]);
      });
  };

  return (
    <ScrollView style={{ marginTop: "7%", flex: 1, backgroundColor: "whit" }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}
      >
        <TouchableOpacity
          style={{ marginRight: 20 }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../assets/goBack.png")}
            style={{ height: 40, width: 40 }}
          />
        </TouchableOpacity>
        <View>
          <Text style={{ color: "#D09A00", fontSize: 23, fontWeight: "bold" }}>
            Choisis une date
          </Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 0 }}>
        <View style={{ alignItems: "center", position: "relative" }}>
          <View
            style={{
              borderWidth: 0,
              borderColor: "grey",
              shadowColor: "#000",
              shadowOffset: {
                height: 3,
              },
              elevation: 10,

              overflow: "hidden",
              height: 200,
              width: "100%",
            }}
          >
            <Image
              source={{ uri: service.image }}
              style={{ height: "100%", width: "100%" }}
            />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 20,
              width: "100%",
              alignItems: "center",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 40, color: "white" }}>
              {service?.serviceName}
            </Text>
          </View>
        </View>
        <View
          style={{ alignItems: "center", paddingHorizontal: 30, marginTop: 15 }}
        >
          <Text style={{ color: "black", fontSize: 20, fontWeight: "600" }}>
            Veuillez remplir les informations{" "}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 30 }}>
          <View style={{ width: "100%" }}>
            <TouchableOpacity
              style={{
                marginTop: 20,
                flexDirection: "row",
                paddingHorizontal: 10,
                paddingVertical: 15,
                width: "100%",
                justifyContent: "space-between",
                backgroundColor: "white",
                borderRadius: 5,
                marginBottom: 5,

                borderBottomWidth: 2,
                borderColor: "#A9A9A9",
                alignItems: "center",
              }}
              onPress={() => {
                showDatePicker();
                setTime("date");
              }}
            >
              <Text style={{ color: "grey", fontSize: 16 }}>
                {fullDate
                  ? fullDate.toISOString().slice(0, 10)
                  : "Choisis une date"}
              </Text>
              <Image
                source={require("../../assets/date.png")}
                style={{ height: 25, width: 25 }}
              />

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode={time}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </TouchableOpacity>

            {availableHoursState ? (
              <View
                style={{
                  backgroundColor: "white",
                  width: "100%",
                  marginTop: "5%",
                  borderRadius: 5,
                  borderBottomWidth: 2,
                  borderColor: "#A9A9A9",
                }}
              >
                <Picker
                  selectedValue={timeDate ? timeDate : "Choisissez une heure"}
                  style={{ width: "100%", borderRadius: 20 }}
                  onValueChange={(itemValue, itemIndex) => {
                    setTimeDate(itemValue);
                  }}
                >
                  {availableHoursState.map((hour, index) => (
                    <Picker.Item key={index} label={hour} value={hour} />
                  ))}
                </Picker>
              </View>
            ) : null}
          </View>
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              marginTop: "5%",
              borderRadius: 5,
              borderBottomWidth: 2,
              borderColor: "#A9A9A9",
            }}
          >
            <Picker
              selectedValue={commune}
              style={{ width: "100%", borderRadius: 20 }}
              onValueChange={(itemValue, itemIndex) => {
                setCommune(itemValue);
              }}
            >
              {Wilayas.map((wilaya, index) => (
                <Picker.Item
                  key={index}
                  label={wilaya.commune_name_ascii}
                  value={wilaya.commune_name_ascii}
                />
              ))}
            </Picker>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 5,
              paddingHorizontal: 10,
              paddingVertical: 15,
              marginVertical: 20,
              width: "100%",
              borderBottomWidth: 2,
              borderColor: "#A9A9A9",
            }}
          >
            <TextInput
              style={{
                flexGrow: 1,
                maxWidth: "90%",
                fontSize: 16,
              }}
              placeholderTextColor="grey"
              placeholder="Address exact"
              onChangeText={(text) => {
                setAddressExact(text);
              }}
            />
            <Image
              source={require("../../assets/address.png")}
              style={{ width: 30, height: 30 }}
            />
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              onSubmit();
            }}
            disabled={!commune || !addressExact || isSubmitting || !timeDate}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                style={{ color: "white", fontSize: 21, fontWeight: "bold" }}
              >
                Sauver
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: "#D09A00",
    paddingHorizontal: 60,
    paddingVertical: 7,
    borderRadius: 25,
    alignSelf: "center",
    marginTop: 25,
    elevation: 4,
  },
});
export default DatePick;

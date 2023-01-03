import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";

import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import { Hours } from "../../../data/Hours";
import { sendNotification } from "../../../functions/sendNotification";

const EditDate = ({ navigation, route }) => {
  const { date } = route.params;
  const [userInfos, setUserInfos] = useState();
  const [time, setTime] = useState("");
  const [fullDate, setFullDate] = useState();
  const [timeDate, setTimeDate] = useState();

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
  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", date.userId);
      const snap = await getDoc(docRef);
      return snap.data();
    };
    fetchUser().then((res) => {
      setUserInfos(res);
    });
  }, []);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const year = new Date(fullDate).toISOString().slice(0, 4);
    const month = new Date(fullDate).toISOString().slice(5, 7);
    const day = new Date(fullDate).toISOString().slice(8, 10);
    const hour = timeDate.toString().slice(0, 2);
    await updateDoc(doc(db, "Dates", date.dateId), {
      Date: new Date(`${year}-${month}-${day}T${hour}:00`),
    })
      .then(async () => {
        const userToken = userInfos?.expoToken;
        const title = "Mise a jour de rendez-vous";
        const body = `Votre date a été modifié par l'administrateur
        !`;
        if (userToken) {
          await sendNotification(userToken, title, body);
        }
      })
      .then(() => {
        setIsSubmitting(false);
        Alert.alert("Votre date a été mise à jour avec succès", "", [
          {
            text: "Okay",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      })
      .catch((err) => {
        Alert.alert(
          "Une erreur s'est produite lors de la mise à jour de la date        ",
          err,
          [{ text: "Réessayer" }]
        );
      });
  };
  return (
    <View
      style={{
        marginTop: "5%",
        backgroundColor: "white",
        flex: 1,
        paddingHorizontal: 25,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{ marginRight: 20 }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../../assets/goBack.png")}
            style={{ height: 40, width: 40 }}
          />
        </TouchableOpacity>
        <View>
          <Text style={{ color: "#D09A00", fontSize: 23, fontWeight: "bold" }}>
            Modifier la date
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop: 30 }}>
        <Text style={{ color: "grey", fontSize: 15 }}>
          Veuillez appeler le client avant de modifier la date !
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 3,
            borderColor: "red",
            borderRadius: 25,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
          onPress={() => {
            Linking.openURL(`tel:${userInfos?.phoneNumber}`);
          }}
        >
          <Image
            source={require("../../../assets/call.png")}
            style={{ height: 30, width: 30, marginRight: 20 }}
          />
          <Text style={{ fontSize: 18 }}>{userInfos?.phoneNumber}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ alignSelf: "center", marginTop: 50 }}>
        <TouchableOpacity
          style={{
            marginTop: 20,
            flexDirection: "row",
            paddingHorizontal: 20,
            justifyContent: "space-between",
            backgroundColor: "#F0F0F0",
            borderRadius: 20,
            width: "60%",
            alignItems: "center",
          }}
          onPress={() => {
            showDatePicker();
            setTime("date");
          }}
        >
          <Text style={{ color: "grey", fontSize: 21 }}>
            {fullDate
              ? fullDate.toISOString().slice(0, 10)
              : "Choisis une date"}
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

        {availableHoursState ? (
          <View
            style={{
              backgroundColor: "white",
              width: 220,
              marginTop: "5%",
            }}
          >
            <Picker
              selectedValue={
                timeDate ? timeDate : "Choisissez une heure              "
              }
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
      <TouchableOpacity
        style={{
          backgroundColor: "#D09A00",
          paddingHorizontal: 90,
          paddingVertical: 10,
          borderRadius: 25,
          alignSelf: "center",
          marginTop: 50,
        }}
        onPress={() => {
          onSubmit();
        }}
        disabled={!fullDate || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 21, fontWeight: "bold" }}>
            Sauver
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EditDate;

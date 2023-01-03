import { View, Text, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { sendNotification } from "../../functions/sendNotification";

const DatesComponents = ({
  date,
  getDatesFromChild,
  fetchDates,
  navigation,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onAccept = async (dateId) => {
    setIsSubmitting(true);
    const docRef = doc(db, "Dates", dateId);
    await updateDoc(docRef, {
      accepted: true,
    })
      .then(async () => {
        console.log(date.userId);
        const docRef = doc(db, "users", date?.userId);
        const snap = await getDoc(docRef);
        return snap.data().expoToken;
      })
      .then(async (userToken) => {
        const title = "Mise a jour de rendez-vous";
        const body = `Votre date a été accepté par l'administrateur
          !`;
        if (userToken) {
          await sendNotification(userToken, title, body);
        }
      })
      .then(() => {
        setIsSubmitting(false);
        fetchDates().then((res) => {
          getDatesFromChild(res);
        });
      });
  };
  return (
    <View
      style={{
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderWidth: 0,
        borderColor: "grey",
        shadowColor: "#000",
        shadowOffset: {
          height: 3,
        },
        elevation: 4,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 21, fontWeight: "bold" }}>
        {date.service.serviceName}
      </Text>

      <Text style={{ color: "grey" }}>
        Date : {new Date(date.Date.seconds * 1000).toISOString().slice(0, 10)}{" "}
        {new Date(date.Date.seconds * 1000).toISOString().slice(11, 13)}:00{" "}
        {new Date(date.Date.seconds * 1000).toISOString().slice(11, 13) === "23"
          ? "00"
          : +new Date(date.Date.seconds * 1000).toISOString().slice(11, 13) + 1}
        :00
      </Text>
      <Text style={{ color: date.accepted ? "green" : "red" }}>
        Status : {date.accepted ? "Accepté" : "Pas encore accepté"}
      </Text>

      <Text style={{ color: "grey" }}>Commune : {date.Commune}</Text>
      <Text style={{ color: "grey" }}>Address : {date.AddressExact}</Text>

      <View
        style={{
          marginTop: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#D09A00",
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 10,
          }}
          onPress={() => {
            navigation.navigate("EditDate", { date });
          }}
        >
          <Text style={{ color: "white" }}>Éditer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "green",
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 10,
          }}
          onPress={() => {
            Alert.alert("Voulez-vous vraiment accepter cette date ?", "", [
              {
                text: "Oui",
                onPress: () => {
                  onAccept(date.dateId);
                },
              },
              { text: "Non" },
            ]);
          }}
        >
          <Text style={{ color: "white" }}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DatesComponents;

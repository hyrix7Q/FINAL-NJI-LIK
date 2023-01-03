import { View, Text, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Toast from "react-native-toast-message";

const AcceptedDatesComponent = ({
  setNewDatesOnChild,
  fetchDates,
  date,
  navigation,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCancel = async (dateId) => {
    const docRef = doc(db, "Dates", dateId);
    await deleteDoc(docRef)
      .then(() => {
        fetchDates().then((res) => {
          setNewDatesOnChild(res);
        });
      })
      .catch(() => {
        Alert.alert("There was an error canceling the date", "Try again!", [
          { text: "Okay" },
        ]);
      });
  };

  const onMarkAsDone = async (dateId) => {
    const docRef = doc(db, "Dates", dateId);
    await deleteDoc(docRef)
      .then(() => {
        fetchDates().then((res) => {
          setNewDatesOnChild(res);
        });
      })
      .catch(() => {
        Alert.alert(
          "There was an error marking the date as done",
          "Try again!",
          [{ text: "Okay" }]
        );
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
        marginBottom: 20,
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
            backgroundColor: "red",
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 10,
          }}
          onPress={() => {
            Alert.alert("Voulez-vous vraiment annuler cette date ?", "", [
              {
                text: "Oui",
                onPress: () => {
                  onCancel(date.dateId);
                },
              },
              { text: "Non" },
            ]);
          }}
        >
          <Text style={{ color: "white" }}>Annuler</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "green",
          paddingHorizontal: 15,
          paddingVertical: 5,
          borderRadius: 10,
          alignSelf: "center",
          marginTop: 20,
        }}
        onPress={() => {
          Alert.alert(
            "Voulez-vous vraiment marquer cette date comme terminée ?",
            "",
            [
              {
                text: "Oui",
                onPress: () => {
                  onMarkAsDone(date.dateId);
                },
              },
              { text: "Non" },
            ]
          );
        }}
      >
        <Text style={{ color: "white" }}>Terminé</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AcceptedDatesComponent;

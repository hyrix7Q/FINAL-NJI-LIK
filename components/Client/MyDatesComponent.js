import { View, Text, Alert, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

const MyDatesComponent = ({ date, fetchMyDates, setNewDatesOnChild }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onCancel = async (dateDetails) => {
    setIsSubmitting(true);
    if (!dateDetails.accepted) {
      await deleteDoc(doc(db, "Dates", dateDetails.dateId)).then(() => {
        setIsSubmitting(false);
      });
      fetchMyDates().then((res) => {
        setNewDatesOnChild(res);
      });
      //Show a toast
    } else {
      setIsSubmitting(false);
      Alert.alert(
        "Votre commande a déjà été acceptée Veuillez appeler ce numéro pour annuler votre commande !"
      );
    }
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
            Alert.alert("Voulez-vous vraiment annuler cette commande?", "", [
              {
                text: "Oui",
                onPress: () => {
                  onCancel(date);
                },
              },
              { text: "Non" },
            ]);
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white" }}>Annuler</Text>
          )}
        </TouchableOpacity>
        <View></View>
      </View>
    </View>
  );
};

export default MyDatesComponent;

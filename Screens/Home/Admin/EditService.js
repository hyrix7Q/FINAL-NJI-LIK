import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../firebase/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";

const EditService = ({ route, navigation }) => {
  const { service } = route.params;

  const [serviceName, setServiceName] = useState(service?.serviceName);
  const [price, setPrice] = useState(service?.price);
  const [image, setImage] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSave = async () => {
    const docRef = doc(db, "Services", service.serviceId);
    if (service.serviceName !== serviceName) {
      setIsSubmitting(true);
      await updateDoc(docRef, {
        serviceName,
      }).then(() => {
        setIsSubmitting(false);
        navigation.goBack();
      });
    }
    if (service.price !== price) {
      setIsSubmitting(true);
      await updateDoc(docRef, {
        price,
      }).then(() => {
        setIsSubmitting(false);

        navigation.goBack();
      });
    }
    if (image) {
      setIsSubmitting(true);
      var oldImageName = service.image.substring(
        service.image.indexOf("%2F") + 3,
        service.image.indexOf("?")
      );

      const oldImageRef = ref(storage, `serviceLogos/${oldImageName}`);
      deleteObject(oldImageRef)
        .then(async () => {
          console.log("LWLA");
          const img = await fetch(image);
          const bytes = await img.blob();
          uploadBytes(
            ref(
              storage,
              `serviceLogos/${service?.serviceName.replace(/ /g, "")}.png`
            ),
            bytes
          )
            .then((snapshot) => {
              return getDownloadURL(snapshot.ref);
            })
            .then(async (url) => {
              // console.log("ZAWJA");

              // const imageRef = ref(
              //   storage,
              //   `serviceLogos/${service.serviceName.replace(/ /g, "")}`
              // );

              // listAll(imageRef).then((res) => {
              //   console.log("TALYA", res.items);

              //   res.items.forEach((item) => {
              //     getDownloadURL(item).then(async (url) => {
              //       console.log("URRRL", url);
              await updateDoc(doc(db, "Services", service.serviceId), {
                image: url,
              });
              //     });
              //   });
              // });
            })
            .then(() => {
              setIsSubmitting(false);
              navigation.goBack();
            });
        })
        .catch((error) => {
          setIsSubmitting(false);
          Alert.alert("Error", error.message, [{ text: "Okay" }]);
        });
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
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
            Modifier le service
          </Text>
        </View>
      </View>
      <ScrollView
        style={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator
      >
        <View style={{ alignSelf: "center", marginTop: 30 }}>
          <Text style={{ fontSize: 16, color: "grey" }}>
            Édition de{" "}
            <Text style={{ fontWeight: "bold" }}>{service.serviceName}</Text>
          </Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <View style={styles.inputField}>
            <TextInput
              style={styles.input}
              placeholder="Nom du service"
              onChangeText={(text) => {
                setServiceName(text);
              }}
              value={serviceName}
            />
            <Image
              source={require("../../../assets/serviceName.png")}
              style={{ width: 30, height: 30 }}
            />
          </View>
          <View style={styles.inputField}>
            <TextInput
              style={styles.input}
              placeholder="Prix"
              onChangeText={(text) => {
                setPrice(text);
              }}
              value={price.toString()}
            />
            <Image
              source={require("../../../assets/money.png")}
              style={{ width: 30, height: 30 }}
            />
          </View>
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => {
              pickImage();
            }}
          >
            <Text style={[styles.input, { color: "grey" }]}>
              Choisissez une image
            </Text>
            <Image
              source={require("../../../assets/gallery.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
          {image ? (
            <View
              style={{
                alignItems: "center",

                overflow: "hidden",
                height: 200,
                width: 200,
                alignSelf: "center",
              }}
            >
              <Image
                source={{ uri: image }}
                style={{ height: "100%", width: "100%", borderRadius: 25 }}
              />
            </View>
          ) : (
            <View
              style={{
                alignItems: "center",

                overflow: "hidden",
                height: 200,
                width: 200,
                alignSelf: "center",
              }}
            >
              <Image
                source={{ uri: service.image }}
                style={{ height: "100%", width: "100%", borderRadius: 25 }}
              />
            </View>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        disabled={
          (service.serviceName === serviceName &&
            service.price === price &&
            !image) ||
          isSubmitting
        }
        style={styles.submitButton}
        onPress={() => {
          Alert.alert("Voulez-vous vraiment modifier votre service?", "", [
            {
              text: "Oui",
              onPress: () => {
                onSave();
              },
            },
            { text: "Non" },
          ]);
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 21, fontWeight: "bold" }}>
            Sauver
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: "5%", backgroundColor: "white", flex: 1 },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 30,
    paddingVertical: 7,

    width: "60%",
  },
  input: { flexGrow: 1, maxWidth: "80%", fontSize: 17 },
  submitButton: {
    backgroundColor: "#D09A00",
    paddingHorizontal: 90,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: "center",
    marginBottom: 30,
  },
});

export default EditService;

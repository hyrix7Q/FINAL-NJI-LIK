import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import * as Yup from "yup";
import Validator from "email-validator";
import { Form, Formik } from "formik";
import { useSelector } from "react-redux";
import { getExpoToken } from "../../functions/getExpoToken";

const Register = ({ navigation }) => {
  const [focusedInput, setFocusedInput] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tokenSlice = useSelector((state) => state.token);
  const [username, setUsername] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const SignupFormSchema = Yup.object().shape({
    email: Yup.string().email().required("An email is required"),
    password: Yup.string()
      .required()
      .min(6, "Your password has to be atleast 6 characters"),
    username: Yup.string().required().max(12, "Your username is too long"),
    phoneNumber: Yup.string().required(),
  });

  const onSignup = (email, password, username, phoneNumber) => {
    setIsSubmitting(true);
    createUserWithEmailAndPassword(
      auth,
      email.replace(/ /g, ""),
      password.replace(/ /g, "")
    )
      .then((user) => {
        sendEmailVerification(user.user).then(() => {
          Alert.alert("Email verification sent ", "Please check spam folder");
        });
        console.log("DKHEL HNAAA 1ere", user.user);

        return user.user;
      })
      .then(async (res) => {
        console.log("DKHEL HNAAA 2eme", tokenSlice, res.uid);
        if (!tokenSlice.fetched || tokenSlice.token === null) {
          await getExpoToken();
        }
        await setDoc(doc(db, "users", res.uid), {
          expoToken: tokenSlice.fetched ? tokenSlice.token : null,
          createdIn: serverTimestamp(),
          username: username,
          profilePic:
            "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
          phoneNumber,
        });
        return res;
      })
      .then(async (res) => {
        console.log("DKHEL 3EMEEEEEEEEEEEE", res);
        await updateProfile(res, {
          displayName: username,
          photoURL:
            "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
        });
        setIsSubmitting(false);
      })
      .catch((err) => {
        setIsSubmitting(false);
        Alert.alert("An Error has occurred !", err.message, [{ text: "Okay" }]);
      });
  };
  return (
    <ScrollView style={styles.container}>
      {/* <Formik
        initialValues={{
          email: "",
          password: "",
          username: "",
          phoneNumber: "",
        }}
        onSubmit={(values) => {}}
        validationSchema={SignupFormSchema}
        validateOnMount={false}
      >
        {({
          handleBlur,
          handleChange,
          handleSubmit,
          values,
          isValid,
          errors,
        }) => ( */}
      <>
        <View style={styles.logo}>
          {/* Logo or Illis */}
          <Image
            source={require("../../assets/illi.png")}
            style={{ height: 150, width: 150 }}
          />
        </View>
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 23, fontWeight: "bold", marginBottom: 10 }}>
            Commencer
          </Text>
          <Text style={{ color: "grey", fontSize: 15 }}>
            Créez un compte pour commencer !
          </Text>
        </View>
        {/* INPUTS */}
        <View style={styles.inputsContainer}>
          <View
            style={
              focusedInput === "Username"
                ? [
                    {
                      backgroundColor: "#CECECE",
                      borderColor: true
                        ? // values.email.length < 1 || true
                          // Validator.validate(values.email)
                          "#CECECE"
                        : "red",
                      borderWidth: 0.8,
                    },
                    styles.inputView,
                  ]
                : [
                    {
                      borderColor: true // values.email.length < 1 || true
                        ? // Validator.validate(values.email)
                          "#CECECE"
                        : "red",
                      borderWidth: true // values.email.length < 1 || true
                        ? // Validator.validate(values.email)
                          1
                        : 0.8,
                      backgroundColor: "#CECECE",
                    },
                    styles.inputView,
                  ]
            }
          >
            <Image
              source={require("../../assets/username.png")}
              style={{ height: 30, width: 30 }}
            />
            <TextInput
              placeholder="Username"
              style={styles.input}
              onFocus={() => {
                setFocusedInput("Username");
              }}
              onChangeText={(text) => {
                setUsername(text);
              }}
              value={username}
            />
          </View>
          {/* {errors.username && values.username.length > 1 ? (
                <Text style={{ color: "red", fontSize: 12 }}>
                  {errors.username}
                </Text>
              ) : null} */}
          <View
            style={
              focusedInput === "Email"
                ? [
                    {
                      backgroundColor: "#CECECE",
                      borderColor: true
                        ? // values.email.length < 1 || true
                          // Validator.validate(values.email)
                          "#CECECE"
                        : "red",
                      borderWidth: 0.8,
                    },
                    styles.inputView,
                  ]
                : [
                    {
                      borderColor: true // values.email.length < 1 || true
                        ? // Validator.validate(values.email)
                          "#CECECE"
                        : "red",
                      borderWidth: true // values.email.length < 1 || true
                        ? // Validator.validate(values.email)
                          1
                        : 0.8,
                      backgroundColor: "#CECECE",
                    },
                    styles.inputView,
                  ]
            }
          >
            <Image
              source={require("../../assets/email.png")}
              style={{ height: 25, width: 25, marginRight: 5 }}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              onFocus={() => {
                setFocusedInput("Email");
              }}
              onChangeText={(text) => {
                setEmail(text);
              }}
              value={email}
            />
          </View>
          <View
            style={
              focusedInput === "Password"
                ? [
                    {
                      backgroundColor: "#CECECE",
                      borderColor: true // values.password.length < 1 ||
                        ? // values.password.length >= 6
                          "#CECECE"
                        : "red",
                      borderWidth: 0.8,
                    },
                    styles.inputView,
                  ]
                : [
                    {
                      borderColor: true ? "#CECECE" : "red",
                      borderWidth: true // values.password.length < 1 ||
                        ? // values.password.length > 6
                          1
                        : 0.8,
                      backgroundColor: "#CECECE",
                    },
                    styles.inputView,
                  ]
            }
          >
            <Image
              source={require("../../assets/password.png")}
              style={{ height: 30, width: 30 }}
            />
            <TextInput
              placeholder="Password"
              style={styles.input}
              onFocus={() => {
                setFocusedInput("Password");
              }}
              onChangeText={(text) => {
                setPassword(text);
              }}
              value={password}
            />
          </View>

          <View
            style={
              focusedInput === "PhoneNumber"
                ? [
                    {
                      backgroundColor: "#CECECE",
                      borderColor: true // values.password.length < 1 ||
                        ? // values.password.length >= 6
                          "#CECECE"
                        : "red",
                      borderWidth: 0.8,
                    },
                    styles.inputView,
                  ]
                : [
                    {
                      borderColor: true ? "#CECECE" : "red",
                      borderWidth: true // values.password.length < 1 ||
                        ? // values.password.length > 6
                          1
                        : 0.8,
                      backgroundColor: "#CECECE",
                    },
                    styles.inputView,
                  ]
            }
          >
            <Image
              source={require("../../assets/phoneNumber.png")}
              style={{ height: 30, width: 30 }}
            />
            <TextInput
              keyboardType="numeric"
              placeholder="Phone Number"
              style={styles.input}
              onFocus={() => {
                setFocusedInput("PhoneNumber");
              }}
              onChangeText={(text) => {
                setPhoneNumber(text);
              }}
              value={phoneNumber}
            />
          </View>
        </View>
        {/* TEXTS */}
        <View style={{ marginTop: 20 }}>
          <Text style={{}}>
            Vous avez déjà un compte ?{" "}
            <Text
              style={{ color: "#D09A00" }}
              onPress={() => {
                navigation.navigate("Login");
              }}
            >
              Connexion
            </Text>
          </Text>
        </View>
        {/* Signup Button */}
        <TouchableOpacity
          disabled={isSubmitting}
          style={styles.signupButton}
          onPress={() => {
            onSignup(email, password, username, phoneNumber);
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: 21, fontWeight: "bold" }}>
              Enregistrer
            </Text>
          )}
        </TouchableOpacity>
      </>
      {/* )}
      </Formik> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: "5%",
    paddingHorizontal: 25,
  },
  logo: {
    marginBottom: 30,
    height: 140,
    alignSelf: "center",
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    width: 250,

    maxWidth: 250,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 15,
  },
  input: {
    flexGrow: 1,
    maxWidth: 180,
  },
  signupButton: {
    backgroundColor: "#D09A00",
    paddingHorizontal: 90,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: "center",
    marginTop: 25,
  },
});

export default Register;

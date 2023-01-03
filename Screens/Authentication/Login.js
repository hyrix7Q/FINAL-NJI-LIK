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
import React, { useRef, useState } from "react";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useSelector } from "react-redux";
import { getExpoToken } from "../../functions/getExpoToken";
// import * as Yup from "yup";
// // import Validator from "email-validator";
// import { Form, Formik } from "formik";

const Login = ({ navigation }) => {
  const [focusedInput, setFocusedInput] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const tokenSlice = useSelector((state) => state.token);
  const services = useSelector((state) => state.services);

  // const LoginFormSchema = Yup.object().shape({
  //   // email: Yup.string().email().required("An email is required"),
  //   password: Yup.string()
  //     .required()
  //     .min(6, "Your password has to be atleast 6 characters"),
  // });

  const onLoginHandler = () => {
    setIsSubmitting(true);
    signInWithEmailAndPassword(
      auth,
      email.replace(/ /g, ""),
      password.replace(/ /g, "")
    )
      .then(async (user) => {
        if (!tokenSlice.fetched || tokenSlice.token === null) {
          await getExpoToken();
        }
        const docRef = doc(db, "users", user.user.uid);
        const snap = await getDoc(docRef);
        if (
          snap.data().expoToken &&
          snap.data().expoToken !== tokenSlice.token
        ) {
          await updateDoc(docRef, {
            expoToken: tokenSlice.token,
          });
        } else if (!snap.data().expoToken || snap.data().expoToken === null) {
          await updateDoc(docRef, {
            expoToken: tokenSlice.token,
          });
        }
        setIsSubmitting(false);
      })
      .catch((err) => {
        setIsSubmitting(false);
        Alert.alert("An error has occurred !", err.message, [{ text: "Okay" }]);
      });
  };

  const forgetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(
          "Password reset link has been sent!",
          "Check your spam folder in your email box"
        );
      })
      .catch((err) => {
        Alert.alert("There was an error", err);
      });
  };

  return (
    <ScrollView style={styles.container}>
      {/* <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={(values) => {}}
        validationSchema={LoginFormSchema}
        validateOnMount={false}
      >
        {({
          handleBlur,
          handleChange,
          handleSubmit,
          values,
          isValid,
          errors,
        }) => (
          <> */}
      <View style={styles.logo}>
        {/* Logo or Illis */}
        <Image
          source={require("../../assets/illi.png")}
          style={{ height: 150, width: 150 }}
        />
      </View>
      <View style={{ marginBottom: 0 }}>
        <Text style={{ fontSize: 23, fontWeight: "bold", marginBottom: 10 }}>
          Content de te revoir !
        </Text>

        <Text style={{ color: "grey", fontSize: 15 }}>
          Connectez-vous à votre compte et commencez !
        </Text>
      </View>
      {/* TEXTS */}
      <View style={{ marginTop: 30, marginBottom: 60, alignSelf: "center" }}>
        <Text style={{}}>
          vous n'avez pas de compte ?{" "}
          <Text
            style={{ color: "#D09A00" }}
            onPress={() => {
              navigation.navigate("Register");
            }}
          >
            Enregistrer
          </Text>
        </Text>
      </View>
      {/* INPUTS */}
      <View style={styles.inputsContainer}>
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
            // onBlur={handleBlur("email")}
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
            // onBlur={handleBlur("password")}
            value={password}
          />
        </View>
      </View>

      {/* Forgot password */}
      <View style={{ marginTop: 10 }}>
        <Text>
          Mot de passe oublié ?{" "}
          <Text
            onPress={() => {
              !email
                ? // errors.email || values.email === ""
                  Alert.alert("Veuillez fournir un email valide!")
                : forgetPassword(email);
            }}
            style={{ color: "#D09A00" }}
          >
            Se remettre!
          </Text>
        </Text>
      </View>
      {/* Signup Button */}
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => {
          onLoginHandler();
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 21, fontWeight: "bold" }}>
            Connexion
          </Text>
        )}
      </TouchableOpacity>
      {/* </>
        )}
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
    marginTop: 50,
  },
});

export default Login;

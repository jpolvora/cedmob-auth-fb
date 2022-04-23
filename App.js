import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import * as Facebook from "expo-facebook";
import * as SecureStore from "expo-secure-store";

async function save(key, value) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  return result || false;
}

async function logIn() {
  try {
   

    const { type, token, expirationDate, permissions, declinedPermissions } =
      await Facebook.logInWithReadPermissionsAsync({
        permissions: ["public_profile"],
      });

    if (type === "success") {
      // Get the user's name using Facebook's Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`
      );

      if (response.ok) await save("token", token);
      Alert.alert("Logged in!", `Hi ${(await response.json()).name}!`);
      return true;
    } else {
      // type === 'cancel'
    }
  } catch ({ message }) {
    alert(`Facebook Login Error: ${message}`);
  }

  return false;
}

export default function App() {
  const [isAuth, setIsAuth] = useState(false);

  async function logout() {
    await SecureStore.deleteItemAsync('token')
    await Facebook.logOutAsync()
    setIsAuth(false)
  }

  useEffect(() => {    
    const getState = async () => {
      await Facebook.initializeAsync({
        appId: "726405698521968",
      });
      const token = await getValueFor("token");
      if (token) {
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}`
        );

        if (response.ok) setIsAuth(true);
      }
    };

    getState();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      {!isAuth && <Button title="Login" onPress={() => setIsAuth(logIn())}></Button>}
      {isAuth && <Button title="Logout" onPress={logout}></Button>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import MyStack from './src/Navigation/Navigation';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import auth from '@react-native-firebase/auth';
import { checkIfFirstLaunch } from './src/Functions/Functions';
import LoadingScreen from './src/Components/LoadingScreen/LoadingScreen';
import PushNotification from 'react-native-push-notification';
import axios from 'axios'
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import stripe from 'tipsi-stripe';
stripe.setOptions({
  publishableKey: 'pk_test_RjADdW2vGwFAgOOk7ws1juNB002JV727O8',
  androidPayMode: 'test', // Android only
  merchantId: 'merchant.com.perch',
})
export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      initializing: true,
      user: null,
      firstLaunch: false,
      checkFirstLaunch: false,
      phoneVerified: 'loading',
    };
  };
  componentDidMount() {
    SplashScreen.hide();
    this.subscriber = auth().onAuthStateChanged(this.onAuthStateChanged);

    checkIfFirstLaunch()
      .then(isFirstLaunch => {
        if (isFirstLaunch) {//HAS LAUNCHED BEFORE
          this.setState({ firstLaunch: false, checkFirstLaunch: true });
        }
        else {//FIRST LAUNCH
          this.setState({ firstLaunch: true, checkFirstLaunch: true });
        }
      });
  };
  componentWillUnmount() {
    return this.subscriber;
  }
  onAuthStateChanged = (user) => {
    if (user) {
      const userID = auth().currentUser.uid;
      database().ref(`users/${userID}/summarizedHistory/phoneVerified`).once('value', snap => {
        this.setState({ phoneVerified: snap.val() })
      }).catch(() => { this.setState({ phoneVerified: false }) })
    }
    else
      this.setState({ phoneVerified: false })
    this.setState({ user: user })
    if (this.state.initializing)
      this.setState({ initializing: false });
  }
  render() {
    if (this.state.initializing == true || this.state.checkFirstLaunch == false || this.state.phoneVerified == 'loading')
      return <LoadingScreen />;
    else
      return (
        <NavigationContainer>
          <MyStack isFirstLaunch={this.state.firstLaunch} phoneVerified={this.state.phoneVerified} />
        </NavigationContainer>
      );
  }
};
//FUNCTION STYLE
// export default function App() {
//   // Set an initializing state whilst Firebase connects
//   const [initializing, setInitializing] = useState(true);
//   const [user, setUser] = useState();

//   // Simply to know if firebase is initialized
//   function onAuthStateChanged(user) {
//     setUser(user);
//     if (initializing) setInitializing(false);
//   }

//   useEffect(() => {
//     const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
//     return subscriber; // unsubscribe on unmount
//   }, []);

//   if (initializing)
//     return <LoadingScreen />;
//   else
//     return (
//       <NavigationContainer>
//         <MyStack />
//       </NavigationContainer>
//     );
// }

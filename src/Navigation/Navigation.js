import React from 'react';
import { Animated, Easing } from 'react-native';
import { createStackNavigator, } from '@react-navigation/stack';
import { NavigationAction } from '@react-navigation/native';
import { checkIfFirstLaunch } from '../Functions/Functions';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

import SignIn from '../Screens/SignIn/SignIn';
import SignUp from '../Screens/SignUp/SignUp';
import VerifyPhoneNumber from '../Screens/VerifyPhoneNumber/VerifyPhoneNumber';
import Main from '../Screens/Main/Main';
import CarpoolResults from '../Screens/CarpoolResults/CarpoolResults';
import CarpoolTripDetails from '../Screens/CarpoolTripDetails/CarpoolTripDetails';
import CarpoolHistory from '../Screens/CarpoolHistory/CarpoolHistory';
import History from '../Screens/History/History';
import RideshareHistory from '../Screens/RideshareHistory/RideshareHistory';
import RideshareChoice from '../Screens/RideshareChoice/RideshareChoice';
import RideshareConfirmed from '../Screens/RideshareConfirmed/RideshareConfirmed';
import Chat from '../Screens/Chat/Chat';
import ContactUs from '../Screens/ContactUs/ContactUs';
import PaymentMethod from '../Screens/PaymentMethod/PaymentMethod';
import Settings from '../Screens/Settings/Settings';
import SavedPlaces from '../Screens/SavedPlaces/SavedPlaces';
import Privacy from '../Screens/Privacy/Privacy';
import Profile from '../Screens/Profile/Profile';
import ChangePassword from '../Screens/ChangePassword/ChangePassword';
import CarpoolDriverProfile from '../Screens/CarpoolDriverProfile/CarpoolDriverProfile';
import VerifyDetails from '../Screens/VerifyDetails/VerifyDetails';
import GetFreeRides from '../Screens/GetFreeRides/GetFreeRides';
import Wallet from '../Screens/Wallet/Wallet';
import NewCreditCard from '../Screens/NewCreditCard/NewCreditCard';
import CreditHistory from '../Screens/CreditHistory/CreditHistory';
import AddFunds from '../Screens/AddFunds/Addfunds';
import Onboarding from '../Screens/Onboarding/Onboarding';
import PreviousMessages from '../Screens/PreviousMessages/PreviousMessages';
import SupportMessage from '../Screens/SupportMessage/SupportMessage';
import ScheduledTrips from '../Screens/ScheduledTrips/ScheduledTrips';
const Stack = createStackNavigator();
let initialRouteName;

auth().onAuthStateChanged(user => {
  if (user)
    initialRouteName = 'Main';
  else
    initialRouteName = 'SignIn';
});




export default class MyStack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  };
  render() {
    return (
      <Stack.Navigator
        initialRouteName={this.props.isFirstLaunch ? 'Onboarding' : initialRouteName}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false
        }}
      >
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ cardStyleInterpolator: translateY }} />
        <Stack.Screen name="VerifyPhoneNumber" component={VerifyPhoneNumber} />
        <Stack.Screen name="Main" component={Main} options={{ cardStyleInterpolator: fadeIn }} />
        <Stack.Screen name="CarpoolResults" component={CarpoolResults} />
        <Stack.Screen name="CarpoolTripDetails" component={CarpoolTripDetails} />
        <Stack.Screen name="CarpoolHistory" component={CarpoolHistory} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="RideshareHistory" component={RideshareHistory} />
        <Stack.Screen name="RideshareChoice" component={RideshareChoice} />
        <Stack.Screen name="RideshareConfirmed" component={RideshareConfirmed} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="ContactUs" component={ContactUs} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="SavedPlaces" component={SavedPlaces} />
        <Stack.Screen name="Privacy" component={Privacy} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="CarpoolDriverProfile" component={CarpoolDriverProfile} />
        <Stack.Screen name="VerifyDetails" component={VerifyDetails} />
        <Stack.Screen name="GetFreeRides" component={GetFreeRides} />
        <Stack.Screen name="Wallet" component={Wallet} />
        <Stack.Screen name="NewCreditCard" component={NewCreditCard} />
        <Stack.Screen name="CreditHistory" component={CreditHistory} />
        <Stack.Screen name="AddFunds" component={AddFunds} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="PreviousMessages" component={PreviousMessages} />
        <Stack.Screen name="SupportMessage" component={SupportMessage} />
        <Stack.Screen name="ScheduledTrips" component={ScheduledTrips} />
      </Stack.Navigator>
    );
  }
}
const fadeIn = (sceneProps) => {
  const { current } = sceneProps;

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  })

  return {
    cardStyle: {
      opacity: opacity
    },
  }
}
const fasterFadeIn = (sceneProps) => {
  const { current } = sceneProps;

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  })

  return {
    cardStyle: {
      opacity: opacity
    },
  }
}
const translateY = (sceneProps) => {
  const { current, layouts } = sceneProps;
  const height = layouts.screen.height;

  const translateY = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height, height / 2, 0]
  })
  return {
    cardStyle: {
      transform: [{ translateY }]
    },
  }
}
const fasterTranslateY = (sceneProps) => {
  const { current, layouts } = sceneProps;
  const height = layouts.screen.height;

  const translateY = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height, 0, 0]
  })
  return {
    cardStyle: {
      transform: [{ translateY }]
    },
  }
}
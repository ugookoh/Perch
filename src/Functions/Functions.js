import React from 'react';
import { Linking, Alert, Platform, Dimensions, StatusBar, Animated, View, Text, LayoutAnimation } from 'react-native';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Keyboard } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn'
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import database from '@react-native-firebase/database';
import NetInfo from "@react-native-community/netinfo";
import _ from 'lodash';
import stripe from 'tipsi-stripe';

const GOOGLE_KEY = 'AIzaSyCBmmCb6Lkhbj6LR5eCi2Lz2ocbpyW6kb4';
const polyline = require('@mapbox/polyline');// for decoding polylines

export const [height, width] = [Dimensions.get('window').height - (Platform.OS === 'android' ? (Dimensions.get('screen').height == Dimensions.get('window').height ? StatusBar.currentHeight : 0) : 0), Dimensions.get('window').width];

export const colors = {
  GREEN: "#4DB748",
  BLUE: "#1970A7",
  PURPLE: "#A031AF",
  GREEN_: "rgba(77, 183, 72, 0.3)",
  BLUE_: "rgba(25, 112, 167, 0.3)",
  PURPLE_: "rgba(160, 49, 175, 0.3)",
  GREY: "#403D3D",
  WHITE: "#FFFFFF",
  RED: "#FF0000",
  GOLD: "#FFAA00",
  GREENMAKER: "#82cd7e",
  BLUEMAKER: "#64b5e8",
  PURPLEMAKER: "#cc74d8",
  GREY_LIGHT: "#FDFCF7",
};
//GET TOKEN AND SEND IT TO THE DATABASE ON MAIN
export function getFirebaseMessagingToken() {
  AsyncStorage.getItem('USER_DETAILS')
    .then(result => {
      const userID = JSON.parse(result).userID;
      messaging().getToken()
        .then(fcmToken => {
          if (fcmToken) {
            database().ref(`deviceID/${userID}`).set({
              os: Platform.OS,
              token: fcmToken,
            })
              .catch(error => { console.log(error.message) })
          }
          else {
            database().ref(`deviceID/${userID}`).set({
              os: Platform.OS,
              token: 'NOTOKEN',
            })
              .catch(error => { console.log(error.message) })
          }
        }).catch(error => { console.log(error.message) })
    }).catch(error => { console.log(error.message) })
};
//CLASS FOR GRANTING THE NOTIFICATION
export class Notifications extends React.Component {
  componentDidMount() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        //console.log("TOKEN:", token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        //console.log("NOTIFICATION:", notification);
        // process the notification here
        // required on iOS only 
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      // Android only
      senderID: "89897349326",
      userInfo: { id: '123' },
      // iOS only
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: true
    });


  };
  render() {
    return (
      <></>
    )
  };
};

export class OfflineNotice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.Y_START = y(55);
    this.Y_END = -y(100);
    this.position = new Animated.ValueXY({ x: 0, y: this.Y_END });//This is the value we are animating to.


    const navigation = this.props.navigation;
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage.data.navigateTo == 'CarpoolTripDetails') {
        AsyncStorage.getItem('USER_DETAILS')
          .then(result => {
            const userID = JSON.parse(result).userID;
            const ref = remoteMessage.data.scheduled == 'true' ? `scheduledCarpoolTripReserve/carpool/user/${userID}` : `carpoolTripReserve/carpool/user/${userID}`;
            database().ref(ref).once('value', snapshot => {
              if (snapshot.val()) {
                const dateText = `userHistory/${userID}/carpool/${snapshot.val().startAt.year}/${snapshot.val().startAt.month}/${snapshot.val().historyRef}`
                navigation.navigate('CarpoolTripDetails', {
                  location: snapshot.val().location,
                  destination: snapshot.val().destination,
                  seatNumber: snapshot.val().seatNumber,
                  tripAccepted: true,
                  userID: userID,
                  data: JSON.parse(snapshot.val().data),
                  hour: snapshot.val().startAt.hour,
                  min: snapshot.val().startAt.min,
                  dateText: dateText,
                  now: remoteMessage.data.scheduled == 'true' ? false : true,
                  scheduled: remoteMessage.data.scheduled == 'true',
                  onRefresh: () => { },
                  handleOnNavigateBack: () => { },
                });
              }
            });
          });
      } else if (remoteMessage.data.navigateTo == 'Chat') {

        AsyncStorage.getItem('USER_DETAILS')
          .then(result => {
            const userID = JSON.parse(result).userID;
            database().ref(`carpoolTripReserve/carpool/user/${userID}/historyRef`).once('value', snapshot => {
              if (snapshot.val())
                navigation.navigate('Chat', remoteMessage.data);
              else
                database().ref(`scheduledCarpoolTripReserve/carpool/user/${userID}/historyRef`).once('value', snapshot_ => {
                  if (snapshot_.val())
                    navigation.navigate('Chat', remoteMessage.data);
                }).catch(error => { console.log(error.message) })

            })
          })
          .catch(error => { console.log(error.message) })
      }
      else if (remoteMessage.data.navigateTo == 'SupportMessage')
        navigation.navigate('SupportMessage', remoteMessage.data);
      else if (remoteMessage.data.navigateTo == 'ScheduledTrips')
        AsyncStorage.getItem('USER_DETAILS')
          .then(result => {
            const userDetails = JSON.parse(result);
            navigation.navigate('ScheduledTrips', { userDetails: userDetails });
          }).catch(error => { console.log(error.message) })

    });
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {

          if (remoteMessage.data.navigateTo == 'CarpoolTripDetails') {
            AsyncStorage.getItem('USER_DETAILS')
              .then(result => {
                const userID = JSON.parse(result).userID;
                const ref = remoteMessage.data.scheduled == 'true' ? `scheduledCarpoolTripReserve/carpool/user/${userID}` : `carpoolTripReserve/carpool/user/${userID}`;
                database().ref(ref).once('value', snapshot => {
                  if (snapshot.val()) {
                    const dateText = `userHistory/${userID}/carpool/${snapshot.val().startAt.year}/${snapshot.val().startAt.month}/${snapshot.val().historyRef}`
                    navigation.navigate('CarpoolTripDetails', {
                      location: snapshot.val().location,
                      destination: snapshot.val().destination,
                      seatNumber: snapshot.val().seatNumber,
                      tripAccepted: true,
                      userID: userID,
                      data: JSON.parse(snapshot.val().data),
                      hour: snapshot.val().startAt.hour,
                      min: snapshot.val().startAt.min,
                      dateText: dateText,
                      now: remoteMessage.data.scheduled == 'true' ? false : true,
                      rideConfirmed: remoteMessage.data.scheduled == 'true' ? true : null,
                      onRefresh: () => { },
                    });
                  }
                });
              });
          } else if (remoteMessage.data.navigateTo == 'Chat') {
            AsyncStorage.getItem('USER_DETAILS')
              .then(result => {
                const userID = JSON.parse(result).userID;
                database().ref(`carpoolTripReserve/carpool/user/${userID}/historyRef`).once('value', snapshot => {
                  console.log(JSON.stringify(snapshot.val()))
                  if (snapshot.val())
                    navigation.navigate('Chat', remoteMessage.data);
                  else
                    database().ref(`scheduledCarpoolTripReserve/carpool/user/${userID}/historyRef`).once('value', snapshot_ => {
                      if (snapshot_.val())
                        navigation.navigate('Chat', remoteMessage.data);
                    }).catch(error => { console.log(error.message) })
                })
              })
              .catch(error => { console.log(error.message) })
          }
          else if (remoteMessage.data.navigateTo == 'SupportMessage')
            navigation.navigate('SupportMessage', remoteMessage.data);
          else if (remoteMessage.data.navigateTo == 'ScheduledTrips')
            AsyncStorage.getItem('USER_DETAILS')
              .then(result => {
                const userDetails = JSON.parse(result);
                navigation.navigate('ScheduledTrips', { userDetails: userDetails });
              }).catch(error => { console.log(error.message) })
        }
      })
      .catch(error => { console.log(error.message) })

    this.unsubscribe = messaging().onMessage(remoteMessage => {
      if (navigation.isFocused()) {
        PushNotification.configure({
          onNotification: function (notification) {
            const n = Platform.OS == 'ios' ? (notification.alert == undefined) : notification.userInteraction;
            if (n) {
              if (remoteMessage.data.navigateTo == 'CarpoolTripDetails') {
                AsyncStorage.getItem('USER_DETAILS')
                  .then(result => {
                    const userID = JSON.parse(result).userID;
                    const ref = remoteMessage.data.scheduled == 'true' ? `scheduledCarpoolTripReserve/carpool/user/${userID}` : `carpoolTripReserve/carpool/user/${userID}`;
                    database().ref(ref).once('value', snapshot => {
                      if (snapshot.val()) {
                        const dateText = `userHistory/${userID}/carpool/${snapshot.val().startAt.year}/${snapshot.val().startAt.month}/${snapshot.val().historyRef}`
                        navigation.navigate('CarpoolTripDetails', {
                          location: snapshot.val().location,
                          destination: snapshot.val().destination,
                          seatNumber: snapshot.val().seatNumber,
                          tripAccepted: true,
                          userID: userID,
                          data: JSON.parse(snapshot.val().data),
                          hour: snapshot.val().startAt.hour,
                          min: snapshot.val().startAt.min,
                          dateText: dateText,
                          now: remoteMessage.data.scheduled == 'true' ? false : true,
                          rideConfirmed: remoteMessage.data.scheduled == 'true' ? true : null,
                          onRefresh: () => { },
                        });
                      }
                    });
                  });
              } else if (remoteMessage.data.navigateTo == 'Chat') {
                AsyncStorage.getItem('USER_DETAILS')
                  .then(result => {
                    const userID = JSON.parse(result).userID;

                    database().ref(`carpoolTripReserve/carpool/user/${userID}/historyRef`).once('value', snapshot => {
                      if (snapshot.val())
                        navigation.navigate('Chat', remoteMessage.data);
                      else
                        database().ref(`scheduledCarpoolTripReserve/carpool/user/${userID}/historyRef`).once('value', snapshot_ => {
                          if (snapshot_.val())
                            navigation.navigate('Chat', remoteMessage.data);
                        }).catch(error => { console.log(error.message) })
                    })
                  })
                  .catch(error => { console.log(error.message) })
              }
              else if (remoteMessage.data.navigateTo == 'SupportMessage')
                navigation.navigate('SupportMessage', remoteMessage.data);
              else if (remoteMessage.data.navigateTo == 'ScheduledTrips')
                AsyncStorage.getItem('USER_DETAILS')
                  .then(result => {
                    const userDetails = JSON.parse(result);
                    navigation.navigate('ScheduledTrips', { userDetails: userDetails });
                  }).catch(error => { console.log(error.message) })
            }
            notification.finish(PushNotificationIOS.FetchResult.NoData);
          },
          // Android only
          senderID: "89897349326",
          userInfo: { id: '123' },
          // iOS only
          permissions: {
            alert: true,
            badge: true,
            sound: true
          },
          popInitialNotification: true,
          requestPermissions: true
        });

        if (remoteMessage.data.navigateTo !== this.props.screenName) {
          PushNotification.localNotification({
            //... You can use all the options from localNotifications
            title: remoteMessage.notification.title,
            message: remoteMessage.notification.body,
          });
        }
      }
    });

  };
  componentDidMount() {
    NetInfo.addEventListener(this.handleConnectivityChange);
  }
  componentWillUnmount() {
    this.unsubscribe();
    // NetInfo.removeEventListener(this.handleConnectivityChange);
  }
  handleConnectivityChange = state => {
    if (state.isConnected) {
      Animated.spring(this.position, {
        toValue: { x: 0, y: this.Y_END },
        bounciness: 0,
      }).start(() => {

      });
      // })

    } else {//OUTRIGHTLY NO CONNECTION
      Animated.spring(this.position, {
        toValue: { x: 0, y: this.Y_START },
        bounciness: 0,
      }).start(() => {
        setTimeout(() => {
          Animated.spring(this.position, {
            toValue: { x: 0, y: this.Y_END },
            bounciness: 0,
          }).start();
        }, 3000);//HIDE BACK AFTER 3 SECONDS
      });
    }
  };

  render() {
    return (
      <Animated.View style={[{ width: width, alignItems: 'center', position: 'absolute', zIndex: 10, elevation: 10 }, this.position.getLayout()]}>
        <View style={{ height: y(100), borderRadius: 10, width: x(313), backgroundColor: colors.RED, justifyContent: 'space-around', alignItems: 'center', paddingVertical: y(20) }}>
          <Text style={{ fontFamily: 'Gilroy-ExtraBold', fontSize: y(18, true), color: colors.WHITE }}>There is no internet connection</Text>
          <Text style={{ fontFamily: 'Gilroy-SemiBold', fontSize: y(14, true), color: colors.WHITE }}>Your device is currently offline</Text>
        </View>
      </Animated.View>
    );
  }
};
//CHECK IF THE PERMISSION FOR LOCATION IS GRANTED
export function permissionLocation() {
  let permission_;
  if (Platform.OS === 'ios')
    permission_ = PERMISSIONS.IOS.LOCATION_ALWAYS;
  else if (Platform.OS === 'android')
    permission_ = PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION
  check(permission_)
    .then(result => {//STORE THE RESULT IN ASYNC STORAGE AND SO WE CHECK WHENEVR WE WANT TO USE IT.
      switch (result) {
        case RESULTS.UNAVAILABLE: {
          AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('FALSE_UNAVAILABLE'))
            .catch(error => { console.log(error.message) });
        }
          break;
        case RESULTS.DENIED: {
          request(permission_).then(result => {
            console.log(result);
          });
          AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('FALSE_DENIED'))
            .catch(error => { console.log(error.message) });
          Geolocation.requestAuthorization();
        }
          break;
        case RESULTS.GRANTED:
          {
            AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('TRUE'))
              .catch(error => { console.log(error.message) });
          }
          break;
        case RESULTS.BLOCKED:
          AsyncStorage.setItem('LOCATION_GRANTED', JSON.stringify('FALSE_BLOCKED'))
            .catch(error => { console.log(error.message) });
          break;
      }
    })
    .catch(error => {
      console.log(error.message)
    });
};
//CHECK IF USER IS LOGGED IN
export function isUserLoggedIn() {
  auth().onAuthStateChanged(user => {
    if (user) { }
    else
      this.props.navigation.navigate('SignIn');
  })
};
//CHECKS FOR FIRST LAUNCH and CREATE HISTORY DATABASE
export async function checkIfFirstLaunch() {
  try {
    const hasLaunched = await AsyncStorage.getItem('HAS_LAUNCHED');
    if (hasLaunched === null) {//This means it has not been launched before
      AsyncStorage.setItem('HAS_LAUNCHED', 'true')
        .then(() => {
          return false;
        }).catch(error => {
          console.log(error.message)
        });
    }
    else
      return true;
  } catch (error) {
    return false;
  }
};
//CHECK FOR NETWORK CONNECTIVITY
export function handleConnectivityChange(state) {
  if (state.isConnected) {
    axios.get('https://www.google.com')
      .then((result) => {//THERE IS ACTUALLY A CONNECTION
        this.setState({ connection_Status: 'Online' });
      })
      .catch(error => {//CONNECTION IS PRESENT BUT NO INTERNET
        this.setState({ connection_Status: 'Offline' });
      });

  } else {//OUTRIGHTLY NO CONNECTION
    this.setState({ connection_Status: 'Offline' });
  }
};
//CHECK IF APP IN FOREGROUND OR BACKGROUND FOR NOTIFICATIONS
export function handleAppStateChange(nextAppState) {///THIS HANLES 
  if (nextAppState === 'background') {
    this.setState({ appState: 'background' });
  }
  else if (nextAppState === 'active') {
    this.setState({ appState: 'foreground' });
  }
};
//HANDLE LOGINS
export function handleLogin() {
  const { email, password } = this.state;

  auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      const userID = auth().currentUser.uid;
      database().ref(`users/${userID}`).once('value', data => {
        AsyncStorage.setItem('USER_DETAILS', JSON.stringify(data.val()))
          .then(() => {
            if (this.props.route.params)
              if (this.props.route.params.forceUpdate)
                this.props.route.params.forceUpdate(data.val());

            if (data.val().summarizedHistory.phoneVerified)
              this.props.navigation.navigate("Main", { userDetails: data.val() });
            else {
              this.props.navigation.navigate("VerifyPhoneNumber", { userDetails: data.val() });
              sendVerification(userID, 'phoneNumber', 'storeAndSend', '', data.val().phoneNumber, '', data.val().firstName, '');
            }
          })
          .catch(error => { console.log(error.message) });
      }).catch(error => console.log(error.message))
    })
    .then(() => setTimeout(() => {
      this.setState({ password: "", errorMessage: "", loading: false })
    }, 1000)
    )
    .catch(error => this.setState({ errorMessage: error.message, loading: false }));
};
//HANDLE SIGN-UPS
export function createUserDetails(firstName, lastName, email, phoneNumber, password, isDriver) {
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/checkIfPhoneNumberIsFree`, { phoneNumber: phoneNumber })
    .then(r => {
      if (r.data) {
        auth().createUserWithEmailAndPassword(email, password)
          .then(() => {
            const userID = auth().currentUser.uid;
            axios.post('https://us-central1-perch-01.cloudfunctions.net/createUserDetails', { firstName: firstName, lastName: lastName, email: email, phoneNumber: phoneNumber, userID: userID, isDriver: isDriver })
              .then(() => {
                database().ref(`users/${userID}`).once('value', data => {
                  AsyncStorage.setItem('USER_DETAILS', JSON.stringify(data.val()))
                    .then(() => {
                      this.props.navigation.navigate("VerifyPhoneNumber", { userDetails: data.val() });
                    })
                    .catch(error => { console.log(error.message) });
                }).catch(error => console.log(error.message))
              })
              .then(() => {
                setTimeout(() => {
                  this.setState({ password: "", errorMessage: "", loading: false })
                }, 1000)
              })
              .catch(error => { this.setState({ errorMessage: error.message, loading: false }) });
          }).catch(error => { this.setState({ errorMessage: error.message, loading: false }) });
      }
      else
        this.setState({ errorMessage: 'This phone number is currently registered with another account, contact us for help', loading: false })
    }).catch(error => {
      this.setState({ errorMessage: error.message, loading: false })
    })


};
//SEND VERIFICATION CODES
export function sendVerification(userID, type, action, code, phoneNumber, email, name, screenName) {
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/sendVerificationCode`,
    {
      userID: userID,
      type: type,
      action: action,
      code: code,
      phoneNumber: phoneNumber,
      email: email,
      name: name
    })
    .then((r) => {
      const result = r.data;
      if (action == 'check') {
        if (result) {
          this.setState({ loading: false });
          if (screenName = 'VerifyPhoneNumber')
            this.props.navigation.navigate('Main')
        }
        else {
          this.setState({ loading: false })
          Alert.alert('Error', 'The verification code was not correct. Please check again or click resend.',);
        }
      }
    })
    .catch(error => {
      Alert.alert('Error', `${error.message}, please resend code`);
      this.setState({ loading: false });
    })
};
//HANDLE LOGOUTS
export function signOut(forceUpdate) {
  auth().signOut()
    .then(() => {
      AsyncStorage.removeItem("USER_DETAILS")
        .then(() => {
          this.props.navigation.navigate("SignIn", {
            forceUpdate: (value) => { forceUpdate(value); }
          })
        })
        .catch(error => { console.log(error.message) })
    })
    .catch(error => { console.log(error.message) })
};
//GET LOCATION COORDINATES
export function getLocation(mainText, description, id, fieldID, screen) {
  switch (screen) {
    case 'Main': {
      Keyboard.dismiss();
      if (this.state.destinationFocused || (this.state.locationFocused && this.state.destination != ''))
        this.setState({ loading: true });


      axios.get('https://maps.googleapis.com/maps/api/place/details/json?place_id=' + id + '&fields=geometry&key=' + GOOGLE_KEY)
        .then(result => {
          const lat = (result.data.result.geometry.location).lat;
          const lng = (result.data.result.geometry.location).lng;
          searchHistoryInsert.call(this, { latitude: Number(lat), longitude: Number(lng), description: description, place_id: id, mainText })
          return { lat: Number(lat), lng: Number(lng) }
        })
        .then((results) => {
          if (fieldID === 'location') {
            this.setState({ latitude: results.lat, longitude: results.lng, location: mainText, });

            if (this.state.destination == '')
              this.destinationInput.focus();
            else
              Keyboard.dismiss();
          }
          else if (fieldID === 'destination') {
            this.setState({ latitude1: results.lat, longitude1: results.lng, destination: mainText, });
            Keyboard.dismiss();
          }
        })
        .then(() => {
          this.setState({ predictionsLoaded: false, predictions: [] })
        })
        .then(() => {


          axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.currentLocationLatitude},${this.state.currentLocationLongitude}&key=${GOOGLE_KEY}`)
            .then(result_ => {
              let location_ = this.state.location != '' ?
                {
                  description: this.state.location,
                  latitude: this.state.latitude,
                  longitude: this.state.longitude
                } :
                {
                  description: result_.data.results[0].address_components[0].short_name + ' ' + result_.data.results[0].address_components[1].long_name,
                  latitude: this.state.currentLocationLatitude,
                  longitude: this.state.currentLocationLongitude,
                };

              if (this.state.destination != '') {

                if (this.state.carpool) {
                  this.props.navigation.navigate('CarpoolResults', {
                    location: {
                      description: location_.description,
                      latitude: location_.latitude,
                      longitude: location_.longitude,
                    },
                    destination: {
                      description: this.state.destination,
                      latitude: this.state.latitude1,
                      longitude: this.state.longitude1
                    },
                    onReturn: (val_) => {
                      this.onReturn.call(this, val_)
                    },
                    now: this.state.now,
                    date: this.state.date,
                    tomorrow: this.state.tomorrow,
                    handleOnNavigateBack: () => { this.handleOnNavigateBack.call(this); }
                  })
                  setTimeout(() => {
                    this.setState({ loading: false });
                  }, 2000)

                }
                else if (this.state.rideshare) {

                  axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${[location_.latitude, location_.longitude]}&destination=${[this.state.latitude1, this.state.longitude1]}&key=${GOOGLE_KEY}`)
                    .then(result => {
                      this.props.navigation.navigate('RideshareChoice', {
                        location: {
                          description: location_.description,
                          latitude: location_.latitude,
                          longitude: location_.longitude,
                        },
                        destination: {
                          description: this.state.destination,
                          latitude: this.state.latitude1,
                          longitude: this.state.longitude1
                        },
                        polyline: polyline.decode(result.data.routes[0].overview_polyline.points),
                        onReturn: (val_) => {
                          this.onReturn.call(this, val_)
                        },
                      })
                      setTimeout(() => {
                        this.setState({ loading: false });
                      }, 2000)

                    }).catch(error_ => { console.log(error_.message) })
                }
              }
            }).catch(error => { console.log(error.message) })

        }
        )
        .catch(error => (console.log(error.message)))
    } break;
    case 'SavedPlaces': {
      axios.get('https://maps.googleapis.com/maps/api/place/details/json?place_id=' + id + '&fields=geometry&key=' + GOOGLE_KEY)
        .then(result => {
          const lat = (result.data.result.geometry.location).lat;
          const lng = (result.data.result.geometry.location).lng;

          AsyncStorage.getItem('USER_DETAILS')
            .then(result => {
              let userDetails = JSON.parse(result);
              let title = '';
              if (fieldID == 'home') {
                title = 'homeAddress';
                userDetails.homeAddress = {
                  latitude: lat,
                  longitude: lng,
                  mainText: mainText,
                  description: description,
                  place_id: id,
                };
                this.setState({ homeAddress: userDetails.homeAddress, home: userDetails.homeAddress.mainText });
              }
              else if (fieldID == 'work') {
                title = 'workAddress';
                userDetails.workAddress = {
                  latitude: lat,
                  longitude: lng,
                  mainText: mainText,
                  description: description,
                  place_id: id,
                }
                this.setState({ workAddress: userDetails.workAddress, work: userDetails.workAddress.mainText });
              }

              AsyncStorage.setItem('USER_DETAILS', JSON.stringify(userDetails))
                .catch(error => { console.log(error.message) })

              if (title != '')
                axios.post('https://us-central1-perch-01.cloudfunctions.net/updateUserDetails', {
                  userID: userDetails.userID,
                  fieldsToUpdate: {
                    [title]: {
                      latitude: lat,
                      longitude: lng,
                      mainText: mainText,
                      description: description,
                      place_id: id,
                    }
                  }
                }).catch(error => { Alert.alert('Error', error.message) })

            }).catch(error => { console.log(error.message) })
        })
        .catch(error => { console.log(error.message) })
    } break;
  }
};
//LOAD SEARCH RESULTS
export function loadResults(text, screen) {
  switch (screen) {
    case 'Main': {
      //this.setState({destination:text})
      if (text == '') {
        this.setState({ predictionsLoaded: false, predictions: [] })
      }
      else {
        axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}${this.state.currentLocation}&key=${GOOGLE_KEY}`)
          .then(result => {//You return everythimg you wanna use from the queries
            this.setState({ predictionsLoaded: true, predictions: (result.data.predictions.map((data) => { return { mainText: data.structured_formatting.main_text, description: data.description, place_id: data.place_id } })) })
          })
          .catch(error => console.log(error.message));
      }
    } break;
    case 'SavedPlaces': {
      //this.setState({destination:text})
      if (text == '') {
        this.setState({ predictions: [] })
      }
      else {
        axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}${this.state.currentLocation}&key=${GOOGLE_KEY}`)
          .then(result => {//You return everythimg you wanna use from the queries
            this.setState({ predictionsLoaded: true, predictions: (result.data.predictions.map((data) => { return { mainText: data.structured_formatting.main_text, description: data.description, place_id: data.place_id } })) })
          })
          .catch(error => console.log(error.message));
      }
    } break;
  }
};
//REVERSE GEOCODING
export function reverseGeocoding(region, input, screen) {
  axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=${GOOGLE_KEY}`)
    .then(result => {
      if (screen == 'MAIN') {
        //console.log(JSON.stringify(result.data.results[0]));
        const mainAddress = result.data.results[0].address_components[0].short_name + ' ' + result.data.results[0].address_components[1].long_name;
        const secondaryAddress = result.data.results[0].formatted_address;
        if (input == 'location')
          this.setState({
            location: mainAddress, latitude: region.latitude, longitude: region.longitude, suggestion: 'springDown',
            regionMovedData: { mainText: mainAddress, description: secondaryAddress, place_id: result.data.results[0].place_id, input: input },
          });
        else if (input == 'destination')
          this.setState({
            destination: mainAddress, latitude1: region.latitude, longitude1: region.longitude, suggestion: 'springDown',
            regionMovedData: { mainText: mainAddress, description: secondaryAddress, place_id: result.data.results[0].place_id, input: input },
          });
      }
      else if (screen == 'RIDESHARECHOICE') {
        const mainAddress = result.data.results[0].address_components[0].short_name + ' ' + result.data.results[0].address_components[1].long_name;
        if (input == 'location') {
          axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${[region.latitude, region.longitude]}&destination=${[this.state.destination.latitude, this.state.destination.longitude]}&key=${GOOGLE_KEY}`)
            .then(result => {
              this.setState({
                location: {
                  latitude: region.latitude,
                  longitude: region.longitude,
                  description: mainAddress,
                },
                finalLoading: false,
                polyline: polyline.decode(result.data.routes[0].overview_polyline.points),
              });
            }).catch(error => { console.log(error.message) })
        }
      }
    })
    .catch(error => { console.log(error.message) });
};
//DEBOUNCER
export var debouncer = _.debounce(loadResults, 1000);
//HISTORY INSERTER
export function searchHistoryInsert(search) {//WE WOULD ALWAYS HAVE A MAX OF 5 ENTRIES
  const place_id = search.place_id;
  let countID = -1;
  AsyncStorage.getItem('HISTORY')
    .then(result => {
      if (result) {
        let listOfPlaces = JSON.parse(result);
        for (let i = 0; i < listOfPlaces.length; i++)
          if (place_id === listOfPlaces[i].place_id)
            countID = i;

        if (countID !== -1)//THE ENTRY EXISTS
        {
          listOfPlaces.splice(countID, 1);
          listOfPlaces.unshift(search);

        }
        else {
          if (listOfPlaces.length >= 5)
            listOfPlaces.pop();
          listOfPlaces.unshift(search);
        }
        AsyncStorage.setItem('HISTORY', JSON.stringify(listOfPlaces))
          .then(() => {
            this.setState({ history: listOfPlaces })
          })
          .catch(error => console.log(error.message))
      }
      else {
        let toInsert = JSON.stringify([search]);
        AsyncStorage.setItem('HISTORY', toInsert)
          .then(() => {
            this.setState({ history: [search] })
          })
          .catch(error => console.log(error.message))
      }
    })
    .catch(error => console.log(error.message))

};
//LIST OF RECENTLY SEARCHED.
export var searchHistoryList = new Promise((resolve, reject) => {
  AsyncStorage.getItem('HISTORY')
    .then((result) => {
      resolve(JSON.parse(result))
    })
    .catch(error => console.log(error.message))
});
//TO PUT THE ETA'S 
export function eTARefresh(n, data, position) {
  switch (n) {
    case 1: {
      axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${data}&destinations=${this.data.walkFrom.to}&key=${GOOGLE_KEY}`)
        .then(result => {
          const mins = Math.floor(result.data.rows[0].elements[0].duration.value / 60);
          this.setState({ etaD1: mins })
        })
        .catch(err => { console.log(err.message) })
    } break;
    case 2: {
      if (position == 1) {
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${data}&destinations=${this.data.walkFrom.to}&key=${GOOGLE_KEY}`)
          .then(result => {
            const mins = Math.floor(result.data.rows[0].elements[0].duration.value / 60);
            this.setState({ etaD1: mins });
          })
          .catch(err => { console.log(err.message) })
      }
      else if (position == 2) {
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${data}&destinations=${this.data.intercept.to}&key=${GOOGLE_KEY}`)
          .then(result => {
            const mins = Math.floor(result.data.rows[0].elements[0].duration.value / 60);
            this.setState({ etaD2: mins })
          })
          .catch(err => { console.log(err.message) })
      }
    } break;
    case 3: {
      if (position == 1) {
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${data}&destinations=${this.data.walkFrom.to}&key=${GOOGLE_KEY}`)
          .then(result => {
            const mins = Math.floor(result.data.rows[0].elements[0].duration.value / 60);
            this.setState({ etaD1: mins })
          })
          .catch(err => { console.log(err.message) })
      }
      else if (position == 2) {
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${data}&destinations=${this.data.intercept1.to}&key=${GOOGLE_KEY}`)
          .then(result => {
            const mins = Math.floor(result.data.rows[0].elements[0].duration.value / 60);
            this.setState({ etaD2: mins })
          })
          .catch(err => { console.log(err.message) })
      }
      else if (position == 3) {
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${data}&destinations=${this.data.intercept2.to}&key=${GOOGLE_KEY}`)
          .then(result => {
            const mins = Math.floor(result.data.rows[0].elements[0].duration.value / 60);
            this.setState({ etaD3: mins })
          })
          .catch(err => { console.log(err.message) })
      }
    } break;
  }



};
//GET ETAS (FOR RIDESHARE)
export function etaRideshare(data) {
  const DL = [data.latitude, data.longitude];//USER LOCATION
  const UL = [this.state.location.latitude, this.state.location.longitude];//DRIVER LOCATION

  axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${UL}&destinations=${DL}&key=${GOOGLE_KEY}`)
    .then(result => {
      const mins = Math.floor(result.data.rows[0].elements[0].duration.value / 60);
      this.setState({
        eta: mins,
        tripDuration: getTime(result.data.rows[0].elements[0].duration.value, this.state.tripDurationInSeconds)
      })
    })
    .catch(err => { console.log(err.message) })
};
//TO SEND OUT CARPOOL REQUESTS AND LISTEN TO UPDATES
export function carpoolRequestHandler(data_, historyData) {
  this.setState({ loading: true });
  AsyncStorage.getItem('USER_DETAILS')
    .then(result => {
      const userDetails = JSON.parse(result);
      const toSend = {
        userID: userDetails.userID,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        rating: userDetails.summarizedHistory.carpool.rating,
        tripNumber: userDetails.summarizedHistory.carpool.tripNumber,
        phoneNumber: userDetails.phoneNumber,
        data: data_,
      };
      const date = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate(),
        hour: new Date().getHours(),
        min: new Date().getMinutes(),
        seconds: new Date().getSeconds(),
      };
      axios.post('https://us-central1-perch-01.cloudfunctions.net/carpoolRequestSender', {
        data: toSend,
        historyData: historyData,
        date: date,
      })
        .then((result) => {
          if (result.data == 'INACTIVE')
            this.setState({ tripActive: false });

          this.setState({ userID: userDetails.userID, dateText: `userHistory/${userDetails.userID}/carpool/${date.year}/${monthNames[date.month]}/${date.day}-${date.hour}-${date.min}-${date.seconds}` });

        })
        .catch(e => {
          console.log(e.message);
          this.setState({ tripActive: false });
        })
    })
    .catch(error => { console.log(error.message) })

};
export function scheduledCarpoolRequestHandler(data_, historyData) {
  this.setState({ loading: true });
  AsyncStorage.getItem('USER_DETAILS')
    .then(result => {
      const userDetails = JSON.parse(result);
      const toSend = {
        userID: userDetails.userID,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        rating: userDetails.summarizedHistory.carpool.rating,
        tripNumber: userDetails.summarizedHistory.carpool.tripNumber,
        phoneNumber: userDetails.phoneNumber,
        data: data_,
      };
      const date = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate(),
        hour: new Date().getHours(),
        min: new Date().getMinutes(),
        seconds: new Date().getSeconds(),
      };
      axios.post('https://us-central1-perch-01.cloudfunctions.net/scheduledCarpoolRequestSender', {
        data: toSend,
        historyData: historyData,
        date: date,
        rawDate: this.state.rawDate,
      }).then(r => {
        if (r.data == 'COMPLETE')
          Alert.alert(
            'Request sent',
            'Your request has been sent to this driver. You can see a list of sent requests on the "Scheduled trips" option from the main screen menu.',
            [{
              text: 'Ok',
              style: 'cancel',
              onPress: () => {
                this.props.navigation.navigate('Main')
              },
            }])
        else if (r.data == 'INACTIVE')
          Alert.alert(
            'Request not sent',
            'Unfortunately, this driver is either inactive or already has a full car for this trip',
            [{
              text: 'Ok',
              style: 'cancel',
              onPress: () => {
                this.props.navigation.navigate('Main')
              },
            }])
      }).catch(error => { console.log(error.message) })
    }).catch(error => { console.log(error.message) })
};
export function scheduledCarpoolRequestCanceller(userID, driverID) {
  this.setState({ loading: true })
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/scheduledCarpoolRequestCanceller`, {
    userID: userID,
    driverID: driverID,
    from: 'user',
  }).then(() => {
    Alert.alert(
      'Request deleted',
      'Your request has successfully been deleted',
      [{
        text: 'Ok',
        style: 'cancel',
        onPress: () => {
          this.props.route.params.onRefresh();
          this.props.navigation.goBack();
        },
      }])

  }).catch(error => { console.log(error.message) })
};
export function startScheduledRiderTrip(userID, data) {
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/startScheduledRiderTrip`, { userID: userID })
    .then(() => {
      this.props.navigation.push('CarpoolTripDetails', {
        location: this.state.location,
        destination: this.state.destination,
        seatNumber: this.state.seatNumber,
        tripAccepted: true,
        userID: userID,
        data: data,
        hour: this.state.hours,
        min: this.state.minutes,
        dateText: this.state.dateText,
        now: true,
        handleOnNavigateBack: () => { },
        onRefresh: () => { },
      });
    }).catch(error => { console.log(error.message) })
};
//TO GET DRIVERS IN THE REGION
export function getDriversInit() {
  this.setState({ preliminarySearch: true });
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/preliminaryDriverEta`, {
    latitude: this.state.location.latitude,
    longitude: this.state.location.longitude,
    latitude1: this.state.destination.latitude,
    longitude1: this.state.destination.longitude,
  })
    .then((result) => {
      //let result = { data: { "packages": 210, "sedans": 'NORESULTS', "suvs": 'NORESULTS', "tripDuration": 603 } };
      this.setState({
        etaSedan: result.data.sedans == 'NORESULTS' ? 'UNAVAILABLE' : Math.ceil(result.data.sedans / 60),
        tripDurationSedan: result.data.sedans == 'NORESULTS' ? '' : getTime(result.data.sedans, result.data.tripDuration),

        etaSuv: result.data.suvs == 'NORESULTS' ? 'UNAVAILABLE' : Math.ceil(result.data.suvs / 60),
        tripDurationSuv: result.data.suvs == 'NORESULTS' ? '' : getTime(result.data.suvs, result.data.tripDuration),

        etaPackage: result.data.packages == 'NORESULTS' ? 'UNAVAILABLE' : Math.ceil(result.data.packages / 60),
        tripDurationPackage: result.data.packages == 'NORESULTS' ? '' : getTime(result.data.packages, result.data.tripDuration),

        preliminarySearch: false,

        tripDurationInSeconds: result.data.tripDuration,
      });
      let i = 0;
      if (result.data.sedans !== 'NORESULTS') i++
      if (result.data.suvs !== 'NORESULTS') i++
      if (result.data.packages !== 'NORESULTS') i++

      if (i === 3)
        this.setState({ orientation: 'space-between' })
      if (i == 2)
        this.setState({ orientation: 'space-around' });
      else if (i == 1)
        this.setState({ orientation: 'center' });
      else if (i == 0)
        this.setState({ unavailable: true });
    })
    .catch(error => { console.log(error.message) });


};
//SEND REQUEST TO DRIVER
export function rideshareRequestSender() {
  this.setState({ searchingForDriver: true });  ////SEND THE REQUEST BEFORE DOING THIS
  let carSize;
  switch (this.state.choice) {
    case 'normalSized': { carSize = 'SMALL' } break;
    case 'largeSized': { carSize = 'LARGE' } break;
    case 'package': { carSize = 'PACKAGE' } break;
  };
  const HOUR = new Date().getHours();
  const MIN = new Date().getMinutes();


  AsyncStorage.getItem('USER_DETAILS')
    .then(result => {
      const userDetails = JSON.parse(result);
      const userShareCode = HOUR + userDetails.lastName.substring(0, 1).toUpperCase() + userDetails.firstName.substring(0, 3).toUpperCase() + MIN;

      this.setState({ userID: userDetails.userID, userShareCode: userShareCode }, () => {
        axios.post(`https://us-central1-perch-01.cloudfunctions.net/createUserRideshareRequest`, {
          userID: userDetails.userID,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          rating: userDetails.summarizedHistory.rideshare.rating,
          tripNumber: userDetails.summarizedHistory.rideshare.tripNumber,
          latitude: this.state.location.latitude,
          longitude: this.state.location.longitude,
          latitude1: this.state.destination.latitude,
          longitude1: this.state.destination.longitude,
          carSize: carSize,
          phoneNumber: userDetails.phoneNumber,
        }).catch(error => { console.log(error.message) })
      })

    }).catch(error => { console.log(error.message) })

};
//TO CALL A DRIVER
export const callNumber = phone => {
  console.log('callNumber ----> ', phone);
  let phoneNumber = phone;
  if (Platform.OS !== 'android') {
    phoneNumber = `telprompt:${phone}`;
  }
  else {
    phoneNumber = `tel:${phone}`;
  }
  Linking.canOpenURL(phoneNumber)
    .then(supported => {
      if (!supported) {
        Alert.alert('Phone number is not available');
      } else {
        return Linking.openURL(phoneNumber);
      }
    })
    .catch(err => console.log(err));
};
//SEND THE RIDESHARE RATING
export function rideshareRatingHandler(rating, userID, driverID, historyRef) {//THE RIDESHARE HANDLER FOR THE RIDESHARE PORTION , WE SEND THIS TO THE SERVER
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/rideshareUserRatingHandler`, {
    rating: rating,
    userID: userID,
    driverID: driverID,
    historyRef: historyRef
  }).catch(error => { console.log(error.message) });
};
//SEND THE CARPOOL RATIMG
export function carpoolRatingHandler(rating, userID, driverID, historyRef) {
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/carpoolUserRatingHandler`, {
    rating: rating,
    userID: userID,
    driverID: driverID,
    historyRef: historyRef,
  }).catch(error => { console.log(error.message) })
};
//MAKE A RANDOMID
export function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `${result}${new Date().getTime()}`;
};
//CANCEL FUNCTION
export function cancelTrip(toSend) {
  this.setState({ cancelLoading: true }, () => {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/cancelTrip`, toSend)
      .then(() => {
        Alert.alert(
          'Your trip has been cancelled',
          'We would reach out to you shortly regarding refunds and compensation. Contact us for further information.',
          [{
            text: 'Done',
            style: 'cancel',
            onPress: () => {
              this.props.navigation.navigate('Main');
            },
          },
          ])
      })
      .catch(() => {
        Alert.alert(
          'Cancel request failed',
          'We failed to cancel this trip due to unknown reasons, please try again. Contact us for further help.',
          [{
            text: 'Close',
            style: 'cancel',
            onPress: () => {
              this.setState({ cancelLoading: false })
            },
          },
          ])
      })
  });

};
//SCHEDULED CANCEL FUNCTION
export function cancelScheduledTrip(toSend) {
  this.setState({ cancelLoading: true }, () => {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/cancelScheduledTrip`, toSend)
      .then(() => {
        Alert.alert(
          'Your trip has been cancelled',
          'We would reach out to you shortly regarding refunds and compensation. Contact us for further information.',
          [{
            text: 'Done',
            style: 'cancel',
            onPress: () => {
              this.props.navigation.navigate('Main');
            },
          },
          ])
      })
      .catch(() => {
        Alert.alert(
          'Cancel request failed',
          'We failed to cancel this trip due to unknown reasons, please try again. Contact us for further help.',
          [{
            text: 'Close',
            style: 'cancel',
            onPress: () => {
              this.setState({ cancelLoading: false })
            },
          },
          ])
      })
  });
};
export function storeCard(userID, cardObject) {
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/storeStripeCard`, { userID: userID, cardObject: cardObject })
    .then(() => {
      this.setState({ loading: false });
      Alert.alert('Card added', 'Your card has been successfully added', [{
        text: 'Ok',
        onPress: () => {
          this.props.route.params.refreshCards();
          this.props.navigation.goBack();
        }
      }])
    })
    .catch(error => {
      this.setState({ loading: false });
      Alert.alert('Error', error.message);
    });
}
export function chargeCustomer(toSend, dataToSend, historyData, usedPerchKms) {
  this.setState({ loading: true }, () => {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/chargeCustomer`, toSend)
      .then(result => {
        const { status, client_secret, id } = result.data;
        historyData.paymentIntentId = id;
        if (status == 'succeeded') {
          if (usedPerchKms) {
            perchKilometerPayment.call(this, {
              userID: this.state.userID,
              usedPerchKms: usedPerchKms,
            }, dataToSend, historyData)
          } else {
            if (this.state.now)
              carpoolRequestHandler.call(this, dataToSend, historyData);
            else
              scheduledCarpoolRequestHandler.call(this, dataToSend, historyData);
          }

        }
        else if (status == 'requires_action') {
          stripe.authenticatePaymentIntent({
            clientSecret: client_secret
          }).then(data => {
            if (data.status == 'requires_confirmation') {
              axios.post(`https://us-central1-perch-01.cloudfunctions.net/confirmStripePayment`, { paymentIntentId: data.paymentIntentId, cardId: data.paymentMethodId })
                .then((result_) => {
                  const status_ = result_.data.status;
                  if (status_ == 'succeeded') {
                    if (usedPerchKms) {
                      perchKilometerPayment.call(this, {
                        userID: this.state.userID,
                        usedPerchKms: usedPerchKms,
                      }, dataToSend, historyData)
                    } else {
                      if (this.state.now)
                        carpoolRequestHandler.call(this, dataToSend, historyData);
                      else
                        scheduledCarpoolRequestHandler.call(this, dataToSend, historyData);
                    }
                  }
                })
                .catch(error => {
                  Alert.alert(
                    'Payment Error',
                    `Error : ${error.message}`,
                    [{
                      text: 'Ok',
                      onPress: () => { this.props.navigation.goBack() }
                    }])
                })
            }
          }).catch(error => {
            Alert.alert(
              'Payment Error',
              `Error : ${error.message}`,
              [{
                text: 'Ok',
                onPress: () => { this.props.navigation.goBack() }
              }])
          })
        }
      })
      .catch(error => {
        Alert.alert(
          'Payment Error',
          `Error : ${error.message}`,
          [{
            text: 'Ok',
            onPress: () => { this.props.navigation.goBack() }
          }])
      });
  });
};

export function buyKilometers(toSend) {
  this.setState({ loading: true }, () => {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/buyPerchKilometers`, { ...toSend, status: 'initial' })
      .then(result => {
        const { status, client_secret, id } = result.data;
        toSend.paymentIntentId = id;
        toSend.status = 'confirm_payment';

        if (status == 'succeeded') {
          this.setState({ paymentCompleted: true })
        }
        else if (status == 'requires_action') {
          stripe.authenticatePaymentIntent({
            clientSecret: client_secret
          }).then(data => {
            if (data.status == 'requires_confirmation') {
              axios.post(`https://us-central1-perch-01.cloudfunctions.net/buyPerchKilometers`, { ...toSend, paymentIntentId: id, status: 'confirm_payment' })
                .then((result_) => {
                  const status_ = result_.data.status;
                  if (status_ == 'succeeded') {
                    this.setState({ paymentCompleted: true })
                  }
                })
                .catch(error => {
                  this.setState({ loading: false }, () => {
                    Alert.alert(
                      'Payment Error',
                      `Error : ${error.message}`)
                  });
                })
            }
          }).catch(error => {
            this.setState({ loading: false }, () => {
              Alert.alert(
                'Payment Error',
                `Error : ${error.message}`)
            });
          })
        }
      })
      .catch(error => {
        this.setState({ loading: false }, () => {
          Alert.alert(
            'Payment Error',
            `Error : ${error.message}`)
        });
      });
  });
};

export function perchKilometerDifference(perchKms, totalKms, rate) {
  if (perchKms >= totalKms) {
    const remainingPerchKms = perchKms - totalKms;
    return ({
      remainingPerchKms: remainingPerchKms,
      remainingTotalKms: 0,
      usedPerchKms: totalKms,
      remainingCost: 0,
    })
  } else {
    const remainingTotalKms = totalKms - perchKms + (totalKms - perchKms < 1.5 && totalKms - perchKms > 0 ? 1.5 - (totalKms - perchKms) : 0);

    return ({
      remainingPerchKms: 0 + (totalKms - perchKms < 1.5 && totalKms - perchKms > 0 ? 1.5 - (totalKms - perchKms) : 0),
      remainingTotalKms: remainingTotalKms,
      usedPerchKms: perchKms - (totalKms - perchKms < 1.5 && totalKms - perchKms > 0 ? 1.5 - (totalKms - perchKms) : 0),
      remainingCost: (remainingTotalKms * rate)
    })
  }
};

export function perchKilometerPayment(toSend, dataToSend, historyData) {
  this.setState({ loading: true }, () => {
    axios.post(`https://us-central1-perch-01.cloudfunctions.net/chargeCustomerPerchKms`, toSend)
      .then((result) => {//----PAYMENT IS COMPLETE, SEND PROCESS FOR DRIVER TO ACCESS----//
        if (this.state.now)
          carpoolRequestHandler.call(this, dataToSend, { ...historyData, perchKms: { amount: toSend.usedPerchKms, rate: result.data.rate } });
        else
          scheduledCarpoolRequestHandler.call(this, dataToSend, { ...historyData, perchKms: { amount: toSend.usedPerchKms, rate: result.data.rate } });
      })
      .catch(error => {
        Alert.alert('Perch Kilometer error', `Error: ${error.message}. Please contact us for further assistance and refunds`, [
          {
            text: 'Ok',
            onPress: () => { this.props.navigation.goBack() }
          }
        ])
      })
  });
};

export function deleteCard(userID, last4, selected) {
  axios.post(`https://us-central1-perch-01.cloudfunctions.net/deleteStripeCard`, { userID: userID, last4: last4, selected: selected });
};
export function calculateZone(aH, bH, aM, bM, oldzone) {
  let newzone;

  switch (oldzone) {
    case 'AM': { newzone = 'PM' } break;
    case 'PM': { newzone = 'AM' } break;
  };

  if (((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60)) > 12)
    return newzone;
  else
    return oldzone
};
export function calculateTime(aH, bH, aM, bM) {
  const re = ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60)) > 12 ?
    ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60)) - 12 :
    ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60));

  return re;
};
export function nN(d) {
  return Number(d);
};
//CALCULATE DISTANCE IN METERS
export function polylineLenght(data) {
  let distance = 0;
  for (let k = 0; k < data.length - 1; k++)
    distance += distanceCalculator(data[k][0], data[k][1], data[k + 1][0], data[k + 1][1])

  return (distance)
};
export function sendFeedback() {
  if (this.state.issue == 'choice')
    Alert.alert('Topic needed', 'Please pick a topic to contact us about. If you do not have one, please pick "Other"')
  else {
    this.setState({ loading: true }, () => {
      AsyncStorage.getItem('USER_DETAILS')
        .then(result => {
          const userDetails = JSON.parse(result);

          database().ref(`userFeedback/${userDetails.userID}`).update({
            [new Date().getTime()]: {
              body: this.state.form,
              subject: this.state.issue,
              status: 'UNPROCESSED',
              date: getDate(),
            }
          }).then(() => {
            this.setState({ messageSent: true, form: '', }, () => {
              this.setState({ loading: false })
            })
          })
            .catch(error => { console.log(error.message) })
        }).catch(error => { console.log(error.message) })
    })
  }
};
export function changePassword(oldPassword, newPassword) {
  this.setState({ loading: true }, () => {
    AsyncStorage.getItem('USER_DETAILS')
      .then(r => {
        const email = JSON.parse(r).email;
        const password = oldPassword;

        auth().signInWithEmailAndPassword(email, password)
          .then(() => {
            auth().currentUser.updatePassword(newPassword)
              .then(() => {
                Alert.alert('Password changed',
                  'Your password has been changed successfully',
                  [
                    {
                      text: 'Ok',
                      onPress: () => { this.props.navigation.goBack() },
                      style: 'cancel'
                    },
                  ],
                  { cancelable: false })
              })
              .catch(error => this.setState({ errorMessage: error.message, loading: false }));
          })
          .catch(error => this.setState({ errorMessage: error.message, loading: false }));
      }).catch(error => { console.log(error.message) })
  })
};
export function sendPasswordResetLink(email) {
  auth().sendPasswordResetEmail(email)
    .then(() => {
      Alert.alert('Email sent', 'Your password reset email has been successfully send',
        [{ text: 'Ok', onPress: () => { this.props.navigation.goBack() } }])
    }).catch(error => {
      Alert.alert(`Error`, error.message);
      this.setState({ loading: false })
    })
};
export async function openBrowser(URL) {
  try {
    const url = URL;//'https://www.perchrides.com'
    await InAppBrowser.isAvailable()
    InAppBrowser.open(url, {
      // iOS Properties
      dismissButtonStyle: 'close',
      preferredBarTintColor: 'rgb(64, 64, 64)',
      preferredControlTintColor: 'white',
      modalPresentationStyle: 'fullScreen',
      // Android Properties
      showTitle: true,
      toolbarColor: 'rgb(64, 64, 64)',
      secondaryToolbarColor: colors.WHITE,
      enableUrlBarHiding: true,
      enableDefaultShare: true,
      forceCloseOnRedirection: true,
    }).then((result) => {
      //Alert.alert(JSON.stringify(result))
    })
  } catch (error) {
    Alert.alert('Error opening browser',
      'Please open the browser manually and go to our website to delete your account')
  }
};
export function distanceCalculator(lat1, lon1, lat2, lon2) {
  let R = 6371 * 1000; // Radius of the earth in m
  let dLat = deg2rad(lat2 - lat1);  // deg2rad below
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in m
  return d;
};
function deg2rad(deg) {
  return deg * (Math.PI / 180)
};
function getTime(eta, duration) {
  const currentTime = new Date().getSeconds() + (new Date().getMinutes() * 60) + (new Date().getHours() * 60 * 60);
  const etaArrival = eta;//INSERT ETA ARRIVAL HERE
  const tripDuration = duration;//INSERT TRIP DURATION HERE.....ALL IN SECONDS

  const tripEnd = (new Date((currentTime + tripDuration + etaArrival) * 1000).toISOString().substr(11, 8));
  const hour_ = Number(tripEnd.substr(0, 2));
  const minutes = (tripEnd.substr(3, 2))
  const meridien = hour_ >= 12 ? 'PM' : 'AM';
  const hour = hour_ > 12 ? hour_ - 12 : (hour_ == 0 ? 12 : hour_);
  const TIME = `${hour}:${minutes} ${meridien}`;
  return TIME;
};
export function indexFinder(searchMe, value) {
  for (let j = 0; j < searchMe.length; j++)
    if (searchMe[j][0] === value[0] && searchMe[j][1] === value[1])
      return j;

  return -1;
};
//DIMENSION ASSERT
export function dimensionAssert() {
  return (height < 800);
};
export function x(data) {
  return (data / 375) * width;
};
export function y(data, isFontSize) {
  // if (height < 800)
  //   return ((data / 812) * height) + 3;
  // else
  if (isFontSize && height >= 812) {
    return (data + 3);
  } else
    return ((data / 812) * height) + 3;
};
export const CustomLayoutLinear = {
  duration: 200,
  create: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.linear,
  },
  delete: {
    duration: 50,
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
};
export function getDate() {
  const DAY = new Date().getDate();
  const MONTH = new Date().getMonth();
  const YEAR = new Date().getFullYear();
  const HOUR = new Date().getHours();
  const MIN = new Date().getMinutes();
  const SECOND = new Date().getSeconds();

  return (`${YEAR}-${MONTH}-${DAY}-${HOUR}-${MIN}-${SECOND}`);
};
export function dateformat(time) {
  let slash1 = 0, slash2 = 0, slash3 = 0;
  for (let k = 0; k < time.length; k++) {
    if (time.charAt(k) == '-')
      slash1 == 0 ? slash1 = k : slash2 == 0 ? slash2 = k : slash3 = k;

    if (slash3 != 0)
      break;
  };

  const y = time.substring(0, slash1);
  const m = time.substring(slash1 + 1, slash2);
  const d = time.substring(slash2 + 1, slash3);

  return `${d}/${Number(m) + 1}/${y}`;
};
export function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);


  return { hours: h, minutes: m };
};
export const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

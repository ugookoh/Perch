import AsyncStorage from '@react-native-community/async-storage';
import Clipboard from '@react-native-community/clipboard';
import database from '@react-native-firebase/database';
import * as turf from '@turf/turf'; //for encoding polylines
import React from 'react';
import { Alert, Animated, PanResponder, Platform, StatusBar, Switch, Text, TouchableOpacity, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { MaterialIndicator } from 'react-native-indicators';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon__ from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Feather';
import Icon_ from 'react-native-vector-icons/FontAwesome';
import { DriverProfile } from '../../Components/BreakdownCardsWithCombiners/BreakdownCardsWithCombiners';
import Button from '../../Components/Button/Button';
import CarpoolSlider from '../../Components/CarpoolSlider/CarpoolSlider';
import Divider from '../../Components/Divider/Divider';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import {
    callNumber,
    cancelScheduledTrip, cancelTrip, carpoolRatingHandler,
    dimensionAssert, height, OfflineNotice,
    polylineLenght, startScheduledRiderTrip, width, x, y,
    colors
} from '../../Functions/Functions';
import BlueIcon from '../../Images/svgImages/blueIcon';
import GreenIcon from '../../Images/svgImages/greenIcon';
import PurpleIcon from '../../Images/svgImages/purpleIcon';
import styles from './styles';
import DriverRating from './DriverRating';
import SvgComponent from './SvgComponent';
const X_CONSTANT = 0;
const Y_START_ = y(dimensionAssert() ? 360 : 425);
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const edgePadding = {
    top: y(70),
    right: x(80),
    bottom: y(70),
    left: x(25)
};
export default class CarpoolRideConfirmed extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sendUserLocation: true,
            remainingDistance: null,
            nextDriverDistances: null,
            originalTotalDistance: null,
            dateText: this.props.dateText,
            cancelAlert: false,

            driver1Rating: 0,
            driver2Rating: 0,
            driver3Rating: 0,

            loading: false,
            cancelLoading: false,
            callScreen: false,
            messageScreen: false,
            navigationLoading: false,

            location: this.props.location,
            destination: this.props.destination,
            seatNumber: this.props.seatNumber,
            hours: this.props.hours,
            minutes: this.props.minutes,
            shareCode: '------',
            animate: true,

            currentLocation: null,

        };
        this.data = this.props.data;
        this.ratingTop = new Animated.Value(height);
        this.ratingShown = false;
        this.value;
        this.direction;
        this.headerInverse = new Animated.Value(-Y_START_);
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START_ });//This is the value we are animating to.
        this.position.y.addListener(({ value }) => {
            this.headerInverse.setValue(-value);
            if (value >= Y_START_ && this.direction === 'downwards') {
                this.position.stopAnimation(() => {
                    this.direction = 'upwards';

                    const Y_POSITION = Number(value);
                    if ((Y_POSITION > Y_START_ && this.direction === 'upwards'))
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: Y_START_ },
                            useNativeDriver: false,
                        }).start();
                });
            }
            else if ((value <= this.TOP_OF_TRIPS) && this.direction === 'upwards') {
                this.direction = 'downwards';
                this.position.stopAnimation(() => {
                    if (value < this.TOP_OF_TRIPS)
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: (this.TOP_OF_TRIPS + 1) },
                            useNativeDriver: false,
                        }).start();
                })
            }

        });

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 10 || Math.abs(gestureState.dy) >= 10;

            },
            onPanResponderGrant: (evt, gestureState) => {
                this.position.stopAnimation();
                this.position.setOffset({ x: X_CONSTANT, y: this.position.y._value });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });
                this.value = Number(JSON.stringify(this.position.y));
            },
            onPanResponderMove: (evt, gestureState) => {
                this.position.stopAnimation();
                const Y_POSITION = (this.value + gestureState.dy);
                if (Y_POSITION <= Y_START_ && Y_POSITION >= this.TOP_OF_TRIPS)
                    this.position.setValue({ x: X_CONSTANT, y: (gestureState.dy) });

                if (Math.sign(gestureState.vy) == 1) //going down
                    this.direction = 'downwards';
                else if (Math.sign(gestureState.vy) == -1)//going upwards
                    this.direction = 'upwards';

            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();

                const Y_POSITION = Number(JSON.stringify(this.position.y));
                if (Y_POSITION < Y_START_) {
                    Animated.decay(this.position, {
                        velocity: { x: 0, y: gestureState.vy }, // velocity from gesture release
                        useNativeDriver: false,
                    }).start();

                    if (Math.sign(gestureState.vy) == 1) //going down
                        this.direction = 'downwards';
                    else if (Math.sign(gestureState.vy) == -1)//going upwards
                        this.direction = 'upwards';

                }
                else if (Y_POSITION > Y_START_) {
                    this.direction = 'upwards';
                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_START_ }, // velocity from gesture release
                        useNativeDriver: false,
                    }).start();
                }
            },
        });
        this._Y_START = y(55);
        this._Y_END = -y(100);
        this.position_ = new Animated.ValueXY({ x: 0, y: this._Y_END });
    };

    componentDidMount() {
        const data = this.data;
        database().ref(`carpoolTripReserve/carpool/user/${this.props.userID}`).on('child_removed', snapshot => {
            if (this?.props?.animateMapToCurrentRegion)
                this.props.animateMapToCurrentRegion();

            setTimeout(() => {
                if (!this.props.tripEnded)
                    this.props.navigation.navigate("Main");
            }, 3000);
        })
        AsyncStorage.getItem('USER_DETAILS').then(result => {
            const userDetails = JSON.parse(result);
            this.setState({ shareCode: userDetails.shareCode });
        })
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    currentLocation: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }
                });
                database().ref(`userLocation/${this.props.userID}`).set({
                    location: { latitude: position.coords.latitude, longitude: position.coords.longitude },
                    shareLocation: true,
                }).catch(e => { console.log(e.message) });
            },
            (error) => {
                console.log(error.code, error.message);
                Geolocation.requestAuthorization();
            },
            {
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        ).catch((error) => {
            console.log(error.code, error.message);
            Geolocation.requestAuthorization();
        });

        this.watchID = Geolocation.watchPosition(position => {//THIS HAPPENS AS THE USER MOVES OR CHANGES LOCATION
            this.setState({
                currentLocation: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }
            })
            if (this.timeoutFunction && this.state.sendUserLocation) {
                database().ref(`userLocation/${this.props.userID}`).set({
                    location: { latitude: position.coords.latitude, longitude: position.coords.longitude },
                    shareLocation: true,
                }).catch(e => { console.log(e.message) });

                this.timeoutFunction = false;
            }
        },
            error => (console.log(error.message)),
            {
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                distanceFilter: 10,
            }
        );

        this.timeout = setInterval(() => {
            this.timeoutFunction = true;
        }, 10000);
        //CHATS
        switch (data.steps) {
            case 1: {
                this.keys1 = [];
                this.firstMessagesGotten1 = false;
                database().ref(`chats/${this.props.userID}-${data.key}/`).once('value', snap => {
                    this.keys1 = Object.keys(snap.val() || {});
                    if (snap.val()) {
                        let arrayToAppend = [], i = 0;
                        snap.forEach(val => {
                            arrayToAppend[i] = val.val();
                            i++;
                        });

                        this.firstMessagesGotten1 = true;
                    }
                    else {
                        this.firstMessagesGotten1 = true;

                    }
                });
                database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).on('child_added', snapshot => {

                    if (this.firstMessagesGotten1 && this.keys1.includes(snapshot.key) == false) {

                        if (snapshot.val().sender == 'O')
                            this.sendNotification(this.state.driverDetails ? this.state.driverDetails.name : 'Driver', snapshot.val().m) //ENABLE DEEP LINKING

                    };
                });
            } break
            case 2: {
                this.keys1 = [];
                this.firstMessagesGotten1 = false;
                database().ref(`chats/${this.props.userID}-${data.start}/`).once('value', snap => {
                    this.keys1 = Object.keys(snap.val() || {});
                    if (snap.val()) {
                        let arrayToAppend = [], i = 0;
                        snap.forEach(val => {
                            arrayToAppend[i] = val.val();
                            i++;
                        });

                        this.firstMessagesGotten1 = true;
                    }
                    else {
                        this.firstMessagesGotten1 = true;

                    }
                });
                database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).on('child_added', snapshot => {

                    if (this.firstMessagesGotten1 && this.keys1.includes(snapshot.key) == false) {

                        if (snapshot.val().sender == 'O')
                            this.sendNotification(this.state.driverDetails ? this.state.driverDetails.name : 'Driver', snapshot.val().m) //ENABLE DEEP LINKING

                    };
                });
                this.keys2 = [];
                this.firstMessagesGotten2 = false;
                database().ref(`chats/${this.props.userID}-${data.end}/`).once('value', snap => {
                    this.keys2 = Object.keys(snap.val() || {});
                    if (snap.val()) {
                        let arrayToAppend = [], i = 0;
                        snap.forEach(val => {
                            arrayToAppend[i] = val.val();
                            i++;
                        });

                        this.firstMessagesGotten2 = true;
                    }
                    else {
                        this.firstMessagesGotten2 = true;

                    }
                });
                database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).on('child_added', snapshot => {

                    if (this.firstMessagesGotten2 && this.keys2.includes(snapshot.key) == false) {

                        if (snapshot.val().sender == 'O')
                            this.sendNotification(this.state.driverDetails ? this.state.driverDetails.name : 'Driver', snapshot.val().m) //ENABLE DEEP LINKING

                    };
                });
            } break;
            case 3: {
                this.keys1 = [];
                this.firstMessagesGotten1 = false;
                database().ref(`chats/${this.props.userID}-${data.start}/`).once('value', snap => {
                    this.keys1 = Object.keys(snap.val() || {});
                    if (snap.val()) {
                        let arrayToAppend = [], i = 0;
                        snap.forEach(val => {
                            arrayToAppend[i] = val.val();
                            i++;
                        });

                        this.firstMessagesGotten1 = true;
                    }
                    else {
                        this.firstMessagesGotten1 = true;

                    }
                });
                database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).on('child_added', snapshot => {

                    if (this.firstMessagesGotten1 && this.keys1.includes(snapshot.key) == false) {

                        if (snapshot.val().sender == 'O')
                            this.sendNotification(this.state.driverDetails ? this.state.driverDetails.name : 'Driver', snapshot.val().m) //ENABLE DEEP LINKING

                    };
                });
                this.keys2 = [];
                this.firstMessagesGotten2 = false;
                database().ref(`chats/${this.props.userID}-${data.end}/`).once('value', snap => {
                    this.keys2 = Object.keys(snap.val() || {});
                    if (snap.val()) {
                        let arrayToAppend = [], i = 0;
                        snap.forEach(val => {
                            arrayToAppend[i] = val.val();
                            i++;
                        });

                        this.firstMessagesGotten2 = true;
                    }
                    else {
                        this.firstMessagesGotten2 = true;

                    }
                });
                database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).on('child_added', snapshot => {

                    if (this.firstMessagesGotten2 && this.keys2.includes(snapshot.key) == false) {

                        if (snapshot.val().sender == 'O')
                            this.sendNotification(this.state.driverDetails ? this.state.driverDetails.name : 'Driver', snapshot.val().m) //ENABLE DEEP LINKING

                    };
                });
                this.keys3 = [];
                this.firstMessagesGotten3 = false;
                database().ref(`chats/${this.props.userID}-${data.start}/`).once('value', snap => {
                    this.keys3 = Object.keys(snap.val() || {});
                    if (snap.val()) {
                        let arrayToAppend = [], i = 0;
                        snap.forEach(val => {
                            arrayToAppend[i] = val.val();
                            i++;
                        });

                        this.firstMessagesGotten3 = true;
                    }
                    else {
                        this.firstMessagesGotten3 = true;

                    }
                });
                database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).on('child_added', snapshot => {

                    if (this.firstMessagesGotten3 && this.keys3.includes(snapshot.key) == false) {

                        if (snapshot.val().sender == 'O')
                            this.sendNotification(this.state.driverDetails ? this.state.driverDetails.name : 'Driver', snapshot.val().m) //ENABLE DEEP LINKING

                    };
                });

            } break;
        }
    };
    zoomOut() {
        const data = this.data;
        switch (data.steps) {
            case 1: {
                let r = [...data.firstLeg, [this.props.location.latitude, this.props.location.longitude], [this.props.destination.latitude, this.props.destination.longitude]];
                const line = turf.lineString(r);
                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.props.driverL1) {
                    bboxPolygon.push(this.props.driverL1);
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding: edgePadding,
                        })
                }

            } break;
            case 2: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push([this.props.location.latitude, this.props.location.longitude], [this.props.destination.latitude, this.props.destination.longitude])
                const line = turf.lineString(r);
                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.props.driverL1 && this.props.driverL2) {
                    bboxPolygon.push(this.props.driverL1, this.props.driverL2);
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding: edgePadding,
                        })
                }


            } break;
            case 3: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push(...data.thirdLeg);
                r.push([this.props.location.latitude, this.props.location.longitude], [this.props.destination.latitude, this.props.destination.longitude])
                const line = turf.lineString(r);
                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.props.driverL1 && this.props.driverL2 && this.props.driverL3) {
                    bboxPolygon.push(this.props.driverL1, this.props.driverL2, this.props.driverL3);
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding: edgePadding,
                        })
                }
            } break;
        };
    };
    zoomIn() {
        const data = this.data;
        switch (data.steps) {
            case 1: {
                let r = [...data.firstLeg, [this.props.location.latitude, this.props.location.longitude], [this.props.destination.latitude, this.props.destination.longitude]];
                const line = turf.lineString(r);
                const bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.props.driverL1) {
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding: edgePadding,
                        })
                }
            } break;
            case 2: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push([this.props.location.latitude, this.props.location.longitude], [this.props.destination.latitude, this.props.destination.longitude])
                const line = turf.lineString(r);
                const bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.props.driverL1 && this.props.driverL2) {
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding: edgePadding,
                        })
                }

            } break;
            case 3: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push(...data.thirdLeg);
                r.push([this.props.location.latitude, this.props.location.longitude], [this.props.destination.latitude, this.props.destination.longitude])
                const line = turf.lineString(r);
                const bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.props.driverL1 && this.props.driverL2 && this.props.driverL3) {
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding: edgePadding,
                        })
                }
            } break;
        };
    };
    showRating() {
        if (this.ratingShown)
            Animated.spring(this.ratingTop, {
                toValue: 0,
                bounciness: 0,
                useNativeDriver: false,
            }).start();
    }
    nextDriverDistancesSetter(value, value2) {
        this.setState({ nextDriverDistances: value, originalTotalDistance: value2 });
    };
    animate = () => {
        if (this.state.animate)
            this.setState({ animate: false }, () => {
                Animated.spring(this.position_, {
                    toValue: { x: 0, y: this._Y_START },
                    bounciness: 0,
                    useNativeDriver: false,
                }).start(() => {
                    setTimeout(() => {
                        Animated.spring(this.position_, {
                            toValue: { x: 0, y: this._Y_END },
                            bounciness: 0,
                            useNativeDriver: false,
                        }).start(() => {
                            this.setState({ animate: true })
                        });
                    }, 2000);//HIDE BACK AFTER 2 SECONDS
                });
            });
    };
    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
        clearInterval(this.timeout);
    };
    render() {
        if (this.props.tripEnded && this.ratingShown == false) {
            this.ratingShown = true;
            this.showRating.call(this);
        }
        const scale_ = this.position.y.interpolate({
            inputRange: [Y_START_, y(691)],
            outputRange: [1, 2.7],
            extrapolate: 'clamp',
        });
        const data = this.props.data;
        let totalDistance = this.props.totalDistance;
        let remainingDistance = this.state.remainingDistance != null ? this.state.remainingDistance : totalDistance;

        remainingDistance > 100 ?
            remainingDistance = `${(remainingDistance / 1000).toFixed(1)} KM` :
            remainingDistance = `${(remainingDistance).toFixed(remainingDistance != 0 ? 1 : 0)} M`;

        let fullTripPoly, marginTopNextDriver = y(14), nextDriver = <></>;
        let loadingComplete = false;
        let ratingStack = <></>;
        let phones = <></>;
        let messages = <></>;
        let justifyContent_ = 'space-between';
        let driverID1, driverID2, driverID3;
        let driverIDArray = [];
        switch (data.steps) {
            case 1: {
                driverID1 = data.key;
                driverIDArray = [driverID1];
                if (this.props.driver1) {
                    loadingComplete = true;
                    ratingStack = (
                        <DriverRating
                            rating={this.state.driver1Rating}
                            starColor={colors.GREEN}
                            ratingAdjust={(rating) => {
                                this.setState({ driver1Rating: rating })
                            }}
                            driverName={`${this.props.driver1.name}`}
                            driver={this.props.driver1}
                        />
                    );

                    phones = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.GREEN }]} onPress={() => { callNumber(this.props.driver1.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                        </>
                    );
                    messages = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.GREEN }]}
                                    onPress={() => {
                                        if (this.props.getFirstEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID1,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                        </>
                    )
                    justifyContent_ = 'center';
                }


                fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2];
                totalDistance = polylineLenght(fullTripPoly);


                if (this.props.getFirstEta)
                    nextDriver = (
                        <>
                            <View style={[{ marginTop: y(30) }]}>
                                <DriverProfile
                                    now={this.props.now}
                                    color={colors.GREEN}
                                    driver={this.props.driver1 ? this.props.driver1 : null}
                                    eta={this.props.etaD1}
                                    style={'carpool'}
                                />
                            </View>
                            <View style={[styles.divider, { marginTop: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                        </>
                    );
                else
                    marginTopNextDriver = y(25);

            } break;
            case 2: {
                driverID1 = data.start;
                driverID2 = data.end;
                driverIDArray = [driverID1, driverID2];
                if (this.props.driver1 && this.props.driver2) {
                    loadingComplete = true;
                    ratingStack = (
                        <>
                            <DriverRating
                                rating={this.state.driver1Rating}
                                starColor={colors.GREEN}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver1Rating: rating })
                                }}
                                driverName={`${this.props.driver1.name}`}
                                driver={this.props.driver1}
                            />
                            <DriverRating
                                rating={this.state.driver2Rating}
                                starColor={colors.BLUE}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver2Rating: rating })
                                }}
                                driverName={`${this.props.driver2.name}`}
                                driver={this.props.driver2}
                            />
                        </>
                    );

                    phones = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.GREEN }]} onPress={() => { callNumber(this.props.driver1.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.GREEN }]}>{`1st driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.BLUE }]} onPress={() => { callNumber(this.props.driver2.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.BLUE }]}>{`2nd driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver2.firstName}</Text>
                            </View>
                        </>
                    );
                    messages = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.GREEN }]}
                                    onPress={() => {
                                        if (this.props.getFirstEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID1,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.GREEN }]}>{`1st driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.BLUE }]}
                                    onPress={() => {
                                        if (this.props.getSecondEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID2,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.BLUE }]}>{`2nd driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver2.firstName}</Text>
                            </View>
                        </>
                    )
                }


                fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3];
                totalDistance = polylineLenght(fullTripPoly);



                if (this.props.getFirstEta)
                    nextDriver = (
                        <>
                            <View style={[{ marginTop: y(30) }]}>
                                <DriverProfile
                                    color={colors.GREEN}
                                    driver={this.props.driver1 ? this.props.driver1 : null}
                                    eta={this.props.etaD1}
                                    style={'carpool'}
                                />
                            </View>
                            <View style={[styles.divider, { marginTop: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                        </>
                    );
                else if (this.props.getSecondEta)
                    nextDriver = (
                        <>
                            <View style={[{ marginTop: y(30) }]}>
                                <DriverProfile
                                    color={colors.BLUE}
                                    driver={this.props.driver2 ? this.props.driver2 : null}
                                    eta={this.props.etaD2}
                                    style={'carpool'}
                                />
                            </View>
                            <View style={[styles.divider, { marginTop: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                        </>
                    );
                else
                    marginTopNextDriver = y(25);


            } break;
            case 3: {
                driverID1 = data.start;
                driverID2 = data.middle;
                driverID3 = data.end;
                driverIDArray = [driverID1, driverID2, driverID3];
                if (this.props.driver1 && this.props.driver2 && this.props.driver3) {
                    loadingComplete = true;
                    ratingStack = (
                        <>
                            <DriverRating
                                rating={this.state.driver1Rating}
                                starColor={colors.GREEN}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver1Rating: rating })
                                }}
                                driverName={`${this.props.driver1.name}`}
                                driver={this.props.driver1}
                            />
                            <DriverRating
                                rating={this.state.driver2Rating}
                                starColor={colors.BLUE}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver2Rating: rating })
                                }}
                                driverName={`${this.props.driver2.name}`}
                                driver={this.props.driver2}
                            />
                            <DriverRating
                                rating={this.state.driver3Rating}
                                starColor={colors.PURPLE}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver3Rating: rating })
                                }}
                                driverName={`${this.props.driver3.name}`}
                                driver={this.props.driver3}
                            />
                        </>
                    );

                    phones = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.GREEN }]} onPress={() => { callNumber(this.props.driver1.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.GREEN }]}>{`1st driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.BLUE }]} onPress={() => { callNumber(this.props.driver2.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.BLUE }]}>{`2nd driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver2.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.PURPLE }]} onPress={() => { callNumber(this.props.driver3.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.PURPLE }]}>{`3rd driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver3.firstName}</Text>
                            </View>
                        </>
                    );
                    messages = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.GREEN }]}
                                    onPress={() => {
                                        if (this.props.getFirstEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID1,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.GREEN }]}>{`1st driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.BLUE }]}
                                    onPress={() => {
                                        if (this.props.getSecondEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID2,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.BLUE }]}>{`2nd driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver2.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: colors.PURPLE }]}
                                    onPress={() => {
                                        if (this.props.getThirdEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID3,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={colors.WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: colors.PURPLE }]}>{`3rd driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver3.firstName}</Text>
                            </View>
                        </>
                    );
                }

                fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3, ...data.thirdLeg, ...data.walk4];
                totalDistance = polylineLenght(fullTripPoly);



                if (this.props.getFirstEta)
                    nextDriver = (
                        <>
                            <View style={[{ marginTop: y(30) }]}>
                                <DriverProfile
                                    color={colors.GREEN}
                                    driver={this.props.driver1 ? this.props.driver1 : null}
                                    eta={this.props.etaD1}
                                    style={'carpool'}
                                />
                            </View>
                            <View style={[styles.divider, { marginTop: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                        </>
                    );
                else if (this.props.getSecondEta)
                    nextDriver = (
                        <>
                            <View style={[{ marginTop: y(30) }]}>
                                <DriverProfile
                                    color={colors.BLUE}
                                    driver={this.props.driver2 ? this.props.driver2 : null}
                                    eta={this.props.etaD2}
                                    style={'carpool'}
                                />
                            </View>
                            <View style={[styles.divider, { marginTop: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                        </>
                    );
                else if (this.props.getThirdEta)
                    nextDriver = (
                        <>
                            <View style={[{ marginTop: y(30) }]}>
                                <DriverProfile
                                    color={colors.PURPLE}
                                    driver={this.props.driver3 ? this.props.driver3 : null}
                                    eta={this.props.etaD3}
                                    style={'carpool'}
                                />
                            </View>
                            <View style={[styles.divider, { marginTop: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                        </>
                    );
                else
                    marginTopNextDriver = y(25);
            } break;
        };
        if (loadingComplete && this.state.navigationLoading == false)
            return (
                <View style={styles.container}>
                    <Animated.View style={[{ width: width, alignItems: 'center', position: 'absolute', zIndex: 10, elevation: 10 }, this.position_.getLayout()]}>
                        <View style={{ height: y(70), borderRadius: 10, width: x(313), backgroundColor: colors.GREEN, justifyContent: 'space-around', alignItems: 'center', paddingVertical: y(20) }}>
                            <Text style={{ fontFamily: 'Gilroy-SemiBold', fontSize: y(14, true), color: colors.WHITE }}>Copied to clipboard</Text>
                        </View>
                    </Animated.View>
                    <StatusBar backgroundColor={'#000000'} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.screenName} />
                    {
                        this.state.cancelLoading ?
                            <View style={[styles.cancelContainer, {}]}>
                                <View style={styles.cancelLoadingContainer}>
                                    <MaterialIndicator color={colors.GREEN} size={x(35)} style={{}} />
                                    <Text style={styles.cancelLoadingText}>We are cancelling your trip. Please do not go back or close this screen.</Text>
                                </View>
                            </View> : <></>
                    }
                    {
                        this.state.cancelAlert == true ?
                            <View style={styles.cancelAlertContainer}>
                                <View style={styles.cancelAlert}>
                                    <View style={styles.cancelAlertUpper}>
                                        <Text style={[styles.cancelText, { fontSize: y(17, true), marginBottom: y(6) }]}>Leave this screen?</Text>
                                        <Text style={[styles.cancelText, { fontSize: y(13, true), marginBottom: y(10), fontFamily: 'Gilroy-Regular' }]}>Leave this screen?</Text>
                                    </View>
                                    <View style={[{ flexDirection: 'row' }]}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                // this.tripIsOver.call(this);
                                                this.props.endTrip();
                                            }}
                                            style={[styles.cancelAlertLower, { borderRightWidth: 0.5, borderColor: 'rgba(64, 61, 61, 0.3)', }]}>
                                            <Text style={[styles.cancelText, { fontSize: y(15, true), color: colors.RED, marginVertical: y(15) }]}>Exit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { this.setState({ cancelAlert: false }) }} style={[styles.cancelAlertLower, { borderLeftWidth: 0.5, borderColor: 'rgba(64, 61, 61, 0.3)', }]}>
                                            <Text style={[styles.cancelText, { fontSize: y(15, true), color: colors.GREEN, marginVertical: y(15) }]}>Stay</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View> :
                            <></>
                    }
                    {
                        this.state.callScreen ?
                            <View style={styles.cancelAlertContainer}>
                                <View style={[styles.cancelAlert, { padding: x(10), width: x(270) }]}>
                                    <View style={[styles.cancelIcon, {}]}>
                                        <TouchableOpacity onPress={() => { this.setState({ callScreen: false, }) }} style={{ width: y(40), height: y(40) }}>
                                            <Icon name={'x'} size={y(26)} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={[styles.cancelText, { fontSize: y(17, true), marginBottom: y(6) }]}>Pick the driver you want to call</Text>
                                    <View style={[styles.phoneContainer, { justifyContent: justifyContent_ }]}>
                                        {phones}
                                    </View>
                                </View>
                            </View> :
                            <></>
                    }
                    {
                        this.state.messageScreen ?
                            <View style={styles.cancelAlertContainer}>
                                <View style={[styles.cancelAlert, { padding: x(10), width: x(270) }]}>
                                    <View style={[styles.cancelIcon, {}]}>
                                        <TouchableOpacity onPress={() => { this.setState({ messageScreen: false, }) }} style={{ width: y(40), height: y(40) }}>
                                            <Icon name={'x'} size={y(26)} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={[styles.cancelText, { fontSize: y(17, true), marginBottom: y(6) }]}>Pick the driver you want to text</Text>
                                    <View style={[styles.phoneContainer, { justifyContent: justifyContent_ }]}>
                                        {messages}
                                    </View>
                                </View>
                            </View> :
                            <></>
                    }
                    <TouchableOpacity style={[styles.zoomIcon, { backgroundColor: colors.RED, top: y(70), right: x(10) }]} onPress={() => { this.setState({ cancelAlert: true }) }}>
                        <Icon name={'x'} size={y(21)} color={'#FFFFFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 135 : 120), right: x(10) }]} onPress={this.zoomIn.bind(this)}>
                        <Icon name={'zoom-in'} size={y(21)} color={colors.GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 200 : 170), right: x(10) }]} onPress={this.zoomOut.bind(this)}>
                        <Icon name={'zoom-out'} size={y(21)} color={colors.GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 265 : 220), right: x(10) }]}
                        onPress={() => {
                            Geolocation.getCurrentPosition(
                                (position) => {
                                    this.map.animateToRegion({
                                        latitude: position.coords.latitude,
                                        longitude: position.coords.longitude,
                                        latitudeDelta: LATITUDE_DELTA,
                                        longitudeDelta: LONGITUDE_DELTA,
                                    });
                                },
                                (error) => {
                                    console.log(error.code, error.message);
                                    Geolocation.requestAuthorization();
                                }, {
                                distanceFilter: 10,
                                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                            }).catch((error) => {
                                console.log(error.code, error.message);
                                Geolocation.requestAuthorization();
                            });
                        }}
                    >
                        <Icon_ name={'location-arrow'} size={y(21)} color={colors.GREEN} />
                    </TouchableOpacity>

                    <Animated.View style={{ transform: [{ scale: scale_ }], position: 'absolute', }}>
                        <MapView
                            initialRegion={{
                                latitude: this.props.location.latitude,
                                longitude: this.props.location.longitude,
                                longitudeDelta: LONGITUDE_DELTA,
                                latitudeDelta: LATITUDE_DELTA,
                            }}
                            onMapReady={() => {
                                this.mapIsReady = true;
                                this.zoomOut.call(this);
                            }}
                            ref={map => { this.map = map }}
                            provider={PROVIDER_GOOGLE}
                            style={[styles.maps_]}
                            customMapStyle={MapStyle}
                            //region={this.getMapRegion()}
                            showsUserLocation={true}
                            showsCompass={false}
                            showsMyLocationButton={false}
                        >
                            <Marker //LOCATION
                                coordinate={{ latitude: this.props.location.latitude, longitude: this.props.location.longitude }}
                                identifier={'mkL'}
                                style={{ zIndex: 1, elevation: 1 }}>
                                <Icon_ name={'circle'} color={colors.GREY} size={20} />
                            </Marker>

                            <Marker //DESTINATION
                                coordinate={{ latitude: this.props.destination.latitude, longitude: this.props.destination.longitude }}
                                identifier={'mkD'}
                                style={{ zIndex: 1, elevation: 1 }}
                            >
                                <SvgComponent />
                            </Marker>
                            {this.props.driverL1 ?
                                <Marker.Animated
                                    coordinate={this.props.driverL1}
                                    identifier={'mk1'}
                                    style={{ zIndex: 2, elevation: 2 }}
                                >
                                    <View style={styles.icon}><GreenIcon /></View>
                                </Marker.Animated>
                                : <></>}
                            {this.props.driverL2 ?
                                <Marker.Animated
                                    coordinate={this.props.driverL2}
                                    identifier={'mk2'}
                                    style={{ zIndex: 2, elevation: 2 }}
                                >
                                    <View style={styles.icon}><BlueIcon /></View>
                                </Marker.Animated>
                                : <></>}
                            {this.props.driverL3 ?
                                <Marker.Animated
                                    coordinate={this.props.driverL3}
                                    identifier={'mk3'}
                                    style={{ zIndex: 2, elevation: 2 }}
                                >
                                    <View style={styles.icon}><PurpleIcon /></View>
                                </Marker.Animated>
                                : <></>}
                            {this.props.polylines}
                        </MapView>
                    </Animated.View>

                    <Animated.View style={[styles.lowerSection, this.position.getLayout(),]} {...this.panResponder.panHandlers}>

                        <View style={styles.background}></View>
                        <View style={styles.tripContainer}
                            onLayout={(event) => {
                                this.TOP_OF_TRIPS = -event.nativeEvent.layout.height + (height / 1.3);
                            }}>
                            <View style={styles.tripDetails}>

                                <View style={styles.bubble}>
                                    <Text style={styles.bubbleText}>{remainingDistance}</Text>
                                </View>

                                {nextDriver}

                                <View style={[styles.carpoolSlider, { marginTop: marginTopNextDriver }]}>
                                    {
                                        this.props.scheduled ?
                                            <View style={[styles.startTrip, { opacity: this.props.scheduledTripStarted ? 1 : 0.7 }]}>
                                                <Button text={this.props.scheduledTripStarted ? 'Start trip now' : 'Driver has to start trip first'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2}
                                                    disabled={this.props.scheduledTripStarted ? false : true}
                                                    onPress={() => {
                                                        //compare the rawdate and current date to make sure 5 mins is already less then call the function
                                                        this.setState({ navigationLoading: true }, () => {
                                                            startScheduledRiderTrip.call(this, this.props.userID, data)
                                                        });
                                                    }} />
                                            </View>
                                            : <CarpoolSlider
                                                data={this.props.data}
                                                distanceSetter={(value) => {
                                                    this.setState({ remainingDistance: value })
                                                }}
                                                nextDriverDistancesSetter={this.nextDriverDistancesSetter.bind(this)}
                                                originalDistance={totalDistance}
                                                etaD1={this.props.etaD1}
                                                etaD2={this.props.etaD2}
                                                etaD3={this.props.etaD3}
                                                driverL1={this.props.driverL1}
                                                driverL2={this.props.driverL2}
                                                driverL3={this.props.driverL3}
                                                location={this.props.location}
                                                destination={this.props.destination}
                                                driver1={this.props.driver1}
                                                driver2={this.props.driver2}
                                                driver3={this.props.driver3}
                                                endTrip={this.props.endTrip}
                                                dateText={this.state.dateText}
                                                userID={this.props.userID}
                                            />}
                                </View>

                                <View style={[styles.divider, { marginVertical: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                                <View style={styles.contactContainer}>
                                    <TouchableOpacity style={styles.contactButton} onPress={() => { this.setState({ callScreen: true }) }}>
                                        <Icon name={'phone-call'} color={colors.WHITE} size={y(20)} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.contactButton} onPress={() => { this.setState({ messageScreen: true }) }}>
                                        <Icon name={'mail'} color={colors.WHITE} size={y(20)} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.divider, { marginVertical: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                                <View style={styles.switchContainer}>
                                    <Text style={styles.switchText}>Share live location to drivers</Text>
                                    <Switch
                                        trackColor={{ false: "#767577", true: "rgba(77, 183, 72, 0.8)" }}
                                        thumbColor={this.state.sendUserLocation ? "#FFFFFF" : "#f4f3f4"}
                                        onValueChange={(value) => {
                                            this.setState({ sendUserLocation: value })
                                            if (value == false)
                                                database().ref(`userLocation/${this.props.userID}`).set({
                                                    shareLocation: false
                                                }).catch(e => { console.log(e.message) })
                                        }}
                                        value={this.state.sendUserLocation}
                                    />
                                </View>
                                <View style={[styles.divider, { marginVertical: y(14) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                                <TouchableOpacity
                                    style={[styles.textContainer, { marginTop: y(23), marginBottom: y(20) }]}
                                    onPress={() => {
                                        Alert.alert(
                                            'Cancel this trip?',
                                            'Are you sure you want to cancel this trip? You might get charged a fee depending on the conditions by which you cancel your trip, visit our website for more information.',
                                            [{
                                                text: 'Close',
                                                style: 'cancel',
                                            }, {
                                                text: 'Cancel trip',
                                                style: 'destructive',
                                                onPress: () => {
                                                    if (this.props.now) {//MAKE SURE TO SEND driverIDArray
                                                        cancelTrip.call(this, {
                                                            userID: this.props.userID,
                                                            type: 'rider',
                                                            driverIDArray: driverIDArray,
                                                            time: new Date().getTime(),
                                                            userLocation: this.state.currentLocation,
                                                        });
                                                    } else {//deal with scheduled trip cancellations
                                                        cancelScheduledTrip.call(this, {
                                                            userID: this.props.userID,
                                                            type: 'rider',
                                                            driverIDArray: driverIDArray,
                                                            time: new Date().getTime(),
                                                            userLocation: this.state.currentLocation,
                                                        });
                                                    }
                                                },
                                            }])
                                    }}>
                                    <Text style={[styles.firstLayer, { color: '#FF0000', }]}>{this.props.now ? 'Cancel trip' : 'Cancel scheduled request'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.tripBreakdown,]}>
                                <Text style={[styles.tripTitle, { top: y(14), left: x(15), }]}>Trip Breakdown</Text>

                                {this.props.tripBreakdown}

                            </View>

                            <Text style={[styles.adText, { marginTop: y(26) }]}>{'Get discounts towards your next trip by sharing your special code with your friends ! '}</Text>
                            <View style={[styles.share, { marginTop: y(10), marginBottom: y(45) }]}>
                                <View style={styles.shareCode}>
                                    <Text style={styles.shareCodeText}>{this.state.shareCode}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.animate();
                                        Clipboard.setString(`Sign up with my Perch referral code "${this.state.shareCode}" at https://perchrides.com/s/auth/u_si_su?mode=signUp&referralCode=${this.state.shareCode}`);
                                    }}>
                                    <View style={styles.send}>
                                        <Icon__ name={'paper-plane'} color={colors.WHITE} size={y(30)} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View style={[styles.ratingContainer, { top: this.ratingTop }]} /*THIS IS THE RATINGS PANEL */>
                        <View style={styles.ratingCancel}>
                            <TouchableOpacity style={{ height: y(40), width: y(40) }} onPress={() => { this.props.endTrip() }}>
                                <Icon name={'x'} size={y(30)} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.ratingTitle}>Thank you for riding with Perch! Please rate your experience with our Perch drivers today</Text>
                        <View style={styles.ratingFlex}>
                            {ratingStack}
                        </View>
                        <View style={[styles.button, { marginTop: y(25) }]}>
                            <Button text={'Go Home'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2}
                                onPress={() => {
                                    if (this.state.driver1Rating != 0)
                                        carpoolRatingHandler(this.state.driver1Rating, this.props.userID, driverID1, this.state.dateText);
                                    if (this.state.driver2Rating != 0)
                                        carpoolRatingHandler(this.state.driver2Rating, this.props.userID, driverID2, this.state.dateText);
                                    if (this.state.driver3Rating != 0)
                                        carpoolRatingHandler(this.state.driver3Rating, this.props.userID, driverID3, this.state.dateText);

                                    this.props.endTrip();
                                }}
                                loading={this.state.loading} />
                        </View>
                    </Animated.View>

                </View >
            )
        else
            return (
                <LoadingScreen />
            )
    }
};
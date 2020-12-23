import React from 'react';
import styles from './styles';
import { BackHandler, View, Text, TouchableOpacity, Animated, Alert, PanResponder, Platform, StatusBar, Easing, LayoutAnimation, UIManager, Switch, Image } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Callout, Polyline } from 'react-native-maps';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { MaterialIndicator } from 'react-native-indicators';
import {
    carpoolRequestHandler,
    carpoolRatingHandler,
    callNumber,
    OfflineNotice,
    x, y, width, height, dimensionAssert, CustomLayoutLinear,
    scheduledCarpoolRequestHandler,
    scheduledCarpoolRequestCanceller,
    startScheduledRiderTrip
} from '../../Functions/Functions';
import Svg, { Path, G } from "react-native-svg";
import Header from '../../Components/Header/Header';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
import Visa from '../../Images/svgImages/visa';
import Money from '../../Images/svgImages/moneyChoice';
import PerchWallet from '../../Images/svgImages/perchWallet';
import Interac from '../../Images/svgImages/interac';
import { Card, TopCombiner, MiddleCombiner, BottomCombiner, DriverProfile } from '../../Components/BreakdownCardsWithCombiners/BreakdownCardsWithCombiners';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import Geolocation from 'react-native-geolocation-service';
import { eTARefresh } from '../../Functions/Functions';
import * as turf from '@turf/turf';//for encoding polylines
import database from '@react-native-firebase/database';
import { AnimatedPolylineSingleLine, AnimatedPolylineMultipleLine } from '../../Components/AnimatedPolyline/AnimatedPolyline';
const [GREEN, BLUE, PURPLE, GREEN_, BLUE_, PURPLE_, GREY, WHITE, RED] = ['#4DB748', '#1970A7', '#A031AF', 'rgba(77, 183, 72, 0.3)', 'rgba(25, 112, 167, 0.3)', 'rgba(160, 49, 175, 0.3)', '#403D3D', '#FFFFFF', '#FF0000'];
const [GREENMAKER, BLUEMAKER, PURPLEMAKER] = [`#82cd7e`, '#64b5e8', '#cc74d8'];
import GreenIcon from '../../Images/svgImages/greenIcon';
import BlueIcon from '../../Images/svgImages/blueIcon';
import PurpleIcon from '../../Images/svgImages/purpleIcon';
import Icon from 'react-native-vector-icons/Feather';
import Icon_ from 'react-native-vector-icons/FontAwesome';
import StarRating from 'react-native-star-rating';
import Icon__ from 'react-native-vector-icons/Entypo';
import CarpoolSlider from '../../Components/CarpoolSlider/CarpoolSlider';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import KeepAwake from 'react-native-keep-awake';
import storage from '@react-native-firebase/storage';


const MAX_HEADER_HEIGHT = y(156);
const MIN_HEADER_HEIGHT = y(96.5);
const X_CONSTANT = 0;
const Y_START = y(364);
const Y_START_ = y(dimensionAssert() ? 360 : 425);

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class CarpoolTripDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            hours: this.props.route.params.hours ? this.props.route.params.hours : new Date().getHours(),
            minutes: this.props.route.params.min ? this.props.route.params.min : new Date().getMinutes(),
            driverL1: null,
            driverL2: null,
            driverL3: null,
            location: this.props.route.params.location,
            destination: this.props.route.params.destination,
            seatNumber: this.props.route.params.seatNumber,
            etaD1: null,
            etaD2: null,
            etaD3: null,

            getFirstEta: true,
            getSecondEta: true,
            getThirdEta: true,

            driver1: null,
            driver2: null,
            driver3: null,

            loading: false,
            tripActive: true,
            tripAccepted: this.props.route.params.tripAccepted, //TO KNOW IF WE ARE NAVIGATING FROM HOME OR WHEREVER
            userID: this.props.route.params.userID,

            tripEnded: false,
            start1st: true,
            start2nd: false,
            start3rd: false,
            startSecond1: false,
            startSecond2: false,
            startSecond3: false,

            now: this.props.route.params.now,
            rawDate: this.props.route.params.rawDate,
            scheduled: this.props.route.params.scheduled,
            dateText: this.props.route.params.dateText ? this.props.route.params.dateText : null,

            scheduledTripStarted: false,
            paymentMethod: 'creditCard',
        };
        this.oldTrip = this.props.route.params.tripAccepted  //THIS IS HOW WE KNOW IF ITS A NEW TRIP OR AN OLDER ONE WE GOT FROM MAIN
        this.mapIsReady = false;
        this.data = (this.props.route.params.data);
        this.TOP_OF_TRIPS = 0;
        this.dataToSend = null;
        this.value;
        this.direction;
        this.headerInverse = new Animated.Value(-Y_START);
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });//This is the value we are animating to.
        this.position.y.addListener(({ value }) => {
            this.headerInverse.setValue(-value);
            if (value >= Y_START && this.direction === 'downwards') {
                this.position.stopAnimation(() => {
                    this.direction = 'upwards';

                    const Y_POSITION = Number(value);
                    if ((Y_POSITION > Y_START && this.direction === 'upwards'))
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: Y_START },
                        }).start();
                });
            }
            else if ((value <= this.TOP_OF_TRIPS) && this.direction === 'upwards') {
                this.direction = 'downwards';
                this.position.stopAnimation(() => {
                    if (value < this.TOP_OF_TRIPS)
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: (this.TOP_OF_TRIPS + 1) },
                        }).start();
                })
            }

        });


        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 4 || Math.abs(gestureState.dy) >= 4;

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
                if (Y_POSITION <= Y_START && Y_POSITION >= this.TOP_OF_TRIPS)
                    this.position.setValue({ x: X_CONSTANT, y: (gestureState.dy) });


                if (Math.sign(gestureState.vy) == 1) //going down
                    this.direction = 'downwards';
                else if (Math.sign(gestureState.vy) == -1)//going upwards
                    this.direction = 'upwards';



            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();

                const Y_POSITION = Number(JSON.stringify(this.position.y));
                if (Y_POSITION < Y_START) {
                    Animated.decay(this.position, {
                        velocity: { x: 0, y: gestureState.vy }, // velocity from gesture release
                    }).start();

                    if (Math.sign(gestureState.vy) == 1) //going down
                        this.direction = 'downwards';
                    else if (Math.sign(gestureState.vy) == -1)//going upwards
                        this.direction = 'upwards';

                }
                else if (Y_POSITION > Y_START) {
                    this.direction = 'upwards';
                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_START }, // velocity from gesture release
                    }).start();
                }
            },
        })
    };
    componentDidMount() {
        KeepAwake.activate();
        const data = this.data;
        switch (data.steps) {
            case 1: {
                const d1 = data.key;
                database().ref(`/carpoolRequests/${d1}`).once('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({
                            driverL1: snapshot.val().location ? snapshot.val().location : snapshot.val(),
                            driver1: {
                                name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                                firstName: snapshot.val().firstName,
                                carDetails: snapshot.val().carDetails,
                                history: snapshot.val().history,
                                phoneNumber: snapshot.val().phoneNumber,
                                mainID: d1.substring(0, d1.length - 6),
                            },
                        });

                        setTimeout(() => {
                            const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...data.firstLeg, [this.state.destination.latitude, this.state.destination.longitude],]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                            if (this.state.driverL1) {
                                //bboxPolygon.push(this.state.driverL1);
                                if (this.mapIsReady && this.map)
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(80),
                                            bottom: x(40),
                                            left: x(25)
                                        },
                                    })
                            }
                        }, 1000);
                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];
                        if (this.state.now) {
                            if (this.state.getFirstEta)
                                eTARefresh.call(this, 1, ar_, 1);
                            else if (this.state.etaD1)
                                this.setState({ etaD1: null })
                        }
                    }
                    else {
                        database().ref(`/scheduledCarpoolRequests/${d1}`).once('value', snapshot => {
                            if (snapshot.val()) {
                                this.setState({
                                    driverL1: snapshot.val().location ? snapshot.val().location : snapshot.val(),
                                    driver1: {
                                        name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                                        firstName: snapshot.val().firstName,
                                        carDetails: snapshot.val().carDetails,
                                        history: snapshot.val().history,
                                        phoneNumber: snapshot.val().phoneNumber,
                                        mainID: d1.substring(0, d1.length - 6),
                                    },
                                });

                                setTimeout(() => {
                                    const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...data.firstLeg, [this.state.destination.latitude, this.state.destination.longitude],]);
                                    let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                                    if (this.state.driverL1) {
                                        //bboxPolygon.push(this.state.driverL1);
                                        if (this.mapIsReady && this.map)
                                            this.map.fitToCoordinates(bboxPolygon, {
                                                edgePadding:
                                                {
                                                    top: x(40),
                                                    right: x(80),
                                                    bottom: x(40),
                                                    left: x(25)
                                                },
                                            })
                                    }
                                }, 1000);
                            }
                        });
                    }
                });

                database().ref(`/carpoolRequests/${d1}/requestStatus`).on('value', snapshot => {
                    this.setState({ scheduledTripStarted: snapshot.val() ? true : false });
                })

                database().ref(`/carpoolRequests/${d1}/location`).on('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({ driverL1: snapshot.val().location ? snapshot.val().location : snapshot.val() });
                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];
                        if (this.state.getFirstEta)
                            eTARefresh.call(this, 1, ar_, 1);
                        else if (this.state.etaD1)
                            this.setState({ etaD1: null })
                    }
                });

                database().ref(`/currentCarpoolTrips/${data.key}/${this.state.userID}/status`).on('value', snapshot => {
                    if (snapshot.val() === "STARTED")
                        this.setState({ getFirstEta: false, etaD1: null })
                    else if (snapshot.val() === "FINISHED") {//BRING OUT REVIEW HERE
                        this.setState({ tripEnded: true });
                        database().ref(`/userLocation/${this.state.userID}`)
                            .remove()
                            .catch(error => { console.log(error.message) });
                    }
                });

            } break;
            case 2: {
                const d1 = data.start;
                const d2 = data.end;


                database().ref(`/carpoolRequests/${d1}`).once('value', snapshot => {
                    if (snapshot.val()) {

                        this.setState({
                            driverL1: snapshot.val().location ? snapshot.val().location : snapshot.val(),
                            driver1: {
                                name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                                firstName: snapshot.val().firstName,
                                carDetails: snapshot.val().carDetails,
                                history: snapshot.val().history,
                                phoneNumber: snapshot.val().phoneNumber,
                                mainID: d1.substring(0, d1.length - 6),
                            }
                        });

                        setTimeout(() => {

                            const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...data.firstLeg, ...data.secondLeg, [this.state.destination.latitude, this.state.destination.longitude]]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                            if (this.state.driverL1 && this.state.driverL2) {
                                //bboxPolygon.push(this.state.driverL1, this.state.driverL2);
                                if (this.mapIsReady && this.map)
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(80),
                                            bottom: x(40),
                                            left: x(25)
                                        },
                                    })
                            }
                        }, 1000);

                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];
                        if (this.state.getFirstEta)
                            eTARefresh.call(this, 2, ar_, 1);
                        else if (this.state.etaD1)
                            this.setState({ etaD1: null })

                    }

                });

                database().ref(`/carpoolRequests/${d1}/location`).on('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({ driverL1: snapshot.val() });
                        const ar_ = [snapshot.val().latitude, snapshot.val().longitude];
                        if (this.state.getFirstEta)
                            eTARefresh.call(this, 2, ar_, 1);
                        else if (this.state.etaD1)
                            this.setState({ etaD1: null })
                    }
                });


                database().ref(`/carpoolRequests/${d2}`).once('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({
                            driverL2: snapshot.val().location ? snapshot.val().location : snapshot.val(),
                            driver2: {
                                name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                                firstName: snapshot.val().firstName,
                                carDetails: snapshot.val().carDetails,
                                history: snapshot.val().history,
                                phoneNumber: snapshot.val().phoneNumber,
                                mainID: d2.substring(0, d2.length - 6),
                            }
                        });

                        setTimeout(() => {
                            const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...data.firstLeg, ...data.secondLeg, [this.state.destination.latitude, this.state.destination.longitude]]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                            if (this.state.driverL1 && this.state.driverL2) {
                                //bboxPolygon.push(this.state.driverL1, this.state.driverL2);
                                if (this.mapIsReady && this.map)
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(80),
                                            bottom: x(40),
                                            left: x(25)
                                        },
                                    })
                            }
                        }, 1000);


                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];

                        if (this.state.getSecondEta)
                            eTARefresh.call(this, 2, ar_, 2);
                        else if (this.state.etaD2)
                            this.setState({ etaD2: null })
                    }
                });

                database().ref(`/carpoolRequests/${d2}/location`).on('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({ driverL2: snapshot.val().location ? snapshot.val().location : snapshot.val() });
                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];
                        if (this.state.getSecondEta)
                            eTARefresh.call(this, 2, ar_, 2);
                        else if (this.state.etaD2)
                            this.setState({ etaD2: null })
                    }
                });

                database().ref(`/currentCarpoolTrips/${data.start}/${this.state.userID}/status`).on('value', snapshot => {
                    if (snapshot.val() === "STARTED")
                        this.setState({ getFirstEta: false, etaD1: null })
                });
                database().ref(`/currentCarpoolTrips/${data.end}/${this.state.userID}/status`).on('value', snapshot => {
                    if (snapshot.val() === "STARTED")
                        this.setState({ getSecondEta: false, etaD2: null })
                    else if (snapshot.val() === "FINISHED") {
                        this.setState({ tripEnded: true });
                        database().ref(`/userLocation/${this.state.userID}`)
                            .remove()
                            .catch(error => { console.log(error.message) });
                    }
                });

            } break;
            case 3: {
                const d1 = data.start;
                const d2 = data.middle;
                const d3 = data.end;

                database().ref(`/carpoolRequests/${d1}`).once('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({
                            driverL1: snapshot.val().location ? snapshot.val().location : snapshot.val(),
                            driver1: {
                                name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                                firstName: snapshot.val().firstName,
                                carDetails: snapshot.val().carDetails,
                                history: snapshot.val().history,
                                phoneNumber: snapshot.val().phoneNumber,
                                mainID: d1.substring(0, d1.length - 6),
                            }
                        });

                        setTimeout(() => {
                            const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...data.firstLeg, ...data.secondLeg, ...data.thirdLeg, [this.state.destination.latitude, this.state.destination.longitude]]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                            if (this.state.driverL1 && this.state.driverL2 && this.state.driverL3) {
                                //bboxPolygon.push(this.state.driverL1, this.state.driverL2, this.state.driverL3);
                                if (this.mapIsReady && this.map)
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(80),
                                            bottom: x(40),
                                            left: x(25)
                                        },
                                    })
                            }
                        }, 1000);

                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];

                        if (this.state.getFirstEta)
                            eTARefresh.call(this, 3, ar_, 1);
                        else if (this.state.etaD1)
                            this.setState({ etaD1: null })
                    }
                });

                database().ref(`/carpoolRequests/${d1}/location`).on('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({ driverL1: snapshot.val().location ? snapshot.val().location : snapshot.val() });
                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];
                        if (this.state.getFirstEta)
                            eTARefresh.call(this, 3, ar_, 1);
                        else if (this.state.etaD1)
                            this.setState({ etaD1: null })
                    }
                });


                database().ref(`/carpoolRequests/${d2}`).once('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({
                            driverL2: snapshot.val().location ? snapshot.val().location : snapshot.val(),
                            driver2: {
                                name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                                firstName: snapshot.val().firstName,
                                carDetails: snapshot.val().carDetails,
                                history: snapshot.val().history,
                                phoneNumber: snapshot.val().phoneNumber,
                                mainID: d2.substring(0, d2.length - 6),
                            }
                        });

                        setTimeout(() => {
                            const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...data.firstLeg, ...data.secondLeg, ...data.thirdLeg, [this.state.destination.latitude, this.state.destination.longitude]]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                            if (this.state.driverL1 && this.state.driverL2 && this.state.driverL3) {
                                //bboxPolygon.push(this.state.driverL1, this.state.driverL2, this.state.driverL3);
                                if (this.mapIsReady && this.map)
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(80),
                                            bottom: x(40),
                                            left: x(25)
                                        },
                                    })
                            }
                        }, 1000);


                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];

                        if (this.state.getSecondEta)
                            eTARefresh.call(this, 3, ar_, 2);
                        else if (this.state.etaD2)
                            this.setState({ etaD2: null })
                    }
                });

                database().ref(`/carpoolRequests/${d2}/location`).on('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({ driverL2: snapshot.val().location ? snapshot.val().location : snapshot.val() });
                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];
                        if (this.state.getSecondEta)
                            eTARefresh.call(this, 3, ar_, 2);
                        else if (this.state.etaD2)
                            this.setState({ etaD2: null })
                    }
                });

                database().ref(`/carpoolRequests/${d3}`).once('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({
                            driverL3: snapshot.val().location ? snapshot.val().location : snapshot.val(),
                            driver3: {
                                name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                                firstName: snapshot.val().firstName,
                                carDetails: snapshot.val().carDetails,
                                history: snapshot.val().history,
                                phoneNumber: snapshot.val().phoneNumber,
                                mainID: d3.substring(0, d3.length - 6),
                            }
                        });

                        setTimeout(() => {
                            const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...data.firstLeg, ...data.secondLeg, ...data.thirdLeg, [this.state.destination.latitude, this.state.destination.longitude]]);
                            let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                            if (this.state.driverL1 && this.state.driverL2 && this.state.driverL3) {
                                //bboxPolygon.push(this.state.driverL1, this.state.driverL2, this.state.driverL3);
                                if (this.mapIsReady && this.map)
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(80),
                                            bottom: x(40),
                                            left: x(25)
                                        },
                                    })
                            }
                        }, 1000);


                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];

                        if (this.state.getThirdEta)
                            eTARefresh.call(this, 3, ar_, 3);
                        else if (this.state.etaD3)
                            this.setState({ etaD3: null })
                    }
                });

                database().ref(`/carpoolRequests/${d3}/location`).on('value', snapshot => {
                    if (snapshot.val()) {
                        this.setState({ driverL3: snapshot.val().location ? snapshot.val().location : snapshot.val() });
                        const ar_ = snapshot.val().location ? [snapshot.val().location.latitude, snapshot.val().location.longitude] : [snapshot.val().latitude, snapshot.val().longitude];

                        if (this.state.getThirdEta)
                            eTARefresh.call(this, 3, ar_, 3);
                        else if (this.state.etaD3)
                            this.setState({ etaD3: null })
                    }
                });



                database().ref(`/currentCarpoolTrips/${data.start}/${this.state.userID}/status`).on('value', snapshot => {
                    if (snapshot.val() === "STARTED")
                        this.setState({ getFirstEta: false, etaD1: null })

                });
                database().ref(`/currentCarpoolTrips/${data.middle}/${this.state.userID}/status`).on('value', snapshot => {
                    if (snapshot.val() === "STARTED")
                        this.setState({ getSecondEta: false, etaD2: null })
                });
                database().ref(`/currentCarpoolTrips/${data.end}/${this.state.userID}/status`).on('value', snapshot => {
                    if (snapshot.val() === "STARTED")
                        this.setState({ getThirdEta: false, etaD3: null })
                    else if (snapshot.val() === "FINISHED") {
                        this.setState({ tripEnded: true });
                        database().ref(`/userLocation/${this.state.userID}`)
                            .remove()
                            .catch(error => { console.log(error.message) });
                    }
                });

            } break;
        };
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    };
    goBack = () => {
        if (this.props.route.params.onRefresh)
            this.props.route.params.onRefresh();
        this.props.navigation.goBack();
    }
    zoomOut() {
        const data = this.data;
        switch (data.steps) {
            case 1: {
                let r = [...data.firstLeg, [this.state.location.latitude, this.state.location.longitude], [this.state.destination.latitude, this.state.destination.longitude]];
                const line = turf.lineString(r);
                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.state.driverL1) {
                    bboxPolygon.push(this.state.driverL1);
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: x(40),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
                        })
                }

            } break;
            case 2: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push([this.state.location.latitude, this.state.location.longitude], [this.state.destination.latitude, this.state.destination.longitude])
                const line = turf.lineString(r);
                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.state.driverL1 && this.state.driverL2) {
                    bboxPolygon.push(this.state.driverL1, this.state.driverL2);
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: x(40),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
                        })
                }


            } break;
            case 3: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push(...data.thirdLeg);
                r.push([this.state.location.latitude, this.state.location.longitude], [this.state.destination.latitude, this.state.destination.longitude])
                const line = turf.lineString(r);
                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.state.driverL1 && this.state.driverL2 && this.state.driverL3) {
                    bboxPolygon.push(this.state.driverL1, this.state.driverL2, this.state.driverL3);
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: x(40),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
                        })
                }
            } break;
        };
    };
    zoomIn() {
        const data = this.data;
        switch (data.steps) {
            case 1: {
                let r = [...data.firstLeg, [this.state.location.latitude, this.state.location.longitude], [this.state.destination.latitude, this.state.destination.longitude]];
                const line = turf.lineString(r);
                const bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.state.driverL1) {
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: x(40),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
                        })
                }
            } break;
            case 2: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push([this.state.location.latitude, this.state.location.longitude], [this.state.destination.latitude, this.state.destination.longitude])
                const line = turf.lineString(r);
                const bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.state.driverL1 && this.state.driverL2) {
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: x(40),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
                        })
                }

            } break;
            case 3: {
                let r = [...data.firstLeg];
                r.push(...data.secondLeg);
                r.push(...data.thirdLeg);
                r.push([this.state.location.latitude, this.state.location.longitude], [this.state.destination.latitude, this.state.destination.longitude])
                const line = turf.lineString(r);
                const bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                if (this.state.driverL1 && this.state.driverL2 && this.state.driverL3) {
                    if (this.mapIsReady && this.map)
                        this.map.fitToCoordinates(bboxPolygon, {
                            edgePadding:
                            {
                                top: x(40),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
                        })
                }
            } break;
        };
    };
    changePayment(value) {
        this.setState({ paymentMethod: value });
    };
    handleBackButtonClick = () => {
        //HANDLE BACKBUTTON HERE
        this.goBack();
    };
    componentWillUnmount() {
        KeepAwake.deactivate();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    };

    render() {

        let PAYMENT_CHOICE = <></>;

        switch (this.state.paymentMethod) {
            case 'creditCard': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa}><Visa height={'100%'} width={'100%'} /></View>
                        <Text style={styles.cardNumber}> XXXX XXXX XXX3 3456</Text>
                    </View>
                );
            } break;
            case 'cash': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa_}><Money height={'100%'} width={'100%'} /></View>
                        <Text style={[styles.cardNumber, { marginLeft: x(6) }]}> Cash</Text>
                    </View>
                );
            } break;
            case 'perchCredit': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa_}><PerchWallet height={'100%'} width={'100%'} /></View>
                        <Text style={[styles.cardNumber, { marginLeft: x(6) }]}> Perch Wallet</Text>
                    </View>
                );
            } break;
            case 'interac': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa_}><Interac height={'100%'} width={'100%'} /></View>
                        <Text style={styles.cardNumber}> Interac e-transfer</Text>
                    </View>
                );
            } break;
        };
        const top_ = this.state.scrollY.interpolate({
            inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
            outputRange: [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
            extrapolate: 'clamp',
        });
        const scale_ = this.position.y.interpolate({
            inputRange: [Y_START, y(691)],
            outputRange: [1, 2.7],
            extrapolate: 'clamp',
        });

        const data = this.data;
        let tripBreakdown = <></>, drivers = {};
        let totalDistance, totalTime, totalH, totalM, waitingTime, tripStartIn, tripStartH_, tripStartM_, startHour, startMin, endHour, endMin, startMeridiem, endMeridiem, polylines;
        switch (data.steps) {
            case 1: {
                totalDistance = data.firstDistance;
                totalTime = data.travelDetails.walkFromL.duration.value
                    + data.travelDetails.etaTravel1.duration.value
                    + data.travelDetails.walkToD.duration.value;

                [totalH, totalM] = [secondsToHms(totalTime).hours, secondsToHms(totalTime).minutes];

                tripStartIn =  /*<<<<----- REMOVE THIS MINUS SIGNNNN*/ ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
                [tripStartH_, tripStartM_] = [secondsToHms(tripStartIn).hours, secondsToHms(tripStartIn).minutes];
                startHour = calculateTime(this.state.hours, tripStartH_, this.state.minutes, tripStartM_)
                startMin = ((this.state.minutes + tripStartM_) % 60);
                endHour = calculateTime(startHour, totalH, startMin, totalM);
                endMin = ((startMin + totalM) % 60);
                startMeridiem = ((nN(this.state.hours) + nN(tripStartH_)) % 24) < 12 ? 'AM' : 'PM';
                endMeridiem = (((nN(this.state.hours) + nN(tripStartH_) + nN(totalH) + Math.floor(((nN(startMin) + nN(totalM)) / 60)))) % 24) < 12 ? 'AM' : 'PM';

                let stop1ATH, stop1ATM, stop1ATm, stop1ATh, stop1A_m,
                    stop1BTH, stop1BTM, stop1BTm, stop1BTh, stop1B_m;


                [stop1ATh, stop1ATm] = [secondsToHms(data.travelDetails.walkFromL.duration.value).hours, secondsToHms(data.travelDetails.walkFromL.duration.value).minutes];
                stop1ATH = calculateTime(startHour, stop1ATh, startMin, stop1ATm);
                stop1ATM = ((startMin + stop1ATm) % 60);
                stop1A_m = calculateZone(startHour, stop1ATh, startMin, stop1ATm, startMeridiem);

                [stop1BTh, stop1BTm] = [secondsToHms(data.travelDetails.etaTravel1.duration.value).hours, secondsToHms(data.travelDetails.etaTravel1.duration.value).minutes];
                stop1BTH = calculateTime(stop1ATH, stop1BTh, stop1ATM, stop1BTm);
                stop1BTM = ((stop1ATM + stop1BTm) % 60);
                stop1B_m = calculateZone(stop1ATH, stop1BTh, stop1ATM, stop1BTm, stop1A_m);

                startHour = startHour == 0 ? startHour = 12 : startHour;
                endHour = endHour == 0 ? endHour = 12 : endHour;
                this.dataToSend = [
                    {
                        driverID: data.key,
                        leg: JSON.stringify(data.firstLeg),
                        depatureTime: `${stop1ATH}:${stop1ATM < 10 ? '0' + stop1ATM : stop1ATM} ${stop1A_m}`,
                        arrivalTime: `${stop1BTH}:${stop1BTM < 10 ? '0' + stop1BTM : stop1BTM} ${stop1B_m}`,
                        seatNumber: this.state.seatNumber,
                        lastDriver: true,
                        stopA: data.travelDetails.stop1A,
                        stopB: data.travelDetails.stop1B,
                        index_START: data.tripIndexes.index1st_1,
                        index_END: data.tripIndexes.index1st_2,
                        scheduled:!this.state.now,
                    },
                ];

                tripBreakdown =
                    (<View style={{ top: y(68), paddingBottom: y(82) }}>
                        <TopCombiner start={this.state.location.description} time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`} distance={data.travelDetails.walkFromL.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card color={GREEN} onPress={() => { this.props.navigation.navigate('CarpoolDriverProfile', { driver: this.state.driver1 }) }}
                                filler_time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`}
                                stopA={data.travelDetails.stop1A}
                                stopB={data.travelDetails.stop1B}
                                start={this.state.location.description}
                                distance={data.firstDistance}
                                timeA={`${stop1ATH == 0 ? 12 : stop1ATH}:${stop1ATM < 10 ? '0' + stop1ATM : stop1ATM} ${stop1A_m}`}
                                timeB={`${stop1BTH == 0 ? 12 : stop1BTH}:${stop1BTM < 10 ? '0' + stop1BTM : stop1BTM} ${stop1B_m}`}
                                eta={this.state.etaD1} driver={this.state.driver1}
                                tripAccepted={this.state.tripAccepted}
                            />
                        </View>
                        <BottomCombiner end={this.state.destination.description} time={`${endHour}:${endMin < 10 ? '0' + endMin : endMin} ${endMeridiem}`} distance={data.travelDetails.walkToD.distance.value} />
                    </View>);
                polylines = (
                    <>
                        <Polyline
                            coordinates={data.firstPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREEN_}
                            strokeWidth={4}
                        />
                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }}//TRIP WE ARE JOINING
                        >
                            <Icon_ name={'circle'} color={GREEN} size={12} />
                        </Marker>
                        <AnimatedPolylineSingleLine
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={GREENMAKER}
                            strokeColor={GREEN}
                            strokeWidth={4}
                        //interval={10}
                        />
                        <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}>
                            <Icon_ name={'circle'} color={GREEN} size={12} />
                        </Marker>

                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                    </>
                );

                drivers.driver1 = this.state.driver1;

            } break;
            case 2: {
                totalDistance = data.firstDistance + data.secondDistance;

                tripStartIn =  /*<<<<----- REMOVE THIS MINUS SIGNNNN*/ ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
                [tripStartH_, tripStartM_] = [secondsToHms(tripStartIn).hours, secondsToHms(tripStartIn).minutes];
                startHour = calculateTime(this.state.hours, tripStartH_, this.state.minutes, tripStartM_)
                startMin = ((this.state.minutes + tripStartM_) % 60);
                startMeridiem = ((nN(this.state.hours) + nN(tripStartH_)) % 24) < 12 ? 'AM' : 'PM';

                let stop1ATH, stop1ATM, stop1ATm, stop1ATh, stop1A_m,
                    stop1BTH, stop1BTM, stop1BTm, stop1BTh, stop1B_m,
                    stop2ATH, stop2ATM, stop2ATm, stop2ATh, stop2A_m,
                    stop2BTH, stop2BTM, stop2BTm, stop2BTh, stop2B_m;

                [stop1ATh, stop1ATm] = [secondsToHms(data.travelDetails.walkFromL.duration.value).hours, secondsToHms(data.travelDetails.walkFromL.duration.value).minutes];
                stop1ATH = calculateTime(startHour, stop1ATh, startMin, stop1ATm);
                stop1ATM = ((startMin + stop1ATm) % 60);
                stop1A_m = calculateZone(startHour, stop1ATh, startMin, stop1ATm, startMeridiem);

                [stop1BTh, stop1BTm] = [secondsToHms(data.travelDetails.etaTravel1.duration.value).hours, secondsToHms(data.travelDetails.etaTravel1.duration.value).minutes];
                stop1BTH = calculateTime(stop1ATH, stop1BTh, stop1ATM, stop1BTm);
                stop1BTM = ((stop1ATM + stop1BTm) % 60);
                stop1B_m = calculateZone(stop1ATH, stop1BTh, stop1ATM, stop1BTm, stop1A_m);

                let timeForTrip1 =
                    (data.travelDetails.etaArrival1.duration.value)
                    // + data.travelDetails.walkFromL.duration.value
                    + data.travelDetails.etaTravel1.duration.value;


                [stop2ATh, stop2ATm] = [
                    secondsToHms((data.travelDetails.etaArrival2.duration.value) - timeForTrip1).hours,
                    secondsToHms((data.travelDetails.etaArrival2.duration.value) - timeForTrip1).minutes
                ];
                stop2ATH = calculateTime(stop1BTH, stop2ATh, stop1BTM, stop2ATm);
                stop2ATM = ((stop1BTM + stop2ATm) % 60);
                stop2A_m = calculateZone(stop1BTH, stop2ATh, stop1BTM, stop2ATm, stop1B_m);

                [stop2BTh, stop2BTm] = [secondsToHms(data.travelDetails.etaTravel2.duration.value).hours, secondsToHms(data.travelDetails.etaTravel2.duration.value).minutes];
                stop2BTH = calculateTime(stop2ATH, stop2BTh, stop2ATM, stop2BTm);
                stop2BTM = ((stop2ATM + stop2BTm) % 60);
                stop2B_m = calculateZone(stop2ATH, stop2BTh, stop2ATM, stop2BTm, stop2A_m);

                [totalH, totalM] = [secondsToHms(data.travelDetails.walkToD.duration.value).hours, secondsToHms(data.travelDetails.walkToD.duration.value).minutes]
                endHour = calculateTime(stop2BTH, totalH, stop2BTM, totalM);
                endMin = ((stop2BTM + totalM) % 60);
                endMeridiem = calculateZone(stop2BTH, totalH, stop2BTM, totalM, stop2B_m);


                startHour = startHour == 0 ? startHour = 12 : startHour;
                endHour = endHour == 0 ? endHour = 12 : endHour;

                this.dataToSend = [
                    {
                        driverID: data.start,
                        leg: JSON.stringify(data.firstLeg),
                        depatureTime: `${stop1ATH}:${stop1ATM < 10 ? '0' + stop1ATM : stop1ATM} ${stop1A_m}`,
                        arrivalTime: `${stop1BTH}:${stop1BTM < 10 ? '0' + stop1BTM : stop1BTM} ${stop1B_m}`,
                        seatNumber: this.state.seatNumber,
                        stopA: data.travelDetails.stop1A,
                        stopB: data.travelDetails.stop1B,
                        index_START: data.tripIndexes.index1st_1,
                        index_END: data.tripIndexes.index1st_2,
                        scheduled:!this.state.now,
                    },
                    {
                        driverID: data.end,
                        leg: JSON.stringify(data.secondLeg),
                        depatureTime: `${stop2ATH}:${stop2ATM < 10 ? '0' + stop2ATM : stop2ATM} ${stop2A_m}`,
                        arrivalTime: `${stop2BTH}:${stop2BTM < 10 ? '0' + stop2BTM : stop2BTM} ${stop2B_m}`,
                        seatNumber: this.state.seatNumber,
                        lastDriver: true,
                        stopA: data.travelDetails.stop2A,
                        stopB: data.travelDetails.stop2B,
                        index_START: data.tripIndexes.index2nd_1,
                        index_END: data.tripIndexes.index2nd_2,
                        scheduled:!this.state.now,
                    },
                ];

                tripBreakdown =
                    (<View style={{ top: y(68), paddingBottom: y(82) }}>
                        <TopCombiner start={this.state.location.description} time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`} distance={data.travelDetails.walkFromL.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card
                                color={GREEN}
                                onPress={() => { this.props.navigation.navigate('CarpoolDriverProfile', { driver: this.state.driver1 }) }}
                                filler_time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`}
                                stopA={data.travelDetails.stop1A}
                                stopB={data.travelDetails.stop1B}
                                start={this.state.location.description}
                                distance={data.firstDistance}
                                timeA={`${stop1ATH == 0 ? 12 : stop1ATH}:${stop1ATM < 10 ? '0' + stop1ATM : stop1ATM} ${stop1A_m}`}
                                timeB={`${stop1BTH == 0 ? 12 : stop1BTH}:${stop1BTM < 10 ? '0' + stop1BTM : stop1BTM} ${stop1B_m}`}
                                eta={this.state.etaD1}
                                driver={this.state.driver1}
                                tripAccepted={this.state.tripAccepted}
                            />
                        </View>
                        <MiddleCombiner start={this.state.location.description} distance={data.travelDetails.walk.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card
                                color={BLUE}
                                onPress={() => { this.props.navigation.navigate('CarpoolDriverProfile', { driver: this.state.driver2 }) }}
                                filler_time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`}
                                stopA={data.travelDetails.stop2A}
                                stopB={data.travelDetails.stop2B}
                                start={this.state.location.description}
                                distance={data.secondDistance}
                                timeA={`${stop2ATH == 0 ? 12 : stop2ATH}:${stop2ATM < 10 ? '0' + stop2ATM : stop2ATM} ${stop2A_m}`}
                                timeB={`${stop2BTH == 0 ? 12 : stop2BTH}:${stop2BTM < 10 ? '0' + stop2BTM : stop2BTM} ${stop2B_m}`}
                                eta={this.state.etaD2}
                                driver={this.state.driver2}
                                tripAccepted={this.state.tripAccepted}
                            />
                        </View>
                        <BottomCombiner end={this.state.destination.description} time={`${endHour}:${endMin < 10 ? '0' + endMin : endMin} ${endMeridiem}`} distance={data.travelDetails.walkToD.distance.value} />
                    </View>);

                polylines = (
                    <>
                        <Polyline //ORIGINAL TRIP
                            coordinates={data.firstPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREEN_}
                            strokeWidth={4}
                        />
                        <Polyline
                            coordinates={data.secondPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={BLUE_}
                            strokeWidth={4}
                        />

                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }//TRIP WE ARE JOINING
                        }
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon_ name={'circle'} color={GREEN} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREEN}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={GREENMAKER}
                            strokeColor={GREEN}
                            strokeWidth={4}
                            start1st={this.state.start1st}
                            start2nd={this.state.startSecond1}
                            complete1st={() => { this.setState({ start2nd: true }); }}
                            complete2nd={() => { this.setState({ startSecond1: false, startSecond2: true }) }}
                        //interval={10}
                        />
                        {(data.firstLeg[data.firstLeg.length - 1][0] != data.secondLeg[0][0] && data.firstLeg[data.firstLeg.length - 1][1] != data.secondLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}
                                style={{ zIndex: 0, elevation: 0 }}
                            >
                                <Icon_ name={'circle'} color={GREEN} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.secondLeg[0][0], longitude: data.secondLeg[0][1] }}
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon_ name={'circle'} color={BLUE} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={BLUE}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={BLUEMAKER}
                            strokeColor={BLUE}
                            strokeWidth={4}
                            start1st={this.state.start2nd}
                            start2nd={this.state.startSecond2}
                            complete1st={() => { this.setState({ startSecond1: true }) }}
                            complete2nd={() => { this.setState({ startSecond2: false, startSecond1: true, }) }}

                        //interval={10}
                        />
                        <Marker coordinate={{ latitude: data.secondLeg[data.secondLeg.length - 1][0], longitude: data.secondLeg[data.secondLeg.length - 1][1] }}
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon_ name={'circle'} color={BLUE} size={12} />
                        </Marker>

                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk3.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                    </>
                );

                drivers.driver1 = this.state.driver1;
                drivers.driver2 = this.state.driver2;
            } break;
            case 3: {

                totalDistance = data.firstDistance + data.secondDistance + data.thirdDistance;

                tripStartIn =  /*<<<<----- REMOVE THIS MINUS SIGNNNN*/ ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
                [tripStartH_, tripStartM_] = [secondsToHms(tripStartIn).hours, secondsToHms(tripStartIn).minutes];
                startHour = calculateTime(this.state.hours, tripStartH_, this.state.minutes, tripStartM_);
                startMin = ((this.state.minutes + tripStartM_) % 60);
                startMeridiem = ((nN(this.state.hours) + nN(tripStartH_)) % 24) < 12 ? 'AM' : 'PM';

                let stop1ATH, stop1ATM, stop1ATm, stop1ATh, stop1A_m,
                    stop1BTH, stop1BTM, stop1BTm, stop1BTh, stop1B_m,
                    stop2ATH, stop2ATM, stop2ATm, stop2ATh, stop2A_m,
                    stop2BTH, stop2BTM, stop2BTm, stop2BTh, stop2B_m,
                    stop3ATH, stop3ATM, stop3ATm, stop3ATh, stop3A_m,
                    stop3BTH, stop3BTM, stop3BTm, stop3BTh, stop3B_m;

                [stop1ATh, stop1ATm] = [secondsToHms(data.travelDetails.walkFromL.duration.value).hours, secondsToHms(data.travelDetails.walkFromL.duration.value).minutes];
                stop1ATH = calculateTime(startHour, stop1ATh, startMin, stop1ATm);
                stop1ATM = ((startMin + stop1ATm) % 60);
                stop1A_m = calculateZone(startHour, stop1ATh, startMin, stop1ATm, startMeridiem);

                [stop1BTh, stop1BTm] = [secondsToHms(data.travelDetails.etaTravel1.duration.value).hours, secondsToHms(data.travelDetails.etaTravel1.duration.value).minutes];
                stop1BTH = calculateTime(stop1ATH, stop1BTh, stop1ATM, stop1BTm);
                stop1BTM = ((stop1ATM + stop1BTm) % 60);
                stop1B_m = calculateZone(stop1ATH, stop1BTh, stop1ATM, stop1BTm, stop1A_m);


                let timeForTrip1 =
                    (data.travelDetails.etaArrival1.duration.value)
                    //+ data.travelDetails.walkFromL.duration.value
                    + data.travelDetails.etaTravel1.duration.value;


                [stop2ATh, stop2ATm] = [
                    secondsToHms((data.travelDetails.etaArrival2.duration.value) - timeForTrip1).hours,
                    secondsToHms((data.travelDetails.etaArrival2.duration.value) - timeForTrip1).minutes
                ];
                stop2ATH = calculateTime(stop1BTH, stop2ATh, stop1BTM, stop2ATm);
                stop2ATM = ((stop1BTM + stop2ATm) % 60);
                stop2A_m = calculateZone(stop1BTH, stop2ATh, stop1BTM, stop2ATm, stop1B_m);

                [stop2BTh, stop2BTm] = [secondsToHms(data.travelDetails.etaTravel2.duration.value).hours, secondsToHms(data.travelDetails.etaTravel2.duration.value).minutes];
                stop2BTH = calculateTime(stop2ATH, stop2BTh, stop2ATM, stop2BTm);
                stop2BTM = ((stop2ATM + stop2BTm) % 60);
                stop2B_m = calculateZone(stop2ATH, stop2BTh, stop2ATM, stop2BTm, stop2A_m);

                let timeForTrip2 =
                    (data.travelDetails.etaArrival2.duration.value)
                    //+ data.travelDetails.walk1duration.value
                    + data.travelDetails.etaTravel2.duration.value;

                [stop3ATh, stop3ATm] = [
                    secondsToHms((data.travelDetails.etaArrival3.duration.value) - timeForTrip2).hours,
                    secondsToHms((data.travelDetails.etaArrival3.duration.value) - timeForTrip2).minutes
                ];
                stop3ATH = calculateTime(stop2BTH, stop3ATh, stop2BTM, stop3ATm);
                stop3ATM = ((stop2BTM + stop3ATm) % 60);
                stop3A_m = calculateZone(stop2BTH, stop3ATh, stop2BTM, stop3ATm, stop2B_m);

                [stop3BTh, stop3BTm] = [secondsToHms(data.travelDetails.etaTravel3.duration.value).hours, secondsToHms(data.travelDetails.etaTravel3.duration.value).minutes];
                stop3BTH = calculateTime(stop3ATH, stop3BTh, stop3ATM, stop3BTm);
                stop3BTM = ((stop3ATM + stop3BTm) % 60);
                stop3B_m = calculateZone(stop3ATH, stop3BTh, stop3ATM, stop3BTm, stop3A_m);

                [totalH, totalM] = [secondsToHms(data.travelDetails.walkToD.duration.value).hours, secondsToHms(data.travelDetails.walkToD.duration.value).minutes]
                endHour = calculateTime(stop3BTH, totalH, stop3BTM, totalM);
                endMin = ((stop3BTM + totalM) % 60);
                endMeridiem = calculateZone(stop3BTH, totalH, stop3BTM, totalM, stop3B_m);

                startHour = startHour == 0 ? startHour = 12 : startHour;
                endHour = endHour == 0 ? endHour = 12 : endHour;
                this.dataToSend = [
                    {
                        driverID: data.start,
                        leg: JSON.stringify(data.firstLeg),
                        depatureTime: `${stop1ATH}:${stop1ATM < 10 ? '0' + stop1ATM : stop1ATM} ${stop1A_m}`,
                        arrivalTime: `${stop1BTH}:${stop1BTM < 10 ? '0' + stop1BTM : stop1BTM} ${stop1B_m}`,
                        seatNumber: this.state.seatNumber,
                        stopA: data.travelDetails.stop1A,
                        stopB: data.travelDetails.stop1B,
                        index_START: data.tripIndexes.index1st_1,
                        index_END: data.tripIndexes.index1st_2,
                        scheduled:!this.state.now,
                    },
                    {
                        driverID: data.middle,
                        leg: JSON.stringify(data.secondLeg),
                        depatureTime: `${stop2ATH}:${stop2ATM < 10 ? '0' + stop2ATM : stop2ATM} ${stop2A_m}`,
                        arrivalTime: `${stop2BTH}:${stop2BTM < 10 ? '0' + stop2BTM : stop2BTM} ${stop2B_m}`,
                        seatNumber: this.state.seatNumber,
                        stopA: data.travelDetails.stop2A,
                        stopB: data.travelDetails.stop2B,
                        index_START: data.tripIndexes.index2nd_1,
                        index_END: data.tripIndexes.index2nd_2,
                        scheduled:!this.state.now,
                    },
                    {
                        driverID: data.end,
                        leg: JSON.stringify(data.thirdLeg),
                        depatureTime: `${stop3ATH}:${stop3ATM < 10 ? '0' + stop3ATM : stop3ATM} ${stop3A_m}`,
                        arrivalTime: `${stop3BTH}:${stop3BTM < 10 ? '0' + stop3BTM : stop3BTM} ${stop3B_m}`,
                        seatNumber: this.state.seatNumber,
                        lastDriver: true,
                        stopA: data.travelDetails.stop3A,
                        stopB: data.travelDetails.stop3B,
                        index_START: data.tripIndexes.index3rd_1,
                        index_END: data.tripIndexes.index3rd_2,
                        scheduled:!this.state.now,
                    },
                ];



                tripBreakdown =
                    (<View style={{ top: y(68), paddingBottom: y(82) }}>
                        <TopCombiner start={this.state.location.description} time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`} distance={data.travelDetails.walkFromL.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card
                                color={GREEN}
                                onPress={() => { this.props.navigation.navigate('CarpoolDriverProfile', { driver: this.state.driver1 }) }}
                                filler_time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`}
                                stopA={data.travelDetails.stop1A}
                                stopB={data.travelDetails.stop1B}
                                start={this.state.location.description}
                                distance={data.firstDistance}
                                timeA={`${stop1ATH == 0 ? 12 : stop1ATH}:${stop1ATM < 10 ? '0' + stop1ATM : stop1ATM} ${stop1A_m}`}
                                timeB={`${stop1BTH == 0 ? 12 : stop1BTH}:${stop1BTM < 10 ? '0' + stop1BTM : stop1BTM} ${stop1B_m}`}
                                eta={this.state.etaD1}
                                driver={this.state.driver1}
                                tripAccepted={this.state.tripAccepted}
                            />
                        </View>
                        <MiddleCombiner start={this.state.location.description} distance={data.travelDetails.walk1.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card
                                color={BLUE}
                                onPress={() => { this.props.navigation.navigate('CarpoolDriverProfile', { driver: this.state.driver2 }) }}
                                filler_time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`}
                                stopA={data.travelDetails.stop2A}
                                stopB={data.travelDetails.stop2B}
                                start={this.state.location.description}
                                distance={data.secondDistance}
                                timeA={`${stop2ATH == 0 ? 12 : stop2ATH}:${stop2ATM < 10 ? '0' + stop2ATM : stop2ATM} ${stop2A_m}`}
                                timeB={`${stop2BTH == 0 ? 12 : stop2BTH}:${stop2BTM < 10 ? '0' + stop2BTM : stop2BTM} ${stop2B_m}`}
                                eta={this.state.etaD2}
                                driver={this.state.driver2}
                                tripAccepted={this.state.tripAccepted}
                            />
                        </View>
                        <MiddleCombiner start={this.state.location.description} distance={data.travelDetails.walk2.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card color={PURPLE}
                                onPress={() => { this.props.navigation.navigate('CarpoolDriverProfile', { driver: this.state.driver3 }) }}
                                filler_time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`}
                                stopA={data.travelDetails.stop3A}
                                stopB={data.travelDetails.stop3B}
                                start={this.state.location.description}
                                distance={data.thirdDistance}
                                timeA={`${stop3ATH == 0 ? 12 : stop3ATH}:${stop3ATM < 10 ? '0' + stop3ATM : stop3ATM} ${stop3A_m}`}
                                timeB={`${stop3BTH == 0 ? 12 : stop3BTH}:${stop3BTM < 10 ? '0' + stop3BTM : stop3BTM} ${stop3B_m}`}
                                eta={this.state.etaD3}
                                driver={this.state.driver3}
                                tripAccepted={this.state.tripAccepted}
                            />
                        </View>
                        <BottomCombiner end={this.state.destination.description} time={`${endHour}:${endMin < 10 ? '0' + endMin : endMin} ${endMeridiem}`} distance={data.travelDetails.walkToD.distance.value} />
                    </View>);

                polylines = (
                    <>
                        <Polyline //ORIGINAL TRIP
                            coordinates={data.firstPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREEN_}
                            strokeWidth={4}
                        />
                        <Polyline
                            coordinates={data.secondPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={BLUE_}
                            strokeWidth={4}
                        />
                        <Polyline
                            coordinates={data.thirdPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={PURPLE_}
                            strokeWidth={4}
                        />



                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }}//TRIP WE ARE JOINING
                        >
                            <Icon_ name={'circle'} color={GREEN} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREEN}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={GREENMAKER}
                            strokeColor={GREEN}
                            strokeWidth={4}
                            start1st={this.state.start1st}
                            start2nd={this.state.startSecond1}
                            complete1st={() => { this.setState({ start2nd: true }); }}
                            complete2nd={() => { this.setState({ startSecond1: false, startSecond2: true }) }}
                        //interval={10}
                        />
                        {(data.firstLeg[data.firstLeg.length - 1][0] != data.secondLeg[0][0] && data.firstLeg[data.firstLeg.length - 1][1] != data.secondLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}>
                                <Icon_ name={'circle'} color={GREEN} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.secondLeg[0][0], longitude: data.secondLeg[0][1] }}>
                            <Icon_ name={'circle'} color={BLUE} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={BLUE}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={BLUEMAKER}
                            strokeColor={BLUE}
                            strokeWidth={4}
                            start1st={this.state.start2nd}
                            start2nd={this.state.startSecond2}
                            complete1st={() => { this.setState({ start3rd: true }) }}
                            complete2nd={() => { this.setState({ startSecond2: false, startSecond3: true, }) }}

                        //interval={10}
                        />
                        {(data.secondLeg[data.secondLeg.length - 1][0] != data.thirdLeg[0][0] && data.secondLeg[data.secondLeg.length - 1][1] != data.thirdLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.secondLeg[data.secondLeg.length - 1][0], longitude: data.secondLeg[data.secondLeg.length - 1][1] }}>
                                <Icon_ name={'circle'} color={BLUE} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.thirdLeg[0][0], longitude: data.thirdLeg[0][1] }}>
                            <Icon_ name={'circle'} color={PURPLE} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.thirdLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={PURPLE}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.thirdLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={PURPLEMAKER}
                            strokeColor={PURPLE}
                            strokeWidth={4}
                            start1st={this.state.start3rd}
                            start2nd={this.state.startSecond3}
                            complete1st={() => { this.setState({ startSecond1: true }) }}
                            complete2nd={() => { this.setState({ startSecond3: false, startSecond1: true, }) }}

                        //interval={10}
                        />
                        <Marker coordinate={{ latitude: data.thirdLeg[data.thirdLeg.length - 1][0], longitude: data.thirdLeg[data.thirdLeg.length - 1][1] }}>
                            <Icon_ name={'circle'} color={PURPLE} size={12} />
                        </Marker>


                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk3.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk4.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                    </>
                );

                drivers.driver1 = this.state.driver1;
                drivers.driver2 = this.state.driver2;
                drivers.driver3 = this.state.driver3;

            } break;
        };


        if (this.state.tripAccepted == false)
            return (
                <View style={styles.container}>
                    <StatusBar backgroundColor={'#000000'} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />

                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <View style={styles.header}>
                        <Header scrollY={this.headerInverse} name={'Trip Details'} onPress={() => { this.goBack.call(this); }} disabled={this.state.loading} />
                    </View>
                    {this.state.loading ?
                        <Drivers
                            steps={this.data.steps}
                            driver1={this.state.driver1}
                            driver2={this.state.driver2}
                            driver3={this.state.driver3}
                            tripActive={this.state.tripActive}
                            userID={this.state.userID}
                            data={data} onPress={() => { this.goBack.call(this); }}
                            navigate={() => {
                                this.setState({ tripAccepted: true });
                            }}
                        /> :
                        <></>}
                    <TouchableOpacity style={[styles.zoomIcon, { top: y(180), right: x(10) }]} onPress={this.zoomIn.bind(this)}>
                        <Icon name={'zoom-in'} size={y(21)} color={GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 245 : 235), right: x(10) }]} onPress={this.zoomOut.bind(this)}>
                        <Icon name={'zoom-out'} size={y(21)} color={GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 310 : 290), right: x(10) }]}
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
                                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                                distanceFilter: 10,
                            }).catch((error) => {
                                console.log(error.code, error.message);
                                Geolocation.requestAuthorization();
                            });
                        }}
                    >
                        <Icon_ name={'location-arrow'} size={y(21)} color={GREEN} />
                    </TouchableOpacity>


                    <Animated.View style={{ top: top_, transform: [{ scale: scale_ }], position: 'absolute', }}>
                        <MapView
                            initialRegion={{
                                latitude: this.state.location.latitude,
                                longitude: this.state.location.longitude,
                                longitudeDelta: LONGITUDE_DELTA,
                                latitudeDelta: LATITUDE_DELTA,

                            }}
                            onMapReady={() => {
                                this.mapIsReady = true;
                            }}
                            ref={map => { this.map = map }}
                            provider={PROVIDER_GOOGLE}
                            style={[styles.maps]}
                            customMapStyle={MapStyle}
                            showsCompass={false}
                            showsMyLocationButton={false}
                            showsUserLocation={true}
                        >
                            <Marker //LOCATION
                                coordinate={{ latitude: this.state.location.latitude, longitude: this.state.location.longitude }}
                                identifier={'mkL'}
                                style={{ zIndex: 1, elevation: 1 }}
                            >
                                <Icon_ name={'circle'} color={GREY} size={y(15)} />
                            </Marker>

                            <Marker //DESTINATION
                                coordinate={{ latitude: this.state.destination.latitude, longitude: this.state.destination.longitude }}
                                identifier={'mkD'}
                                style={{ zIndex: 1, elevation: 1 }}
                            >
                                <SvgComponent />
                            </Marker>
                            {this.state.driverL1 ?
                                <Marker.Animated
                                    coordinate={this.state.driverL1}
                                    identifier={'mk1'}
                                    style={{ zIndex: 2, elevation: 2 }}
                                >
                                    <View style={styles.icon}><GreenIcon /></View>
                                </Marker.Animated>
                                : <></>}
                            {this.state.driverL2 ?
                                <Marker.Animated
                                    coordinate={this.state.driverL2}
                                    identifier={'mk2'}
                                    style={{ zIndex: 2, elevation: 2 }}
                                >
                                    <View style={styles.icon}><BlueIcon /></View>
                                </Marker.Animated>
                                : <></>}
                            {this.state.driverL3 ?
                                <Marker.Animated
                                    coordinate={this.state.driverL3}
                                    identifier={'mk3'}
                                    style={{ zIndex: 2, elevation: 2 }}
                                >
                                    <View style={styles.icon}><PurpleIcon /></View>
                                </Marker.Animated>
                                : <></>}

                            {polylines}


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
                                    <Text style={styles.bubbleText}>{`${(totalDistance / 1000).toFixed(1)} KM`}</Text>
                                </View>
                                <Text style={[styles.tripTitle, { top: y(14), left: x(15), }]}>Trip Details</Text>

                                <View style={[styles.textContainer, { marginTop: y(51) }]}>
                                    <Text style={[styles.firstLayer,]}>Leave at</Text>
                                    <Text style={[styles.firstLayer,]}>{`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`}</Text>
                                </View>

                                <View style={[styles.textContainer, { marginTop: y(10) }]}>
                                    <Text style={[styles.firstLayer,]}>Arrive at</Text>
                                    <Text style={[styles.firstLayer,]}>{`${endHour}:${endMin < 10 ? '0' + endMin : endMin} ${endMeridiem}`}</Text>
                                </View>

                                <View style={[styles.divider, { marginTop: y(9) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                                <View style={[styles.textContainer, { marginTop: y(14) }]}>
                                    <Text style={[styles.firstLayer,]}>{`Number of passengers`}</Text>
                                    <Text style={[styles.firstLayer,]}>{this.state.seatNumber}</Text>
                                </View>
                                <View style={[styles.textContainer, { marginTop: y(10) }]}>
                                    <Text style={[styles.firstLayer,]}>Cost per km</Text>
                                    <Text style={[styles.firstLayer,]}>{`$2.00`}</Text>
                                </View>
                                <View style={[styles.textContainer, { marginTop: y(14) }]}>
                                    <Text style={[styles.total,]}>TOTAL</Text>
                                    <Text style={[styles.total,]}>$14.15</Text>
                                </View>
                                <View style={[styles.divider, { marginTop: y(9) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                                <View style={[styles.payment, { marginTop: y(10) }]}>
                                    <Text style={styles.paymentText}>PAYMENT METHOD</Text>
                                    {PAYMENT_CHOICE}
                                    <View style={{ right: 0, bottom: 0, position: 'absolute', }}>
                                        <TouchableOpacity onPress={() => {
                                            this.props.navigation.navigate('PaymentMethod', {
                                                choice: this.state.paymentMethod,
                                                changePayment: (value) => { this.changePayment.call(this, value) },
                                            })
                                        }}>
                                            <Text style={styles.change}>CHANGE</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={[styles.divider, { marginTop: y(10) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                                <View style={[styles.button, { marginTop: y(14) }]}>
                                    <Button text={this.state.scheduled ? 'Request pending' : 'Request Perch'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2}
                                        disabled={this.state.scheduled ? true : false}
                                        onPress={() => {
                                            const historyData = {
                                                data: JSON.stringify(data),//STRINGIFY IT TO AVOID ARRAYS MOVING ABOUT,
                                                seatNumber: this.state.seatNumber,
                                                location: this.state.location,
                                                destination: this.state.destination,
                                                driverDetails: {
                                                    steps: data.steps,
                                                    drivers: drivers,
                                                },
                                            };
                                            if (this.state.now)
                                                carpoolRequestHandler.call(this, this.dataToSend, historyData);
                                            else
                                                scheduledCarpoolRequestHandler.call(this, this.dataToSend, historyData);

                                        }}
                                        loading={this.state.loading} />
                                </View>
                                <TouchableOpacity style={[styles.textContainer, { marginTop: y(14), marginBottom: y(20) }]}
                                    onPress={() => {
                                        if (this.state.scheduled) {
                                            Alert.alert(
                                                'Cancel this request?',
                                                'Are you sure you want to cancel this request? You would not be charged',
                                                [{
                                                    text: 'Close',
                                                    style: 'cancel',
                                                },
                                                {
                                                    text: 'Cancel request',
                                                    style: 'destructive',
                                                    onPress: () => {
                                                        scheduledCarpoolRequestCanceller.call(this, this.state.userID, data.key)
                                                    },
                                                }])
                                        }
                                        else
                                            this.props.navigation.goBack();
                                    }}
                                >
                                    <Text style={[styles.firstLayer, { color: '#FF0000', }]}>{this.state.scheduled ? 'Cancel request' : 'Cancel'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.tripBreakdown,
                            ]}>
                                <Text style={[styles.tripTitle, { top: y(14), left: x(15), }]}>Trip Breakdown</Text>

                                {tripBreakdown}

                            </View>
                        </View>
                    </Animated.View>

                </View>
            );
        else
            return (
                <CarpoolRideConfirmed
                    tripBreakdown={tripBreakdown}
                    driverL1={this.state.driverL1}
                    driverL2={this.state.driverL2}
                    driverL3={this.state.driverL3}
                    location={this.state.location}
                    destination={this.state.destination}
                    polylines={polylines}
                    data={data}
                    hours={this.state.hours}
                    minutes={this.state.minutes}
                    screenName={this.props.route.name}
                    totalDistance={totalDistance}
                    etaD1={this.state.etaD1}
                    etaD2={this.state.etaD2}
                    etaD3={this.state.etaD3}
                    getFirstEta={this.state.getFirstEta}
                    getSecondEta={this.state.getSecondEta}
                    getThirdEta={this.state.getThirdEta}
                    driver1={this.state.driver1}
                    driver2={this.state.driver2}
                    driver3={this.state.driver3}
                    navigation={this.props.navigation}
                    endTrip={() => {
                        if (this.props.route.params.handleOnNavigateBack)
                            this.props.route.params.handleOnNavigateBack();
                        this.props.navigation.navigate('Main');
                    }}
                    userID={this.state.userID}
                    seatNumber={this.state.seatNumber}
                    oldTrip={this.oldTrip}
                    tripEnded={this.state.tripEnded}
                    dateText={this.state.dateText}
                    now={this.state.now}
                    rawDate={this.state.rawDate}
                    scheduled={this.state.scheduled}
                    scheduledTripStarted={this.state.scheduledTripStarted}
                />
            );
    };
};

class Drivers extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            complete1: false,
            complete2: false,
            complete3: false,
            declined: false,
        };
        this.progress1 = new Animated.Value(0);
        this.progress2 = new Animated.Value(0);
        this.progress3 = new Animated.Value(0);
    };
    componentDidMount() {//PUT LISTENERS FOR ACCEPTANCE OR DENAIL HERE
        AsyncStorage.getItem('USER_DETAILS').then(result => {
            const userDetails = JSON.parse(result);
            switch (this.props.steps) {
                case 1: {
                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.key}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress1_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });
                } break;
                case 2: {
                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.start}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress1_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });

                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.end}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress2_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });
                } break;
                case 3: {
                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.start}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress1_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });

                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.middle}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress2_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });

                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.end}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress3_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });
                } break;
            };

        }).catch(error => { console.log(error.message) });
    };
    progress1_() {
        this.setState({ complete1: true })
        Animated.timing(this.progress1, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };
    progress2_() {
        this.setState({ complete2: true })
        Animated.timing(this.progress2, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };
    progress3_() {
        this.setState({ complete3: true })
        Animated.timing(this.progress3, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };

    render() {

        let toDisplay = <></>, finished = false;
        switch (this.props.steps) {
            case 1: {
                if (this.state.complete1)
                    finished = true;
                else
                    finished = false;

                toDisplay =
                    <View style={styles.driverRow}>
                        <Text style={[styles.driverName, { color: GREEN, marginVertical: y(10) }]}>{this.props.driver1 ? this.props.driver1.firstName : ''}</Text>
                        {this.state.complete1 ?
                            <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress1} style={{ width: x(50), height: x(50) }}
                                    colorFilters={[{
                                        keypath: "Shape Layer 3",
                                        color: GREEN,
                                    }, {
                                        keypath: "Shape Layer 4",
                                        color: GREEN,
                                    }]} />
                            </View> :
                            <View>
                                <MaterialIndicator color={GREEN} size={x(20)} />
                            </View>
                        }
                    </View>
            } break;
            case 2: {
                if (this.state.complete1 && this.state.complete2)
                    finished = true;
                else
                    finished = false;

                toDisplay =
                    <>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: GREEN, marginTop: y(10) }]}>{this.props.driver1 ? this.props.driver1.firstName : ''}</Text>
                            {this.state.complete1 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress1} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: GREEN,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: GREEN,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={GREEN} size={x(20)} />
                                </View>
                            }
                        </View>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: BLUE, marginBottom: y(10), marginTop: y(5) }]}>{this.props.driver2 ? this.props.driver2.firstName : ''}</Text>
                            {this.state.complete2 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress2} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: BLUE,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: BLUE,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={BLUE} size={x(20)} />
                                </View>
                            }
                        </View>

                    </>
            } break;
            case 3: {
                if (this.state.complete1 && this.state.complete2 && this.state.complete3)
                    finished = true;
                else
                    finished = false;

                toDisplay =
                    <>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: GREEN, marginTop: y(10) }]}>{this.props.driver1 ? this.props.driver1.firstName : ''}</Text>
                            {this.state.complete1 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress1} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: GREEN,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: GREEN,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={GREEN} size={x(20)} />
                                </View>
                            }
                        </View>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: BLUE, marginVertical: y(5) }]}>{this.props.driver2 ? this.props.driver2.firstName : ''}</Text>
                            {this.state.complete2 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12), }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress2} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: BLUE,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: BLUE,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={BLUE} size={x(20)} />
                                </View>
                            }
                        </View>

                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: PURPLE, marginBottom: y(10) }]}>{this.props.driver3 ? this.props.driver3.firstName : ''}</Text>
                            {this.state.complete3 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress3} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: PURPLE,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: PURPLE,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={PURPLE} size={x(20)} />
                                </View>
                            }
                        </View>
                    </>
            } break;
        };

        if (Platform.OS == 'ios')
            if (finished)
                LayoutAnimation.configureNext(CustomLayoutLinear);

        if (finished)
            this.props.navigate();

        if (this.props.tripActive && this.state.declined == false)
            return (
                <View style={styles.driverContainer}>
                    {finished == false ?
                        <View style={styles.secondaryDriverConatiner_}>
                            <Text style={[styles.driverTitle, { textAlign: 'center', marginVertical: y(5) }]}>Waiting for drivers to accept the ride request</Text>
                            {toDisplay}
                            <Text style={[styles.driverName, { textAlign: 'center', marginBottom: y(5), fontSize: y(12) }]}>Drivers will accept within <Text style={{ fontWeight: '700', }}>3 minutes</Text> and the trip would begin</Text>

                        </View> :
                        <View style={[styles.secondaryDriverConatiner_, { justifyContent: 'center', alignItems: 'center', width: x(100), height: x(100) }]}>
                            <MaterialIndicator color={GREEN} size={x(50)} />
                        </View>
                    }
                </View>
            );
        else {
            return (
                <View style={styles.driverContainer}>
                    <View style={styles.secondaryDriverConatiner_}>
                        <Text style={[styles.driverTitle, { textAlign: 'center', marginVertical: y(5), fontSize: y(16) }]}>Sadly a driver could not accept your request , please pick another trip</Text>
                        <TouchableOpacity style={styles.backButton} onPress={this.props.onPress}>
                            <Text style={[styles.driverTitle, { color: WHITE, fontSize: y(15) }]}>Go back</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            );
        }
    };
};

class CarpoolRideConfirmed extends React.Component {
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
            callScreen: false,
            messageScreen: false,
            navigationLoading: false,

            location: this.props.location,
            destination: this.props.destination,
            seatNumber: this.props.seatNumber,
            hours: this.props.hours,
            minutes: this.props.minutes,

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
                        }).start();
                });
            }
            else if ((value <= this.TOP_OF_TRIPS) && this.direction === 'upwards') {
                this.direction = 'downwards';
                this.position.stopAnimation(() => {
                    if (value < this.TOP_OF_TRIPS)
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: (this.TOP_OF_TRIPS + 1) },
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
                    }).start();
                }
            },
        });
    };

    componentDidMount() {
        const data = this.data;

        Geolocation.getCurrentPosition(
            (position) => {
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
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        ).catch((error) => {
            console.log(error.code, error.message);
            Geolocation.requestAuthorization();
        });

        this.watchID = Geolocation.watchPosition(position => {//THIS HAPPENS AS THE USER MOVES OR CHANGES LOCATION
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
                            edgePadding:
                            {
                                top: x(20),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
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
                            edgePadding:
                            {
                                top: x(20),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
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
                            edgePadding:
                            {
                                top: x(20),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
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
                            edgePadding:
                            {
                                top: x(20),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
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
                            edgePadding:
                            {
                                top: x(20),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
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
                            edgePadding:
                            {
                                top: x(20),
                                right: x(80),
                                bottom: x(40),
                                left: x(25)
                            },
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
            }).start();
    }
    nextDriverDistancesSetter(value, value2) {
        this.setState({ nextDriverDistances: value, originalTotalDistance: value2 });
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
        switch (data.steps) {
            case 1: {
                driverID1 = data.key;
                if (this.props.driver1) {
                    loadingComplete = true;
                    ratingStack = (
                        <DriverRating
                            rating={this.state.driver1Rating}
                            starColor={GREEN}
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
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: GREEN }]} onPress={() => { callNumber(this.props.driver1.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                        </>
                    );
                    messages = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: GREEN }]}
                                    onPress={() => {
                                        if (this.props.getFirstEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID1,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={WHITE} size={y(20)} />
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
                                    color={GREEN}
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
                if (this.props.driver1 && this.props.driver2) {
                    loadingComplete = true;
                    ratingStack = (
                        <>
                            <DriverRating
                                rating={this.state.driver1Rating}
                                starColor={GREEN}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver1Rating: rating })
                                }}
                                driverName={`${this.props.driver1.name}`}
                                driver={this.props.driver1}
                            />
                            <DriverRating
                                rating={this.state.driver2Rating}
                                starColor={BLUE}
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
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: GREEN }]} onPress={() => { callNumber(this.props.driver1.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: GREEN }]}>{`1st driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: BLUE }]} onPress={() => { callNumber(this.props.driver2.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: BLUE }]}>{`2nd driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver2.firstName}</Text>
                            </View>
                        </>
                    );
                    messages = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: GREEN }]}
                                    onPress={() => {
                                        if (this.props.getFirstEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID1,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: GREEN }]}>{`1st driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: BLUE }]}
                                    onPress={() => {
                                        if (this.props.getSecondEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID2,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: BLUE }]}>{`2nd driver`}</Text>
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
                                    color={GREEN}
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
                                    color={BLUE}
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
                if (this.props.driver1 && this.props.driver2 && this.props.driver3) {
                    loadingComplete = true;
                    ratingStack = (
                        <>
                            <DriverRating
                                rating={this.state.driver1Rating}
                                starColor={GREEN}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver1Rating: rating })
                                }}
                                driverName={`${this.props.driver1.name}`}
                                driver={this.props.driver1}
                            />
                            <DriverRating
                                rating={this.state.driver2Rating}
                                starColor={BLUE}
                                ratingAdjust={(rating) => {
                                    this.setState({ driver2Rating: rating })
                                }}
                                driverName={`${this.props.driver2.name}`}
                                driver={this.props.driver2}
                            />
                            <DriverRating
                                rating={this.state.driver3Rating}
                                starColor={PURPLE}
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
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: GREEN }]} onPress={() => { callNumber(this.props.driver1.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: GREEN }]}>{`1st driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: BLUE }]} onPress={() => { callNumber(this.props.driver2.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: BLUE }]}>{`2nd driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver2.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: PURPLE }]} onPress={() => { callNumber(this.props.driver3.phoneNumber); }}>
                                    <Icon name={'phone-call'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: PURPLE }]}>{`3rd driver`}</Text>
                                <Text style={styles.phoneText}>{this.props.driver3.firstName}</Text>
                            </View>
                        </>
                    );
                    messages = (
                        <>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: GREEN }]}
                                    onPress={() => {
                                        if (this.props.getFirstEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID1,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: GREEN }]}>{`1st driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver1.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: BLUE }]}
                                    onPress={() => {
                                        if (this.props.getSecondEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID2,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: BLUE }]}>{`2nd driver`}</Text>
                                <Text numberOfLines={1} style={styles.phoneText}>{this.props.driver2.firstName}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity style={[styles.phoneIcon, { backgroundColor: PURPLE }]}
                                    onPress={() => {
                                        if (this.props.getThirdEta)
                                            this.props.navigation.navigate('Chat', {
                                                riderID: this.props.userID,
                                                driverID: driverID3,
                                            })
                                        else
                                            alert('Cannot message after trip has started. Feel free to talk to each other')
                                    }}>
                                    <Icon name={'mail'} color={WHITE} size={y(20)} />
                                </TouchableOpacity>
                                <Text style={[styles.phoneText_, { color: PURPLE }]}>{`3rd driver`}</Text>
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
                                    color={GREEN}
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
                                    color={BLUE}
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
                                    color={PURPLE}
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
                    <StatusBar backgroundColor={'#000000'} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.screenName} />
                    {this.state.cancelAlert == true ?
                        <View style={styles.cancelAlertContainer}>
                            <View style={styles.cancelAlert}>
                                <View style={styles.cancelAlertUpper}>
                                    <Text style={[styles.cancelText, { fontSize: y(17), marginBottom: y(6) }]}>Leave this screen?</Text>
                                    <Text style={[styles.cancelText, { fontSize: y(13), marginBottom: y(10), fontFamily: 'Gilroy-Regular' }]}>Leave this screen?</Text>
                                </View>
                                <View style={[{ flexDirection: 'row' }]}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            // this.tripIsOver.call(this);
                                            this.props.endTrip();
                                        }}
                                        style={[styles.cancelAlertLower, { borderRightWidth: 0.5, borderColor: 'rgba(64, 61, 61, 0.3)', }]}>
                                        <Text style={[styles.cancelText, { fontSize: y(15), color: RED, marginVertical: y(15) }]}>Exit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { this.setState({ cancelAlert: false }) }} style={[styles.cancelAlertLower, { borderLeftWidth: 0.5, borderColor: 'rgba(64, 61, 61, 0.3)', }]}>
                                        <Text style={[styles.cancelText, { fontSize: y(15), color: GREEN, marginVertical: y(15) }]}>Stay</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View> :
                        <></>}

                    {this.state.callScreen ?
                        <View style={styles.cancelAlertContainer}>
                            <View style={[styles.cancelAlert, { padding: x(10), width: x(270) }]}>
                                <View style={[styles.cancelIcon, {}]}>
                                    <TouchableOpacity onPress={() => { this.setState({ callScreen: false, }) }} style={{ width: y(40), height: y(40) }}>
                                        <Icon name={'x'} size={y(26)} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.cancelText, { fontSize: y(17), marginBottom: y(6) }]}>Pick the driver you want to call</Text>
                                <View style={[styles.phoneContainer, { justifyContent: justifyContent_ }]}>
                                    {phones}
                                </View>
                            </View>
                        </View> :
                        <></>}
                    {this.state.messageScreen ?
                        <View style={styles.cancelAlertContainer}>
                            <View style={[styles.cancelAlert, { padding: x(10), width: x(270) }]}>
                                <View style={[styles.cancelIcon, {}]}>
                                    <TouchableOpacity onPress={() => { this.setState({ messageScreen: false, }) }} style={{ width: y(40), height: y(40) }}>
                                        <Icon name={'x'} size={y(26)} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.cancelText, { fontSize: y(17), marginBottom: y(6) }]}>Pick the driver you want to text</Text>
                                <View style={[styles.phoneContainer, { justifyContent: justifyContent_ }]}>
                                    {messages}
                                </View>
                            </View>
                        </View> :
                        <></>}
                    <TouchableOpacity style={[styles.zoomIcon, { backgroundColor: RED, top: y(70), right: x(10) }]} onPress={() => { this.setState({ cancelAlert: true }) }}>
                        <Icon name={'x'} size={y(21)} color={'#FFFFFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 135 : 120), right: x(10) }]} onPress={this.zoomIn.bind(this)}>
                        <Icon name={'zoom-in'} size={y(21)} color={GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 200 : 170), right: x(10) }]} onPress={this.zoomOut.bind(this)}>
                        <Icon name={'zoom-out'} size={y(21)} color={GREEN} />
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
                        <Icon_ name={'location-arrow'} size={y(21)} color={GREEN} />
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
                                <Icon_ name={'circle'} color={GREY} size={20} />
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
                                        <Icon name={'phone-call'} color={WHITE} size={y(20)} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.contactButton} onPress={() => { this.setState({ messageScreen: true }) }}>
                                        <Icon name={'mail'} color={WHITE} size={y(20)} />
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
                                <TouchableOpacity style={[styles.textContainer, { marginTop: y(23), marginBottom: y(20) }]} onPress={() => { }}>
                                    <Text style={[styles.firstLayer, { color: '#FF0000', }]}>{this.props.now ? 'Cancel trip' : 'Cancel scheduled request'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.tripBreakdown,
                            ]}>
                                <Text style={[styles.tripTitle, { top: y(14), left: x(15), }]}>Trip Breakdown</Text>

                                {this.props.tripBreakdown}

                            </View>

                            <Text style={[styles.adText, { marginTop: y(26) }]}>{'Get discounts towards your next trip by sharing your special code with your friends ! '}</Text>
                            <View style={[styles.share, { marginTop: y(10), marginBottom: y(45) }]}>
                                <View style={styles.shareCode}>
                                    <Text style={styles.shareCodeText}>234USER01</Text>
                                </View>
                                <TouchableOpacity>
                                    <View style={styles.send}>
                                        <Icon__ name={'paper-plane'} color={WHITE} size={y(30)} />
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

                </View>
            )
        else
            return (
                <LoadingScreen />
            )
    }
};
class DriverRating extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            driver: this.props.driver,
            url: null
        }
    }
    componentDidMount() {
        this.setImage();
    }
    setImage = () => {
        database().ref(`userImage/${this.state.driver.mainID}`).once('value', snap => {
            storage().ref(`${snap.val()}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) });
            this.setState({ joinedText: snap.val().driverJoinedText })
        })
    };
    render() {
        return (
            <View style={styles.driverRatingContainer}>
                <View style={[styles.driverRatingdp, this.state.url ? { borderWidth: 0 } : {}]}>
                    {
                        this.state.url ?
                            <Image
                                source={{ uri: this.state.url }}
                                resizeMode={'contain'}
                                style={{
                                    flex: 1,
                                    height: x(60),
                                    width: x(60),
                                }} />
                            : <></>
                    }
                </View>
                <Text style={[styles.ratingDriverName, { marginVertical: y(5) }]}>{this.props.driverName}</Text>
                <View style={styles.star}>
                    <StarRating
                        disabled={false}
                        maxStars={5}
                        rating={Number(this.props.rating)}
                        fullStarColor={this.props.starColor}
                        emptyStarColor={this.props.starColor}
                        starSize={x(40)}
                        selectedStar={(rating) => { this.props.ratingAdjust(rating) }}
                    />
                </View>

            </View>
        )
    }
};
function SvgComponent() {
    return (
        <Svg width={16} height={24} viewBox="0 0 14 20" fill={GREY}>
            <G data-name="Group 3003">
                <Path
                    data-name="pin_sharp_circle-[#625]"
                    d="M7 0a7 7 0 00-7 7c0 3.866 7 13 7 13s7-9.134 7-13a7 7 0 00-7-7"
                    fillRule="evenodd"
                />
                <G data-name="Page-1">
                    <G data-name="Dribbble-Light-Preview">
                        <G data-name="icons">
                            <Path
                                data-name="pin_sharp_circle-[#625]"
                                d="M7 7.635a1 1 0 111-1 1 1 0 01-1 1m0-4a3 3 0 103 3 3 3 0 00-3-3"
                                fill="#fff"
                                fillRule="evenodd"
                            />
                        </G>
                    </G>
                </G>
            </G>
        </Svg>
    );
};
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);


    return { hours: h, minutes: m };
};
function nN(d) {
    return Number(d);
};
function calculateTime(aH, bH, aM, bM) {
    const re = ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60)) > 12 ?
        ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60)) - 12 :
        ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60));

    return re;
};
function calculateZone(aH, bH, aM, bM, oldzone) {
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
function distanceCalculator(lat1, lon1, lat2, lon2) {
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
function polylineLenght(data) {
    let distance = 0;
    for (let k = 0; k < data.length - 1; k++)
        distance += distanceCalculator(data[k][0], data[k][1], data[k + 1][0], data[k + 1][1])

    return (distance)
};

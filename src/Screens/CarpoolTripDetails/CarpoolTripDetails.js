import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
import * as turf from '@turf/turf'; //for encoding polylines
import React from 'react';
import { Alert, Animated, BackHandler, PanResponder, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import KeepAwake from 'react-native-keep-awake';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import Icon_ from 'react-native-vector-icons/FontAwesome';
import stripe from 'tipsi-stripe';
import { AnimatedPolylineMultipleLine, AnimatedPolylineSingleLine } from '../../Components/AnimatedPolyline/AnimatedPolyline';
import { BottomCombiner, Card, MiddleCombiner, TopCombiner } from '../../Components/BreakdownCardsWithCombiners/BreakdownCardsWithCombiners';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import SvgComponent from './SvgComponent';

import {
    calculateTime, calculateZone, carpoolRequestHandler,
    chargeCustomer, dimensionAssert, eTARefresh, height,
    nN, OfflineNotice,
    perchKilometerDifference,
    perchKilometerPayment, scheduledCarpoolRequestCanceller, scheduledCarpoolRequestHandler,
    secondsToHms, width, x, y, colors
} from '../../Functions/Functions';

import ApplePayLogo from '../../Images/svgImages/applePayLogo';
import BlueIcon from '../../Images/svgImages/blueIcon';
import GenericPaymentCard from '../../Images/svgImages/genericPaymentCard';
import GooglePayLogo from '../../Images/svgImages/googlePayLogo';
import GreenIcon from '../../Images/svgImages/greenIcon';
import MasterCard from '../../Images/svgImages/mastercard';
import Money from '../../Images/svgImages/moneyChoice';
import PerchWallet from '../../Images/svgImages/perchWallet';
import PurpleIcon from '../../Images/svgImages/purpleIcon';
import Visa from '../../Images/svgImages/visa';

import styles from './styles';
import CarpoolRideConfirmed from './CarpoolRideConfirmed';
import Drivers from './Drivers';

const MAX_HEADER_HEIGHT = y(156);
const MIN_HEADER_HEIGHT = y(96.5);
const X_CONSTANT = 0;
const Y_START = y(364);
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
            selected: 'NONE',
            last4: 'xxxx',
            card: null,

            perchKms: 0,
            usePerchKms: false,
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
        database().ref(`cards/${this.state.userID}/selected`).on('value', snapshot => {
            const platformPayment = Platform.OS == 'ios' ? 'applePay' : 'googlePay';
            if (snapshot.val()) {
                if (snapshot.val() != platformPayment)
                    database().ref(`cards/${this.state.userID}/${snapshot.val()}/card`).once('value', card => {
                        switch (card.val().brand) {
                            case 'Visa': {
                                this.setState({ selected: 'visa', last4: snapshot.val(), card: card.val() });
                            } break;
                            case 'Mastercard': {
                                this.setState({ selected: 'mastercard', last4: snapshot.val(), card: card.val() });
                            } break;
                            default: {
                                this.setState({ selected: 'default', last4: snapshot.val(), card: card.val() });
                            } break;
                        };
                    })
                else
                    this.setState({ selected: platformPayment })
            }
        });
        database().ref(`usePerchKilometers/${this.state.userID}`).on('value', snapshot => {
            this.setState({ usePerchKms: snapshot.val() ? true : false })
        });
        database().ref(`perchKilometers/${this.state.userID}/quantity`).on('value', snapshot => {
            this.setState({ perchKms: snapshot.val() })
        });

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

        switch (this.state.selected) {
            case 'visa': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa}><Visa height={'100%'} width={'100%'} /></View>
                        <Text style={styles.cardNumber}>XXXX XXXX XXXX {this.state.last4}</Text>
                    </View>
                );
            } break;
            case 'mastercard': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa}><MasterCard height={'100%'} width={'100%'} /></View>
                        <Text style={styles.cardNumber}>XXXX XXXX XXXX {this.state.last4}</Text>
                    </View>
                );
            } break;
            case 'default': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={[styles.visa_, { width: x(26.2) }]}><GenericPaymentCard height={'100%'} width={'100%'} /></View>
                        <Text style={[styles.cardNumber, { marginLeft: x(6) }]}>XXXX XXXX XXXX {this.state.last4}</Text>
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
            case 'applePay': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa_}><ApplePayLogo height={'100%'} width={'100%'} /></View>
                        <Text style={[styles.cardNumber, { marginLeft: x(6) }]}>Apple Pay</Text>
                    </View>
                );
            } break;
            case 'googlePay': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={[styles.visa_, { width: x(46.2) }]}><GooglePayLogo height={'100%'} width={'100%'} /></View>
                        <Text style={[styles.cardNumber, { marginLeft: x(0) }]}>Google Pay</Text>
                    </View>
                );
            } break;
            default: {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={[styles.visa_, { width: x(26.2) }]}><GenericPaymentCard height={'100%'} width={'100%'} /></View>
                        <Text style={[styles.cardNumber, { marginLeft: x(5) }]}>Pick a payment method</Text>
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
                        scheduled: !this.state.now,
                        toPay: data.cost.toDrivers.firstDriverPay,
                    },
                ];

                tripBreakdown =
                    (<View style={{ top: y(68), paddingBottom: y(82) }}>
                        <TopCombiner start={this.state.location.description} time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`} distance={data.travelDetails.walkFromL.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card color={colors.GREEN} onPress={() => { this.props.navigation.navigate('CarpoolDriverProfile', { driver: this.state.driver1 }) }}
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
                            strokeColor={colors.GREEN_}
                            strokeWidth={4}
                        />
                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }}//TRIP WE ARE JOINING
                        >
                            <Icon_ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>
                        <AnimatedPolylineSingleLine
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={colors.GREENMAKER}
                            strokeColor={colors.GREEN}
                            strokeWidth={4}
                        //interval={10}
                        />
                        <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}>
                            <Icon_ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>

                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
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
                        scheduled: !this.state.now,
                        toPay: data.cost.toDrivers.firstDriverPay,
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
                        scheduled: !this.state.now,
                        toPay: data.cost.toDrivers.secondDriverPay,
                    },
                ];

                tripBreakdown =
                    (<View style={{ top: y(68), paddingBottom: y(82) }}>
                        <TopCombiner start={this.state.location.description} time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`} distance={data.travelDetails.walkFromL.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card
                                color={colors.GREEN}
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
                                color={colors.BLUE}
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
                            strokeColor={colors.GREEN_}
                            strokeWidth={4}
                        />
                        <Polyline
                            coordinates={data.secondPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.BLUE_}
                            strokeWidth={4}
                        />

                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }//TRIP WE ARE JOINING
                        }
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon_ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREEN}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={colors.GREENMAKER}
                            strokeColor={colors.GREEN}
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
                                <Icon_ name={'circle'} color={colors.GREEN} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.secondLeg[0][0], longitude: data.secondLeg[0][1] }}
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon_ name={'circle'} color={colors.BLUE} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.BLUE}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={colors.BLUEMAKER}
                            strokeColor={colors.BLUE}
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
                            <Icon_ name={'circle'} color={colors.BLUE} size={12} />
                        </Marker>

                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk3.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
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
                        scheduled: !this.state.now,
                        toPay: data.cost.toDrivers.firstDriverPay,
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
                        scheduled: !this.state.now,
                        toPay: data.cost.toDrivers.secondDriverPay,
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
                        scheduled: !this.state.now,
                        toPay: data.cost.toDrivers.thirdDriverPay,
                    },
                ];



                tripBreakdown =
                    (<View style={{ top: y(68), paddingBottom: y(82) }}>
                        <TopCombiner start={this.state.location.description} time={`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem}`} distance={data.travelDetails.walkFromL.distance.value} />
                        <View style={{ zIndex: 2 }}>
                            <Card
                                color={colors.GREEN}
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
                                color={colors.BLUE}
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
                            <Card color={colors.PURPLE}
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
                            strokeColor={colors.GREEN_}
                            strokeWidth={4}
                        />
                        <Polyline
                            coordinates={data.secondPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.BLUE_}
                            strokeWidth={4}
                        />
                        <Polyline
                            coordinates={data.thirdPolyline.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.PURPLE_}
                            strokeWidth={4}
                        />



                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }}//TRIP WE ARE JOINING
                        >
                            <Icon_ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREEN}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={colors.GREENMAKER}
                            strokeColor={colors.GREEN}
                            strokeWidth={4}
                            start1st={this.state.start1st}
                            start2nd={this.state.startSecond1}
                            complete1st={() => { this.setState({ start2nd: true }); }}
                            complete2nd={() => { this.setState({ startSecond1: false, startSecond2: true }) }}
                        //interval={10}
                        />
                        {(data.firstLeg[data.firstLeg.length - 1][0] != data.secondLeg[0][0] && data.firstLeg[data.firstLeg.length - 1][1] != data.secondLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}>
                                <Icon_ name={'circle'} color={colors.GREEN} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.secondLeg[0][0], longitude: data.secondLeg[0][1] }}>
                            <Icon_ name={'circle'} color={colors.BLUE} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.BLUE}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={colors.BLUEMAKER}
                            strokeColor={colors.BLUE}
                            strokeWidth={4}
                            start1st={this.state.start2nd}
                            start2nd={this.state.startSecond2}
                            complete1st={() => { this.setState({ start3rd: true }) }}
                            complete2nd={() => { this.setState({ startSecond2: false, startSecond3: true, }) }}

                        //interval={10}
                        />
                        {(data.secondLeg[data.secondLeg.length - 1][0] != data.thirdLeg[0][0] && data.secondLeg[data.secondLeg.length - 1][1] != data.thirdLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.secondLeg[data.secondLeg.length - 1][0], longitude: data.secondLeg[data.secondLeg.length - 1][1] }}>
                                <Icon_ name={'circle'} color={colors.BLUE} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.thirdLeg[0][0], longitude: data.thirdLeg[0][1] }}>
                            <Icon_ name={'circle'} color={colors.PURPLE} size={12} />
                        </Marker>
                        {/* <Polyline
                            coordinates={data.thirdLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.PURPLE}
                            strokeWidth={4}
                        /> */}
                        <AnimatedPolylineMultipleLine
                            coordinates={data.thirdLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColorMove={colors.PURPLEMAKER}
                            strokeColor={colors.PURPLE}
                            strokeWidth={4}
                            start1st={this.state.start3rd}
                            start2nd={this.state.startSecond3}
                            complete1st={() => { this.setState({ startSecond1: true }) }}
                            complete2nd={() => { this.setState({ startSecond3: false, startSecond1: true, }) }}

                        //interval={10}
                        />
                        <Marker coordinate={{ latitude: data.thirdLeg[data.thirdLeg.length - 1][0], longitude: data.thirdLeg[data.thirdLeg.length - 1][1] }}>
                            <Icon_ name={'circle'} color={colors.PURPLE} size={12} />
                        </Marker>


                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk3.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={4}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk4.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
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
                            now={this.state.now}
                            userID={this.state.userID}
                            data={data} onPress={() => { this.goBack.call(this); }}
                            navigate={() => {
                                this.setState({ tripAccepted: true });
                            }}
                        /> :
                        <></>}
                    <TouchableOpacity style={[styles.zoomIcon, { top: y(180), right: x(10) }]} onPress={this.zoomIn.bind(this)}>
                        <Icon name={'zoom-in'} size={y(21)} color={colors.GREEN} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.zoomIcon, { top: y(dimensionAssert() ? 245 : 235), right: x(10) }]} onPress={this.zoomOut.bind(this)}>
                        <Icon name={'zoom-out'} size={y(21)} color={colors.GREEN} />
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
                        <Icon_ name={'location-arrow'} size={y(21)} color={colors.GREEN} />
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
                                <Icon_ name={'circle'} color={colors.GREY} size={y(15)} />
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
                                    <Text style={[styles.firstLayer,]}>${(data.cost.costPerKM).toFixed(2)}</Text>
                                </View>
                                {this.state.usePerchKms ?
                                    <>
                                        <View style={[styles.textContainer, { marginTop: y(10) }]}>
                                            <Text style={[styles.firstLayer,]}>Total kilometers</Text>
                                            <Text style={[styles.firstLayer,]}>{(data.cost.totalKilometers).toFixed(2)} kms</Text>
                                        </View>
                                        <View style={[styles.textContainer, { marginTop: y(10) }]}>
                                            <Text style={[styles.firstLayer,]}>Available Perch Kilometers </Text>
                                            <Text style={[styles.firstLayer, { color: colors.GREEN, fontFamily: 'Gilroy-Bold' }]}>{(this.state.perchKms).toFixed(2)} kms</Text>
                                        </View>
                                    </> :
                                    <></>}
                                <View style={[styles.textContainer, { marginTop: y(14) }]}>
                                    <Text style={[styles.total,]}>TOTAL</Text>
                                    <Text style={[styles.total,]}>$ {this.state.usePerchKms ? (perchKilometerDifference(this.state.perchKms, data.cost.totalKilometers, data.cost.costPerKM).remainingCost).toFixed(2) : data.cost.total}</Text>
                                </View>
                                <View style={[styles.divider, { marginTop: y(9) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                                <View style={[styles.payment, { marginTop: y(10) }]}>
                                    <Text style={styles.paymentText}>PAYMENT METHOD</Text>
                                    {PAYMENT_CHOICE}
                                    <View style={{ right: 0, bottom: 0, position: 'absolute', }}>
                                        <TouchableOpacity onPress={() => {
                                            AsyncStorage.getItem('USER_DETAILS').then(result => {
                                                const userDetails = JSON.parse(result);
                                                this.props.navigation.navigate('Wallet', {
                                                    userDetails: userDetails,
                                                    choice: this.state.selected,
                                                })
                                            })
                                        }}>
                                            <Text style={styles.change}>{this.state.selected == 'NONE' ? 'SELECT' : 'CHANGE'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={[styles.divider, { marginTop: y(10) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                                <View style={[styles.button, { marginTop: y(14) }]}>
                                    <Button text={this.state.scheduled ? 'Request pending' : 'Request Perch'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2}
                                        disabled={this.state.scheduled ? true : false}
                                        onPress={() => {
                                            const { remainingPerchKms, remainingTotalKms, usedPerchKms, remainingCost } = perchKilometerDifference(this.state.perchKms, data.cost.totalKilometers, data.cost.costPerKM);
                                            let cost_ = data.cost;
                                            if (this.state.usePerchKms && usedPerchKms != 0)
                                                cost_.total = (remainingCost).toFixed(2);//TO SWITCH THE TOTAL PAID WHEN PERCH KMS ARE USED
                                            let historyData = {
                                                data: JSON.stringify(data),//STRINGIFY IT TO AVOID ARRAYS MOVING ABOUT,
                                                seatNumber: this.state.seatNumber,
                                                location: this.state.location,
                                                destination: this.state.destination,
                                                driverDetails: {
                                                    steps: data.steps,
                                                    drivers: drivers,
                                                },
                                                cost: cost_,
                                                card: this.state.card,
                                                paymentMethod: this.state.selected,//applePay, googlePay or a card type
                                            };
                                            if (this.state.selected == 'NONE') {
                                                Alert.alert(
                                                    'Please select payment',
                                                    'Please select a payment method in order to book a ride.', [
                                                    {
                                                        text: 'Cancel',
                                                        style: 'cancel'
                                                    },
                                                    {
                                                        text: 'Select Payment',
                                                        onPress: () => {
                                                            AsyncStorage.getItem('USER_DETAILS').then(result => {
                                                                const userDetails = JSON.parse(result);
                                                                this.props.navigation.navigate('Wallet', {
                                                                    userDetails: userDetails,
                                                                    choice: this.state.selected,
                                                                })
                                                            })
                                                        }
                                                    }
                                                ])
                                            }
                                            else if (this.state.usePerchKms && usedPerchKms != 0) {

                                                if (remainingCost == 0) {
                                                    historyData.paymentIntentId = 'fullyPerchKms';
                                                    //Process a perch km payment and move on to payments
                                                    perchKilometerPayment.call(this, {
                                                        userID: this.state.userID,
                                                        usedPerchKms: usedPerchKms,
                                                    }, this.dataToSend, historyData)
                                                }
                                                else {
                                                    if (this.state.selected == 'applePay') {
                                                        stripe.canMakeNativePayPayments()
                                                            .then(canUsePayment => {
                                                                if (canUsePayment) {
                                                                    stripe.paymentRequestWithApplePay([
                                                                        { label: 'Perch', amount: remainingCost.toFixed(2) },
                                                                    ], {
                                                                        currencyCode: 'CAD',
                                                                        countryCode: 'CA'
                                                                    })
                                                                        .then((result) => {
                                                                            stripe.completeApplePayRequest()
                                                                                .then(() => {
                                                                                    historyData.paymentIntentId = result.tokenId;
                                                                                    perchKilometerPayment.call(this, {
                                                                                        userID: this.state.userID,
                                                                                        usedPerchKms: usedPerchKms,
                                                                                    }, this.dataToSend, historyData)
                                                                                })
                                                                                .catch(error => {
                                                                                    Alert.alert('Payment Error', error.message);
                                                                                    stripe.cancelNativePayRequest()
                                                                                })
                                                                        }).catch(error => {
                                                                            Alert.alert('Payment Error', error.message);
                                                                            stripe.cancelNativePayRequest()
                                                                        })
                                                                }
                                                                else
                                                                    Alert.alert('Payment Error', `You cannot use ${Platform.OS == 'ios' ? 'Apple Pay' : 'Google Pay'}, please select another payment method or add a credit/debit card`);
                                                            })
                                                            .catch(error => { Alert.alert('Payment Error', error.message) })
                                                    }
                                                    else if (this.state.selected == 'googlePay') {
                                                        stripe.canMakeNativePayPayments()
                                                            .then(canUsePayment => {
                                                                if (canUsePayment) {
                                                                    stripe.paymentRequestWithAndroidPay({
                                                                        total_price: remainingCost.toFixed(2),
                                                                        currency_code: 'CAD',
                                                                        shipping_address_required: false,
                                                                        billing_address_required: false,
                                                                        shipping_countries: ["CA"],
                                                                        line_items: [{
                                                                            currency_code: 'CAD',
                                                                            description: 'Perch',
                                                                            total_price: remainingCost.toFixed(2),
                                                                            unit_price: remainingCost.toFixed(2),
                                                                            quantity: '1',
                                                                        }],
                                                                    })
                                                                        .then((result) => {
                                                                            historyData.paymentIntentId = result.tokenId;
                                                                            perchKilometerPayment.call(this, {
                                                                                userID: this.state.userID,
                                                                                usedPerchKms: usedPerchKms,
                                                                            }, this.dataToSend, historyData)
                                                                        })
                                                                        .catch(error => {
                                                                            Alert.alert('Payment Error', error.message);
                                                                            stripe.cancelNativePayRequest()
                                                                        })
                                                                }
                                                                else
                                                                    Alert.alert('Payment Error', `You cannot use ${Platform.OS == 'ios' ? 'Apple Pay' : 'Google Pay'}, please select another payment method or add a credit/debit card`);
                                                            })
                                                            .catch(error => { Alert.alert('Payment Error', error.message) })
                                                    }
                                                    else {
                                                        AsyncStorage.getItem('USER_DETAILS').then(result => {
                                                            const userDetails = JSON.parse(result);
                                                            chargeCustomer.call(this, {
                                                                cost: Number(remainingCost.toFixed(2)),
                                                                cardId: this.state.card.cardId,
                                                                customerID: userDetails.stripeCustomerID,
                                                            },
                                                                this.dataToSend,
                                                                historyData,
                                                                usedPerchKms);
                                                        });
                                                    }
                                                }
                                            }
                                            else {//WITHOUT PERCH KMS

                                                if (this.state.selected == 'applePay') {
                                                    stripe.canMakeNativePayPayments()
                                                        .then(canUsePayment => {
                                                            if (canUsePayment) {
                                                                stripe.paymentRequestWithApplePay([
                                                                    { label: 'Perch', amount: data.cost.total },
                                                                ], {
                                                                    currencyCode: 'CAD',
                                                                    countryCode: 'CA'
                                                                })
                                                                    .then((result) => {
                                                                        stripe.completeApplePayRequest()
                                                                            .then(() => {
                                                                                historyData.paymentIntentId = result.tokenId;
                                                                                if (this.state.now)
                                                                                    carpoolRequestHandler.call(this, this.dataToSend, historyData);
                                                                                else
                                                                                    scheduledCarpoolRequestHandler.call(this, this.dataToSend, historyData);
                                                                            })
                                                                            .catch(error => {
                                                                                Alert.alert('Payment Error', error.message);
                                                                                stripe.cancelNativePayRequest()
                                                                            })
                                                                    }).catch(error => {
                                                                        Alert.alert('Payment Error', error.message);
                                                                        stripe.cancelNativePayRequest()
                                                                    })
                                                            }
                                                            else
                                                                Alert.alert('Payment Error', `You cannot use ${Platform.OS == 'ios' ? 'Apple Pay' : 'Google Pay'}, please select another payment method or add a credit/debit card`);
                                                        })
                                                        .catch(error => { Alert.alert('Payment Error', error.message) })
                                                }
                                                else if (this.state.selected == 'googlePay') {
                                                    stripe.canMakeNativePayPayments()
                                                        .then(canUsePayment => {
                                                            if (canUsePayment) {
                                                                stripe.paymentRequestWithAndroidPay({
                                                                    total_price: data.cost.total,
                                                                    currency_code: 'CAD',
                                                                    shipping_address_required: false,
                                                                    billing_address_required: false,
                                                                    shipping_countries: ["CA"],
                                                                    line_items: [{
                                                                        currency_code: 'CAD',
                                                                        description: 'Perch',
                                                                        total_price: data.cost.total,
                                                                        unit_price: data.cost.total,
                                                                        quantity: '1',
                                                                    }],
                                                                })
                                                                    .then((result) => {
                                                                        historyData.paymentIntentId = result.tokenId;
                                                                        if (this.state.now)
                                                                            carpoolRequestHandler.call(this, this.dataToSend, historyData);
                                                                        else
                                                                            scheduledCarpoolRequestHandler.call(this, this.dataToSend, historyData);
                                                                    })
                                                                    .catch(error => {
                                                                        Alert.alert('Payment Error', error.message);
                                                                        stripe.cancelNativePayRequest()
                                                                    })
                                                            }
                                                            else
                                                                Alert.alert('Payment Error', `You cannot use ${Platform.OS == 'ios' ? 'Apple Pay' : 'Google Pay'}, please select another payment method or add a credit/debit card`);
                                                        })
                                                        .catch(error => { Alert.alert('Payment Error', error.message) })
                                                }
                                                else {
                                                    AsyncStorage.getItem('USER_DETAILS').then(result => {
                                                        const userDetails = JSON.parse(result);
                                                        chargeCustomer.call(this, {
                                                            cost: Number(data.cost.total),
                                                            cardId: this.state.card.cardId,
                                                            customerID: userDetails.stripeCustomerID,
                                                        },
                                                            this.dataToSend,
                                                            historyData);
                                                    });
                                                }
                                            }
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
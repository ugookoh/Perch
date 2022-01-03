import React from 'react';
import styles from './styles';
import { Animated, Text, View, Dimensions, TouchableOpacity, ScrollView, StatusBar, Platform, LayoutAnimation, UIManager, AppState } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import * as turf from '@turf/turf';
import database from '@react-native-firebase/database';
import PushNotification from 'react-native-push-notification';
import { Notifications, handleAppStateChange, x, y, dimensionAssert, height, width, indexFinder, polylineLenght, distanceCalculator, CustomLayoutLinear } from '../../Functions/Functions';
const [GREEN, BLUE, PURPLE, GREEN_, BLUE_, PURPLE_, GREY, WHITE, RED] = ['#4DB748', '#1970A7', '#A031AF', 'rgba(77, 183, 72, 0.3)', 'rgba(25, 112, 167, 0.3)', 'rgba(160, 49, 175, 0.3)', '#403D3D', '#FFFFFF', '#FF0000'];



export default class CarpoolResults extends React.Component {
    constructor(props) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            walking: true,
            currentPosition: [],
            currentDistance: 0,
            appState: 'foreground',
        };
        this.descriptionMaker = this.descriptionMaker.bind(this);
        this.sendNotification = this.sendNotification.bind(this);
        this.timeoutFunction = true;
        this.slider = new Animated.Value(0);
        this.remainingDistance = this.props.originalDistance;
        this.messageCount = [];//USE THIS TO AVOID SENDING NOTIFICATION TWICE SINCE FUNCTION IS IN RENDER , WE STORE KEY OF NOTIFICATION WE SEND
    }
    componentDidMount() {
        const data = this.props.data;

        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({ currentPosition: [position.coords.latitude, position.coords.longitude] });
                let fullTripPoly, totalDistance;
                switch (data.steps) {
                    case 1: {
                        fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2];
                        const nextDriverDistances = {
                            d1: polylineLenght([...data.walk1, data.firstLeg[0]]),
                            //d_: polylineLenght([...data.walk1, data.firstLeg[0]]) + 100,//PLUS 100 METERS
                        };
                        this.props.nextDriverDistancesSetter(nextDriverDistances, polylineLenght(fullTripPoly));
                    } break;
                    case 2: {
                        fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3];
                        const nextDriverDistances = {
                            d1: polylineLenght([...data.walk1, data.firstLeg[0]]),
                            d2: polylineLenght([...data.walk1, ...data.firstLeg, ...data.walk2, data.secondLeg[0]]),
                            // d_: polylineLenght([...data.walk1, ...data.firstLeg, ...data.walk2, data.secondLeg[0]]) + 100,//PLUS 100 METERS
                        };
                        this.props.nextDriverDistancesSetter(nextDriverDistances, polylineLenght(fullTripPoly));
                    } break;
                    case 3: {
                        fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3, ...data.thirdLeg, ...data.walk4];
                        const nextDriverDistances = {
                            d1: polylineLenght([...data.walk1, data.firstLeg[0]]),
                            d2: polylineLenght([...data.walk1, ...data.firstLeg, ...data.walk2, data.secondLeg[0]]),
                            d3: polylineLenght([...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3, data.thirdLeg[0]]),
                            // d_: polylineLenght([...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3, data.thirdLeg[0]]) + 100,//PLUS 100 METERS
                        };
                        this.props.nextDriverDistancesSetter(nextDriverDistances, polylineLenght(fullTripPoly));
                    } break;
                };
                totalDistance = polylineLenght(fullTripPoly);
                const currentNearestPoint = turf.nearestPointOnLine(turf.lineString(fullTripPoly), turf.point([position.coords.latitude, position.coords.longitude])).geometry.coordinates;
                const currentIndex = indexFinder(fullTripPoly, currentNearestPoint);
                const travelledPoly = fullTripPoly.slice(0, currentIndex + 1);
                const travelledDistance = polylineLenght(travelledPoly);
                this.remainingDistance = totalDistance - travelledDistance;
                this.props.distanceSetter(this.remainingDistance);
            },
            (error) => {
                console.log(error.code, error.message);
               Geolocation.requestAuthorization("whenInUse");
            }, {
            distanceFilter: 10,
            //enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            enableHighAccuracy: true,
        }).catch((error) => {
            console.log(error.code, error.message);
           Geolocation.requestAuthorization("whenInUse");
        });

        this.watchID = Geolocation.watchPosition(position => {//THIS HAPPENS AS THE USER MOVES OR CHANGES LOCATION
            if (this.timeoutFunction) {
                this.setState({ currentPosition: [position.coords.latitude, position.coords.longitude] });
                this.props.distanceSetter(this.remainingDistance);
                // this.timeoutFunction = false;
            }
        },
            error => (console.log(error.message)),
            {
                distanceFilter: 10,
                enableHighAccuracy: true,
            }
        );

        // this.timeout = setInterval(() => {    //THROTTLER FUNCTION
        //     this.timeoutFunction = true;
        // }, 2000);

        AppState.addEventListener('change', handleAppStateChange.bind(this));
        const walkIn = this.props.etaD1 ? this.props.etaD1 - (data.travelDetails.walkFromL.duration.value / 60).toFixed(0) : 0;
        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking in {<Text style={{ color: GREEN }}>{walkIn} mins</Text>}</Text>;
        this.description2 = `Walk to ${data.travelDetails.stop1A}`;
        this.setState({ appState: this.state.appState });//to rerender description texts
    };
    descriptionMaker() {
        const data = this.props.data;
        if (this.state.currentPosition.length !== 0)
            switch (data.steps) {
                case 1: {
                    const etaD1 = this.props.etaD1;

                    const driverL1 = this.props.driverL1 ? [this.props.driverL1.latitude, this.props.driverL1.longitude] : [0, 0];

                    const minswalk1 = (data.travelDetails.walkFromL.duration.value / 60).toFixed(0);
                    const minswalk2 = (data.travelDetails.walkToD.duration.value / 60).toFixed(0);

                    if (distanceCalculator(data.walkTo.to[0], data.walkTo.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {
                        //////TRIP ENDS HERE NAVIGATE BACK HOME//////
                        //this.props.endTrip();

                        /////SET HISTORY TO COMPLETED///////
                        // database().ref(this.props.dateText)
                        //     .update({ status: 'COMPLETED' })
                        //     .catch(error => { console.log(error.message) });

                    }
                    else if (distanceCalculator(data.walkTo.from[0], data.walkTo.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO FINAL STOP A
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Walk to destination</Text>;
                        this.description2 = `Walk to ${this.props.destination.description}`;
                    }//DONT DELETE

                    //1ST
                    else if (distanceCalculator(driverL1[0], driverL1[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//RIDING WITH DRIVER 1 / DRIVER 1 IS CLOSE
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Ride with {<Text style={{ color: GREEN }}>{this.props.driver1.firstName}</Text>}</Text>;
                        this.description2 = `Get off at ${data.travelDetails.stop1B}`;
                    }
                    else if (distanceCalculator(data.walkFrom.to[0], data.walkFrom.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_1B
                        if (etaD1 > 2) { //YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Wait for {<Text style={{ color: GREEN }}>{this.props.driver1.firstName}</Text>} to arrive </Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 1B NOW
                            const car = this.props.driver1 ?
                                this.props.driver1.carDetails.color + ' ' + this.props.driver1.carDetails.year + ' ' + this.props.driver1.carDetails.make + ' ' + this.props.driver1.carDetails.model :
                                '';
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Get on the {<Text style={{ color: GREEN }}>{car}</Text>}</Text>;

                        }
                        this.description2 = `Get off at ${data.travelDetails.stop1B}`;
                    }
                    else {//if (distanceCalculator(data.walkFrom.from[0], data.walkFrom.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_1A
                        if (etaD1 - minswalk1 > 2) { //YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking in {<Text style={{ color: GREEN }}>{etaD1 - minswalk1} mins</Text>}</Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 1B NOW
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking {<Text style={{ color: GREEN }}>now</Text>}</Text>;
                            this.sendNotification(`Start walking now`, `Perch arriving in ${etaD1 - minswalk1} minutes`, 1);
                        }

                        this.description2 = `Walk to ${data.travelDetails.stop1A}`;
                    }
                } break;
                case 2: {
                    const etaD1 = this.props.etaD1;
                    const etaD2 = this.props.etaD2;


                    const driverL1 = this.props.driverL1 ? [this.props.driverL1.latitude, this.props.driverL1.longitude] : [0, 0];
                    const driverL2 = this.props.driverL2 ? [this.props.driverL2.latitude, this.props.driverL2.longitude] : [0, 0];

                    const minswalk1 = (data.travelDetails.walkFromL.duration.value / 60).toFixed(0);
                    const minswalk2 = (data.travelDetails.walk.duration.value / 60).toFixed(0);
                    const minswalk3 = (data.travelDetails.walkToD.duration.value / 60).toFixed(0);


                    if (distanceCalculator(data.walkTo.to[0], data.walkTo.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {
                        //////TRIP ENDS HERE NAVIGATE BACK HOME//////          WE ARE LEAVING SETTING HISTORY TO THE DRIVER AND THEN WE ARE GOING TO SHOW RATING
                        //this.props.endTrip();

                        /////SET HISTORY TO COMPLETED///////
                        // database().ref(this.props.dateText)
                        //     .update({ status: 'COMPLETED' })
                        //     .catch(error => { console.log(error.message) });

                    }
                    else if (distanceCalculator(data.walkTo.from[0], data.walkTo.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO FINAL STOP A
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Walk to destination</Text>;
                        this.description2 = `Walk to ${this.props.destination.description}`;
                    }//DONT DELETE

                    //2ND
                    else if (distanceCalculator(driverL2[0], driverL2[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//RIDING WITH DRIVER 2
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Ride with {<Text style={{ color: BLUE }}>{this.props.driver2.firstName}</Text>}</Text>;
                        this.description2 = `Get off at ${data.travelDetails.stop2B}`;
                    }
                    else if (distanceCalculator(data.intercept.to[0], data.intercept.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_2B
                        if (etaD2 > 2) {//YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Wait for {<Text style={{ color: BLUE }}>{this.props.driver2.firstName}</Text>} to arrive </Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 2B NOW
                            const car = this.props.driver2 ?
                                this.props.driver2.carDetails.color + ' ' + this.props.driver2.carDetails.year + ' ' + this.props.driver2.carDetails.make + ' ' + this.props.driver2.carDetails.model :
                                '';
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Get on the {<Text style={{ color: BLUE }}>{car}</Text>}</Text>;
                            this.sendNotification(`Your second Perch has arrived`,
                                `Check for the following properties in the car before riding , the plate number (${this.props.driver2 ? this.props.driver2.carDetails.plateNumber : ''}) , the car details (a ${car}) and check if the driver's profile picture matches to ensure your safety`,
                                4);
                        };
                        this.description2 = `Get off at ${data.travelDetails.stop2B}`;
                    }
                    else if (distanceCalculator(data.intercept.from[0], data.intercept.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_2A
                        if (etaD2 - minswalk2 > 2) {//YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking in {<Text style={{ color: BLUE }}>{etaD2 - minswalk2} mins</Text>}</Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 2B NOW
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking {<Text style={{ color: BLUE }}>now</Text>}</Text>;
                            this.sendNotification(`Start walking now`, `Perch arriving in ${etaD2 - minswalk2} minutes`, 3);
                        };
                        this.description2 = `Walk to ${data.travelDetails.stop2A}`;
                    }
                    //1ST
                    else if (distanceCalculator(driverL1[0], driverL1[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//RIDING WITH DRIVER 1 / DRIVER 1 IS CLOSE
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Ride with {<Text style={{ color: GREEN }}>{this.props.driver1.firstName}</Text>}</Text>;
                        this.description2 = `Get off at ${data.travelDetails.stop1B}`;
                    }
                    else if (distanceCalculator(data.walkFrom.to[0], data.walkFrom.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_1B
                        if (etaD1 > 2) { //YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Wait for {<Text style={{ color: GREEN }}>{this.props.driver1.firstName}</Text>} to arrive </Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 1B NOW
                            const car = this.props.driver1 ?
                                this.props.driver1.carDetails.color + ' ' + this.props.driver1.carDetails.year + ' ' + this.props.driver1.carDetails.make + ' ' + this.props.driver1.carDetails.model :
                                '';
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Get on the {<Text style={{ color: GREEN }}>{car}</Text>}</Text>;
                            this.sendNotification(`Your first Perch has arrived`,
                                `Check for the following properties in the car before riding , the plate number (${this.props.driver1 ? this.props.driver1.carDetails.plateNumber : ''}) , the car details (a ${car}) and check if the driver's profile picture matches to ensure your safety`,
                                2);
                        }
                        this.description2 = `Get off at ${data.travelDetails.stop1B}`;
                    }
                    else {//if (distanceCalculator(data.walkFrom.from[0], data.walkFrom.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_1A

                        if (etaD1 - minswalk1 > 2) { //YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking in {<Text style={{ color: GREEN }}>{etaD1 - minswalk1} mins</Text>}</Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 1B NOW
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking {<Text style={{ color: GREEN }}>now</Text>}</Text>;
                            this.sendNotification(`Start walking now`, `Perch arriving in ${etaD1 - minswalk1} minutes`, 1);
                        }

                        this.description2 = `Walk to ${data.travelDetails.stop1A}`;
                    }

                } break;
                case 3: {
                    const etaD1 = this.props.etaD1;
                    const etaD2 = this.props.etaD2;
                    const etaD3 = this.props.etaD3;


                    const driverL1 = this.props.driverL1 ? [this.props.driverL1.latitude, this.props.driverL1.longitude] : [0, 0];
                    const driverL2 = this.props.driverL2 ? [this.props.driverL2.latitude, this.props.driverL2.longitude] : [0, 0];
                    const driverL3 = this.props.driverL3 ? [this.props.driverL3.latitude, this.props.driverL3.longitude] : [0, 0];


                    const minswalk1 = (data.travelDetails.walkFromL.duration.value / 60).toFixed(0);
                    const minswalk2 = (data.travelDetails.walk1.duration.value / 60).toFixed(0);
                    const minswalk3 = (data.travelDetails.walk2.duration.value / 60).toFixed(0);
                    const minswalk4 = (data.travelDetails.walkToD.duration.value / 60).toFixed(0);





                    if (distanceCalculator(data.walkTo.to[0], data.walkTo.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {
                        //////TRIP ENDS HERE NAVIGATE BACK HOME//////
                        //this.props.endTrip();

                    }
                    else if (distanceCalculator(data.walkTo.from[0], data.walkTo.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO FINAL STOP A
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Walk to destination</Text>;
                        this.description2 = `Walk to ${this.props.destination.description}`;
                    }//DONT DELETE


                    //3RD
                    else if (distanceCalculator(driverL3[0], driverL3[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//RIDING WITH DRIVER 3
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Ride with {<Text style={{ color: PURPLE }}>{this.props.driver3.firstName}</Text>}</Text>;
                        this.description2 = `Get off at ${data.travelDetails.stop3B}`;
                    }
                    else if (distanceCalculator(data.intercept2.to[0], data.intercept2.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_3B
                        if (etaD3 > 2) {//YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Wait for {<Text style={{ color: PURPLE }}>{this.props.driver3.firstName}</Text>} to arrive </Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 1B NOW
                            const car = this.props.driver3 ?
                                this.props.driver3.carDetails.color + ' ' + this.props.driver3.carDetails.year + ' ' + this.props.driver3.carDetails.make + ' ' + this.props.driver3.carDetails.model :
                                '';
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Get on the {<Text style={{ color: PURPLE }}>{car}</Text>}</Text>;
                            // this.sendNotification(`Your third Perch has arrived`,
                            //     `Check for the following properties in the car before riding , the plate number (${this.props.driver3 ? this.props.driver3.carDetails.plateNumber : ''}) , the car details (a ${car}) and check if the driver's profile picture matches to ensure your safety`,
                            //     6);
                        };
                        this.description2 = `Get off at ${data.travelDetails.stop3B}`;
                    }
                    else if (distanceCalculator(data.intercept2.from[0], data.intercept2.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_3A
                        if (etaD3 - minswalk3 > 2) {//YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking in {<Text style={{ color: PURPLE }}>{etaD3 - minswalk3} mins</Text>}</Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 3B NOW
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking {<Text style={{ color: PURPLE }}>now</Text>}</Text>;
                            this.sendNotification(`Start walking now`, `Perch arriving in ${etaD3 - minswalk3} minutes`, 5);
                        };
                        this.description2 = `Walk to ${data.travelDetails.stop3A}`;
                    }
                    //2ND
                    else if (distanceCalculator(driverL2[0], driverL2[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//RIDING WITH DRIVER 2
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Ride with {<Text style={{ color: BLUE }}>{this.props.driver2.firstName}</Text>}</Text>;
                        this.description2 = `Get off at ${data.travelDetails.stop2B}`;
                    }
                    else if (distanceCalculator(data.intercept1.to[0], data.intercept1.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_2B
                        if (etaD2 > 2) {//YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Wait for {<Text style={{ color: BLUE }}>{this.props.driver2.firstName}</Text>} to arrive </Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 2B NOW
                            const car = this.props.driver2 ?
                                this.props.driver2.carDetails.color + ' ' + this.props.driver2.carDetails.year + ' ' + this.props.driver2.carDetails.make + ' ' + this.props.driver2.carDetails.model :
                                '';
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Get on the {<Text style={{ color: BLUE }}>{car}</Text>}</Text>;
                            // this.sendNotification(`Your second Perch has arrived`,
                            //     `Check for the following properties in the car before riding , the plate number (${this.props.driver2 ? this.props.driver2.carDetails.plateNumber : ''}) , the car details (a ${car}) and check if the driver's profile picture matches to ensure your safety`,
                            //     4);
                        };
                        this.description2 = `Get off at ${data.travelDetails.stop2B}`;
                    }
                    else if (distanceCalculator(data.intercept1.from[0], data.intercept1.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_2A
                        if (etaD2 - minswalk2 > 2) {//YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking in {<Text style={{ color: BLUE }}>{etaD2 - minswalk2} mins</Text>}</Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 2B NOW
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking {<Text style={{ color: BLUE }}>now</Text>}</Text>;
                            this.sendNotification(`Start walking now`, `Perch arriving in ${etaD2 - minswalk2} minutes`, 3);
                        };
                        this.description2 = `Walk to ${data.travelDetails.stop2A}`;
                    }
                    //1ST
                    else if (distanceCalculator(driverL1[0], driverL1[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//RIDING WITH DRIVER 1 / DRIVER 1 IS CLOSE
                        this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Ride with {<Text style={{ color: GREEN }}>{this.props.driver1.firstName}</Text>}</Text>;
                        this.description2 = `Get off at ${data.travelDetails.stop1B}`;
                    }
                    else if (distanceCalculator(data.walkFrom.to[0], data.walkFrom.to[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_1B
                        if (etaD1 > 2) { //YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Wait for {<Text style={{ color: GREEN }}>{this.props.driver1.firstName}</Text>} to arrive </Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 1B NOW
                            const car = this.props.driver1 ?
                                this.props.driver1.carDetails.color + ' ' + this.props.driver1.carDetails.year + ' ' + this.props.driver1.carDetails.make + ' ' + this.props.driver1.carDetails.model :
                                '';
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Get on the {<Text style={{ color: GREEN }}>{car}</Text>}</Text>;
                            // this.sendNotification(`Your first Perch has arrived`,
                            //     `Check for the following properties in the car before riding , the plate number (${this.props.driver1 ? this.props.driver1.carDetails.plateNumber : ''}) , the car details (a ${car}) and check if the driver's profile picture matches to ensure your safety`,
                            //     2);
                        }
                        this.description2 = `Get off at ${data.travelDetails.stop1B}`;
                    }
                    else {//if (distanceCalculator(data.walkFrom.from[0], data.walkFrom.from[1], this.state.currentPosition[0], this.state.currentPosition[1]) < 50) {//CLOSEST TO STOP_1A

                        if (etaD1 - minswalk1 > 2) { //YOU CAN STILL WAIT FOR DRIVER TO COME CLOSE
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking in {<Text style={{ color: GREEN }}>{etaD1 - minswalk1} mins</Text>}</Text>;
                        }
                        else {//YOU HAVE TO START GOING TO STOP 1B NOW
                            this.description1 = <Text style={[styles.topText, { marginTop: y(10) }]}>Start walking {<Text style={{ color: GREEN }}>now</Text>}</Text>;
                            this.sendNotification(`Start walking now`, `Perch arriving in ${etaD1 - minswalk1} minutes`, 1);
                        }

                        this.description2 = `Walk to ${data.travelDetails.stop1A}`;
                    }

                } break;
            };
    };
    sendNotification(title, message, number) {
        if (this.messageCount.includes(number) == false) {
            this.messageCount.push(number)
            PushNotification.localNotification({
                //... You can use all the options from localNotifications
                title: title,
                message: message,
            });
        }
    }
    componentWillUnmount() {
        AppState.removeEventListener('change', handleAppStateChange.bind(this));
        Geolocation.clearWatch(this.watchID);
    };

    render() {
        LayoutAnimation.configureNext(CustomLayoutLinear);
        const data = this.props.data;
        let flex = <></>, totalDistance, fullTripPoly;
        const totalWidth = x(290);
        switch (data.steps) {
            case 1: {
                fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2];
                totalDistance = polylineLenght(fullTripPoly);
                const walk1Flex = polylineLenght(data.walk1) / totalDistance;
                const firstLegFlex = polylineLenght(data.firstLeg) / totalDistance;
                const walk2Flex = 1 - walk1Flex - firstLegFlex;

                flex = (
                    <>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, width: (walk1Flex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREEN, width: (firstLegFlex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, borderTopRightRadius: 10, borderBottomRightRadius: 10, width: (walk2Flex * totalWidth) }]}></View>
                    </>
                );

                const currentNearestPoint = this.state.currentPosition.length !== 0 ? turf.nearestPointOnLine(turf.lineString(fullTripPoly), turf.point(this.state.currentPosition)).geometry.coordinates : 0;
                const currentIndex = this.state.currentPosition.length !== 0 ? indexFinder(fullTripPoly, currentNearestPoint) : 0;
                const travelledPoly = fullTripPoly.slice(0, currentIndex + 1);
                const travelledDistance = polylineLenght(travelledPoly);
                this.slider.setValue(travelledDistance);
                this.remainingDistance = totalDistance - travelledDistance;
                this.descriptionMaker();


            } break;
            case 2: {
                fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3];
                totalDistance = polylineLenght(fullTripPoly);
                const walk1Flex = polylineLenght(data.walk1) / totalDistance;
                const firstLegFlex = polylineLenght(data.firstLeg) / totalDistance;
                const walk2Flex = polylineLenght(data.walk2) / totalDistance;
                const secondLegFlex = polylineLenght(data.secondLeg) / totalDistance;
                const walk3Flex = 1 - walk1Flex - firstLegFlex - walk2Flex - secondLegFlex;
                this.remainingDistance = totalDistance - travelledDistance;

                flex = (
                    <>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, width: (walk1Flex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREEN, width: (firstLegFlex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, width: (walk2Flex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: BLUE, width: (secondLegFlex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, width: (walk3Flex * totalWidth), borderTopRightRadius: 10, borderBottomRightRadius: 10, }]}></View>
                    </>
                );

                const currentNearestPoint = this.state.currentPosition.length !== 0 ? turf.nearestPointOnLine(turf.lineString(fullTripPoly), turf.point(this.state.currentPosition)).geometry.coordinates : 0;
                const currentIndex = this.state.currentPosition.length !== 0 ? indexFinder(fullTripPoly, currentNearestPoint) : 0;
                const travelledPoly = fullTripPoly.slice(0, currentIndex + 1);
                const travelledDistance = polylineLenght(travelledPoly);
                this.slider.setValue(travelledDistance);
                this.remainingDistance = totalDistance - travelledDistance;
                this.descriptionMaker();

            } break;
            case 3: {
                fullTripPoly = [...data.walk1, ...data.firstLeg, ...data.walk2, ...data.secondLeg, ...data.walk3, ...data.thirdLeg, ...data.walk4];
                totalDistance = polylineLenght(fullTripPoly);
                const walk1Flex = polylineLenght(data.walk1) / totalDistance;
                const firstLegFlex = polylineLenght(data.firstLeg) / totalDistance;
                const walk2Flex = polylineLenght(data.walk2) / totalDistance;
                const secondLegFlex = polylineLenght(data.secondLeg) / totalDistance;
                const walk3Flex = polylineLenght(data.walk3) / totalDistance;
                const thirdLegFlex = polylineLenght(data.thirdLeg) / totalDistance;
                const walk4Flex = 1 - walk1Flex - firstLegFlex - walk2Flex - secondLegFlex - walk3Flex - thirdLegFlex;

                flex = (
                    <>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, width: (walk1Flex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREEN, width: (firstLegFlex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, width: (walk2Flex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: BLUE, width: (secondLegFlex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, width: (walk3Flex * totalWidth), }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: PURPLE, width: (thirdLegFlex * totalWidth) }]}></View>
                        <View style={[styles.internalFlex, { backgroundColor: GREY, width: (walk4Flex * totalWidth), borderTopRightRadius: 10, borderBottomRightRadius: 10, }]}></View>
                    </>
                );

                const currentNearestPoint = this.state.currentPosition.length !== 0 ? turf.nearestPointOnLine(turf.lineString(fullTripPoly), turf.point(this.state.currentPosition)).geometry.coordinates : 0;
                const currentIndex = this.state.currentPosition.length !== 0 ? indexFinder(fullTripPoly, currentNearestPoint) : 0;
                const travelledPoly = fullTripPoly.slice(0, currentIndex + 1);
                const travelledDistance = polylineLenght(travelledPoly);
                this.slider.setValue(travelledDistance);
                this.remainingDistance = totalDistance - travelledDistance;
                this.descriptionMaker();
            } break;
        };

        const left = this.slider.interpolate({
            inputRange: [0, totalDistance],
            outputRange: ['0%', '100%'],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.container}>
                <Notifications />
                {this.description1}
                <View style={styles.barContainer}>
                    <Animated.View style={[styles.cursor, { left: left }]}></Animated.View>
                    <View style={[styles.cursorPath]}>
                        {flex}
                    </View>
                </View>
                <Text style={[styles.topText, { marginBottom: y(10) }]}>{this.description2}</Text>
            </View>
        )
    }
};
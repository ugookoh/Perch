import database from '@react-native-firebase/database';
import * as turf from '@turf/turf';
import React from 'react';
import {
    Animated, PanResponder,
    Platform, StatusBar, Switch,
    Text, TouchableOpacity, View
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import PushNotification from 'react-native-push-notification';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import StarRating from 'react-native-star-rating';
import Icon__ from 'react-native-vector-icons/Entypo';
import Icon_ from 'react-native-vector-icons/Feather';
import SpecialIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon_Dash from 'react-native-vector-icons/Octicons';
import { AnimatedPolylineSingleLine } from '../../Components/AnimatedPolyline/AnimatedPolyline';
import { DriverProfile } from '../../Components/BreakdownCardsWithCombiners/BreakdownCardsWithCombiners';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import {
    colors,
    callNumber, dimensionAssert,
    etaRideshare, height,
    Notifications, OfflineNotice,
    rideshareRatingHandler, width, x, y
} from '../../Functions/Functions';
import CarInCity from '../../Images/svgImages/carInCity';
import GreenIcon from '../../Images/svgImages/greenIcon';
import Money from '../../Images/svgImages/moneyChoice';
import PerchWallet from '../../Images/svgImages/perchWallet';
import Visa from '../../Images/svgImages/visa';
import styles from './styles';

const Y_START = -x(12);
const X_CONSTANT = 0;
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class RideshareConfirmed extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            polyline: this.props.route.params.polyline,
            location: this.props.route.params.location,
            destination: this.props.route.params.destination,
            driverLocation: null,
            driverDetails: null,
            eta: null,
            driverID: this.props.route.params.driverID,
            sendUserLocation: true,
            userID: this.props.route.params.userID,
            loading: true,
            tripDurationInSeconds: this.props.route.params.tripDurationInSeconds,
            tripDuration: null,
            userShareCode: this.props.route.params.userShareCode,
            mapReadyState: false,
            getEta: true,
            userRating: 0,
            homeLoading: false,
        };
        this.direction = 'MOVABLE';
        this.TAB_HEIGHT = 0
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });
        this.position.y.addListener(({ value }) => {
            if ((value > Y_START || value < this.TAB_HEIGHT) && this.direction == 'MOVABLE') {
                this.direction = 'UNMOVABLE';
                this.position.stopAnimation(() => {
                    if (value > Y_START) {
                        Animated.spring(this.position,
                            {
                                toValue: { x: X_CONSTANT, y: Y_START },
                                useNativeDriver: false,
                            }).start(() => { this.direction = 'MOVABLE' });
                    }
                    else if (value < this.TAB_HEIGHT) {
                        // Animated.spring(this.position,
                        //     {
                        //         toValue: { x: X_CONSTANT, y: this.TAB_HEIGHT + 1 },
                        //         useNativeDriver:false,
                        //     }).start(() => { this.direction = 'MOVABLE' });
                        this.position.setValue({ x: X_CONSTANT, y: this.TAB_HEIGHT + 1 })
                        this.direction = 'MOVABLE';
                    }
                });
            }
        });
        this.ratingTop = new Animated.Value(height);
        this.value;
        this.messageCount = [];//USE THIS TO AVOID SENDING NOTIFICATION TWICE SINCE FUNCTION IS IN RENDER , WE STORE KEY OF NOTIFICATION WE SEND
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 12 || Math.abs(gestureState.dy) >= 12;
            },
            onPanResponderGrant: (evt, gestureState) => {
                this.position.setOffset({ x: X_CONSTANT, y: this.position.y._value });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });


                this.value = Number(JSON.stringify(this.position.y));
            },
            onPanResponderMove: (evt, gestureState) => {

                const Y_POSITION = (this.value + gestureState.dy);

                if (Y_POSITION <= Y_START && Y_POSITION >= this.TAB_HEIGHT)
                    this.position.setValue({ x: X_CONSTANT, y: (gestureState.dy) });

            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();

                const Y_POSITION = Number(JSON.stringify(this.position.y));
                if (Y_POSITION < Y_START && this.direction == 'MOVABLE') {
                    Animated.decay(this.position, {
                        velocity: { x: 0, y: gestureState.vy }, // velocity from gesture release
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    };

    componentDidMount() {
        Geolocation.getCurrentPosition(
            (position) => {
                database().ref(`userLocation/${this.state.userID}`).set({
                    location: { latitude: position.coords.latitude, longitude: position.coords.longitude },
                    shareLocation: 'true',
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
                database().ref(`userLocation/${this.state.userID}`).set({
                    location: { latitude: position.coords.latitude, longitude: position.coords.longitude },
                    shareLocation: 'true',
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

        database().ref(`/driverRideshareRequests/${this.state.driverID}`).once('value', snapshot => {//GET ALL DRIVER INFO
            if (snapshot.val())
                this.setState({
                    driverDetails: {
                        ...snapshot.val(),
                        name: snapshot.val().firstName + ' ' + snapshot.val().lastName,
                        loading: false,
                    }
                });

            const DL = [snapshot.val().currentLocation.latitude, snapshot.val().currentLocation.longitude];
            if (this.state.mapReadyState && this.map) {
                const line = turf.lineString([DL, [this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]);
                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                this.map.fitToCoordinates(bboxPolygon, {
                    edgePadding:
                    {
                        top: x(40),
                        right: x(10),
                        bottom: x(40),
                        left: x(10),
                    },
                });
            }
        });

        database().ref(`/driverRideshareRequests/${this.state.driverID}/currentLocation`).on('value', snapshot => {//LISTEN TO CURRENT LOCATION CHANGE
            if (snapshot.val()) {
                this.setState({ driverLocation: snapshot.val() }, () => { this.driverLocationObtained = true; });
                if (this.state.getEta)
                    etaRideshare.call(this, snapshot.val());
                else if (this.state.eta)
                    this.setState({ eta: null });
            };
        });

        database().ref(`driverRideshareRequests/${this.state.driverID}/rides/${this.state.userID}/status`).on('value', snapshot => {
            if (snapshot.val() === "STARTED") { //THE RIDE HAS STARTED , STOP LISTENING FOR ETA
                this.setState({ eta: null, getEta: false });

            }
            else if (snapshot.val() === "FINISHED") { //THE RIDE HAS ENDED , BRING OUT THE REVIEW
                Animated.spring(this.ratingTop, {
                    toValue: 0,
                    bounciness: 0,
                    useNativeDriver: false,
                }).start();

                database().ref(`userLocation/${this.state.userID}`).remove()
                    .catch(error => { console.log(error.message) })
            }
        });


        //CHATS
        this.keys = [];
        this.firstMessagesGotten = false;
        database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).once('value', snap => {
            this.keys = Object.keys(snap.val() || {});
            this.lastIdInSnapshot = this.keys[this.keys.length - 1];
            if (snap.val()) {
                let arrayToAppend = [], i = 0;
                snap.forEach(val => {
                    arrayToAppend[i] = val.val();
                    i++;
                });

                this.firstMessagesGotten = true;
            }
            else {
                this.firstMessagesGotten = true;

            }
        });
        database().ref(`chats/${this.state.userID}-${this.state.driverID}/`).on('child_added', snapshot => {

            if (this.firstMessagesGotten && this.keys.includes(snapshot.key) == false) {

                if (snapshot.val().sender == 'O')
                    this.sendNotification(this.state.driverDetails ? this.state.driverDetails.name : 'Driver', snapshot.val().m) //ENABLE DEEP LINKING

            };


        });

    };
    sendNotification(title, message, number) {
        if (this.messageCount.includes(number) == false) {
            this.messageCount.push(number)
            PushNotification.localNotification({
                //... You can use all the options from localNotifications ...//
                title: title,
                message: message,
            });
        }
    }
    componentWillUnmount() {
        clearInterval(this.watchID);
    }
    render() {
        const scale_ = this.position.y.interpolate({
            inputRange: [Y_START, y(691)],
            outputRange: [1, 2.7],
            extrapolate: 'clamp',
            //,{width:x(25.2),}
        });
        const CreditCard = (
            <View style={[styles.selection,]}>
                <View style={[styles.visa, { top: -x(5) }]}><Visa height={'100%'} width={'100%'} /></View>
                <View style={[styles.paymentInfoNumbers, { width: x(277) }]}>
                    <Text style={styles.cardNumber}> **** 3456</Text>
                    <Text style={[styles.cardNumber, {}]}>$5.00</Text>
                </View>
            </View>
        );
        const MoneyChoice = (
            <View style={styles.selection}>
                <View style={styles.visa, { width: x(25.2), }}><Money height={'100%'} width={'100%'} /></View>
                <View style={styles.paymentInfoNumbers}>
                    <Text style={styles.cardNumber}> Cash</Text>
                    <Text style={[styles.cardNumber, {}]}>$5.00</Text>
                </View>
            </View>
        );
        const PerchWalletChoice = (
            <View style={styles.selection}>
                <View style={styles.visa, { width: x(25.2), }}><PerchWallet height={'100%'} width={'100%'} /></View>
                <View style={styles.paymentInfoNumbers}>
                    <Text style={styles.cardNumber}> Perch Wallet</Text>
                    <Text style={[styles.cardNumber, {}]}>$20.19</Text>
                </View>
            </View>
        );
        const carDescription = this.state.driverDetails ? `${this.state.driverDetails.carDetails.color} ${this.state.driverDetails.carDetails.year} ${this.state.driverDetails.carDetails.make} ${this.state.driverDetails.carDetails.model}` : ''


        if (this.state.eta != null && this.state.eta <= 1 && this.state.driverDetails) {
            this.sendNotification(`Your Perch has arrived`,
                `Check for the following properties in the car before riding , the plate number (${this.state.driverDetails ? this.state.driverDetails.carDetails.plateNumber : ''}) , the car details (a ${carDescription}) and check if the driver's profile picture matches to ensure your safety`,
                0);
        }

        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <StatusBar backgroundColor={'#000000'} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
                <TouchableOpacity style={[styles.zoomIcon, { right: x(10), top: y(dimensionAssert() ? 300 : 330) }]}
                    onPress={() => {

                        if (this.state.mapReadyState) {
                            if (this.driverLocationObtained && this.map) {
                                const DL = [this.state.driverLocation.latitude, this.state.driverLocation.longitude];
                                const line = turf.lineString([DL, [this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]);
                                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                                this.map.fitToCoordinates(bboxPolygon, {
                                    edgePadding:
                                    {
                                        top: x(40),
                                        right: x(10),
                                        bottom: x(40),
                                        left: x(10),
                                    },
                                });
                            } else if (this.map) {
                                const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]);
                                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                                this.map.fitToCoordinates(bboxPolygon, {
                                    edgePadding:
                                    {
                                        top: x(40),
                                        right: x(10),
                                        bottom: x(40),
                                        left: x(10),
                                    },
                                });
                            }
                        }

                    }}
                >
                    <MaterialIcons name={'my-location'} size={y(21)} color={colors.GREEN} />
                </TouchableOpacity>
                {/* <TouchableOpacity style={[styles.menu,]}
                    onPress={() => { this.props.navigation.goBack(); }}
                >
                    <View>
                        <Icon name={'ios-arrow-back'} color={colors.WHITE} size={x(28)} />
                    </View>
                </TouchableOpacity> */}
                <Animated.View style={{ transform: [{ scale: scale_ }] }}>
                    <MapView
                        ref={map => { this.map = map }}
                        initialRegion={{
                            latitude: this.state.location.latitude,
                            longitude: this.state.location.longitude,
                            longitudeDelta: LONGITUDE_DELTA,
                            latitudeDelta: LATITUDE_DELTA,
                        }}
                        provider={PROVIDER_GOOGLE}
                        style={[styles.maps,]}
                        customMapStyle={MapStyle}
                        showsCompass={false}
                        showsMyLocationButton={false}
                        showsUserLocation={true}
                        onMapReady={() => {

                            this.setState({ mapReadyState: true }, () => {
                                if (this.driverLocationObtained && this.map) {
                                    const DL = [this.state.driverLocation.latitude, this.state.driverLocation.longitude];
                                    const line = turf.lineString([DL, [this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]);
                                    let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(10),
                                            bottom: x(40),
                                            left: x(10),
                                        },
                                    });
                                }
                                else if (this.map) {
                                    const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]);
                                    let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(40),
                                            right: x(10),
                                            bottom: x(40),
                                            left: x(10),
                                        },
                                    });
                                }

                            });
                        }}
                    >
                        <Marker coordinate={{ latitude: this.state.location.latitude, longitude: this.state.location.longitude }}>
                            <SpecialIcon name={'dot-circle-o'} size={y(20)} color={colors.GREENMAKER} />
                        </Marker>
                        {this.state.mapReadyState ?
                            <AnimatedPolylineSingleLine
                                coordinates={([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]).map((v => { return { latitude: v[0], longitude: v[1] } }))}
                                strokeColorMove={colors.GREEN}
                                strokeColor={colors.GREENMAKER}
                                strokeWidth={4}
                            //interval={10}
                            /> : <></>}
                        <Marker coordinate={{ latitude: this.state.destination.latitude, longitude: this.state.destination.longitude }}>
                            <SpecialIcon name={'stop-circle-o'} size={y(20)} color={colors.GREENMAKER} />
                        </Marker>
                        {this.state.driverLocation ?
                            <Marker.Animated
                                coordinate={this.state.driverLocation}
                                identifier={'mk1'}
                                style={{ zIndex: 2, elevation: 2 }}
                            >
                                <View style={styles.icon}><GreenIcon /></View>
                            </Marker.Animated>
                            : <></>}
                    </MapView>
                </Animated.View>
                <Animated.View style={[styles.lowerSection, this.position.getLayout()]} {...this.panResponder.panHandlers}
                    onLayout={(event) => {
                        this.TAB_HEIGHT = -event.nativeEvent.layout.height + (height / 1.9);
                    }}>
                    <View style={styles.tab}></View>
                    <View style={styles.driverCentralize}>

                        <DriverProfile
                            color={colors.GREEN}
                            driver={this.state.driverDetails ? this.state.driverDetails : null}
                            eta={this.state.eta}
                            style={'rideshare'}
                        />
                    </View>

                    <View style={styles.carDescription}>
                        <View>
                            <ShimmerPlaceHolder autoRun={true} visible={this.state.loading} style={{ width: x(150), height: y(17) }}>
                                <Text style={[styles.car, {}]}>{carDescription}</Text>
                            </ShimmerPlaceHolder>

                            <ShimmerPlaceHolder autoRun={true} visible={this.state.loading} style={{ width: x(80), height: y(17), marginTop: y(5) }}>
                                <Text style={[styles.car, { fontFamily: 'Gilroy-SemiBold', marginTop: y(5), color: colors.GREEN }]}>{this.state.driverDetails ? this.state.driverDetails.carDetails.plateNumber : ''}</Text>
                            </ShimmerPlaceHolder>
                        </View>
                        <View style={styles.bubble}>
                            {this.state.eta ?
                                <>
                                    <Text style={[styles.time, { fontSize: y(25, true) }]}>{this.state.eta}</Text>
                                    <Text style={[styles.time, { fontSize: y(17, true) }]}>mins</Text>
                                </> :
                                <Icon_Dash color={colors.WHITE} size={y(50)} name={'dash'} />}
                        </View>

                    </View>

                    <View style={[{ marginVertical: y(18), opacity: 0.25 }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Share live location to drivers</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "rgba(77, 183, 72, 0.8)" }}
                            thumbColor={this.state.sendUserLocation ? "#FFFFFF" : "#f4f3f4"}
                            onValueChange={(value) => {
                                this.setState({ sendUserLocation: value })
                                if (value == false)
                                    database().ref(`userLocation/${this.state.userID}`).set({
                                        shareLocation: 'false'
                                    }).catch(e => { console.log(e.message) })
                            }}
                            value={this.state.sendUserLocation}
                        />
                    </View>

                    <View style={[{ marginVertical: y(18), opacity: 0.25 }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <View style={styles.contact}>
                        <TouchableOpacity onPress={() => {
                            if (this.state.driverDetails)
                                callNumber(this.state.driverDetails.phoneNumber);
                        }}>
                            <View style={styles.block}>
                                <Icon_ name={'phone'} color={colors.WHITE} size={y(20)} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('Chat', {
                                userID: this.state.userID,
                                driverID: this.state.driverID,
                                driverDetails: this.state.driverDetails,
                                type: 'driverRideshareRequests',
                            })
                        }}>
                            <View style={styles.block}>
                                <Icon_ name={'mail'} color={colors.WHITE} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[{ marginVertical: y(18), opacity: 0.25 }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <View style={{ width: x(313), marginBottom: y(3) }}>
                        <Text style={{ fontSize: y(17, true), fontFamily: 'Gilroy-SemiBold', marginVertical: y(3) }}>Destination</Text>
                    </View>
                    <View style={styles.address}>
                        <Icon_ name={'map-pin'} size={y(25)} style={{ opacity: 0.5, }} />
                        <View style={{ marginLeft: x(5), }}>
                            <Text style={[styles.addressText, { fontSize: y(15, true), width: x(283), }]}>{this.state.destination.description}</Text>
                            <Text style={[styles.addressText, { fontSize: y(13, true), marginTop: y(3) }]}>Arrive at <Text style={[styles.addressText, { fontWeight: '500', color: colors.GREEN }]}>{this.state.tripDuration ? this.state.tripDuration : ''}</Text></Text>
                        </View>
                    </View>

                    <View style={[{ marginVertical: y(18), opacity: 0.25 }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <View style={{ width: x(313), marginBottom: y(3) }}>
                        <Text style={{ fontSize: y(17, true), fontFamily: 'Gilroy-SemiBold', }}>Payment</Text>
                    </View>
                    <View style={styles.payments}>

                        {CreditCard}

                        {MoneyChoice}

                        {PerchWalletChoice}

                    </View>
                    <View style={{ width: x(313), marginTop: y(14) }}>
                        <TouchableOpacity>
                            <Text style={styles.cancel}>CANCEL TRIP</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[{ marginVertical: y(18), opacity: 0.25 }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <Text style={[styles.adText]}>{'Get discounts towards your next trip by sharing your special code with your friends ! '}</Text>
                    <View style={[styles.share, { marginTop: y(10), marginBottom: y(45) }]}>
                        <View style={styles.shareCode}>
                            <Text style={styles.shareCodeText}//RANDOMLY GENERATED VALUE,WHAT IS ACTUALLY SENT IS A SIGNUP LINK WITH USERID APPENDED
                            >{this.state.userShareCode}</Text>
                        </View>
                        <TouchableOpacity>
                            <View style={styles.send}>
                                <Icon__ name={'paper-plane'} color={colors.WHITE} size={y(30)} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Notifications />

                <Animated.View style={[styles.ratingContainer, { top: this.ratingTop }]} /*THIS IS THE RATINGS PANEL */>
                    <View style={styles.ratingCancel}>
                        <TouchableOpacity style={{ height: y(40), width: y(40) }} onPress={() => { this.props.navigation.navigate('Main') }}>
                            <Icon_ name={'x'} size={y(30)} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ratingPhoto}></View>
                    <Text style={styles.ratingName}>{this.state.driverDetails ? `${this.state.driverDetails.firstName} ${this.state.driverDetails.lastName}` : ` `}</Text>
                    <Text style={styles.ratingQuestion}>{this.state.driverDetails ? `Thank you for riding with Perch ! Please rate how your trip with ${this.state.driverDetails.firstName} went today` : `How was your trip today `}</Text>
                    <View style={styles.star}>
                        <StarRating
                            disabled={false}
                            maxStars={5}
                            rating={this.state.userRating}
                            fullStarColor={'#FFAA00'}
                            emptyStarColor={'#FFAA00'}
                            starSize={y(50)}
                            selectedStar={(rating) => { this.setState({ userRating: rating }) }}
                        />
                    </View>
                    <View style={styles.button}><Button text={'Go home'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.homeLoading}
                        onPress={() => {
                            if (this.state.userRating != 0)
                                rideshareRatingHandler(this.state.userRating, this.state.userID, this.state.driverID, this.props.route.params.historyRef);
                            this.setState({ homeLoading: true }, () => {
                                this.props.navigation.navigate('Main');
                            })

                        }} /></View>

                    <View style={styles.carInCity}>
                        <CarInCity />
                    </View>
                </Animated.View>
            </View>
        );
    }
};
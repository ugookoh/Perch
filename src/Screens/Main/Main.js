import AsyncStorage from '@react-native-community/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import database from '@react-native-firebase/database';
import axios from 'axios';
import React from 'react';
import {
    Animated,
    BackHandler, Button, Easing,
    Keyboard,
    LayoutAnimation, PanResponder,
    Platform, StatusBar, Text,
    TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager, View,
    LogBox
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/Feather';
import Icon_ from 'react-native-vector-icons/FontAwesome';
import Divider from '../../Components/Divider/Divider';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import {
    colors, CustomLayoutLinear, debouncer,
    dimensionAssert,
    getFirebaseMessagingToken, getLocation,
    height, isUserLoggedIn,
    makeid, OfflineNotice, permissionLocation,
    reverseGeocoding, searchHistoryList,
    width, x, y
} from '../../Functions/Functions';
import Menu from '../../Images/svgImages/menu';
import Pin from '../../Images/svgImages/pin';
import Drawer from '../../Navigation/DrawerComponent/DrawerComponent';
import styles from './styles';
const polyline = require('@mapbox/polyline');// for decoding polylines

const X_OUT = 0;
const X_IN = -x(325);
const Y_CONSTANT = 0;
const X_CONSTANT = 0;
const Y_TOP = y(229);
const Y_BOTTOM = y(706);
const Y_START = height;

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


export default class Main extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            currentLocation: '',
            location: '',
            destination: '',
            history: null,
            locationFocused: false,
            destinationFocused: false,
            suggestion: 'invisible',
            searchPosition: 'hidden',
            searchBar: 'hide',
            currentLocationLatitude: '',
            currentLocationLongitude: '',
            latitude: '',
            longitude: '',
            latitude1: '',
            longitude1: '',
            carpool: true,
            rideshare: false,
            predictions: [],
            predictionsLoaded: null,
            region: {
                latitude: 0,
                longitude: 0,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            regionMovedData: '',
            mapLoaded: false,
            mapMoved: false,
            loading: false,
            workAddress: null,
            homeAddress: null,

            rerender: '',
            status: 'LOADING...',
            data: null,//for trips that are being continued
            userID: null,
            schedule: true,

            getTime: false,
            now: true,

            date: new Date().getTime(),
            tomorrow: true,
            scheduledStatus: null,
            userDetails: null,

        };


        this.forwardDirection = true;
        this.handleOnNavigateBack = this.handleOnNavigateBack.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.animateMenu = this.animateMenu.bind(this);
        this.animatedValue = new Animated.Value(height);
        this.animatedValueTop_ = new Animated.Value(height);
        this.down_zindex = new Animated.Value(1);
        this.animateFullScreen = this.animateFullScreen.bind(this);

        this.animatedValueTop_.addListener(({ value }) => {
            //console.log(value)
            if (value <= (y(-7.5)) && this.forwardDirection === true) {
                this.setState({ suggestion: 'springUp', searchBar: 'show' });
                this.forwardDirection = false;
                if (this.state.destination == '') {
                    this.destinationInput.focus();
                }

            }

        });


        this.position = new Animated.ValueXY({ x: X_IN, y: Y_CONSTANT });
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 4 || Math.abs(gestureState.dy) >= 4;
            },
            onPanResponderGrant: (evt, gestureState) => {
                this.position.setOffset({ x: this.position.x._value, y: Y_CONSTANT });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dx < 1)
                    this.position.setValue({ x: gestureState.dx, y: Y_CONSTANT });
            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();

                if (Math.sign(gestureState.dx) == 1) {//going out
                    Animated.spring(this.position, {
                        toValue: { x: X_OUT, y: Y_CONSTANT },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        useNativeDriver: false,
                    }).start();
                }
                else if (Math.sign(gestureState.dx) == -1) {//going in
                    Animated.spring(this.position, {
                        toValue: { x: X_IN, y: Y_CONSTANT },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        useNativeDriver: false,
                    }).start();
                }
            },
        });


    };
    componentDidMount() {
        getFirebaseMessagingToken();
        if (this.props.route.params) {
            if (this.props.route.params.userDetails) {
                const userDetails = this.props.route.params.userDetails;
                this.setState({
                    workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                    homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                });
                database().ref(`users/${userDetails.userID}/`).on('value', snapshot => { //ALL DATABASE CALLS ARE TO ALWAYS DOWNLOAD USER IN CASE WEB EDITS IT
                    AsyncStorage.setItem('USER_DETAILS', JSON.stringify(snapshot.val()))
                        .then(() => { this.setState({ userDetails: snapshot.val() }) })
                        .catch((e) => { console.log(e.message) })
                });
            }
        }
        else
            AsyncStorage.getItem('USER_DETAILS')
                .then(result => {
                    if (result) {
                        const userDetails = JSON.parse(result);
                        this.setState({
                            workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                            homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                        });

                        database().ref(`users/${userDetails.userID}/`).on('value', snapshot => {
                            AsyncStorage.setItem('USER_DETAILS', JSON.stringify(snapshot.val()))
                                .then(() => { this.setState({ userDetails: snapshot.val() }) })
                                .catch((e) => { console.log(e.message) })
                        });
                    }
                    else {
                        this.watchID = setInterval(() => {
                            AsyncStorage.getItem('USER_DETAILS')
                                .then((result_) => {
                                    clearInterval(this.watchID);
                                    const userDetails_ = JSON.parse(result_);
                                    this.setState({
                                        workAddress: userDetails_.workAddress ? userDetails_.workAddress : 'NORESULTS',
                                        homeAddress: userDetails_.homeAddress ? userDetails_.homeAddress : 'NORESULTS',
                                    });

                                    database().ref(`users/${userDetails_.userID}/`).on('value', snapshot => {
                                        AsyncStorage.setItem('USER_DETAILS', JSON.stringify(snapshot.val()))
                                            .then(() => { this.setState({ userDetails: snapshot.val() }) })
                                            .catch((e) => { console.log(e.message) })
                                    });
                                }).catch(error => { console.log(error.message) })
                        }, 300)
                    }
                }).catch(error => { console.log(error.message) })
        SplashScreen.hide();
        isUserLoggedIn.call(this);
        permissionLocation();
        searchHistoryList.then((results) => { this.setState({ history: results }) });


        AsyncStorage.getItem('USER_DETAILS')
            .then(result => {
                const userDetails = JSON.parse(result);
                this.setState({ userDetails: userDetails })
                database().ref(`carpoolTripReserve/carpool/user/${userDetails.userID}`).on('value', snapshot => {
                    if (snapshot.val())
                        this.setState({ status: 'ONLINE', data: snapshot.val(), userID: userDetails.userID, })
                    else
                        this.setState({ status: 'OFFLINE' })
                });

                database().ref(`scheduledCarpoolTripReserve/carpool/user/${userDetails.userID}`).on('value', snapshot => {
                    if (snapshot.val())
                        this.setState({ scheduledStatus: 'ONLINE', })
                    else
                        this.setState({ scheduledStatus: 'OFFLINE' })
                })
            }).catch(error => { console.log(error.message) })


        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    currentLocation: `&location=${[position.coords.latitude, position.coords.longitude]}&radius=10000`,
                    region: {
                        latitude: position.coords.latitude - 0.001,
                        longitude: position.coords.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    },
                    mapLoaded: true,
                    currentLocationLatitude: position.coords.latitude,
                    currentLocationLongitude: position.coords.longitude,
                });
            },
            (error) => {
                console.log(error.code, error.message);
                Geolocation.requestAuthorization();
            },
            {
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                //enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: true
            }
        )

        this.watchID = Geolocation.watchPosition(position => {//THIS HAPPENS AS THE USER MOVES OR CHANGES LOCATION
            this.setState({
                currentLocation: `&location=${[position.coords.latitude, position.coords.longitude]}&radius=30000`,
                currentLocationLatitude: position.coords.latitude,
                currentLocationLongitude: position.coords.longitude,
            });
        },
            error => (console.log(error.message)),
            {
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        )

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        Animated.spring(this.animatedValue, {
            //toValue: y(538),
            toValue: y(510),
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        Animated.spring(this.animatedValueTop_, {
            toValue: y(510),
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();

    };
    animateMapToCurrentRegion = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                this.map.animateToRegion({
                    latitude: position.coords.latitude - 0.001,
                    longitude: position.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                });
            },
            (error) => {
                console.log(error.code, error.message);
                Geolocation.requestAuthorization();
            },
            {
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
                //enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: true
            }
        ).catch((error) => {
            console.log(error.code, error.message);
            Geolocation.requestAuthorization();
        });
    };
    forceUpdate(value) {
        const userDetails = value;
        this.setState({
            userDetails: userDetails,
            workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
            homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
        });
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Geolocation.clearWatch(this.watchID);
        //Geolocation.stopObserving();
    };
    home_workLocation(place) {
        switch (place) {
            case 'home': {
                if (this.state.homeAddress) {
                    if (this.state.homeAddress == 'NORESULTS')
                        this.props.navigation.navigate('SavedPlaces', {
                            onReturn: () => {
                                this.onReturnFromSavedPlaces.call(this);
                            }
                        });
                    else { //YOU HAVE FULL ADDRESS, USE IT
                        this.setState({ now: true }, () => {
                            this.animateFullScreen();
                            getLocation.call(this, this.state.homeAddress.mainText, this.state.homeAddress.description, this.state.homeAddress.place_id, 'destination', 'Main');
                        })
                    };
                }
            } break;
            case 'work': {
                if (this.state.workAddress) {
                    if (this.state.workAddress == 'NORESULTS')
                        this.props.navigation.navigate('SavedPlaces', {
                            onReturn: () => {
                                this.onReturnFromSavedPlaces.call(this);
                            }
                        });
                    else {
                        this.setState({ now: true }, () => {
                            this.animateFullScreen();
                            getLocation.call(this, this.state.workAddress.mainText, this.state.workAddress.description, this.state.workAddress.place_id, 'destination', 'Main');
                        });
                    };
                }
            } break;
        };
    };
    handleBackButtonClick() {
        BackHandler.exitApp();
    };
    onReturn(data) {
        if (data == 'L')
            this.setState({ locationFocused: true });
        else
            this.destinationInput.focus();

    };
    onReturnFromSavedPlaces() {
        if (this.props.route.params) {
            if (this.props.route.params.userDetails) {
                const userDetails = this.props.route.params.userDetails;
                this.setState({
                    workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                    homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                });
            }
        }
        else
            AsyncStorage.getItem('USER_DETAILS')
                .then(result => {
                    if (result) {
                        const userDetails = JSON.parse(result);
                        this.setState({
                            workAddress: userDetails.workAddress ? userDetails.workAddress : 'NORESULTS',
                            homeAddress: userDetails.homeAddress ? userDetails.homeAddress : 'NORESULTS',
                            rerender: makeid(7),
                        });
                    }
                    else {
                        this.watchID = setInterval(() => {
                            AsyncStorage.getItem('USER_DETAILS')
                                .then((result_) => {
                                    clearInterval(this.watchID);
                                    const userDetails_ = JSON.parse(result_);
                                    this.setState({
                                        workAddress: userDetails_.workAddress ? userDetails_.workAddress : 'NORESULTS',
                                        homeAddress: userDetails_.homeAddress ? userDetails_.homeAddress : 'NORESULTS',
                                        rerender: makeid(7),
                                    });
                                }).catch(error => { console.log(error.message) })
                        }, 300)
                    }
                }).catch(error => { console.log(error.message) })
    };
    suggestionSetter(value) {
        if (this.state.suggestion != value) {
            this.setState({ suggestion: value });
        }
    };
    mapmovedSetter() {
        if (this.state.mapMoved)
            this.setState({ mapMoved: false })
    };
    handleOnNavigateBack() {

        //MAKE THIS FUNCTION SET THE REVERSE OF THE ANIMATIONS
        this.animatedValueTop_.stopAnimation();
        this.setState({
            suggestion: 'invisible',
            searchPosition: 'hidden',
            searchBar: 'hide',
            locationFocused: false,
            destinationFocused: false,
            schedule: true
        });
        Keyboard.dismiss();

        Animated.spring(this.animatedValueTop_, {
            toValue: y(510),
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
    };
    animateFullScreen() {
        LayoutAnimation.configureNext(CustomLayoutLinear);
        this.hideMenu();
        this.forwardDirection = true;
        this.setState({ schedule: false });
        Animated.spring(this.animatedValueTop_, {
            toValue: -y(15),
            bounciness: 0,
            velocity: 30,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start(() => {
            this.setState({ searchPosition: 'shown', suggestion: 'springUp' });
        });

        Animated.spring(this.down_zindex, {
            toValue: -1,
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };
    animateMenu() {
        LayoutAnimation.configureNext(CustomLayoutLinear)
        Animated.spring(this.position, {
            toValue: { x: X_OUT, y: Y_CONSTANT },
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };
    hideMenu() {
        LayoutAnimation.configureNext(CustomLayoutLinear)
        Animated.spring(this.position, {
            toValue: { x: X_IN, y: Y_CONSTANT },
            useNativeDriver: false,
        }).start();
    };
    continueTrip = () => {
        const data = this.state.data;
        const userID = this.state.userID
        const dateText = `userHistory/${userID}/carpool/${data.startAt.year}/${data.startAt.month}/${data.historyRef}`
        this.props.navigation.navigate('CarpoolTripDetails', {
            location: data.location,
            destination: data.destination,
            seatNumber: data.seatNumber,
            tripAccepted: true,
            userID: this.state.userID,
            data: JSON.parse(data.data),
            hour: data.startAt.hour,
            min: data.startAt.min,
            now: true,
            dateText: dateText,
            handleOnNavigateBack: () => { this.handleOnNavigateBack.call(this); },
            onRefresh: () => { },
        });
    };

    render() {
        const animatedValueWidth_ = this.animatedValueTop_.interpolate({
            inputRange: [0, y(538)],
            outputRange: [width + x(20), x(343)],
            extrapolate: 'clamp',
        });
        const animatedValueHeight_ = this.animatedValueTop_.interpolate({
            inputRange: [-y(15), y(538)],
            outputRange: [y(156) + y(15), y(61)],
            extrapolate: 'clamp',
        });
        const animatedValueOpacity = this.animatedValueTop_.interpolate({
            inputRange: [0, y(538)],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });
        const animatedZindexDown = this.animatedValueTop_.interpolate({
            inputRange: [0, y(538)],
            outputRange: [-1, 1],
            extrapolate: 'clamp',
        });
        const predictionResults = this.state.predictions.map((data) => {
            let input;
            if (this.state.locationFocused)
                input = 'location';
            else if (this.state.destinationFocused)
                input = 'destination';

            return (
                <LocationItem description={data.description} mainText={data.mainText}
                    key={data.place_id}
                    Press={() => {
                        getLocation.call(this,
                            data.mainText, data.description, data.place_id, input, 'Main', this.animateMapToCurrentRegion);
                    }} />)
        });
        const zoomTop = this.state.searchPosition === 'shown' ?
            y(dimensionAssert() ? 545 : 570) :
            y(dimensionAssert() ? 425 : 440);
        let historyResults = this.state.history ? this.state.history.map((data) => {
            let input;
            if (this.state.locationFocused)
                input = 'location';
            else if (this.state.destinationFocused)
                input = 'destination';

            return (
                <LocationItem description={data.description} mainText={data.mainText}
                    key={data.place_id}
                    Press={() => {
                        getLocation.call(this,
                            data.mainText, data.description, data.place_id, input, 'Main', this.animateMapToCurrentRegion);
                    }} />)
        })
            : <></>;

        let status = 'Where are you headed?';
        if (this.state.status == 'LOADING...')
            status = 'Loading information...';
        else if (this.state.status == 'ONLINE')
            status = 'Continue current trip ?';

        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />

                    {this.state.loading ? <LoadingScreen zIndex={5} /> : <></>}
                    <StatusBar backgroundColor={'#000000'} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />

                    {this.state.searchPosition === 'shown' ?
                        <View style={styles.point}>
                            <Pin />
                        </View>
                        : <></>}

                    <LowerSection
                        visibility={this.state.suggestion}
                        predictionResults={
                            (this.state.predictionsLoaded || (this.state.location != '' && this.state.destination != '')) ? predictionResults : historyResults
                        }
                        suggestionSetter={this.suggestionSetter.bind(this)}
                        mapmovedSetter={this.mapmovedSetter.bind(this)}
                    />


                    <TouchableOpacity style={[styles.zoomIcon, { top: zoomTop, right: x(10) }]}
                        onPress={() => {
                            Geolocation.getCurrentPosition(
                                (position) => {
                                    this.map.animateToRegion({
                                        latitude: position.coords.latitude - 0.001,
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
                                //enableHighAccuracy: true,
                                timeout: 15000,
                                maximumAge: 10000,
                                distanceFilter: 0,
                                forceRequestLocation: true
                            }).catch((error) => {
                                console.log(error.code, error.message);
                                Geolocation.requestAuthorization();
                            });
                        }}
                    >
                        <Icon_ name={'location-arrow'} size={y(21)} color={colors.GREEN} />
                    </TouchableOpacity>



                    {this.state.searchBar === 'show' ?
                        <Animated.View style={[styles.searchBar, { zIndex: 3, elevation: 3 }]}>
                            <StatusBar barStyle={'light-content'} backgroundColor={'#4DB748'} />
                            <TouchableOpacity
                                style={styles.cancelIcon}
                                onPress={this.handleOnNavigateBack}
                            ><Icon name={'x'} size={y(25)} color={'#FFFFFF'} /></TouchableOpacity>
                            <View style={styles.canceldivider}><Divider width={x(0.5)} height={y(dimensionAssert() ? 85 : 72)} borderRadius={0} borderColor={'#FFFFFF'} borderWidth={1} /></View>
                            <Icon name={'map-pin'} size={y(25)} color={'#FFFFFF'} style={styles.icon1} />
                            <Icon name={'map-pin'} size={y(25)} color={'#FFFFFF'} style={styles.icon2} />
                            <View style={styles.textDivider}><Divider width={x(244)} height={(1)} borderRadius={0} borderColor={'#FFFFFF'} borderWidth={1} /></View>
                            {this.state.location === '' && this.state.locationFocused === false ?

                                <TouchableOpacity onPress={() => {
                                    this.setState({ locationFocused: true });
                                }}
                                    style={styles.currentLocation}
                                >
                                    <Text style={styles.currentLocationText}>Current Location</Text>
                                </TouchableOpacity>
                                :
                                <TextInput
                                    autoFocus={true}
                                    onFocus={() => { this.setState({ locationFocused: true, destinationFocused: false, suggestion: 'springUp' }) }}
                                    onChangeText={(value) => {
                                        this.setState({ location: value });
                                        debouncer.call(this, value, 'Main');
                                    }}
                                    //onEndEditing={()=>{}}
                                    style={styles.locationInput}
                                    value={this.state.location}
                                //placeholderTextColor={'#D3D3D3'}
                                />
                            }
                            <TextInput
                                //onFocus={this.springUp}
                                placeholder={'Enter a destination'}
                                onFocus={() => { this.setState({ destinationFocused: true, locationFocused: false, suggestion: 'springUp' }) }}
                                ref={(input) => { this.destinationInput = input; }}
                                style={styles.destinationInput}
                                onChangeText={(value) => {
                                    this.setState({ destination: value });
                                    debouncer.call(this, value, 'Main');
                                }}
                                placeholderTextColor={'#D3D3D3'}
                                autoFocus={false}
                                value={this.state.destination}
                            />
                        </Animated.View> :
                        <></>}





                    {this.state.mapLoaded ?
                        <MapView
                            initialRegion={this.state.region}
                            ref={(ref) => this.map = ref}
                            provider={PROVIDER_GOOGLE}
                            style={[styles.maps,]}
                            customMapStyle={MapStyle}
                            // onRegionChange={(region) => {
                            //         this.setState({ region: region })
                            // }}
                            onRegionChangeComplete={(region) => {
                                if (this.state.locationFocused)
                                    reverseGeocoding.call(this, region, 'location', 'MAIN');
                                else if (this.state.destinationFocused)
                                    reverseGeocoding.call(this, region, 'destination', 'MAIN');

                                if (this.state.locationFocused || this.state.destinationFocused)
                                    this.setState({ mapMoved: true, suggestion: 'springDown' });
                            }}
                            showsUserLocation={true}
                            showsCompass={false}
                            scrollEnabled={true}
                            showsMyLocationButton={false}
                        >
                        </MapView> :
                        <></>}


                    <TouchableOpacity
                        style={styles.menuTO}
                        onPress={this.animateMenu}>
                        <View style={styles.menu}>
                            <View style={styles.menu_}><Menu height={'100%'} width={'100%'} /></View>
                        </View>
                    </TouchableOpacity>

                    <Animated.View style={[styles.menuView, { elevation: 5, zIndex: 5 }, this.position.getLayout()]} {...this.panResponder.panHandlers}>
                        <Drawer
                            status={this.state.status}
                            navigation={this.props.navigation}
                            hideMenu={this.hideMenu}
                            userDetails={this.state.userDetails}
                            choice={this.state.rideshare ? 'rideshare' : `carpool`}
                            forceUpdate={(value) => { this.forceUpdate.call(this, value) }}
                            rerender={this.state.rerender}
                            onReturnFromSavedPlaces={() => { this.onReturnFromSavedPlaces.call(this); }} />
                    </Animated.View>


                    <Animated.View style={[styles.searchInverse, { width: animatedValueWidth_, height: animatedValueHeight_, top: this.animatedValueTop_, },]}>
                        <TouchableOpacity
                            disabled={this.state.status == 'LOADING...'}
                            onPress={() => {
                                this.setState({ now: true, getTime: false }, () => {
                                    this.state.status == 'OFFLINE' ?
                                        this.animateFullScreen() :
                                        this.continueTrip();
                                });
                            }}
                            style={styles.searchInverse_TO}>
                            <Animated.Text style={[styles.mainText, { opacity: animatedValueOpacity }]}>{status}</Animated.Text>
                            {this.state.schedule ?
                                <TouchableOpacity style={styles.sContainer} onPress={() => {
                                    if (this.state.scheduledStatus) {
                                        if (this.state.scheduledStatus == 'OFFLINE')
                                            this.setState({ getTime: this.state.getTime ? false : true, now: this.state.now ? false : true })
                                        else if (this.state.scheduledStatus == 'ONLINE')
                                            this.props.navigation.navigate('ScheduledTrips', { userDetails: this.state.userDetails })
                                    }
                                }}>
                                    <Icon name={'clock'} size={y(19)} style={styles.sIcon} color={colors.GREEN} />
                                </TouchableOpacity> :
                                <></>
                            }
                        </TouchableOpacity>
                    </Animated.View>


                    <Animated.View style={[styles.lowerSection, { top: this.animatedValue, opacity: animatedValueOpacity, [Platform.OS === 'android' ? 'elevation' : 'zIndex']: animatedZindexDown }]}>

                        <View style={[styles.voidSpace]}></View>
                        <View style={styles.history}>
                            <View style={styles.historyList}>
                                <View><Icon name={'home'} size={y(25)} color={'#000000'} style={styles.icon} /></View>
                                <View>
                                    <TouchableOpacity onPress={() => { this.home_workLocation.call(this, 'home') }} disabled={this.state.status == 'ONLINE' || this.state.status == 'LOADING...'}>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.homeAddress ? true : false} style={{ width: x(120), height: y(15) }}>
                                            <Text numberOfLines={1} style={styles.addressMain}>{this.state.homeAddress && this.state.homeAddress !== 'NORESULTS' ? this.state.homeAddress.mainText : `Add Home Address`}</Text>
                                        </ShimmerPlaceHolder>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.homeAddress ? true : false} style={{ marginTop: x(3), width: x(250), height: y(12) }}>
                                            <Text numberOfLines={2} style={styles.address2nd}>{this.state.homeAddress && this.state.homeAddress !== 'NORESULTS' ? this.state.homeAddress.description : `Home Address`}</Text>
                                        </ShimmerPlaceHolder>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.historyList}>
                                <View><Icon name={'briefcase'} size={y(25)} color={'#000000'} style={styles.icon} /></View>
                                <View>
                                    <TouchableOpacity onPress={() => { this.home_workLocation.call(this, 'work') }} disabled={this.state.status == 'ONLINE' || this.state.status == 'LOADING...'}>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.workAddress ? true : false} style={{ width: x(120), height: y(15) }}>
                                            <Text numberOfLines={1} style={styles.addressMain}>{this.state.workAddress && this.state.workAddress !== 'NORESULTS' ? this.state.workAddress.mainText : `Add Work Address`}</Text>
                                        </ShimmerPlaceHolder>
                                        <ShimmerPlaceHolder autoRun={true} visible={this.state.workAddress ? true : false} style={{ marginTop: x(3), width: x(250), height: y(12) }}>
                                            <Text numberOfLines={2} style={styles.address2nd}>{this.state.workAddress && this.state.workAddress !== 'NORESULTS' ? this.state.workAddress.description : `Work Address`}</Text>
                                        </ShimmerPlaceHolder>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>

                        <View style={styles.choiceSplit}>
                            {/* HIDING THE RIDESHARE CHOICE
                             <TouchableOpacity
                                onPress={() => {
                                    this.setState({ carpool: true, rideshare: false })
                                }}
                            >
                                <View style={[styles.choiceView,]}>

                                    <View style={[styles.choice_, { opacity: this.state.carpool ? 1 : 0.6 }]}>
                                        <View style={styles.choiceIcon}>
                                            <CarpoolIcon />
                                        </View>
                                        <Text style={styles.choice}>Carpool</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <Divider height={y(58)} width={0} borderRadius={0} borderColor={'#FFFFFF'} borderWidth={0.5} />
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ rideshare: true, carpool: false })
                                }}
                            >
                                <View style={[styles.choiceView,]}>

                                    <View style={[styles.choice_, { opacity: this.state.rideshare ? 1 : 0.6 }]}>
                                        <View style={styles.choiceIcon}>
                                            <RideshareIcon />
                                        </View>
                                        <Text style={styles.choice}>Rideshare</Text>
                                    </View>
                                </View>
                            </TouchableOpacity> */}
                        </View>
                    </Animated.View>


                    {this.state.suggestion !== 'invinsible' ?
                        <View style={styles.done}>
                            <TouchableOpacity
                                disabled={!this.state.mapMoved}
                                style={[styles.doneView, { backgroundColor: this.state.mapMoved ? '#4DB748' : 'rgba(77, 183, 72, 0.5)' }]}
                                onPress={() => {
                                    this.setState({ suggestion: 'springUp', mapMoved: false });
                                    getLocation.call(this,
                                        this.state.regionMovedData.mainText, this.state.regionMovedData.description, this.state.regionMovedData.place_id, this.state.regionMovedData.input, 'Main');
                                }}
                            >
                                <Text style={styles.doneText}>Confirm Position</Text>
                            </TouchableOpacity>
                        </View> :
                        <></>
                    }

                    {this.state.getTime ?
                        Platform.OS === 'ios' ?
                            <View style={styles.iosSpinnerView}>
                                <DateTimePicker
                                    value={this.state.date}
                                    mode={'time'}
                                    is24Hour={false}
                                    display={'spinner'}
                                    style={{ width: x(320), backgroundColor: colors.GREY, top: y(40) }}
                                    onChange={(event, date) => {
                                        //this.setState({ getTime: false })
                                        const d = event.nativeEvent.timestamp;
                                        if (date) {

                                            const advance15mins = new Date().getTime() + (15 * 60000);//15 mins in advance
                                            this.setState({ date: new Date(d), tomorrow: d > advance15mins ? false : true });
                                        }
                                    }}
                                />
                                <View style={styles.iosSpinner}>
                                    <Button
                                        title={'Cancel'}
                                        onPress={() => { this.setState({ now: true, getTime: false }) }}
                                    />
                                    <Button
                                        title={'Confirm'}
                                        onPress={() => {
                                            this.setState({ now: false, getTime: false }, () => {
                                                this.state.status == 'OFFLINE' ?
                                                    this.animateFullScreen() :
                                                    this.continueTrip();
                                            });
                                        }}
                                    />
                                </View>
                            </View>
                            :
                            <DateTimePicker
                                value={new Date(this.state.date)}
                                mode={'time'}
                                is24Hour={false}
                                //display={"spinner"}
                                onChange={(event, date) => {
                                    this.setState({ getTime: false })
                                    const d = event.nativeEvent.timestamp;
                                    if (date) {
                                        const advance15mins = new Date().getTime() + (15 * 60000);//15 mins in advance
                                        this.setState({ date: new Date(d), tomorrow: d > advance15mins ? false : true }, () => {
                                            this.animateFullScreen();
                                        })
                                    }
                                }}
                            />
                        : <></>}
                </View>
            </TouchableWithoutFeedback >
        );
    }
};
class LowerSection extends React.Component {
    constructor() {
        super();
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };
        this.state = {
        }

        this.springUp = this.springUp.bind(this);
        this.springDown = this.springDown.bind(this);
        this.value;
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });//This is the value we are animating to.
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
                Keyboard.dismiss();
                const Y_POSITION = (this.value + gestureState.dy);

                if (Y_POSITION >= y(175))
                    this.position.setValue({ x: X_CONSTANT, y: gestureState.dy });


            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();


                if (Math.sign(gestureState.vy) == 1) {//going down

                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_BOTTOM },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        easing: Easing.bounce,
                        useNativeDriver: false,
                    }).start();


                }
                else if (Math.sign(gestureState.vy) == -1) {//going up

                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_TOP },
                        velocity: { x: gestureState.vx, y: gestureState.vy },
                        easing: Easing.bounce,
                        useNativeDriver: false,
                    }).start();

                }
            },
        })
    }




    springUp() {
        //LayoutAnimation.configureNext(CustomLayoutLinear);
        Animated.spring(this.position, {
            toValue: { x: X_CONSTANT, y: Y_TOP },
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        this.props.suggestionSetter('springUp');
    }

    springDown() {
        //LayoutAnimation.configureNext(CustomLayoutLinear);
        Animated.spring(this.position, {
            toValue: { x: X_CONSTANT, y: Y_BOTTOM },
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        this.props.suggestionSetter('springDown');
    }

    invisible() {
        Animated.spring(this.position, {
            toValue: { x: X_CONSTANT, y: Y_START },
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start();
        this.props.suggestionSetter('invinsible');
        this.props.mapmovedSetter();
    }



    render() {

        if (this.props.visibility === 'springUp')
            this.springUp();
        else if (this.props.visibility === 'springDown')
            this.springDown();
        else if (this.props.visibility === 'invisible')
            this.invisible();


        //LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <Animated.View style={[styles.suggestions, this.position.getLayout()]} {...this.panResponder.panHandlers}>
                <View style={styles.suggestionHeader}><Text style={styles.suggestionHeaderText}>SEARCH RESULTS</Text></View>
                {this.props.predictionResults}
            </Animated.View>

        );
    }
};
class LocationItem extends React.Component {
    constructor() {
        super();
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };
    }
    render() {
        return (
            <View>
                <View style={styles.resultView}>
                    <Icon name={'map-pin'} size={y(25)} color={'#4DB748'} style={styles.resultIcon} />
                    <TouchableOpacity
                        onPress={this.props.Press}
                    >
                        <View>
                            <Text style={styles.mainAddress}>{this.props.mainText}</Text>
                            <Text style={styles.secondaryAddress}>{this.props.description}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.resultDivider}><Divider width={x(343)} height={(1)} borderRadius={1} borderColor={'#78849E'} borderWidth={1} /></View>
            </View>
        );
    }
};
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Cannot update during an existing state transition'
]);
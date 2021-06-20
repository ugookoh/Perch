import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
import * as turf from '@turf/turf';
import React from 'react';
import { Animated, Easing, LayoutAnimation, PixelRatio, Platform, StatusBar, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { BarIndicator, MaterialIndicator } from 'react-native-indicators';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import X_Icon from 'react-native-vector-icons/Feather';
import Icon__ from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import SpecialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon_ from 'react-native-vector-icons/MaterialIcons';
import { AnimatedPolylineSingleLine } from '../../Components/AnimatedPolyline/AnimatedPolyline';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import {
    colors, CustomLayoutLinear,
    dimensionAssert, getDriversInit,
    height, OfflineNotice,
    reverseGeocoding, rideshareRequestSender,
    width, x, y
} from '../../Functions/Functions';
import CityNoResults from '../../Images/svgImages/cityNoResults';
import Interac from '../../Images/svgImages/interac';
import Money from '../../Images/svgImages/moneyChoice';
import PackageChoice from '../../Images/svgImages/packageChoice';
import PerchWallet from '../../Images/svgImages/perchWallet';
import Pin from '../../Images/svgImages/pin';
import SedanChoice from '../../Images/svgImages/sedanChoice';
import SuvChoice from '../../Images/svgImages/suvChoice';
import Visa from '../../Images/svgImages/visa';
import styles from './styles';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.008339428281933124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const LOWERSECTIONHEIGHT = y(dimensionAssert() ? 500 : 430);
const LOWERSECTIONHEIGHT_ANIMATED = y(dimensionAssert() ? 256 : 215);

export default class RideshareChoice extends React.Component {
    constructor(props) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            choice: 'normalSized',
            polyline: this.props.route.params.polyline,
            location: this.props.route.params.location,
            destination: this.props.route.params.destination,
            loading: false,
            finalLoading: false,
            searchingForDriver: false,
            confirmCurrentLocation: false,//Short for padding-regular,
            width: width + 1,
            mapReadyState: false,

            etaSedan: false,//CAN BE UNAVAILABLE IF NO ONE IS AVAILABLE..ALSO CONTROLS SHIMMER
            etaSuv: false,
            etaPackage: false,

            tripDurationSedan: null,
            tripDurationSuv: null,
            tripDurationPackage: null,
            orientation: 'space-between',
            unavailable: false,

            userID: '',
            preliminarySearch: false,
            tripDurationInSeconds: null,
            userShareCode: null,

            paymentMethod: 'creditCard',
        };
        this.top = new Animated.Value(height);
        this.bottom = new Animated.Value(0);
        this.height = new Animated.Value(LOWERSECTIONHEIGHT);
    };
    componentDidMount() {
        getDriversInit.call(this);
        this.watchID = setInterval(() => {
            if (this.state.searchingForDriver == false && this.state.preliminarySearch == false)
                getDriversInit.call(this);
        }, 10000); //EVERY 10 SECONDS CALL THIS FUNCTION AGAIN TO REFRESH THE DATA.

    };
    componentWillUnmount() {
        clearInterval(this.watchID);
    };

    vehicleAnimator(direction) {
        switch (direction) {
            case 'UP': {
                Animated.spring(this.top, {
                    toValue: 0,
                    bounciness: 0,
                    easing: Easing.linear,
                }).start();
            }; break;
            case 'DOWN': {
                Animated.spring(this.top, {
                    toValue: height,
                    bounciness: 0,
                    easing: Easing.linear,
                }).start();
            } break;
        };
    };
    changePayment(value) {
        this.setState({ paymentMethod: value });
    };
    confirmLocation() {
        Animated.spring(this.top, {
            toValue: height,
            bounciness: 0,
            easing: Easing.linear,
        }).start(() => {
            if (this.map)
                this.map.animateToRegion({
                    latitude: this.state.location.latitude,
                    longitude: this.state.location.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                });
            this.setState({ confirmCurrentLocation: true })
            Animated.spring(this.height, {
                toValue: LOWERSECTIONHEIGHT_ANIMATED,
            }).start(() => {
                this.animatedComplete = true;
            });

        });
    }
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
                        <Text style={styles.cardNumber}> Cash</Text>
                    </View>
                );
            } break;
            case 'perchCredit': {
                PAYMENT_CHOICE = (
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={styles.visa_}><PerchWallet height={'100%'} width={'100%'} /></View>
                        <Text style={styles.cardNumber}> Perch Wallet</Text>
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
        }

        const zoomTop = this.height.interpolate({
            inputRange: [LOWERSECTIONHEIGHT_ANIMATED, LOWERSECTIONHEIGHT],
            outputRange: [y(dimensionAssert() ? 480 : 540), y(dimensionAssert() ? 220 : 330)],
            extrapolate: 'clamp',
        });
        const borderRadius = this.height.interpolate({
            inputRange: [LOWERSECTIONHEIGHT_ANIMATED, LOWERSECTIONHEIGHT],
            outputRange: [0, 16],
            extrapolate: 'clamp',
        });




        const padding = y(this.state.confirmCurrentLocation == false ?
            (dimensionAssert() ? 320 : 270) : 0
        );
        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <StatusBar backgroundColor={'#000000'} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
                {this.state.searchingForDriver ?
                    <SearchingForDriver
                        userID={this.state.userID}
                        goHome={() => { this.props.navigation.navigate('Main') }}
                        goForward={(driverID, userID, historyRef) => {
                            this.props.navigation.navigate('RideshareConfirmed', {
                                driverID: driverID,
                                location: this.state.location,
                                destination: this.state.destination,
                                polyline: this.state.polyline,
                                userID: userID,
                                tripDurationInSeconds: this.state.tripDurationInSeconds,
                                userShareCode: this.state.userShareCode,
                                historyRef: historyRef,
                            })
                        }}
                        location={this.state.location}
                        destination={this.state.destination}
                        polyline={this.state.polyline}
                    /> :
                    <></>}
                {this.state.confirmCurrentLocation ?
                    <View style={styles.point}>
                        <Pin />
                    </View>
                    : <></>}
                <TouchableOpacity style={[styles.menu,]} onPress={this.props.navigation.goBack}>
                    <View>
                        <Icon name={'ios-arrow-back'} color={colors.WHITE} size={x(28)} />
                    </View>
                </TouchableOpacity>

                <Animated.View style={[styles.zoomIcon, { top: zoomTop, right: x(10) }]}>
                    <TouchableOpacity style={[styles.zoomIcon,]}
                        onPress={() => {
                            if (this.mapReady && this.state.confirmCurrentLocation == false && this.map) {
                                const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]);
                                let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                                this.map.fitToCoordinates(bboxPolygon, {
                                    edgePadding:
                                    {
                                        top: x(50),
                                        right: x(30),
                                        bottom: Platform.OS === 'ios' ? x(40) : PixelRatio.get() * x(padding),
                                        left: x(80),
                                    },
                                });
                            }
                            else if (this.state.confirmCurrentLocation && this.map) {
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
                            }
                        }}
                    >
                        <Icon_ name={'my-location'} size={y(21)} color={colors.GREEN} />
                    </TouchableOpacity>
                </Animated.View>
                {this.state.confirmCurrentLocation ?
                    <></> :
                    <Animated.View style={[styles.containerLD, { top: zoomTop, left: x(10) }]}>
                        <SpecialIcon name={'swap-vertical-bold'} color={colors.GREEN} size={x(20)} style={{ marginLeft: x(10) }} />

                        <View style={{ marginLeft: x(15) }}>
                            <TouchableOpacity onPress={() => {
                                this.props.route.params.onReturn('L');
                                this.props.navigation.goBack();

                            }}>
                                <Text style={styles.textLD} numberOfLines={1}>{this.state.location.description}</Text>
                            </TouchableOpacity>
                            <View style={[{ opacity: 0.25, marginVertical: x(2) }]}><Divider height={0.5} width={x(250)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                            <TouchableOpacity onPress={() => {
                                this.props.route.params.onReturn('D');
                                this.props.navigation.goBack();

                            }}>
                                <Text style={styles.textLD} numberOfLines={1}>{this.state.destination.description}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                }

                <MapView
                    initialRegion={{
                        latitude: this.state.location.latitude,
                        longitude: this.state.location.longitude,
                        longitudeDelta: LONGITUDE_DELTA,
                        latitudeDelta: LATITUDE_DELTA,

                    }}
                    ref={map => { this.map = map }}
                    provider={PROVIDER_GOOGLE}
                    style={[styles.maps, { width: this.state.width }]}
                    customMapStyle={MapStyle}
                    onMapReady={() => {
                        const line = turf.lineString([[this.state.location.latitude, this.state.location.longitude], ...this.state.polyline, [this.state.destination.latitude, this.state.destination.longitude],]);
                        let bboxPolygon = turf.bboxPolygon(turf.bbox(line)).geometry.coordinates[0].map((v => { return { latitude: v[0], longitude: v[1] } }));
                        this.setState({ width: this.state.width - 1, mapReadyState: true }, () => {
                            this.mapReady = true;
                            if (this.state.confirmCurrentLocation == false && this.map)
                                setTimeout(() => {
                                    this.map.fitToCoordinates(bboxPolygon, {
                                        edgePadding:
                                        {
                                            top: x(50),
                                            right: x(30),
                                            bottom: Platform.OS === 'ios' ? x(40) : PixelRatio.get() * x(padding),
                                            left: x(80),
                                        },
                                    });
                                }, 100)
                        });
                    }}
                    onRegionChangeComplete={(region) => {
                        if (this.state.confirmCurrentLocation && this.animatedComplete) {
                            this.setState({ finalLoading: true });
                            reverseGeocoding.call(this, region, 'location', 'RIDESHARECHOICE');
                        }
                    }}
                    showsCompass={false}
                    showsMyLocationButton={false}
                    showsUserLocation={true}
                    mapPadding={{
                        bottom: padding
                    }}
                >
                    <Marker coordinate={{ latitude: this.state.location.latitude, longitude: this.state.location.longitude }}>
                        <Icon__ name={'dot-circle-o'} size={y(20)} color={colors.GREENMAKER} />
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

                        <Icon__ name={'stop-circle-o'} size={y(20)} color={colors.GREENMAKER} />
                    </Marker>
                </MapView>

                <Animated.View style={[styles.lowerSection, { height: this.height, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]}>
                    {
                        this.state.unavailable ?//NO TRIPS ARE AVAILABLE
                            <>
                                <View style={styles.city}>
                                    <CityNoResults />
                                </View>
                                <Text style={styles.noResultText}>Unfortunately there are no Perchers near this pickup location, please change your pickup location or try again shortly</Text>
                                <View style={styles.button}><Button text={'Change Pickup Location'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.loading}
                                    onPress={() => {
                                        this.props.route.params.onReturn('L');
                                        this.props.navigation.goBack();
                                    }} /></View>
                            </> :
                            this.state.confirmCurrentLocation ?//ABOUT TO PICK A CURENT LOCATION
                                <>
                                    <View style={{ width: x(313) }}>
                                        <Text style={[styles.title, { marginTop: y(25) }]}>Confirm your pickup location</Text>
                                        <Text style={[styles.description]}>Edit your pickup address if you need to</Text>
                                    </View>
                                    <TouchableOpacity style={styles.confirmPickup}
                                        onPress={() => {
                                            this.props.route.params.onReturn('L');
                                            this.props.navigation.goBack();
                                        }}>
                                        <SpecialIcon name={'magnify'} color={colors.GREEN} size={y(30)} style={{ marginHorizontal: x(10) }} />
                                        <Text style={[styles.description, { width: x(250), }]} numberOfLines={1}>{this.state.location.description}</Text>
                                    </TouchableOpacity>
                                    <View style={styles.button}><Button text={'Confirm Pickup location'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.finalLoading}
                                        onPress={() => {
                                            this.setState({ finalLoading: true });
                                            rideshareRequestSender.call(this);
                                        }} /></View>
                                </> :   //REGULAR CHOICE SCREEN
                                <>
                                    <View style={{ width: x(313) }}>
                                        <Text style={[styles.title]}>What vehicle size do you need?</Text>
                                    </View>
                                    <View style={[styles.choice, { justifyContent: this.state.orientation }]}>

                                        {this.state.etaSedan == 'UNAVAILABLE' ?
                                            <></> :
                                            <View style={styles.content}>
                                                {this.state.etaSedan ?
                                                    <View style={styles.etaConatiner}>
                                                        <Text style={styles.etaText}>{`${this.state.etaSedan} mins`}</Text>
                                                    </View> : <></>}
                                                <TouchableOpacity onPress={() => {
                                                    if (this.state.choice !== 'normalSized')
                                                        this.setState({ choice: 'normalSized' })
                                                    else
                                                        this.vehicleAnimator.call(this, 'UP');
                                                }}>
                                                    <View style={[styles.choiceIcon, { opacity: this.state.choice == 'normalSized' ? 1 : 0.3 }]}>
                                                        <SedanChoice height={'100%'} width={'100%'} />
                                                    </View>
                                                </TouchableOpacity>
                                                <Text style={[styles.type, { textAlign: 'center' }]}>Sedan sized Perch</Text>

                                                {/* <ShimmerPlaceHolder autoRun={true} visible={false} style={{ marginTop: x(10), width: x(65), height: y(16) }}> SHIMMER  FOR THE COST!!*/}
                                                <Text style={styles.cost}>$ 15.56</Text>
                                                {/* </ShimmerPlaceHolder> */}

                                                <ShimmerPlaceHolder autoRun={true} visible={this.state.etaSedan} style={{ marginTop: x(5), width: x(50), height: y(12) }}>
                                                    <Text style={[styles.cost, { color: '#ACB1C0', marginTop: x(5), fontSize: y(12, true) }]}>{this.state.tripDurationSedan ? this.state.tripDurationSedan : ''}</Text>
                                                </ShimmerPlaceHolder>
                                            </View>}

                                        {this.state.etaSuv == 'UNAVAILABLE' ?
                                            <></> :
                                            <View style={styles.content}>
                                                {this.state.etaSuv ?
                                                    <View style={styles.etaConatiner}>
                                                        <Text style={styles.etaText}>{`${this.state.etaSuv} mins`}</Text>
                                                    </View> : <></>}
                                                <TouchableOpacity onPress={() => {
                                                    if (this.state.choice !== 'largeSized')
                                                        this.setState({ choice: 'largeSized' })
                                                    else
                                                        this.vehicleAnimator.call(this, 'UP');
                                                }}>
                                                    <View style={[styles.choiceIcon, { opacity: this.state.choice == 'largeSized' ? 1 : 0.3 }]}>
                                                        <SuvChoice height={'100%'} width={'100%'} />
                                                    </View>
                                                </TouchableOpacity>
                                                <Text style={[styles.type, { textAlign: 'center' }]}>Large sized Perch</Text>

                                                {/* <ShimmerPlaceHolder autoRun={true} visible={false} style={{ marginTop: x(10), width: x(65), height: y(16) }}> SHIMMER  FOR THE COST!!*/}
                                                <Text style={styles.cost}>$ 23.19</Text>
                                                {/* </ShimmerPlaceHolder> */}

                                                <ShimmerPlaceHolder autoRun={true} visible={this.state.etaSuv} style={{ marginTop: x(5), width: x(50), height: y(12) }}>
                                                    <Text style={[styles.cost, { color: '#ACB1C0', marginTop: x(5), fontSize: y(12, true) }]}>{this.state.tripDurationSuv ? this.state.tripDurationSuv : ''}</Text>
                                                </ShimmerPlaceHolder>
                                            </View>}

                                        {this.state.etaPackage == 'UNAVAILABLE' ?
                                            <></> :
                                            <View style={styles.content}>
                                                {this.state.etaPackage ?
                                                    <View style={styles.etaConatiner}>
                                                        <Text style={styles.etaText}>{`${this.state.etaPackage} mins`}</Text>
                                                    </View> : <></>}
                                                <TouchableOpacity onPress={() => {
                                                    if (this.state.choice !== 'package')
                                                        this.setState({ choice: 'package' })
                                                    else
                                                        this.vehicleAnimator.call(this, 'UP');
                                                }}>
                                                    <View style={[styles.choiceIcon, { opacity: this.state.choice == 'package' ? 1 : 0.3 }]}>
                                                        <PackageChoice height={'100%'} width={'100%'} />
                                                    </View>
                                                </TouchableOpacity>
                                                <Text style={[styles.type, { textAlign: 'center' }]}>Send a package</Text>

                                                {/* <ShimmerPlaceHolder autoRun={true} visible={false} style={{ marginTop: x(10), width: x(65), height: y(16) }}> SHIMMER  FOR THE COST!!*/}
                                                <Text style={styles.cost}>$ 17.50</Text>
                                                {/* </ShimmerPlaceHolder> */}

                                                <ShimmerPlaceHolder autoRun={true} visible={this.state.etaPackage} style={{ marginTop: x(5), width: x(50), height: y(12) }}>
                                                    <Text style={[styles.cost, { color: '#ACB1C0', marginTop: x(5), fontSize: y(12, true) }]}>{this.state.tripDurationPackage ? this.state.tripDurationPackage : ''}</Text>
                                                </ShimmerPlaceHolder>

                                            </View>}

                                    </View>

                                    <View style={[{ marginTop: y(14), opacity: 0.25, }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                                    <View style={styles.payment}>
                                        <Text style={styles.paymentText}>PAYMENT METHOD</Text>
                                        {PAYMENT_CHOICE}
                                        <View style={{ right: 0, bottom: dimensionAssert() ? -x(6) : 0, position: 'absolute' }}>
                                            <TouchableOpacity onPress={() => {
                                                this.props.navigation.navigate('PaymentMethod', {
                                                    choice: this.state.paymentMethod,
                                                    changePayment: (value) => { this.changePayment.call(this, value) },
                                                })
                                            }}><Text style={styles.change}>CHANGE</Text></TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={[{ marginTop: y(19.9), opacity: 0.25, }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                                    <View style={styles.button}><Button text={'Confirm Perch'} width={x(313)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.loading}
                                        onPress={() => { this.confirmLocation.call(this); }} /></View>
                                </>
                    }
                </Animated.View>
                <Animated.View style={[styles.vehicle, { top: this.top }]}>
                    <VehicleDescription
                        selected={this.state.choice}
                        vehicleAnimator={(value) => {
                            this.vehicleAnimator.call(this, value)
                        }}
                        confirmLocation={this.confirmLocation.bind(this)}
                        location={this.state.location}
                        destination={this.state.destination}
                        eta={this.state.choice == 'normalSized' ?//SEDAN IS PICKED
                            this.state.etaSedan :
                            this.state.choice == 'largeSized' ? //SUV IS CHOSEN
                                this.state.etaSuv :
                                this.state.etaPackage
                        }
                        tripDuration={this.state.choice == 'normalSized' ?//SEDAN IS PICKED
                            this.state.tripDurationSedan :
                            this.state.choice == 'largeSized' ? //SUV IS CHOSEN
                                this.state.tripDurationSuv :
                                this.state.tripDurationPackage}
                    />
                </Animated.View>
            </View>
        );
    }
};

class VehicleDescription extends React.Component {
    constructor() {
        super();
        this.state = {};
    };
    render() {
        let selected, description, picture, button;
        switch (this.props.selected) {
            case 'normalSized': {
                selected = `A sedan sized Perch`;
                button = `Confirm sedan sized Perch`;
                description = `A comfortable, everyday sedan that seats up to 4 people`;
                picture = <SedanChoice />;
            } break;
            case 'largeSized': {
                selected = `An SUV sized Perch`;
                button = `Confirm SUV sized Perch`;
                description = `An affordable, spacious vehicle that seats up to 6 people`;
                picture = <SuvChoice />;
            } break;
            case 'package': {
                selected = `Send a package`;
                button = `Confirm package delivery`;
                description = `Not so convenient to travel out? No problem! You can deliver packages that fit into a sedan with this service`;
                picture = <PackageChoice />
            } break;
        };
        return (
            <View style={styles.vehicleContainer}>

                <View style={styles.xContainer}>
                    <TouchableOpacity style={{ width: y(60), height: y(40) }}>
                        <X_Icon name={'x'} size={y(30)} onPress={() => { this.props.vehicleAnimator('DOWN') }} />
                    </TouchableOpacity>
                </View>

                <View style={{ width: x(313), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                    <View style={[styles.etaConatiner_, { opacity: this.props.eta ? 1 : 0 }]}>
                        <Text style={styles.etaText_}>{`Pickup in ${this.props.eta ? this.props.eta : ''} mins`}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        {/* <ShimmerPlaceHolder autoRun={true} visible={false} style={{ width: x(50),height:y(20) }}>           FOR THE COST!*/}
                        <Text style={[styles.vehicleDescription, { fontSize: y(20, true), fontFamily: 'Gilroy-SemiBold' }]}>{`$40.99`}</Text>
                        {/* </ShimmerPlaceHolder> */}
                        <ShimmerPlaceHolder autoRun={true} visible={this.props.eta ? true : false} style={{ width: x(150), marginTop: y(5), height: y(15) }}>
                            <Text style={[styles.vehicleDescription, { fontSize: y(15, true), fontFamily: 'Gilroy-SemiBold' }]}>{`Arrive at ${this.props.tripDuration ? this.props.tripDuration : ''}`}</Text>
                        </ShimmerPlaceHolder>
                    </View>
                </View>
                <View style={[styles.vehiclePicture,]}>
                    {picture}
                </View>
                <View style={{ width: x(313) }} >
                    <Text style={styles.vehicleTitle}>{selected}</Text>
                    <Text style={styles.vehicleDescription}>{description}</Text>
                </View>
                <View style={[{ opacity: 0.25, marginVertical: x(20) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                <View style={{ width: x(313), marginVertical: x(-10) }} >
                    <Text style={[styles.vehicleTitle, { fontSize: y(18, true) }]}>Trip Details</Text>

                    <View style={styles.vehicleLocation}>
                        <SpecialIcon name={'swap-vertical-bold'} color={colors.GREEN} size={x(30)} style={{ marginLeft: x(10) }} />

                        <View style={{ marginLeft: x(20) }}>
                            <Text numberOfLines={1} style={[styles.vehicleDescription, { width: x(240), marginTop: y(10) }]}>{this.props.location.description}</Text>
                            <View style={[{ opacity: 0.25, marginVertical: x(5) }]}><Divider height={0.5} width={x(240)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                            <Text numberOfLines={1} style={[styles.vehicleDescription, { width: x(240), marginBottom: y(10) }]}>{this.props.destination.description}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.button, { marginTop: y(35) }]}><Button text={button} width={x(313)} height={y(48)} top={0} left={0} zIndex={2}
                    onPress={() => {
                        this.props.confirmLocation();
                    }} /></View>


            </View>
        )
    }
};

class SearchingForDriver extends React.Component {
    constructor() {
        super();

        this.state = {
            tripAccepted: false,
            tripValid: true,
        };
        this.opacity = new Animated.Value(1);
    };
    componentDidMount() {
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.opacity, {
                    toValue: 0.3,
                    duration: 2000,
                    //delay: 1000
                }),
                Animated.timing(this.opacity, {
                    toValue: 1,
                    duration: 2000
                })
            ])
        ).start();

        AsyncStorage.getItem('USER_DETAILS')
            .then(result => {
                const userDetails = JSON.parse(result);
                database().ref(`userRideshareRequests/${userDetails.userID}/status`).on('value', snapshot => {
                    if (snapshot.val()) {
                        if (snapshot.val().accepted == 'ACCEPTED') {//NAVIGATE WITH ALL REQUIRED PARAMETERS HERE
                            this.setState({ tripAccepted: true }, () => {
                                const DAY = new Date().getDate();
                                let MONTH = new Date().getMonth();
                                const YEAR = new Date().getFullYear();
                                const HOUR = new Date().getHours();
                                const MIN = new Date().getMinutes();
                                const SECOND = new Date().getSeconds();

                                switch (MONTH) {
                                    case 0: { MONTH = 'January' } break;
                                    case 1: { MONTH = 'February' } break;
                                    case 2: { MONTH = 'March' } break;
                                    case 3: { MONTH = 'April' } break;
                                    case 4: { MONTH = 'May' } break;
                                    case 5: { MONTH = 'June' } break;
                                    case 6: { MONTH = 'July' } break;
                                    case 7: { MONTH = 'August' } break;
                                    case 8: { MONTH = 'September' } break;
                                    case 9: { MONTH = 'October' } break;
                                    case 10: { MONTH = 'November' } break;
                                    case 11: { MONTH = 'December' } break;
                                };
                                const DATE_ = `${DAY}-${HOUR}-${MIN}-${SECOND}`;
                                const historyRef = `/userHistory/${userDetails.userID}/rideshare/${YEAR}/${MONTH}/${DATE_}`;



                                this.props.goForward(snapshot.val().acceptor, userDetails.userID, historyRef);
                                database().ref(`userRideshareRequests/${userDetails.userID}`).remove()//REMOVE THE ONLD ONE,WE DONT NEED IT
                                    .catch(error => { console.log(error.message) });

                                //MAKE A HISTORY

                                database().ref(`driverRideshareRequests/${snapshot.val().acceptor}`).once('value', snapshot_ => {//GET DRIVERS CAR DETAILS FIRST
                                    const driverDetails = snapshot_.val();
                                    database().ref(`/userHistory/${userDetails.userID}/rideshare/${YEAR}/${MONTH}`).update({ //WE STORE HISTORY IN A SEPERATE PLACE AND DOWNLOAD FROM THERE
                                        [DATE_]: {
                                            status: 'ONGOING',
                                            location: this.props.location,
                                            destination: this.props.destination,
                                            polyline: JSON.stringify(this.props.polyline),//STRINGIFY ARRAYS TO BE STORED
                                            tripAccepted: true,
                                            seatNumber: this.props.seatNumber,
                                            firstName: driverDetails.firstName,
                                            lastName: driverDetails.lastName,
                                            carDetails: driverDetails.carDetails,
                                            history: driverDetails.history,
                                            driverID: snapshot.val().acceptor
                                        }
                                    }).catch((error) => { console.log(error.message) });

                                    database().ref(`driverRideshareRequests/${snapshot.val().acceptor}/rides/${userDetails.userID}`).update({//WE LISTEN HERE IN ORDER TO UPDATE THE ETA AND REVIEW
                                        historyRef: `/userHistory/${userDetails.userID}/rideshare/${YEAR}/${MONTH}/${DATE_}`,
                                        status: 'UNPICKED',
                                        year: YEAR,
                                        month: MONTH,
                                    }).catch(error => { console.log(error.message) });
                                })
                            })
                        }
                        else if (snapshot.val().accepted == 'NODRIVERSAVAILABLE') {
                            this.setState({ tripValid: false });
                            database().ref(`userRideshareRequests/${userDetails.userID}`).remove()//REMOVE THE ONLD ONE IN CASE HE MAKES ANOTHER REQUEST IMMEDIATELY
                                .catch(error => { console.log(error.message) })
                        }
                    }
                });
            }).catch(error => { console.log(error.message) })


    }
    componentWillUnmount() {
        this.opacity.stopAnimation();
    }
    render() {
        return (
            <View style={styles.containerSearch}>
                <View style={styles.secondaryContainerSearch}>
                    {this.state.tripValid ?//ENGINE IS STILL SEARCHING FOR A DRIVER 
                        this.state.tripAccepted ?
                            <>
                                <Text style={[styles.searchText, { fontFamily: 'Gilroy-SemiBold', fontSize: y(20, true) }]}>Ride found!</Text>
                                <View style={{ height: y(100), }}>
                                    <MaterialIndicator color={colors.GREEN} size={x(50)} count={8} />
                                </View>
                            </> :
                            <>
                                <Animated.Text style={[styles.searchText, { opacity: this.opacity, fontFamily: 'Gilroy-SemiBold' }]}>Searching for a Perch driver in your area to pair you with</Animated.Text>
                                <View style={{ height: y(100), }}>
                                    <BarIndicator color={colors.GREEN} size={x(40)} count={8} />
                                </View>
                            </> ://ENGINE HAS FINISHED SEARCHING, NO AVAILABLE DRIVERS
                        <>
                            <View style={styles.secondaryContainerCity}>
                                <CityNoResults />
                            </View>
                            <Text style={[styles.searchText, {}]}>Unfortunately, all the Perch drivers in the region are busy. Please try again shortly.</Text>
                            <View style={[styles.button, { width: x(270), marginVertical: y(10) }]}><Button text={'Go Home'} width={x(270)} height={y(48)} top={0} left={0} zIndex={2}
                                onPress={() => { this.props.goHome() }} /></View>
                        </>
                    }
                </View>
            </View>
        );
    }
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
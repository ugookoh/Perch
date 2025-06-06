import React from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import Dash from 'react-native-dash';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import StarRating from 'react-native-star-rating';
import Icon_ from 'react-native-vector-icons/Feather';
import Icon__ from 'react-native-vector-icons/FontAwesome';
import Icon_Pen from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import DashedDivider from '../../Components/DashedDivider/DashedDivider';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import {
    colors,
    dimensionAssert, height, OfflineNotice, rideshareRatingHandler,
    x, y
} from '../../Functions/Functions';
import Interac from '../../Images/svgImages/interac';
import Money from '../../Images/svgImages/moneyChoice';
import PerchWallet from '../../Images/svgImages/perchWallet';
import Visa from '../../Images/svgImages/visa';
import styles from './styles';

const X_CONSTANT = 0;
const Y_START = y(20);
export default class RideshareHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            starCount: this.props.route.params.data.userRating ? this.props.route.params.data.userRating : 0,
            currenStarDisplay: 0,
            currentStarColor: colors.GOLD,
            data: this.props.route.params.data,
            date: this.props.route.params.date,
            historyRef: this.props.route.params.historyRef,
            userID: this.props.route.params.userID,
        }

        this.TOP_OF_TRIPS = 0;
        this.onStarRatingPress = this.onStarRatingPress.bind(this);
        this.showRating = this.showRating.bind(this);
        this.hideRating = this.hideRating.bind(this);
        this.ratingzIndex = new Animated.Value(-1)
        this.value;
        this.direction;
        this.headerInverse = new Animated.Value(-Y_START);
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });//This is the value we are animating to.
        this.position.y.addListener(({ value }) => {
            this.headerInverse.setValue(-value);

            if ((value >= Y_START && this.direction === 'downwards')) {
                this.position.stopAnimation(() => {
                    if (value >= Y_START && this.direction === 'downwards')
                        this.direction = 'upwards';


                    const Y_POSITION = Number(JSON.stringify(this.position.y));
                    if (Y_POSITION > Y_START && this.direction === 'upwards')
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: Y_START },
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
                        useNativeDriver: false,
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
                        useNativeDriver: false,
                    }).start();
                }
            },
        });
    };
    componentDidMount() {
    };
    hideRating() {
        this.ratingzIndex.setValue(-1);
        if (this.state.starCount !== 0) {
            rideshareRatingHandler(this.state.starCount, this.state.userID, this.state.data.driverID, this.state.historyRef);
            let newResult = this.state.data;
            newResult.userRating = this.state.starCount;
            this.setState({ data: newResult })
        }
    }
    showRating() {
        this.ratingzIndex.setValue(2);
    }

    onStarRatingPress(rating) {

        this.setState({
            starCount: rating,
            currenStarDisplay: rating,
        });
        setTimeout(() => { this.hideRating() }, 500)

    }
    render() {

        const firstRating = (
            <Animated.View style={[styles.rating, { zIndex: this.ratingzIndex, backgroundColor: 'rgba(152, 151, 151, 0.7)', }]}>
                <TouchableOpacity onPress={this.hideRating} style={styles.rating}></TouchableOpacity>
                <StarRating
                    disabled={false}
                    maxStars={5}
                    rating={this.state.starCount ? this.state.starCount : 0}
                    fullStarColor={this.state.currentStarColor}
                    emptyStarColor={this.state.currentStarColor}
                    starSize={y(60)}
                    selectedStar={(rating) => this.onStarRatingPress(rating)}
                />
            </Animated.View>
        );
        const polyline = ([[this.state.data.location.latitude, this.state.data.location.longitude], ...JSON.parse(this.state.data.polyline ? this.state.data.polyline : "[]"), [this.state.data.destination.latitude, this.state.data.destination.longitude],]).map((v => { return { latitude: v[0], longitude: v[1] } }));
        let disabled = false, text = `Not rated yet`;
        if (this.state.data.userRating) {
            disabled = true;
            text = `You rated ${this.state.data.userRating.toFixed(1)}`
        }
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.header}>
                    <Header scrollY={this.headerInverse} name={'Ride Details'} onPress={() => {
                        this.props.route.params.loadResults();
                        this.props.navigation.goBack();
                    }} />
                </View>
                {firstRating}
                <View style={styles.mainBackground}></View>
                <Animated.View style={[this.position.getLayout(), { positon: 'relative' }]} {...this.panResponder.panHandlers}>

                    <View style={styles.tripContainer}
                        onLayout={(event) => {
                            this.TOP_OF_TRIPS = -event.nativeEvent.layout.height + (height / 1.2);
                        }}>

                        <View style={styles.mapGroup}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313), alignSelf: 'center' }]}>Trip Details</Text>
                            <View style={[styles.travel, { top: y(58) }]}>
                                <Icon_ name={'map-pin'} size={y(10)} color={colors.GREEN} />
                                <Text numberOfLines={2} style={[styles.firstLayer, { position: 'relative', color: '#000000', fontSize: y(12, true), marginLeft: x(5), width: x(300), }]}>{this.state.data.location.description}</Text>
                            </View>
                            <View style={styles.LtoD_Divider}><DashedDivider borderColor={colors.GREEN} height={y(25)} width={0} borderWidth={0.5} borderRadius={0} /></View>
                            <View style={[styles.travel, { top: y(dimensionAssert() ? 100 : 94) }]}>
                                <Icon_ name={'map-pin'} size={y(10)} color={colors.GREEN} />
                                <Text numberOfLines={2} style={[styles.firstLayer, { position: 'relative', color: '#000000', fontSize: y(12, true), marginLeft: x(5), width: x(300), }]}>{this.state.data.destination.description}</Text>
                            </View>


                            <View style={[styles.calendar]}>
                                <Text style={[styles.firstLayer, { position: 'relative', color: colors.GREEN, fontSize: y(14, true), marginRight: x(5), }]}>{this.state.date}</Text>
                                <Icon_ name={'calendar'} size={y(13)} color={colors.GREEN} />
                            </View>

                            <MapView
                                ref={(ref) => this.map = ref}
                                onMapReady={() => {
                                    this.map.fitToCoordinates(polyline, {
                                        animated: false,
                                        edgePadding: {
                                            top: x(10),
                                            left: x(10),
                                            right: x(10),
                                            bottom: x(20),
                                        },
                                    });
                                }}
                                provider={PROVIDER_GOOGLE}
                                style={[styles.maps,]}
                                customMapStyle={MapStyle}
                                liteMode={true}
                                showsUserLocation={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                showsCompass={false}
                                showsScale={false}
                                scrollEnabled={false}
                                rotateEnabled={false}
                            >
                                <Marker coordinate={{ latitude: this.state.data.location.latitude, longitude: this.state.data.location.longitude }}>
                                    <Icon__ name={'dot-circle-o'} size={y(15)} color={colors.GREENMAKER} />
                                </Marker>
                                <Polyline
                                    coordinates={polyline}
                                    strokeColor={colors.GREENMAKER}
                                    strokeWidth={2}
                                />
                                <Marker coordinate={{ latitude: this.state.data.destination.latitude, longitude: this.state.data.destination.longitude }}>
                                    <Icon__ name={'stop-circle-o'} size={y(15)} color={colors.GREENMAKER} />
                                </Marker>

                            </MapView>
                        </View>

                        <View style={styles.tripDetails}>

                            <View style={styles.driverCentralize}>
                                <View style={styles.profileFrame}>
                                </View>
                                <View style={{ marginLeft: x(20) }}>
                                    <Text style={[styles.driverName, {}]}>{`${this.state.data.lastName} ${this.state.data.firstName}`}</Text>
                                    <Text style={[styles.driverTripNumber, { marginVertical: x(3) }]}>{`${this.state.data.history.displayTripNumber} trips`}</Text>
                                    <View style={[styles.star, {}]}>
                                        <StarRating
                                            disabled={true}
                                            maxStars={5}
                                            rating={this.state.data.history.rating}
                                            fullStarColor={'#FFAA00'}
                                            emptyStarColor={'#FFAA00'}
                                            starSize={y(13)}
                                        />
                                    </View>
                                </View>
                            </View>
                            <Dash
                                dashLength={x(7)}
                                dashGap={x(7)}
                                style={{ width: '100%', height: 0.1, marginTop: x(7) }} />
                            <Text style={[styles.tripTitle, { width: x(313), marginTop: y(20) }]}>Cost Analysis</Text>

                            <View style={{ flexDirection: 'row', width: x(313), justifyContent: 'space-between', marginTop: y(14) }}>
                                <Text style={[styles.firstLayer, {}]}>{text}</Text>
                                <View style={[styles.historyRating,]}>
                                    <TouchableOpacity onPress={this.showRating} style={{ flexDirection: 'row' }} disabled={disabled}>
                                        <StarRating
                                            disabled={true}
                                            maxStars={5}
                                            rating={this.state.starCount}
                                            fullStarColor={colors.GOLD}
                                            emptyStarColor={colors.GOLD}
                                            starSize={y(12)}
                                        />
                                        {disabled == false ?
                                            <Icon_Pen name={'pen'} size={13} style={{ opacity: 0.5 }} style={{ marginLeft: x(3) }} /> :
                                            <></>}
                                    </TouchableOpacity>
                                </View>

                            </View>

                            <View style={[styles.spaceOut, { marginTop: y(dimensionAssert() ? 8 : 11.7) }]}>
                                <Text style={[styles.firstLayer, {}]}>Trip distance</Text>
                                <Text style={[styles.firstLayer, {}]}>22 km</Text>
                            </View>

                            <View style={[styles.spaceOut, { marginTop: y(dimensionAssert() ? 8 : 11.7) }]}>
                                <Text style={[styles.firstLayer, {}]}>Trip cost</Text>
                                <Text style={[styles.firstLayer, {}]}>$ 22.13</Text>
                            </View>

                            <View style={[styles.spaceOut, { marginTop: y(dimensionAssert() ? 8 : 11.7) }]}>
                                <Text style={[styles.firstLayer, {}]}>Tax</Text>
                                <Text style={[styles.firstLayer, {}]}>$ 2.10</Text>
                            </View>

                            <View style={[styles.divider, { marginTop: y(18) }]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                            <View style={[styles.spaceOut, { marginVertical: y(11) }]}>
                                <Text style={[styles.total, {}]}>TOTAL</Text>
                                <Text style={[styles.total, {}]}>$14.15</Text>
                            </View>

                            <View style={[styles.divider, {}]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>

                            <Text style={[styles.total, { marginTop: y(15.7), fontSize: y(18, true), color: '#000000', fontFamily: 'Gilroy-Regular', width: x(313) }]}>PAYMENT METHOD</Text>

                            <View style={[styles.payment, { marginBottom: y(30) }]}>
                                <View style={{ width: '100%', flexDirection: 'row', }}>
                                    <View style={styles.visa}><Visa height={'100%'} width={'100%'} /></View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                        <Text style={[styles.cardNumber, { left: -x(15) }]}> XXXX XXXX XXX3 3456</Text>
                                        <Text style={styles.cardNumber}> $12.00</Text>
                                    </View>
                                </View>

                                <View style={{ width: '100%', flexDirection: 'row' }}>
                                    <View style={styles.visa_}><Money height={'100%'} width={'100%'} /></View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                        <Text style={styles.cardNumber}> Cash</Text>
                                        <Text style={styles.cardNumber}> $24.99</Text>
                                    </View>
                                </View>

                                <View style={{ width: '100%', flexDirection: 'row' }}>
                                    <View style={styles.visa_}><PerchWallet height={'100%'} width={'100%'} /></View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                        <Text style={styles.cardNumber}> Perch Wallet</Text>
                                        <Text style={styles.cardNumber}> $12.00</Text>
                                    </View>
                                </View>

                                <View style={{ width: '100%', flexDirection: 'row' }}>
                                    <View style={styles.visa_}><Interac height={'100%'} width={'100%'} /></View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                        <Text style={styles.cardNumber}> Interac e-transfer</Text>
                                        <Text style={styles.cardNumber}> $5.00</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.help}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313) }]}>Help</Text>

                            <TouchableOpacity style={[styles.contactUsContainer, { marginTop: y(20), marginBottom: y(16) }]} onPress={() => { this.props.navigation.navigate('ContactUs') }}>
                                <Text style={[styles.firstLayer,]}>Contact Us</Text>
                                <Icon name={'ios-arrow-forward'} color={'#C7C7C7'} size={y(20)} />
                            </TouchableOpacity>
                        </View>

                    </View>
                </Animated.View>

            </View>
        );
    }
};
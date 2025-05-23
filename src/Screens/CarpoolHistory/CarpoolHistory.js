import React from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import StarRating from 'react-native-star-rating';
import Svg, { G, Path } from "react-native-svg";
import Icon_ from 'react-native-vector-icons/Feather';
import Icon__ from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomCombiner, CarpoolHistoryCard, MiddleCombiner, TopCombiner } from '../../Components/BreakdownCardsWithCombiners/BreakdownCardsWithCombiners';
import DashedDivider from '../../Components/DashedDivider/DashedDivider';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import { carpoolRatingHandler, dimensionAssert, height, OfflineNotice, x, y, colors } from '../../Functions/Functions';
import ApplePayLogo from '../../Images/svgImages/applePayLogo';
import GenericPaymentCard from '../../Images/svgImages/genericPaymentCard';
import GooglePayLogo from '../../Images/svgImages/googlePayLogo';
import MasterCard from '../../Images/svgImages/mastercard';
import Visa from '../../Images/svgImages/visa';
import styles from './styles';

const X_CONSTANT = 0;
const Y_START = y(20);
export default class CarpoolHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            starCount1: 0,//put the drivers rating here
            starCount2: 0,
            starCount3: 0,
            currenStarDisplay: 0,
            currentStarColor: '#FFFFFF',
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
                return Math.abs(gestureState.dx) >= 12 || Math.abs(gestureState.dy) >= 12;

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
        const data = JSON.parse(this.state.data.data);
        if (this.state.data.userRating)
            switch (data.steps) {
                case 1: {
                    if (this.state.data.userRating[data.key])
                        this.setState({ starCount1: this.state.data.userRating[data.key] })
                } break;
                case 2: {
                    if (this.state.data.userRating[data.start])
                        this.setState({ starCount1: this.state.data.userRating[data.start] })
                    if (this.state.data.userRating[data.end])
                        this.setState({ starCount2: this.state.data.userRating[data.end] })
                } break;
                case 3: {
                    if (this.state.data.userRating[data.start])
                        this.setState({ starCount1: this.state.data.userRating[data.start] })
                    if (this.state.data.userRating[data.middle])
                        this.setState({ starCount2: this.state.data.userRating[data.middle] })
                    if (this.state.data.userRating[data.end])
                        this.setState({ starCount3: this.state.data.userRating[data.end] })
                } break;
            }
    }
    hideRating() {
        Animated.spring(this.ratingzIndex, {
            toValue: -1,
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    }
    showRating(position) {
        switch (position) {
            case 1: {
                this.setState({ currenStarDisplay: this.state.starCount1, currentStarColor: colors.GREEN },
                    () => {
                        Animated.spring(this.ratingzIndex, {
                            toValue: 2,
                            bounciness: 0,
                            useNativeDriver: false,
                        }).start();
                    });
            } break;
            case 2: {
                this.setState({ currenStarDisplay: this.state.starCount2, currentStarColor: colors.BLUE },
                    () => {
                        Animated.spring(this.ratingzIndex, {
                            toValue: 2,
                            bounciness: 0,
                            useNativeDriver: false,
                        }).start();
                    });
            } break;
            case 3: {
                this.setState({ currenStarDisplay: this.state.starCount3, currentStarColor: colors.PURPLE },
                    () => {
                        Animated.spring(this.ratingzIndex, {
                            toValue: 2,
                            bounciness: 0,
                            useNativeDriver: false,
                        }).start();
                    });
            } break;
        }
    }
    onStarRatingPress(rating) {
        let driver1ID, driver2ID, driver3ID;
        const data = JSON.parse(this.state.data.data);
        switch (data.steps) {
            case 1: {
                driver1ID = data.key;
            } break;
            case 2: {
                driver1ID = data.start;
                driver2ID = data.end;
            } break;
            case 3: {
                driver1ID = data.start;
                driver2ID = data.middle;
                driver3ID = data.end;
            } break;
        }
        switch (this.state.currentStarColor) {
            case colors.GREEN: {
                carpoolRatingHandler(rating, this.state.userID, driver1ID, this.state.historyRef);
                let newData = this.state.data;
                newData.userRating ?
                    newData.userRating[driver1ID] = rating :
                    newData.userRating = { [driver1ID]: rating };
                this.setState({
                    starCount1: rating,
                    currenStarDisplay: rating,
                    data: newData,
                });
                setTimeout(() => { this.hideRating() }, 500)
            } break;
            case colors.BLUE: {
                carpoolRatingHandler(rating, this.state.userID, driver2ID, this.state.historyRef);
                let newData = this.state.data;
                newData.userRating ?
                    newData.userRating[driver2ID] = rating :
                    newData.userRating = { [driver2ID]: rating };
                this.setState({
                    starCount2: rating,
                    currenStarDisplay: rating,
                    data: newData,
                });
                setTimeout(() => { this.hideRating() }, 500)
            } break;
            case colors.PURPLE: {
                carpoolRatingHandler(rating, this.state.userID, driver3ID, this.state.historyRef);
                let newData = this.state.data;
                newData.userRating ?
                    newData.userRating[driver3ID] = rating :
                    newData.userRating = { [driver3ID]: rating };
                this.setState({
                    starCount3: rating,
                    currenStarDisplay: rating,
                    data: newData,
                });
                setTimeout(() => { this.hideRating() }, 500)
            } break;
        }
    }
    render() {

        let tripBreakdown = <></>;

        const data = JSON.parse(this.state.data.data);
        const mainData = this.state.data;
        const firstRating = (
            <Animated.View style={[styles.rating, { zIndex: this.ratingzIndex, backgroundColor: 'rgba(152, 151, 151, 0.7)', }]}>
                <TouchableOpacity onPress={this.hideRating} style={styles.rating}></TouchableOpacity>
                <StarRating
                    disabled={false}
                    maxStars={5}
                    rating={this.state.currenStarDisplay ? this.state.currenStarDisplay : 0}
                    fullStarColor={this.state.currentStarColor}
                    emptyStarColor={this.state.currentStarColor}
                    starSize={y(60)}
                    selectedStar={(rating) => this.onStarRatingPress(rating)}
                />
            </Animated.View>
        );

        switch (data.steps) {
            case 1: {
                totalDistance = data.firstDistance;
                polylines = (
                    <>
                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }}//TRIP WE ARE JOINING
                        >
                            <Icon__ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>
                        <Polyline
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREEN}
                            strokeWidth={2}
                        //interval={10}
                        />
                        <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}>
                            <Icon__ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>

                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                    </>
                );
                tripBreakdown =
                    (<View style={{}}>
                        <TopCombiner
                            start={this.state.data.location.description}
                            time={`10:10 AM`}
                            distance={data.travelDetails.walkFromL.distance.value}
                            type={'history'}
                            position={1}
                            penOnPress={this.showRating}
                            starRating={this.state.starCount1}
                            driverKey={data.key}
                            data={this.state.data}
                        />
                        <View style={{ zIndex: 2 }}>
                            <CarpoolHistoryCard color={colors.GREEN} onPress={() => { }}
                                type={'history'}
                                disabled={true}
                                filler_time={`10:10 AM`}
                                stopA={data.travelDetails.stop1A}
                                stopB={data.travelDetails.stop1B}
                                start={this.state.data.location.description}
                                distance={data.firstDistance}
                                timeA={null}
                                timeB={null}
                                eta={null}
                                driver={this.state.data.driverDetails.drivers.driver1}
                                tripAccepted={this.state.tripAccepted}
                                mainID={data.key.substring(0, data.key.length - 6)}
                            />
                        </View>
                        <BottomCombiner end={this.state.data.destination.description} time={`10:10 AM`} distance={data.travelDetails.walkToD.distance.value} type={'history'} />
                    </View>);
            } break;
            case 2: {
                totalDistance = data.firstDistance + data.secondDistance;
                polylines = (
                    <>

                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }//TRIP WE ARE JOINING
                        }
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon__ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>
                        <Polyline
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREEN}
                            strokeWidth={2}
                        />
                        {(data.firstLeg[data.firstLeg.length - 1][0] != data.secondLeg[0][0] && data.firstLeg[data.firstLeg.length - 1][1] != data.secondLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}
                                style={{ zIndex: 0, elevation: 0 }}
                            >
                                <Icon__ name={'circle'} color={colors.GREEN} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.secondLeg[0][0], longitude: data.secondLeg[0][1] }}
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon__ name={'circle'} color={colors.BLUE} size={12} />
                        </Marker>
                        <Polyline
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.BLUE}
                            strokeWidth={2}
                        />
                        <Marker coordinate={{ latitude: data.secondLeg[data.secondLeg.length - 1][0], longitude: data.secondLeg[data.secondLeg.length - 1][1] }}
                            style={{ zIndex: 0, elevation: 0 }}
                        >
                            <Icon__ name={'circle'} color={colors.BLUE} size={12} />
                        </Marker>

                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk3.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                    </>
                );

                tripBreakdown =
                    (<View style={{}}>
                        <TopCombiner start={this.state.data.location.description} time={`10:10 AM`} distance={data.travelDetails.walkFromL.distance.value}
                            type={'history'}
                            position={1}
                            penOnPress={this.showRating}
                            starRating={this.state.starCount1}
                            driverKey={data.start}
                            data={this.state.data} />
                        <View style={{ zIndex: 2 }}>
                            <CarpoolHistoryCard
                                type={'history'}
                                color={colors.GREEN}
                                onPress={() => { }}
                                filler_time={`10:10 AM`}
                                stopA={data.travelDetails.stop1A}
                                stopB={data.travelDetails.stop1B}
                                start={this.state.data.location.description}
                                distance={data.firstDistance}
                                timeA={null}
                                timeB={null}
                                eta={null}
                                driver={this.state.data.driverDetails.drivers.driver1}
                                mainID={data.start.substring(0, data.start.length - 6)}

                            />
                        </View>
                        <MiddleCombiner start={this.state.data.location.description} distance={data.travelDetails.walk.distance.value}
                            type={'history'}
                            position={2}
                            penOnPress={this.showRating}
                            starRating={this.state.starCount2}
                            driverKey={data.end}
                            data={this.state.data} />
                        <View style={{ zIndex: 2 }}>
                            <CarpoolHistoryCard
                                type={'history'}
                                color={colors.BLUE}
                                onPress={() => { }}
                                filler_time={`10:10 AM`}
                                stopA={data.travelDetails.stop2A}
                                stopB={data.travelDetails.stop2B}
                                start={this.state.data.location.description}
                                distance={data.secondDistance}
                                timeA={null}
                                timeB={null}
                                eta={null}
                                driver={this.state.data.driverDetails.drivers.driver2}
                                mainID={data.end.substring(0, data.end.length - 6)}

                            />
                        </View>
                        <BottomCombiner end={this.state.data.destination.description} time={`10:10 AM`} distance={data.travelDetails.walkToD.distance.value} type={'history'} />
                    </View>);

            } break;
            case 3: {
                totalDistance = data.firstDistance + data.secondDistance + data.thirdDistance;
                polylines = (
                    <>
                        <Marker coordinate={{ latitude: data.firstLeg[0][0], longitude: data.firstLeg[0][1] }}//TRIP WE ARE JOINING
                        >
                            <Icon__ name={'circle'} color={colors.GREEN} size={12} />
                        </Marker>
                        <Polyline
                            coordinates={data.firstLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREEN}
                            strokeWidth={2}
                        />
                        {(data.firstLeg[data.firstLeg.length - 1][0] != data.secondLeg[0][0] && data.firstLeg[data.firstLeg.length - 1][1] != data.secondLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.firstLeg[data.firstLeg.length - 1][0], longitude: data.firstLeg[data.firstLeg.length - 1][1] }}>
                                <Icon__ name={'circle'} color={colors.GREEN} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.secondLeg[0][0], longitude: data.secondLeg[0][1] }}>
                            <Icon__ name={'circle'} color={colors.BLUE} size={12} />
                        </Marker>
                        <Polyline
                            coordinates={data.secondLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.BLUE}
                            strokeWidth={2}
                        />
                        {(data.secondLeg[data.secondLeg.length - 1][0] != data.thirdLeg[0][0] && data.secondLeg[data.secondLeg.length - 1][1] != data.thirdLeg[0][1]) ?
                            <Marker coordinate={{ latitude: data.secondLeg[data.secondLeg.length - 1][0], longitude: data.secondLeg[data.secondLeg.length - 1][1] }}>
                                <Icon__ name={'circle'} color={colors.BLUE} size={12} />
                            </Marker> : <></>}
                        <Marker coordinate={{ latitude: data.thirdLeg[0][0], longitude: data.thirdLeg[0][1] }}>
                            <Icon__ name={'circle'} color={colors.PURPLE} size={12} />
                        </Marker>
                        <Polyline
                            coordinates={data.thirdLeg.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.PURPLE}
                            strokeWidth={2}
                        />
                        <Marker coordinate={{ latitude: data.thirdLeg[data.thirdLeg.length - 1][0], longitude: data.thirdLeg[data.thirdLeg.length - 1][1] }}>
                            <Icon__ name={'circle'} color={colors.PURPLE} size={12} />
                        </Marker>


                        <Polyline //WALK POLYLINES
                            coordinates={data.walk1.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk2.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk3.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                        <Polyline
                            coordinates={data.walk4.map(value => {
                                return { latitude: value[0], longitude: value[1] }
                            })}
                            strokeColor={colors.GREY}
                            strokeWidth={2}
                            lineDashPattern={[20, 10]}
                        />
                    </>
                );
                tripBreakdown =
                    (<View style={{}}>
                        <TopCombiner start={this.state.data.location.description} time={`10:10 AM`} distance={data.travelDetails.walkFromL.distance.value}
                            type={'history'}
                            position={1}
                            penOnPress={this.showRating}
                            starRating={this.state.starCount1}
                            driverKey={data.start}
                            data={this.state.data}
                        />
                        <View style={{ zIndex: 2 }}>
                            <CarpoolHistoryCard
                                type={'history'}
                                color={colors.GREEN}
                                onPress={() => { }}
                                filler_time={`10:10 AM`}
                                stopA={data.travelDetails.stop1A}
                                stopB={data.travelDetails.stop1B}
                                start={this.state.data.location.description}
                                distance={data.firstDistance}
                                timeA={null}
                                timeB={null}
                                eta={null}
                                driver={this.state.data.driverDetails.drivers.driver1}
                                mainID={data.start.substring(0, data.start.length - 6)}

                            />
                        </View>
                        <MiddleCombiner start={this.state.data.location.description} distance={data.travelDetails.walk1.distance.value}
                            type={'history'}
                            position={2}
                            penOnPress={this.showRating}
                            starRating={this.state.starCount2}
                            driverKey={data.middle}
                            data={this.state.data} />
                        <View style={{ zIndex: 2 }}>
                            <CarpoolHistoryCard
                                type={'history'}
                                color={colors.BLUE}
                                onPress={() => { }}
                                filler_time={`10:10 AM`}
                                stopA={data.travelDetails.stop2A}
                                stopB={data.travelDetails.stop2B}
                                start={this.state.data.location.description}
                                distance={data.secondDistance}
                                timeA={null}
                                timeB={null}
                                eta={null}
                                driver={this.state.data.driverDetails.drivers.driver2}
                                mainID={data.middle.substring(0, data.middle.length - 6)}

                            />
                        </View>
                        <MiddleCombiner start={this.state.data.location.description} distance={data.travelDetails.walk2.distance.value}
                            type={'history'}
                            position={3}
                            penOnPress={this.showRating}
                            starRating={this.state.starCount3}
                            driverKey={data.end}
                            data={this.state.data} />
                        <View style={{ zIndex: 2 }}>
                            <CarpoolHistoryCard
                                color={colors.PURPLE}
                                type={'history'}
                                onPress={() => { }}
                                filler_time={`10:10 AM`}
                                stopA={data.travelDetails.stop3A}
                                stopB={data.travelDetails.stop3B}
                                start={this.state.data.location.description}
                                distance={data.thirdDistance}
                                timeA={null}
                                timeB={null}
                                eta={null}
                                driver={this.state.data.driverDetails.drivers.driver3}
                                mainID={data.end.substring(0, data.end.length - 6)}
                            />
                        </View>
                        <BottomCombiner end={this.state.data.destination.description} time={`10:10 AM`} distance={data.travelDetails.walkToD.distance.value} type={'history'} />
                    </View>);
            } break;
        };

        let paymentMethod = <></>;

        switch (mainData.paymentMethod) {
            case 'visa': {
                paymentMethod = <View style={{ width: '100%', flexDirection: 'row', }}>
                    <View style={styles.visa}><Visa height={'100%'} width={'100%'} /></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                        <Text style={[styles.cardNumber, { left: -x(5) }]}> XXXX XXXX XXXX {mainData.card.last4}</Text>
                        <Text style={styles.cardNumber}> ${mainData.cost.total}</Text>
                    </View>
                </View>;
            } break;
            case 'mastercard': {
                paymentMethod = <View style={{ width: '100%', flexDirection: 'row', }}>
                    <View style={styles.visa}><MasterCard height={'100%'} width={'100%'} /></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                        <Text style={[styles.cardNumber, { left: -x(5) }]}> XXXX XXXX XXXX {mainData.card.last4}</Text>
                        <Text style={styles.cardNumber}> ${mainData.cost.total}</Text>
                    </View>
                </View>;
            } break;
            case 'default': {
                paymentMethod = <View style={{ width: '100%', flexDirection: 'row', }}>
                    <View style={styles.visa_}><GenericPaymentCard height={'100%'} width={'100%'} /></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                        <Text style={[styles.cardNumber, { left: -x(5) }]}> XXXX XXXX XXXX {mainData.card.last4}</Text>
                        <Text style={styles.cardNumber}> ${mainData.cost.total}</Text>
                    </View>
                </View>;
            } break;
            case 'applePay': {
                paymentMethod = <View style={{ width: '100%', flexDirection: 'row', }}>
                    <View style={styles.applePay}><ApplePayLogo height={'100%'} width={'100%'} /></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                        <Text style={[styles.cardNumber, { left: -x(5) }]}> Apple Pay</Text>
                        <Text style={styles.cardNumber}> ${mainData.cost.total}</Text>
                    </View>
                </View>;
            } break;
            case 'googlePay': {
                paymentMethod = <View style={{ width: '100%', flexDirection: 'row', }}>
                    <View style={styles.googlePay}><GooglePayLogo height={'100%'} width={'100%'} /></View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                        <Text style={[styles.cardNumber, { left: -x(5) }]}> Google Pay</Text>
                        <Text style={styles.cardNumber}> ${mainData.cost.total}</Text>
                    </View>
                </View>;
            } break;
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
                <Animated.View style={[this.position.getLayout(), { position: 'relative', }]} {...this.panResponder.panHandlers}>

                    <View style={styles.tripContainer}
                        onLayout={(event) => {
                            this.TOP_OF_TRIPS = -event.nativeEvent.layout.height + (height / 1.5);
                        }}>

                        <View style={styles.mapGroup}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313), alignSelf: 'center' }]}>Trip Details</Text>
                            <View style={[styles.travel, { top: y(58) }]}>
                                <Icon_ name={'map-pin'} size={y(10)} color={colors.GREEN} />
                                <Text numberOfLines={3} style={[styles.firstLayer, { color: '#000000', fontSize: y(12, true), marginLeft: x(5), width: x(300), }]}>{this.state.data.location.description}</Text>
                            </View>
                            <View style={styles.LtoD_Divider}><DashedDivider borderColor={colors.GREEN} height={y(dimensionAssert() ? 43 : 30)} width={0} borderWidth={0.5} borderRadius={0} /></View>
                            <View style={[styles.travel, { top: y(dimensionAssert() ? 120 : 105) }]}>
                                <Icon_ name={'map-pin'} size={y(10)} color={colors.GREEN} />
                                <Text numberOfLines={3} style={[styles.firstLayer, { color: '#000000', fontSize: y(12, true), marginLeft: x(5), width: x(300), }]}>{this.state.data.destination.description}</Text>
                            </View>


                            <View style={[styles.calendar]}>
                                <Text style={[styles.firstLayer, { color: colors.GREEN, fontSize: y(14, true), marginRight: x(5), }]}>{this.state.date}</Text>
                                <Icon_ name={'calendar'} size={y(13)} color={colors.GREEN} />
                            </View>

                            <MapView
                                ref={(ref) => this.map = ref}
                                onMapReady={() => {
                                    this.map.fitToElements(true)
                                }}
                                provider={PROVIDER_GOOGLE}
                                style={[styles.maps,]}
                                customMapStyle={MapStyle}
                                //liteMode={true}
                                showsUserLocation={false}
                                //zoomEnabled={false}
                                pitchEnabled={false}
                                showsCompass={false}
                                showsScale={false}
                                scrollEnabled={false}
                                rotateEnabled={false}
                            >


                                <Marker coordinate={{ latitude: this.state.data.location.latitude, longitude: this.state.data.location.longitude }} style={{ zIndex: 1 }}>
                                    <Icon__ name={'circle'} color={colors.GREY} size={y(15)} />
                                </Marker>
                                {polylines}
                                <Marker coordinate={{ latitude: this.state.data.destination.latitude, longitude: this.state.data.destination.longitude }} style={{ zIndex: 1 }}>
                                    <SvgComponent />
                                </Marker>

                            </MapView>
                        </View>
                        {this.state.data.status == 'CANCELLED' ?
                            <View style={styles.tripDetails}>
                                <Text style={[styles.tripTitle, { marginVertical: y(14), width: x(313), color: '#FF0000', fontSize: y(16, true) }]}>This trip was cancelled</Text>
                            </View>
                            : <></>}

                        <View style={styles.tripDetails}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313) }]}>Cost Analysis</Text>
                            <View style={[styles.spaceout, { marginTop: y(19) }]}>
                                <Text style={[styles.firstLayer, {}]}>Trip distance</Text>
                                <Text style={[styles.firstLayer, {}]}>{(mainData.cost.totalKilometers).toFixed(2)} km</Text>
                            </View>

                            <View style={[styles.spaceout, { marginTop: y(11.7) }]}>
                                <Text style={[styles.firstLayer, {}]}>Cost per km</Text>
                                <Text style={[styles.firstLayer, {}]}>${(mainData.cost.costPerKM).toFixed(2)}</Text>
                            </View>
                            {mainData.perchKms ?
                                <>
                                    <View style={[styles.spaceout, { marginTop: y(11.7) }]}>
                                        <Text style={[styles.firstLayer, {}]}>Perch Kilometers used</Text>
                                        <Text style={[styles.firstLayer, {}]}>{(mainData.perchKms.amount).toFixed(2)} km</Text>
                                    </View>
                                </> :
                                <></>
                            }

                            {/* <View style={[styles.spaceout, { marginTop: y(11.7) }]}>
                                <Text style={[styles.firstLayer, {}]}>Tax</Text>
                                <Text style={[styles.firstLayer, {}]}>$ 2.10</Text>
                            </View> */}

                            <View style={[styles.divider, { marginTop: y(16.8) }]}>
                                <Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                            </View>

                            <View style={[styles.spaceout, { marginVertical: y(10) }]}>
                                <Text style={[styles.total, {}]}>TOTAL</Text>
                                <Text style={[styles.total, {}]}>${mainData.cost ? mainData.cost.total : '--'}</Text>
                            </View>

                            <View style={[styles.divider, {}]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                            <Text style={[styles.total, { marginTop: y(15.7), fontSize: y(18, true), color: '#000000', fontFamily: 'Gilroy-Regular', width: x(313) }]}>PAYMENT METHOD</Text>

                            <View style={[styles.payment, { marginBottom: y(30) }]}>
                                {paymentMethod}
                            </View>
                        </View>

                        <View style={styles.help}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313) }]}>Help</Text>

                            <TouchableOpacity style={[styles.contactUsContainer, { marginTop: y(20), marginBottom: y(16) }]} onPress={() => { this.props.navigation.navigate('ContactUs') }}>
                                <Text style={[styles.firstLayer,]}>Contact Us</Text>
                                <Icon name={'ios-arrow-forward'} color={'#C7C7C7'} size={y(20)} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.tripBreakdown, { paddingBottom: y(34) }]}>
                            <Text style={[styles.tripTitle, { marginTop: y(14), width: x(313), marginBottom: y(34) }]}>Trip Breakdown</Text>
                            {tripBreakdown}
                        </View>

                    </View>
                </Animated.View>

            </View>
        );
    }
}

function SvgComponent() {
    return (
        <Svg width={16} height={24} viewBox="0 0 14 20" fill={colors.GREY}>
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

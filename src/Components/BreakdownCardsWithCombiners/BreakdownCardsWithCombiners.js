import React from 'react';
import styles from './styles';
import { View, Text, Dimensions, TouchableOpacity, Image, StatusBar, Platform, TouchableWithoutFeedback } from 'react-native';
import MapPin from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome5';
import StarRating from 'react-native-star-rating';
import Divider from '../Divider/Divider';
import { MaterialIndicator } from 'react-native-indicators';
import Icon_Dash from 'react-native-vector-icons/Octicons';
import DashedDivider from '../../Components/DashedDivider/DashedDivider';
import { height, width, x, y, dimensionAssert } from '../../Functions/Functions';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];
export class DriverProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mainID: this.props.driver.mainID,
            url: null
        }

    }
    componentDidMount() {
        this.setImage();
    }
    setImage = () => {
        database().ref(`userImage/${this.state.mainID}`).once('value', snap => {
            storage().ref(`${snap.val()}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) });
        }).catch(error => { console.log(error.message) });
    };
    render() {
        return (
            <View style={styles.driverCentralize_}>
                <View style={styles.nextDriverContainer}>
                    <Text style={styles.rideConfirmedText}>{this.props.style == 'carpool' ? this.props.now ? 'NEXT DRIVER' : 'RIDE CONFIRMED' : 'RIDE CONFIRMED'}</Text>
                </View>
                <View style={styles.driverCentralize}>


                    <View style={styles.profileConatainer}>

                        <View style={[styles.profileFrame, this.state.url ? { borderWidth: 0 } : {}]}>
                            {this.state.url ?
                                <Image
                                    source={{ uri: this.state.url }}
                                    resizeMode={'contain'}
                                    style={{
                                        flex: 1,
                                        height: y(dimensionAssert() ? 125 : 102.72),
                                        width: y(dimensionAssert() ? 125 : 102.72),
                                    }} /> :
                                <></>}
                        </View>
                        <View>
                            <View style={{ width: x(145) }}>
                                <Text style={styles.driverName}>{this.props.driver ? this.props.driver.name : ''}</Text>
                            </View>

                            <Text style={styles.driverTripNumber}>{`${this.props.driver ? this.props.driver.history.displayTripNumber : '0'} trips`}</Text>
                            <View style={styles.star}>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={this.props.driver ? this.props.driver.history.rating : 0}
                                    fullStarColor={'#FFAA00'}
                                    emptyStarColor={'#FFAA00'}
                                    starSize={y(13)}
                                />
                            </View>

                            {this.props.style == 'carpool' && this.props.eta ?
                                <View style={[styles.timer,]}>
                                    <Text style={[styles.bubbleText, { fontSize: y(19, true), color: this.props.color }]}>{this.props.eta}</Text>
                                    <Text style={[styles.bubbleText, { fontSize: y(12, true), color: this.props.color }]}>mins</Text>
                                </View> : <></>}
                        </View>
                    </View>
                </View>

            </View>
        )
    }
};
export class CarpoolHistoryCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mainID: this.props.mainID,
            url: null
        }
    }
    componentDidMount() {
        this.setImage();
    }
    setImage = () => {
        database().ref(`userImage/${this.state.mainID}`).once('value', snap => {
            storage().ref(`${snap.val()}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) });
        }).catch(error => { console.log(error.message) });
    };
    render() {
        let distance = this.props.distance;
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} km` :
            distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} m`;
        return (
            <View style={styles.cardCentralize}>
                <View style={[styles.card,]}>
                    <View style={[styles.dp, this.state.url ? { borderWidth: 0 } : {}]}>
                        {this.state.url ?
                            <Image
                                source={{ uri: this.state.url }}
                                resizeMode={'contain'}
                                style={{
                                    flex: 1,
                                    height: x(55),
                                    width: x(55),
                                }} /> :
                            <></>}
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>{this.props.filler_time}</Text>

                        </View>

                        <View style={[styles.middleAligner, { opacity: 0 }]}>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                            <View ><DashedDivider borderColor={'#000000'} height={y(44)} width={0} borderWidth={1} borderRadius={0} /></View>
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <Text numberOfLines={1} style={[styles.combinerText, { opacity: 0 }]}>{this.props.start}</Text>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={[styles.name, { color: this.props.color }]}>{this.props.driver.name}</Text>

                            </View>
                            <Text style={[styles.car, { color: this.props.color }]}>{`${this.props.driver.carDetails.color} ${this.props.driver.carDetails.year} ${this.props.driver.carDetails.make} ${this.props.driver.carDetails.model}`}</Text>
                            <Text style={[styles.car, { color: this.props.color }]}>{this.props.driver.carDetails.plateNumber}</Text>

                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', paddingVertical: y(10) }}>
                        <View style={styles.middleAligner}>
                            <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>{this.props.filler_time}</Text>
                            <View style={{ height: y(32), justifyContent: 'center' }}><Icon name={'car'} size={y(20)} color={'#000000'} /></View>
                            <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>{this.props.filler_time}</Text>
                        </View>

                        <View style={styles.middleAligner}>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                            <View><Divider height={y(32)} width={1} borderRadius={3} borderColor={this.props.color} borderWidth={1} /></View>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <Text style={styles.combinerText}>{this.props.stopA}</Text>
                            <View style={{ height: y(32), justifyContent: 'center' }}><Text style={styles.distanceText}>{distance}</Text></View>
                            <Text style={styles.combinerText}>{this.props.stopB}</Text>
                        </View>
                    </View>

                </View>
            </View>
        );
    }
}

export class Card extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    };

    render() {
        return (
            <View style={styles.cardCentralize}>
                <TouchableWithoutFeedback onPress={() => {
                    this.setState({ loading: true }, () => { this.props.onPress(); });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 1000)
                }}>
                    <View style={[styles.card,]}>
                        {this.state.loading ?
                            <View style={styles.loader}>
                                <MaterialIndicator color={GREEN} size={x(30)} />
                            </View> :
                            <></>}
                        <View style={{ flexDirection: 'row' }}>
                            <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                                <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>{this.props.filler_time}</Text>
                                <View style={[styles.bubble, { backgroundColor: this.props.color }]}>
                                    {this.props.eta ?
                                        <>
                                            <Text style={[styles.bubbleText, { fontSize: y(19, true) }]}>{this.props.eta}</Text>
                                            <Text style={[styles.bubbleText, { fontSize: y(12, true) }]}>mins</Text>
                                        </> :
                                        <Icon_Dash color={WHITE} size={y(30)} name={'dash'} />
                                    }
                                </View>
                            </View>

                            <View style={[styles.middleAligner, { opacity: 0 }]}>
                                <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                                <View style={{ left: x(-1.1) }}><DashedDivider borderColor={'#000000'} height={y(44)} width={0} borderWidth={1} borderRadius={0} /></View>
                            </View>

                            <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                                <Text numberOfLines={1} style={[styles.combinerText, { opacity: 0 }]}>{this.props.start}</Text>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={[styles.name, { color: this.props.color }]}>
                                        {this.props.driver ?
                                            (this.props.tripAccepted ?
                                                this.props.driver.name :
                                                this.props.driver.carDetails.color + ' ' + this.props.driver.carDetails.make + ' ' + this.props.driver.carDetails.model
                                            )
                                            : ''}
                                    </Text>

                                    {/* <View style={styles.seatLeft}>
                                        <Text style={[styles.seatNumber, { color: this.props.color, }]}>2</Text>
                                        <Text style={[styles.seatNumber, { color: this.props.color, fontSize: y(12, true) }]}>{'seats'}</Text>
                                    </View> */}

                                </View>
                                {this.props.tripAccepted ?
                                    <Text style={[styles.car, { color: this.props.color }]}>{this.props.driver ? this.props.driver.carDetails.color + ' ' + this.props.driver.carDetails.make + ' ' + this.props.driver.carDetails.model : ''}</Text> :
                                    <></>
                                }
                                <Text style={[styles.car, { color: this.props.color }]}>{this.props.driver ? this.props.driver.carDetails.plateNumber : ''}</Text>

                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', paddingVertical: y(10) }}>
                            <View style={styles.middleAligner}>
                                <Text style={styles.combinerTime}>{this.props.timeA}</Text>
                                <View style={{ height: y(32), justifyContent: 'center' }}><Icon name={'car'} size={y(20)} color={'#000000'} /></View>
                                <Text style={styles.combinerTime}>{this.props.timeB}</Text>
                            </View>

                            <View style={styles.middleAligner}>
                                <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                                <View><Divider height={y(32)} width={1} borderRadius={3} borderColor={this.props.color} borderWidth={1} /></View>
                                <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                            </View>

                            <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                                <Text style={styles.combinerText}>{this.props.stopA}</Text>
                                <View style={{ height: y(32), justifyContent: 'center' }}><Text style={styles.distanceText}>{`${(this.props.distance / 1000).toFixed(2)} km`}</Text></View>
                                <Text style={styles.combinerText}>{this.props.stopB}</Text>
                            </View>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
};
export class TopCombiner extends React.Component {
    constructor() {
        super();

        this.state = {
            divider: null,
        }
    }

    render() {
        if (this.props.type == 'history') {
            let distance = this.props.distance;
            distance > 100 ?
                distance = `${(distance / 1000).toFixed(1)} km` :
                distance = `${(distance).toFixed(distance != 0 ? 0 : 0)} m`;

            let text = `Rate driver`, disabled = false;

            if (this.props.data.userRating)
                if (this.props.data.userRating[this.props.driverKey]) {
                    text = `You rated ${this.props.data.userRating[this.props.driverKey]}/5`;
                    disabled = true;
                }

            return (//HISTORY VERSION
                <View style={styles.cardCentralize}>

                    <View style={styles.topCombiner}
                        onLayout={(event) => {
                            this.setState({ divider: event.nativeEvent.layout.height });
                        }}>

                        <View style={styles.middleAligner}>
                            <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>{this.props.time}</Text>
                            <View style={styles.middle}><Icon name={'walking'} size={y(20)} color={'#000000'} /></View>
                        </View>

                        <View style={styles.middleAligner}>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                            {this.state.divider ?
                                <View style={{ top: y(11), left: x(dimensionAssert() ? 11 : 11.5), position: 'absolute' }}><DashedDivider borderColor={'#000000'} height={this.state.divider} width={0} borderWidth={1} borderRadius={0} /></View>
                                : <></>}
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <Text style={styles.combinerText}>{this.props.start}</Text>
                            <View style={{ height: y(44), justifyContent: 'center' }}><Text style={styles.distanceText}>{distance}</Text></View>
                        </View>

                        <View style={[styles.historyRating,]}>
                            <Text style={[styles.youRated, { color: '#4DB748', fontSize: y(12, true), marginRight: x(10) }]}>{text}</Text>
                            <TouchableOpacity onPress={() => { this.props.penOnPress(this.props.position) }} disabled={disabled} style={{ flexDirection: 'row' }}>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={this.props.starRating}
                                    fullStarColor={'#4DB748'}
                                    emptyStarColor={'#4DB748'}
                                    starSize={y(12)}
                                />
                                {
                                    disabled == false ?
                                        <Icon name={'pen'} size={13} style={{ opacity: 0.5 }} />
                                        :
                                        <></>
                                }
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            );
        }
        else
            return (//DISPLAY VERSION
                <View style={styles.cardCentralize}>
                    <View style={styles.topCombiner}
                        onLayout={(event) => {
                            this.setState({ divider: event.nativeEvent.layout.height });
                        }}>

                        <View style={styles.middleAligner}>
                            <Text style={styles.combinerTime}>{this.props.time}</Text>
                            <View style={styles.middle}><Icon name={'walking'} size={y(20)} color={'#000000'} /></View>
                        </View>

                        <View style={styles.middleAligner}>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                            {this.state.divider ?
                                <View style={{ top: y(11), left: x(dimensionAssert() ? 11 : 11.5), position: 'absolute' }}><DashedDivider borderColor={'#000000'} height={this.state.divider} width={0} borderWidth={1} borderRadius={0} /></View>
                                : <></>}
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <Text style={styles.combinerText}>{this.props.start} </Text>
                            <View style={{ height: y(44), justifyContent: 'center' }}><Text style={styles.distanceText}>{`${(this.props.distance).toFixed(0)} m`}</Text></View>
                        </View>

                    </View>
                </View>
            );
    }
};
export class MiddleCombiner extends React.Component {
    constructor() {
        super();

        this.state = {
            divider: null,
        }
    }
    render() {
        if (this.props.type == 'history') {
            let distance = this.props.distance;
            distance > 100 ?
                distance = `${(distance / 1000).toFixed(1)} km` :
                distance = `${(distance).toFixed(distance != 0 ? 0 : 0)} m`;

            let text = `Rate driver`, disabled = false;

            if (this.props.data.userRating)
                if (this.props.data.userRating[this.props.driverKey]) {
                    text = `You rated ${this.props.data.userRating[this.props.driverKey]}/5`;
                    disabled = true;
                }


            let color;
            if (this.props.position === 2)
                color = '#1970A7';
            else if (this.props.position === 3)
                color = '#A031AF';

            return (//HISTORY VERSION
                <View style={styles.cardCentralize}>
                    <View style={[styles.middleCombiner, { top: y(-10) }]}>

                        <View style={styles.middleAligner}>
                            <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>10:11 AM</Text>
                            <View style={styles.middle}><Icon name={'walking'} size={y(20)} color={'#000000'} /></View>
                        </View>

                        <View style={styles.middleAligner}>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} style={{ opacity: 0 }} />
                            <View style={{ left: x(-1.1) }}><DashedDivider borderColor={'#000000'} height={y(44)} width={0} borderWidth={1} borderRadius={0} /></View>
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <Text numberOfLines={1} style={[styles.combinerText, { opacity: 0 }]}>University of Alberta</Text>
                            <View style={{ height: y(44), justifyContent: 'center' }}><Text style={styles.distanceText}>100 m</Text></View>
                        </View>

                        <View style={[styles.historyRating, { bottom: y(-10) }]}>
                            <Text style={[styles.youRated, { color: color, fontSize: y(12, true), marginRight: x(5) }]}>{text}</Text>
                            <TouchableOpacity onPress={() => { this.props.penOnPress(this.props.position) }} disabled={disabled} style={{ flexDirection: 'row' }}>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={this.props.starRating}
                                    fullStarColor={color}
                                    emptyStarColor={color}
                                    starSize={y(12)}
                                />
                                {disabled == false ?

                                    <Icon name={'pen'} size={13} style={{ opacity: 0.5 }} />
                                    :
                                    <></>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }
        else
            return (//DISPLAY VERSION
                <View style={styles.cardCentralize}>
                    <View style={[styles.middleCombiner, { top: y(-10) }]}>

                        <View style={styles.middleAligner}>
                            <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>10:11 AM</Text>
                            <View style={styles.middle}><Icon name={'walking'} size={y(20)} color={'#000000'} /></View>
                        </View>

                        <View style={styles.middleAligner}>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} style={{ opacity: 0 }} />
                            <View style={{ left: x(-1.1) }}><DashedDivider borderColor={'#000000'} height={y(44)} width={0} borderWidth={1} borderRadius={0} /></View>
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <Text numberOfLines={1} style={[styles.combinerText, { opacity: 0 }]}>{this.props.start}</Text>
                            <View style={{ height: y(44), justifyContent: 'center' }}><Text style={styles.distanceText}>{`${(this.props.distance).toFixed(0)} m`}</Text></View>
                        </View>
                    </View>
                </View>
            );
    }
};
export class BottomCombiner extends React.Component {
    constructor() {
        super();

        this.state = {
            divider: null,
        }
    }
    render() {
        let distance = this.props.distance;
        distance > 100 ?
            distance = `${(distance / 1000).toFixed(1)} km` :
            distance = `${(distance).toFixed(distance != 0 ? 0 : 0)} m`;
        if (this.props.type === 'history') {
            return (//HISTORY VERSION
                <View style={styles.cardCentralize}>
                    <View style={styles.topCombiner}
                        onLayout={(event) => {
                            this.setState({ divider: event.nativeEvent.layout.height });
                        }}>

                        <View style={styles.middleAligner}>
                            <View style={styles.middle}><Icon name={'walking'} size={y(20)} color={'#000000'} /></View>
                            <Text numberOfLines={1} style={[styles.combinerTime, { opacity: 0 }]}>{this.props.time}</Text>
                        </View>

                        <View style={[styles.middleAligner, {}]}>
                            <View style={{ left: x(-1.1) }}><DashedDivider borderColor={'#000000'} height={y(dimensionAssert() ? 40 : 44)} width={0} borderWidth={1} borderRadius={0} /></View>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} style={{ marginTop: x(dimensionAssert() ? 3 : 3) }} />
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <View style={{ height: y(44), justifyContent: 'center' }}><Text style={styles.distanceText}>{distance}</Text></View>
                            <Text style={[styles.combinerText, { marginTop: x(dimensionAssert() ? 0 : 3) }]}>{this.props.end}</Text>
                        </View>

                    </View>
                </View>
            );
        }
        else
            return (//DISPLAY VERSION
                <View style={styles.cardCentralize}>
                    <View style={styles.topCombiner}>

                        <View style={styles.middleAligner}>
                            <View style={styles.middle}><Icon name={'walking'} size={y(20)} color={'#000000'} /></View>
                            <Text style={styles.combinerTime}>{this.props.time}</Text>
                        </View>

                        <View style={styles.middleAligner}>
                            <View style={{ left: x(-1.1) }}><DashedDivider borderColor={'#000000'} height={y(dimensionAssert() ? 40 : 44)} width={0} borderWidth={1} borderRadius={0} /></View>
                            <MapPin name={'map-pin'} size={y(13)} color={'#000000'} />
                        </View>

                        <View style={[styles.middleAligner, { alignItems: 'flex-start' }]}>
                            <View style={{ height: y(44), justifyContent: 'center' }}><Text style={styles.distanceText}>{`${(this.props.distance).toFixed(0)} m`}</Text></View>
                            <Text style={styles.combinerText}>{this.props.end}</Text>
                        </View>

                    </View>
                </View>
            );
    }
};

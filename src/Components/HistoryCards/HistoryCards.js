import React from 'react';
import styles from './styles';
import { View, Text, Dimensions, TouchableOpacity, Animated, Platform, StatusBar, Image, TouchableWithoutFeedback } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion, Polyline } from 'react-native-maps';
import Svg, { Path, G } from "react-native-svg";
import Icon from 'react-native-vector-icons/Feather';
import StarRating from 'react-native-star-rating';
import MapStyle from '../../Components/MapStyle/MapStyle.json';
import DashedDivider from '../../Components/DashedDivider/DashedDivider';
import Divider from '../../Components/Divider/Divider';
import Icon__ from 'react-native-vector-icons/FontAwesome';
import Icon_ from 'react-native-vector-icons/FontAwesome';
import { polylineLenght, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import { MaterialIndicator } from 'react-native-indicators';

import * as turf from '@turf/turf';//for encoding polylines
const polyline = require('@mapbox/polyline');// for decoding polylines


const [GOLD, BLACK] = ['#FFC107', '#000000'];
const [GREEN, BLUE, PURPLE, GREEN_, BLUE_, PURPLE_, GREY, WHITE, RED, GREENMAKER, YELLOW] = ['#4DB748', '#1970A7', '#A031AF', 'rgba(77, 183, 72, 0.3)', 'rgba(25, 112, 167, 0.3)', 'rgba(160, 49, 175, 0.3)', '#403D3D', '#FFFFFF', '#FF0000', '#136009', '#F7F70B'];
export class CarpoolCard extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
        }
    }
    render() {
        if (this.props.data.data) {
            const data = JSON.parse(this.props.data.data);
            const mainData=this.props.data;
            let tripBreakdown = <></>;
            const WIDTH_ = x(313);
            let totalDistance = 0;
            switch (data.steps) {
                case 1: {
                    totalDistance = data.firstDistance;
                    tripBreakdown = <View style={{ height: y(20), backgroundColor: GREEN, width: WIDTH_, borderRadius: 6 }}></View>
                } break;
                case 2: {
                    totalDistance = data.firstDistance + data.secondDistance;
                    tripBreakdown = <>
                        <View style={{ height: y(20), backgroundColor: GREEN, width: (data.firstDistance / totalDistance) * WIDTH_, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}></View>
                        <View style={{ height: y(20), backgroundColor: BLUE, width: (1 - (data.firstDistance / totalDistance)) * WIDTH_, borderTopRightRadius: 6, borderBottomRightRadius: 6 }}></View>
                    </>
                } break;
                case 3: {
                    totalDistance = data.firstDistance + data.secondDistance + data.thirdDistance;
                    tripBreakdown = <>
                        <View style={{ height: y(20), backgroundColor: GREEN, width: (data.firstDistance / totalDistance) * WIDTH_, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}></View>
                        <View style={{ height: y(20), backgroundColor: BLUE, width: (data.secondDistance / totalDistance) * WIDTH_, }}></View>
                        <View style={{ height: y(20), backgroundColor: PURPLE, width: (1 - ((data.firstDistance + data.secondDistance) / totalDistance)) * WIDTH_, borderTopRightRadius: 6, borderBottomRightRadius: 6 }}></View>
                    </>

                } break;
            };
            if (this.props.data.status == 'CANCELLED')
                tripBreakdown = <View style={{ height: y(20), backgroundColor: RED, width: WIDTH_, borderRadius: 6 }}></View>;
            totalDistance > 100 ?
                totalDistance = `${(totalDistance / 1000).toFixed(1)} km` :
                totalDistance = `${(totalDistance).toFixed(totalDistance != 0 ? 1 : 0)} m`;
            return (
                <View style={styles.container}>
                    <TouchableOpacity style={styles.card} onPress={() => {

                        this.setState({ loading: true }, () => {
                            setTimeout(() => {
                                this.props.navigation.navigate('CarpoolHistory', {
                                    date: this.props.date,
                                    data: this.props.data,
                                    historyRef: this.props.historyRef,
                                    userID: this.props.userID,
                                    loadResults: () => { this.props.loadResults() }
                                })
                            }, 100);

                            setTimeout(() => {
                                this.setState({ loading: false })
                            }, 2000);
                        })
                    }}>
                        <>
                            {this.state.loading ?
                                <View style={styles.loader}>
                                    <MaterialIndicator color={GREEN} size={x(30)} />
                                </View> :
                                <></>}
                            <View style={[styles.spaceView, { top: y(dimensionAssert() ? 3 : 6), marginTop: y(6) }]}>
                                <Text style={styles.description}>{`${data.steps} trip ride`}</Text>
                                <Text style={styles.date}>{this.props.date}</Text>
                            </View>

                            <View style={[styles.maps, {}]}  //CANCELED TRIPS GET RED NOT GREEN, ONLY COMPLETED TRIPS ARE GREEN
                            >{tripBreakdown}</View>

                            <View style={styles.travelContainer}>
                                <View style={[styles.travel,]}>
                                    <Icon name={'map-pin'} size={y(10)} color={GREEN} />
                                    <Text numberOfLines={1} style={[styles.firstLayer,]}>{this.props.data.location.description}</Text>
                                </View>
                                <View style={styles.LtoD_Divider}><DashedDivider borderColor={GREEN} height={y(15)} width={0} borderWidth={0.5} borderRadius={0} /></View>
                                <View style={[styles.travel, { top: y(12.4) }]}>
                                    <Icon name={'map-pin'} size={y(10)} color={GREEN} />
                                    <Text numberOfLines={1} style={[styles.firstLayer,]}>{this.props.data.destination.description} </Text>
                                </View>
                            </View>
                            <View style={[styles.divider, {}]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                            <View style={[styles.spaceView, { bottom: y(3), marginTop: y(dimensionAssert() ? 27 : 25), marginBottom: y(6) }]}>
                                <Text style={styles.distance}>{totalDistance}</Text>
                                <Text style={styles.cost}>${mainData.cost ? mainData.cost.total : '--'}</Text>
                            </View>
                        </>
                    </TouchableOpacity>
                </View>
            )
        }
        else
            return (<></>);
    }
};

export class RideShareCard extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
        }
    }
    componentDidMount() {

    }
    render() {
        if (this.props.data.polyline) {
            let color = GREEN;
            if (this.props.data.status == 'ONGOING')
                color = YELLOW;
            else if (this.props.data.status == 'CANCELLED')
                color = RED;
            const car = this.props.data.carDetails ? `${this.props.data.carDetails.color} ${this.props.data.carDetails.year} ${this.props.data.carDetails.make} ${this.props.data.carDetails.model} ` : '';
            let distance = polylineLenght(JSON.parse(this.props.data.polyline ? this.props.data.polyline : "[]"));

            distance > 100 ?
                distance = `${(distance / 1000).toFixed(1)} km` :
                distance = `${(distance).toFixed(distance != 0 ? 1 : 0)} m`;

            return (
                <View style={styles.container}>
                    <TouchableOpacity style={styles.card} onPress={() => {
                        this.setState({ loading: true }, () => {
                            setTimeout(() => {
                                this.props.navigation.navigate('RideshareHistory', {
                                    date: this.props.date,
                                    data: this.props.data,
                                    historyRef: this.props.historyRef,
                                    userID: this.props.userID,
                                    loadResults: () => { this.props.loadResults() },
                                })
                            }, 100);

                            setTimeout(() => {
                                this.setState({ loading: false })
                            }, 2000);
                        })
                    }}>
                        <>
                            {this.state.loading ?
                                <View style={styles.loader}>
                                    <MaterialIndicator color={GREEN} size={x(30)} />
                                </View> :
                                <></>}

                            <View style={[{ width: x(313), marginTop: y(6) }]}>
                                <Text style={[styles.date, { color: BLACK, }]}>{car} <Text style={[styles.date, { fontSize: y(dimensionAssert() ? 10 : 12, true), color: BLACK }]}>{this.props.data.carDetails ? this.props.data.carDetails.plateNumber : ''}</Text></Text>
                                <View style={{ flexDirection: 'row', top: y(dimensionAssert() ? -1 : 4) }}>
                                    <StarRating
                                        disabled={true}
                                        maxStars={5}
                                        rating={this.props.data.userRating ? this.props.data.userRating : 0}
                                        fullStarColor={GOLD}
                                        emptyStarColor={GOLD}
                                        starSize={y(13)}
                                    />
                                    <Text style={[styles.date, { fontSize: y(12, true), marginLeft: x(5) }]}>{this.props.date}</Text>
                                </View>
                            </View>

                            <View style={[styles.maps, { backgroundColor: color }]}  //CANCELED TRIPS GET RED NOT GREEN, ONLY COMPLETED TRIPS ARE GREEN
                            ></View>

                            <View style={styles.travelContainer}>
                                <View style={[styles.travel,]}>
                                    <Icon name={'map-pin'} size={y(10)} color={GREEN} />
                                    <Text numberOfLines={1} style={[styles.firstLayer,]}>{this.props.data.location.description}</Text>
                                </View>
                                <View style={styles.LtoD_Divider}><DashedDivider borderColor={GREEN} height={(dimensionAssert()) ? y(15) : y(17)} width={0} borderWidth={0.5} borderRadius={0} /></View>
                                <View style={[styles.travel, { top: y(12.4) }]}>
                                    <Icon name={'map-pin'} size={y(10)} color={GREEN} />
                                    <Text numberOfLines={1} style={[styles.firstLayer,]}>{this.props.data.destination.description}</Text>
                                </View>
                            </View>

                            <View style={[styles.divider, {}]}><Divider height={0.5} width={x(313)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                            <View style={[styles.spaceView, { marginTop: y(dimensionAssert() ? 20 : 25), marginBottom: y(6) }]}>
                                <Text style={styles.distance}>{distance}</Text>
                                <Text style={styles.cost}>$ 4.99</Text>
                            </View>
                        </>
                    </TouchableOpacity>
                </View>
            )
        }
        else
            return (<></>);
    }
}

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
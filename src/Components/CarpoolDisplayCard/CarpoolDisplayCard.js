import React from 'react';
import styles from './styles';
import { Text, View, Dimensions, TouchableOpacity, StatusBar, Platform, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CarIcon from '../../Images/svgImages/carIcon';
import { MaterialIndicator } from 'react-native-indicators';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const TRIP_WIDTH = x(333);
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];
import moment from 'moment';
/*
*REGARDING const tripStartIn;
*
*
* This is simply the time the driver would take to arrive minus the (walking time + waiting time(6mins))
* E.g a driver is coming in 27 mins, it takes 10 mins to walk there and the current time is 10:30AM.
* Therefore 27-(10+6)=11mins.
* So driver is arriving at 10:57AM. You start walking in 11 mins and you walk for 10 mins to arrive at 10:51AM.
* 10:57-10:51 = 6mins waiting time.
* 
* THIS MUST BE USED TO REMOVE INVALID ITEMS AS TIME GOES ON
*/

export class OneStepTrip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hours: this.props.data.rawDate ? new Date(this.props.data.rawDate).getHours() : new Date().getHours(),
            minutes: this.props.data.rawDate ? new Date(this.props.data.rawDate).getMinutes() : new Date().getMinutes(),
            loading: false,
        }
    }

    render() {
        if (this.props.refreshing) {
            const H = this.props.data.rawDate ? new Date(this.props.data.rawDate).getHours() : new Date().getHours();
            const M = this.props.data.rawDate ? new Date(this.props.data.rawDate).getMinutes() : new Date().getMinutes();

            if (this.state.hours != H || this.state.minutes != M)
                this.setState({
                    hours: H,
                    minutes: M,
                });
        }
        const data = this.props.data;
        const distance = (data.firstDistance);
        const totalTime = data.travelDetails.walkFromL.duration.value
            + data.travelDetails.etaTravel1.duration.value
            + data.travelDetails.walkToD.duration.value;
        const tripStartIn = ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
        const startTime = moment(new Date(new Date().getTime() + (tripStartIn * 1000))).format('hh:mm A');
        const endTime = moment(new Date(new Date().getTime() + (tripStartIn * 1000) + (totalTime * 1000))).format('hh:mm A');


        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback
                    disabled={this.props.refreshing}
                    onPress={() => {
                        this.setState({ loading: true }, () => { this.props.onPress(); });
                        setTimeout(() => {
                            this.setState({ loading: false });
                        }, 1000)
                    }}>
                    <View style={styles.card}>
                        {this.state.loading ?
                            <View style={styles.loader}>
                                <MaterialIndicator color={GREEN} size={x(30)} />
                            </View> :
                            <></>}
                        <View style={styles.tripBreakdownSingleTrip}>
                            <View style={{ height: y(36), width: y(36) }}>
                                <CarIcon />
                            </View>
                        </View>
                        <Text style={styles.cost}>${Number(data.cost.total).toFixed(2)}</Text>
                        <Text style={styles.distance}>{`${(distance / 1000).toFixed(2)} km`}</Text>
                        <Text style={styles.time}>{`${startTime} TO ${endTime}`}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
};
export class TwoStepTrip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hours: new Date().getHours(),
            minutes: new Date().getMinutes(),
            loading: false,
        }
    }


    render() {
        if (this.props.refreshing) {
            const H = new Date().getHours();
            const M = new Date().getMinutes();

            if (this.state.hours != H || this.state.minutes != M)
                this.setState({
                    hours: H,
                    minutes: M,
                });
        }
        const data = this.props.data;
        const distance = (data.firstDistance + data.secondDistance);
        const _1stFlex = (data.firstDistance / distance);
        const _2ndFlex = 1 - _1stFlex;

        const totalTime = data.travelDetails.etaArrival2.duration.value
            + data.travelDetails.etaTravel2.duration.value
            + data.travelDetails.walkToD.duration.value;
        const tripStartIn = ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
        const startTime = moment(new Date(new Date().getTime() + (tripStartIn * 1000))).format('hh:mm A');
        const endTime = moment(new Date(new Date().getTime() + (totalTime * 1000))).format('hh:mm A');

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback
                    disabled={this.props.refreshing}
                    onPress={() => {
                        this.setState({ loading: true }, () => { this.props.onPress(); });
                        setTimeout(() => {
                            this.setState({ loading: false });
                        }, 1000)
                    }}>
                    <View style={styles.card}>
                        {this.state.loading ?
                            <View style={styles.loader}>
                                <MaterialIndicator color={GREEN} size={x(30)} />
                            </View> :
                            <></>}
                        <View style={styles.tripBreakdownContainer}>

                            <View style={[styles.tripBreakdown2trip_1, { width: (_1stFlex * TRIP_WIDTH) }]}>{(_1stFlex * TRIP_WIDTH > 4 + y(30)) ?
                                <View style={{ height: y(36), width: y(36) }}>
                                    <CarIcon />
                                </View> : <></>}</View>
                            <View style={[styles.tripBreakdown2trip_2, { width: (_2ndFlex * TRIP_WIDTH) }]}>{(_2ndFlex * TRIP_WIDTH > 4 + y(30)) ?
                                <View style={{ height: y(36), width: y(36) }}>
                                    <CarIcon />
                                </View> : <></>}</View>

                        </View>
                        <Text style={styles.cost}>${Number(data.cost.total).toFixed(2)}</Text>
                        <Text style={styles.distance}>{`${(distance / 1000).toFixed(2)} km`}</Text>
                        <Text style={styles.time}>{`${startTime} TO ${endTime}`}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
};
export class ThreeStepTrip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hours: new Date().getHours(),
            minutes: new Date().getMinutes(),
            loading: false,
        }
    }

    render() {
        if (this.props.refreshing) {
            const H = new Date().getHours();
            const M = new Date().getMinutes();

            if (this.state.hours != H || this.state.minutes != M)
                this.setState({
                    hours: H,
                    minutes: M,
                });
        }

        const data = this.props.data;
        const distance = (data.firstDistance + data.secondDistance + data.thirdDistance);
        const _1stFlex = (data.firstDistance / distance);
        const _2ndFlex = (data.secondDistance / distance);
        const _3rdFlex = 1 - _1stFlex - _2ndFlex;

        const totalTime = data.travelDetails.etaArrival3.duration.value
            + data.travelDetails.etaTravel3.duration.value
            + data.travelDetails.walkToD.duration.value;
        const tripStartIn = ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
        const startTime = moment(new Date(new Date().getTime() + (tripStartIn * 1000))).format('hh:mm A');
        const endTime = moment(new Date(new Date().getTime() + (totalTime * 1000))).format('hh:mm A');

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback
                    disabled={this.props.refreshing}
                    onPress={() => {
                        this.setState({ loading: true }, () => { this.props.onPress(); });

                        setTimeout(() => {
                            this.setState({ loading: false });
                        }, 1000)
                    }}>
                    <View style={styles.card}>
                        {this.state.loading ?
                            <View style={styles.loader}>
                                <MaterialIndicator color={GREEN} size={x(30)} />
                            </View> :
                            <></>}
                        <View style={styles.tripBreakdownContainer}>

                            <View style={[styles.tripBreakdown3trip_1, { width: (_1stFlex * TRIP_WIDTH) }]}>{(_1stFlex * TRIP_WIDTH > 4 + y(30)) ?
                                <View style={{ height: y(36), width: y(36) }}>
                                    <CarIcon />
                                </View> : <></>}</View>
                            <View style={[styles.tripBreakdown3trip_2, { width: (_2ndFlex * TRIP_WIDTH) }]}>{(_2ndFlex * TRIP_WIDTH > 4 + y(30)) ?
                                <View style={{ height: y(36), width: y(36) }}>
                                    <CarIcon />
                                </View> : <></>}</View>
                            <View style={[styles.tripBreakdown3trip_3, { width: (_3rdFlex * TRIP_WIDTH) }]}>{(_3rdFlex * TRIP_WIDTH > 4 + y(30)) ?
                                <View style={{ height: y(36), width: y(36) }}>
                                    <CarIcon />
                                </View> : <></>}</View>

                        </View>
                        <Text style={styles.cost}>${Number(data.cost.total).toFixed(2)}</Text>
                        <Text style={styles.distance}>{`${(distance / 1000).toFixed(2)} km`}</Text>
                        <Text style={styles.time}>{`${startTime} TO ${endTime}`}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
};

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);


    return { hours: h, minutes: m };
}

function nN(d) {
    return Number(d);
}

function calculateTime(aH, bH, aM, bM) {
    const re = ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60)) > 12 ?
        ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60)) - 12 :
        ((nN(aH) + nN(bH)) % 24) + Math.floor(((nN(aM) + nN(bM)) / 60));

    return re;
}

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
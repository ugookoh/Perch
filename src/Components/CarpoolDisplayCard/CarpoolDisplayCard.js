import React from 'react';
import styles from './styles';
import { Text, View, Dimensions, TouchableOpacity, StatusBar, Platform, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CarIcon from '../../Images/svgImages/carIcon';
import { MaterialIndicator } from 'react-native-indicators';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const TRIP_WIDTH = x(333);
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

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
        let totalTime, totalH, totalM, tripStartIn, tripStartH_, tripStartM_, startHour, startMin, endHour, endMin, startMeridiem, endMeridiem;

        totalTime = data.travelDetails.walkFromL.duration.value
            + data.travelDetails.etaTravel1.duration.value
            + data.travelDetails.walkToD.duration.value;

        [totalH, totalM] = [secondsToHms(totalTime).hours, secondsToHms(totalTime).minutes];

        tripStartIn = /*<<<<----- REMOVE THIS MINUS SIGNNNN*/ ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
        [tripStartH_, tripStartM_] = [secondsToHms(tripStartIn).hours, secondsToHms(tripStartIn).minutes];
        startHour = calculateTime(this.state.hours, tripStartH_, this.state.minutes, tripStartM_)
        startMin = ((this.state.minutes + tripStartM_) % 60);
        endHour = calculateTime(startHour, totalH, startMin, totalM);
        endMin = ((startMin + totalM) % 60);
        startMeridiem = ((nN(this.state.hours) + nN(tripStartH_)) % 24) < 12 ? 'AM' : 'PM';
        endMeridiem = (((nN(this.state.hours) + nN(tripStartH_) + nN(totalH) + Math.floor(((nN(startMin) + nN(totalM)) / 60)))) % 24) < 12 ? 'AM' : 'PM';

        startHour = startHour == 0 ? startHour = 12 : startHour;
        endHour = endHour == 0 ? endHour = 12 : endHour;

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={() => {
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
                        <Text style={styles.time}>{`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem} TO ${endHour}:${endMin < 10 ? '0' + endMin : endMin} ${endMeridiem}`}</Text>
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
        let totalH, totalM, tripStartIn, tripStartH_, tripStartM_, startHour, startMin, endHour, endMin, startMeridiem, endMeridiem;


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

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={() => {
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
                        <Text style={styles.time}>{`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem} TO ${endHour}:${endMin < 10 ? '0' + endMin : endMin} ${endMeridiem}`}</Text>
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

        let totalH, totalM, tripStartIn, tripStartH_, tripStartM_, startHour, startMin, endHour, endMin, startMeridiem, endMeridiem;



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
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={() => {
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
                        <Text style={styles.time}>{`${startHour}:${startMin < 10 ? '0' + startMin : startMin} ${startMeridiem} TO ${endHour}:${endMin < 10 ? '0' + endMin : endMin} ${endMeridiem}`}</Text>
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
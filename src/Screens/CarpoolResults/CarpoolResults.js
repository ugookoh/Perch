import AsyncStorage from '@react-native-community/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-community/picker';
import axios from 'axios';
import moment from 'moment';
import React from 'react';
import { Animated, Button, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import Dash from 'react-native-dash';
import { BarIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/Feather';
import Down from 'react-native-vector-icons/Ionicons';
import { OneStepTrip, ThreeStepTrip, TwoStepTrip } from '../../Components/CarpoolDisplayCard/CarpoolDisplayCard';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import { colors, dimensionAssert, OfflineNotice, x, y, nN, secondsToHms, calculateTime, calculateZone, getTime } from '../../Functions/Functions';
import CatcusNoResults from '../../Images/svgImages/cactusNoResults';
import styles from './styles';
const _1DAY_MILLI_SECS = 86400000;//ms
const _1HOUR_MILLI_SECS = 3600000;//ms 

export default class CarpoolResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            sort: 'Least travel distance',
            choice: 'hidden',
            location: this.props.route.params.location,
            destination: this.props.route.params.destination,
            results: '',
            seatNumber: 1,
            seatNumberFocused: false,
            refreshing: false,

            now: this.props.route.params.now,
            date: this.props.route.params.date,
            tomorrow: this.props.route.params.tomorrow,
            getTime: false,
        };

        this.pickerPosition = new Animated.Value(-y(310))
        this.showPicker = this.showPicker.bind(this);
        this.hidePicker = this.hidePicker.bind(this);
        this.passengers = this.passengers.bind(this);
    };
    componentDidMount() {
        const date = this.state.tomorrow ? this.state.date + _1DAY_MILLI_SECS : this.state.date;
        axios.post('https://us-central1-perch-01.cloudfunctions.net/carpoolChoices', {
            location: this.state.location,
            destination: this.state.destination,
            seatNumber: this.state.seatNumber,
            startTime: this.state.now ? null : { hour: new Date(date).getHours(), min: new Date(date).getMinutes() },
            rawDate: this.state.now ? null : date,
        })
            .then(data => {
                const result = data.data;
                if (result.length == 0)
                    this.setState({ results: 'NORESULTS' })
                else
                    this.resultSort.call(this, result, this.state.sort);
            })
            .catch(err => { console.log(err.message) })

    };

    onRefresh() {
        const date = this.state.tomorrow ? this.state.date + _1DAY_MILLI_SECS : this.state.date;
        axios.post('https://us-central1-perch-01.cloudfunctions.net/carpoolChoices', {
            location: this.state.location,
            destination: this.state.destination,
            seatNumber: this.state.seatNumber,
            startTime: this.state.now ? null : { hour: new Date(date).getHours(), min: new Date(date).getMinutes() },
            rawDate: this.state.now ? null : date,
        })
            .then(data => {
                const result = data.data;
                if (result.length == 0)
                    this.setState({ results: 'NORESULTS' })
                else
                    this.resultSort.call(this, result, this.state.sort);
            })
            .catch(err => { console.log(err.message) })
    };

    hidePicker() {
        this.setState({ choice: 'hidden' });
        Animated.spring(this.pickerPosition, {
            toValue: dimensionAssert() ? -y(310) : -y(290),
            bounciness: 0,
        }).start();
    };

    showPicker() {
        this.setState({ choice: 'shown' });
        Animated.spring(this.pickerPosition, {
            toValue: 0,
            bounciness: 0,
        }).start();
    };

    passengers(sign) {
        switch (sign) {
            case 'plus': {
                if (this.state.seatNumber < 6)
                    this.setState({ seatNumber: this.state.seatNumber + 1 });
            } break;
            case 'minus': {
                if (this.state.seatNumber > 1)
                    this.setState({ seatNumber: this.state.seatNumber - 1 });
            } break;
        }
    };

    resultSort(data_, type) {
        let data = data_
        switch (type) {
            case "Least travel distance": {

                function compare(a_, b_) {

                    let a, b;
                    switch (a_.steps) {
                        case 1: {
                            a = a_.firstDistance;
                        } break;
                        case 2: {
                            a = (a_.firstDistance + a_.secondDistance);
                        } break;
                        case 3: {
                            a = (a_.firstDistance + a_.secondDistance + a_.thirdDistance);
                        } break;
                    };

                    switch (b_.steps) {
                        case 1: {
                            b = b_.firstDistance;
                        } break;
                        case 2: {
                            b = (b_.firstDistance + b_.secondDistance);
                        } break;
                        case 3: {
                            b = (b_.firstDistance + b_.secondDistance + b_.thirdDistance);
                        } break;
                    };




                    if (a > b) return 1;
                    if (b > a) return -1;

                    return 0;
                }
                this.setState({ results: data.sort(compare), refreshing: false });

            } break;
            case "Least travel time": {
                function compare(a_, b_) {

                    let a, b;
                    a = getTime(a_, false);
                    b = getTime(b_, false);




                    if (a > b) return 1;
                    if (b > a) return -1;

                    return 0;
                }
                this.setState({ results: data.sort(compare), refreshing: false });

            } break;
            case "Least walking distance": {

                function compare(a_, b_) {

                    let a, b;
                    switch (a_.steps) {
                        case 1: {
                            a = a_.travelDetails.walkFromL.distance.value + a_.travelDetails.walkToD.distance.value;
                        } break;
                        case 2: {
                            a = a_.travelDetails.walkFromL.distance.value + a_.travelDetails.walk.distance.value + a_.travelDetails.walkToD.distance.value;
                        } break;
                        case 3: {
                            a = a_.travelDetails.walkFromL.distance.value + a_.travelDetails.walk1.distance.value + a_.travelDetails.walk2.distance.value + a_.travelDetails.walkToD.distance.value;
                        } break;
                    };

                    switch (b_.steps) {
                        case 1: {
                            b = b_.travelDetails.walkFromL.distance.value + b_.travelDetails.walkToD.distance.value;
                        } break;
                        case 2: {
                            b = b_.travelDetails.walkFromL.distance.value + b_.travelDetails.walk.distance.value + b_.travelDetails.walkToD.distance.value;
                        } break;
                        case 3: {
                            b = b_.travelDetails.walkFromL.distance.value + b_.travelDetails.walk1.distance.value + b_.travelDetails.walk2.distance.value + b_.travelDetails.walkToD.distance.value;
                        } break;
                    };




                    if (a > b) return 1;
                    if (b > a) return -1;

                    return 0;
                }
                this.setState({ results: data.sort(compare), refreshing: false });

                // for (let k = 0; k < data.length; k++) {
                //     const a_ = data[k];
                //     switch (a_.steps) {
                //         case 1: {
                //             console.log(a_.travelDetails.walkFromL.distance.value + a_.travelDetails.walkToD.distance.value);
                //         } break;
                //         case 2: {
                //             console.log(a_.travelDetails.walkFromL.distance.value + a_.travelDetails.walk.distance.value + a_.travelDetails.walkToD.distance.value);
                //         } break;
                //         case 3: {
                //             console.log(a_.travelDetails.walkFromL.distance.value + a_.travelDetails.walk1.distance.value + a_.travelDetails.walk2.distance.value + a_.travelDetails.walkToD.distance.value);
                //         } break;
                //     };
                // }

            } break;
            case "Fewer transfers": {

                function compare(a_, b_) {

                    let a = a_.steps, b = b_.steps;

                    if (a > b) return 1;
                    if (b > a) return -1;

                    return 0;
                }
                this.setState({ results: data.sort(compare), refreshing: false });

            } break;
        };
    };

    render() {
        const iconRotation = this.pickerPosition.interpolate({
            inputRange: [dimensionAssert() ? -y(310) : -y(290), 0],
            outputRange: ['0deg', '-180deg'],
            extrapolate: 'clamp',
        });
        const date = this.state.tomorrow ? this.state.date + _1DAY_MILLI_SECS : this.state.date;
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header scrollY={this.state.scrollY} name={'Available Perchers'} onPress={this.props.navigation.goBack} />
                {this.state.seatNumberFocused ?
                    <View style={styles.numberOfSeatContainer}>
                        <View style={styles.secondaryNumberOfSeatContainer}>
                            <Text style={styles.counterText}>Number of passengers</Text>
                            <View style={styles.counterContainer}>
                                <TouchableOpacity onPress={() => { this.passengers('minus') }}>
                                    <Icon name={'minus-circle'} size={y(30)} color={colors.GREEN} />
                                </TouchableOpacity>
                                <View style={styles.seatNumberView}>
                                    <Text style={styles.seatNumberText}>{this.state.seatNumber}</Text>
                                </View>
                                <TouchableOpacity onPress={() => { this.passengers('plus') }}>
                                    <Icon name={'plus-circle'} size={y(30)} color={colors.GREEN} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.doneButton} onPress={() => { this.setState({ seatNumberFocused: false, refreshing: true, }, () => { this.onRefresh() }) }}>
                                <Text style={styles.doneText}>Confirm</Text>
                            </TouchableOpacity>

                        </View>
                    </View> :
                    <></>}

                <View style={styles.location}>
                    <Icon name={'map-pin'} size={y(14)} color={colors.GREEN} />
                    <TouchableOpacity
                        onPress={() => {
                            this.props.route.params.onReturn('L');
                            this.props.navigation.goBack();

                        }}
                    >
                        <Text numberOfLines={1} style={styles.text}>{this.state.location != '' ? this.state.location.description : ''}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.L_to_D}>
                    <Dash style={{ width: 0.5, height: y(dimensionAssert() ? 10 : 14), flexDirection: 'column' }} dashColor={colors.GREEN} dashLength={2} />
                </View>
                <View style={styles.destination}>
                    <Icon name={'map-pin'} size={y(14)} color={colors.GREEN} />
                    <TouchableOpacity
                        onPress={() => {
                            this.props.route.params.onReturn('D');
                            this.props.navigation.goBack();

                        }}
                    >
                        <Text numberOfLines={1} style={styles.text}>{this.state.destination != '' ? this.state.destination.description : ''}</Text>
                    </TouchableOpacity>
                </View>


                <View style={styles.divider}><Divider height={0.5} width={x(361)} borderRadius={3} borderColor={'#707070'} borderWidth={1} /></View>

                {/* <Text style={styles.rateText}>$ 2.00 PER KM</Text> */}
                <TouchableOpacity
                    disabled={this.state.results != '' ? false : true}
                    style={styles.sortResultView}
                    onPress={() => {
                        if (this.state.choice === 'hidden')
                            this.showPicker();
                        else if (this.state.choice === 'shown')
                            this.hidePicker();
                    }}
                >
                    <Text style={styles.sortResultText}>{this.state.sort}</Text>
                    <Animated.View style={[styles.dropDownIcon, { transform: [{ rotate: iconRotation }] }]}>
                        <Down name={'ios-arrow-down'} color={colors.GREEN} size={y(25, true)} />
                    </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={this.state.results != '' ? false : true}
                    onPress={() => { this.setState({ seatNumberFocused: true }) }}
                    style={[styles.numberOfSeat]}
                >
                    <Text style={styles.sortResultText}>{`${this.state.seatNumber} passenger${this.state.seatNumber == 1 ? `` : `s`}`}</Text>
                    <View style={[styles.dropDownIcon,]}>
                        <Down name={'ios-arrow-down'} color={colors.GREEN} size={y(25, true)} />
                    </View>
                </TouchableOpacity>
                {this.state.now ?
                    <></> :
                    <TouchableOpacity style={styles.scheduledView} onPress={() => { this.setState({ getTime: true }) }}>
                        <Text style={styles.scheduledText}>At <Text style={{ color: 'rgba(77, 183, 72, 0.7)', }}>{moment(this.state.date).format('hh:mm a').toUpperCase()}</Text>{this.state.tomorrow ? ' tomorrow' : ' today'}</Text>
                        <Icon name={'clock'} size={y(20)} />
                    </TouchableOpacity>
                }
                <View style={[styles.scrollView, { top: y(this.state.now ? 306 : 323), height: y(this.state.now ? 506 : 490), }]}>
                    {this.state.results != '' ?
                        (
                            this.state.results == 'NORESULTS' ?
                                <View style={styles.noResultView}>
                                    <View style={styles.noResult}>
                                        <CatcusNoResults />
                                    </View>
                                    <Text style={styles.noResultText}>{`Unforunately, we could not find any Perchers nearby.\nPlease try again shortly`}</Text>
                                </View> :
                                <FlatList
                                    ref={ref => this.flatList = ref}
                                    data={this.state.results}
                                    onRefresh={() => this.onRefresh.call(this)}
                                    initialNumToRender={15}
                                    refreshing={this.state.refreshing}
                                    renderItem={({ item }) => {
                                        const steps = item.steps;
                                        //getTime(item, true);
                                        switch (steps) {
                                            case 1: {
                                                let toReturn = true;
                                                const d = date;
                                                const h = (60 * 60 * 1000)
                                                if (this.state.now == false)
                                                    if (Math.abs(item.rawDate - d) > (_1HOUR_MILLI_SECS * 2))
                                                        toReturn = false;


                                                if (toReturn)
                                                    return (
                                                        <OneStepTrip
                                                            data={item}
                                                            refreshing={this.state.refreshing}
                                                            onPress={() => {
                                                                AsyncStorage.getItem('USER_DETAILS')
                                                                    .then(result => {
                                                                        const userDetails = JSON.parse(result);
                                                                        this.props.navigation.navigate('CarpoolTripDetails', {
                                                                            data: item,
                                                                            location: this.state.location,
                                                                            destination: this.state.destination,
                                                                            seatNumber: this.state.seatNumber,
                                                                            tripAccepted: false,
                                                                            userID: userDetails.userID,
                                                                            now: this.state.now,
                                                                            hours: item.rawDate ? new Date(item.rawDate).getHours() : null,
                                                                            min: item.rawDate ? new Date(item.rawDate).getMinutes() : null,
                                                                            rawDate: item.rawDate,
                                                                            onRefresh: () => {
                                                                                this.onRefresh.call(this)
                                                                            },
                                                                            handleOnNavigateBack: () => { this.props.route.params.handleOnNavigateBack(); }
                                                                        });
                                                                    }).catch(error => { console.log(error.message) });
                                                            }} />
                                                    )
                                            } break;
                                            case 2: {
                                                return (
                                                    <TwoStepTrip
                                                        data={item}
                                                        refreshing={this.state.refreshing}
                                                        onPress={() => {
                                                            AsyncStorage.getItem('USER_DETAILS')
                                                                .then(result => {
                                                                    const userDetails = JSON.parse(result);
                                                                    this.props.navigation.navigate('CarpoolTripDetails', {
                                                                        data: item, location: this.state.location, destination: this.state.destination, seatNumber: this.state.seatNumber, tripAccepted: false, userID: userDetails.userID, now: true,
                                                                        onRefresh: () => {
                                                                            this.onRefresh.call(this)
                                                                        },
                                                                        handleOnNavigateBack: () => { this.props.route.params.handleOnNavigateBack(); }
                                                                    })
                                                                }).catch(error => { console.log(error.message) });
                                                        }} />
                                                )
                                            } break;
                                            case 3: {
                                                return (
                                                    <ThreeStepTrip
                                                        data={item}
                                                        refreshing={this.state.refreshing}
                                                        onPress={() => {
                                                            AsyncStorage.getItem('USER_DETAILS')
                                                                .then(result => {
                                                                    const userDetails = JSON.parse(result);
                                                                    this.props.navigation.navigate('CarpoolTripDetails', {
                                                                        data: item, location: this.state.location, destination: this.state.destination, seatNumber: this.state.seatNumber, tripAccepted: false, userID: userDetails.userID, now: true,
                                                                        onRefresh: () => {
                                                                            this.onRefresh.call(this)
                                                                        },
                                                                        handleOnNavigateBack: () => { this.props.route.params.handleOnNavigateBack(); }
                                                                    })
                                                                }).catch(error => { console.log(error.message) });
                                                        }} />
                                                )
                                            } break;
                                        }
                                    }}
                                    keyExtractor={(item, index) => { index }}
                                />
                        )
                        :
                        <View style={styles.box}>
                            <BarIndicator color={colors.GREEN} size={x(40)} count={8} />
                        </View>

                    }
                </View>
                <Animated.View style={[styles.pickerView, { bottom: this.pickerPosition, }]}>
                    <View style={styles.pickerChoice}>
                        <View style={{ marginRight: x(20) }}>
                            <Button
                                onPress={this.hidePicker}
                                title="Choose"

                            />
                        </View>
                    </View>
                    <Picker
                        style={styles.picker_}
                        selectedValue={this.state.sort}
                        onValueChange={(itemValue, itemIndex) => {
                            this.setState({ sort: itemValue, refreshing: true }, () => {
                                this.resultSort.call(this, this.state.results, itemValue);
                            });


                            if (Platform.OS === 'android')
                                this.hidePicker();
                        }}>
                        <Picker.Item label="Least travel distance" value="Least travel distance" />
                        <Picker.Item label="Least travel time" value="Least travel time" />
                        <Picker.Item label="Least walking distance" value="Least walking distance" />
                        <Picker.Item label="Fewer transfers" value="Fewer transfers" />
                    </Picker>
                </Animated.View>
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
                                    const d = event.nativeEvent.timestamp;
                                    if (date) {
                                        const advance15mins = new Date().getTime() + (15 * 60000);//15 mins in advance
                                        this.setState({ date: new Date(d), tomorrow: d > advance15mins ? false : true, results: '' }, () => { this.onRefresh() });

                                    }
                                }}
                            />
                            <View style={styles.iosSpinner}>
                                <Button
                                    title={'Cancel'}
                                    onPress={() => { this.setState({ getTime: false }) }}
                                />
                                <Button
                                    title={'Confirm'}
                                    onPress={() => { this.setState({ getTime: false }) }}
                                />
                            </View>
                        </View>
                        :
                        <DateTimePicker
                            value={this.state.date}
                            mode={'time'}
                            is24Hour={false}
                            //display={"spinner"}
                            onChange={(event, date) => {
                                this.setState({ getTime: false })
                                const d = event.nativeEvent.timestamp;
                                if (date) {
                                    const advance15mins = new Date().getTime() + (15 * 60000);//15 mins in advance
                                    this.setState({ date: new Date(d), tomorrow: d > advance15mins ? false : true, results: '' }, () => { this.onRefresh() });

                                }
                            }} />
                    : <></>}
            </View>
        );
    }
};

function getTime(data_, del) {
    const data = data_;
    const minutes = new Date().getMinutes();
    const hours = new Date().getHours();
    let totalH, totalM, tripStartIn, tripStartH_, tripStartM_, startHour, startMin, endHour, endMin, startMeridiem, endMeridiem, totalTime;
    switch (data.steps) {
        case 1: {
            totalTime = data.travelDetails.walkFromL.duration.value
                + data.travelDetails.etaTravel1.duration.value
                + data.travelDetails.walkToD.duration.value;

            [totalH, totalM] = [secondsToHms(totalTime).hours, secondsToHms(totalTime).minutes];

            tripStartIn = /*<<<<----- REMOVE THIS MINUS SIGNNNN*/ ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
            [tripStartH_, tripStartM_] = [secondsToHms(tripStartIn).hours, secondsToHms(tripStartIn).minutes];
            startHour = calculateTime(hours, tripStartH_, minutes, tripStartM_)
            startMin = ((minutes + tripStartM_) % 60);
            endHour = calculateTime(startHour, totalH, startMin, totalM);
            endMin = ((startMin + totalM) % 60);
            startMeridiem = ((nN(hours) + nN(tripStartH_)) % 24) < 12 ? 'AM' : 'PM';
            endMeridiem = (((nN(hours) + nN(tripStartH_) + nN(totalH) + Math.floor(((nN(startMin) + nN(totalM)) / 60)))) % 24) < 12 ? 'AM' : 'PM';
        } break;
        case 2: {
            tripStartIn = /*<<<<----- REMOVE THIS MINUS SIGNNNN*/ ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
            [tripStartH_, tripStartM_] = [secondsToHms(tripStartIn).hours, secondsToHms(tripStartIn).minutes];
            startHour = calculateTime(hours, tripStartH_, minutes, tripStartM_)
            startMin = ((minutes + tripStartM_) % 60);
            startMeridiem = ((nN(hours) + nN(tripStartH_)) % 24) < 12 ? 'AM' : 'PM';


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
        } break;
        case 3: {
            tripStartIn = /*<<<<----- REMOVE THIS MINUS SIGNNNN*/ ((data.travelDetails.etaArrival1.duration.value) - data.travelDetails.walkFromL.duration.value);
            [tripStartH_, tripStartM_] = [secondsToHms(tripStartIn).hours, secondsToHms(tripStartIn).minutes];
            startHour = calculateTime(hours, tripStartH_, minutes, tripStartM_);
            startMin = ((minutes + tripStartM_) % 60);
            startMeridiem = ((nN(hours) + nN(tripStartH_)) % 24) < 12 ? 'AM' : 'PM';

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
        } break;
    };

    let meridiem = hours > 11 ? 'PM' : 'AM';
    if (meridiem == 'PM')
        endMeridiem == 'AM' ? endMeridiem = 'PM' : endMeridiem = 'AM';

    if (endMeridiem == 'PM')
        if (endHour != 12)
            endHour = endHour + 12;

    if (endMeridiem == 'AM' && endHour == 12)
        endHour = 0;

    let value = (endHour * 60) + endMin;

    return value;
};
import React from 'react';
import styles from './styles';
import { FlatList, Animated, Text, View, TextInput, Dimensions, TouchableOpacity, ScrollView, Keyboard, KeyboardAvoidingView, Button, StatusBar, Platform, Alert } from 'react-native';
import { OfflineNotice, sendFeedback, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import { OneStepTrip } from '../../Components/CarpoolDisplayCard/CarpoolDisplayCard';
import { MaterialIndicator } from 'react-native-indicators';
import database from '@react-native-firebase/database';
import CatcusNoResults from '../../Images/svgImages/cactusNoResults';
import Divider from '../../Components/Divider/Divider';

const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default class ScheduledTrips extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            scrollY: new Animated.Value(0),
            results: null,
            stillPending: null,
            userDetails: this.props.route.params.userDetails,
            hideLoader: true,
        };
    };

    componentDidMount() {
        this.onRefresh();
    };

    onRefresh = () => {
        this.setState({ results: null }, () => {
            database().ref(`scheduledPendingUserHistory/${this.state.userDetails.userID}`).once('value', snapshot => {
                if (snapshot.val()) {//we still have pending requests
                    this.setState({ results: snapshot.val(), stillPending: true });
                }
                else
                    database().ref(`scheduledCarpoolTripReserve/carpool/user/${this.state.userDetails.userID}`).once('value', snapshot_ => {
                        if (snapshot_.val())
                            this.setState({ results: snapshot_.val(), stillPending: false });
                        else
                            this.setState({ results: 'NORESULTS' });
                    }).catch(error => { console.log(error.message) })
            }).catch(error => { console.log(error.message) })
        });
    };

    render() {
        let data = null;
        if (this.state.results && this.state.results !== 'NORESULTS' && this.state.stillPending == false)
            data = JSON.parse(this.state.results.data);//for confirmed trips
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header scrollY={this.state.scrollY} name={'Scheduled Trips'} onPress={() => { this.props.navigation.goBack() }} />

                <Text style={[styles._title, { marginTop: y(30) }]}>{this.state.stillPending === false ? 'Confirmed request' : 'List of sent requests'}</Text>
                <View style={[styles.divider, { marginTop: y(8) }]}><Divider height={0.5} width={x(343)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>
                <View style={[styles.scrollView]}>

                    {
                        this.state.results && this.state.hideLoader ?
                            this.state.results == 'NORESULTS' ?
                                <View style={styles.noResultView}>
                                    <View style={styles.noResult}>
                                        <CatcusNoResults />
                                    </View>
                                    <Text style={styles.noResultText}>{`You have not scheduled or requested for any future trips`}</Text>
                                </View> :
                                this.state.stillPending ?
                                    <FlatList
                                        ref={ref => this.flatList = ref}
                                        data={Object.keys(this.state.results)}
                                        initialNumToRender={15}
                                        renderItem={({ item }) => {
                                            const data = JSON.parse(this.state.results[item].data)
                                            const steps = data.steps;
                                            switch (steps) {
                                                case 1: {
                                                    return (
                                                        <OneStepTrip
                                                            data={data}
                                                            onPress={() => {
                                                                const userDetails = this.state.userDetails;
                                                                this.props.navigation.navigate('CarpoolTripDetails', {
                                                                    data: data,
                                                                    location: this.state.results[item].location,
                                                                    destination: this.state.results[item].destination,
                                                                    seatNumber: this.state.results[item].seatNumber,
                                                                    tripAccepted: false,
                                                                    userID: userDetails.userID,
                                                                    now: false,
                                                                    hours: new Date(this.state.results[item].rawDate).getHours(),
                                                                    min: new Date(this.state.results[item].rawDate).getMinutes(),
                                                                    rawDate: this.state.results[item].rawDate,
                                                                    scheduled: true,
                                                                    onRefresh: () => { this.onRefresh() },
                                                                    handleOnNavigateBack: () => { }
                                                                });

                                                            }} />
                                                    );
                                                } break;
                                            }
                                        }}
                                        keyExtractor={(item, index) => { index }}
                                    /> :
                                    <View style={{ flex: 1 }}>
                                        <OneStepTrip
                                            data={data}
                                            onPress={() => {
                                                this.setState({ hideLoader: false }, () => {
                                                    database().ref(`carpoolRequests/${data.key}/requestStatus`).once('value', snap => {
                                                        const now = snap.val() ? true : false;

                                                        const userDetails = this.state.userDetails;
                                                        const dateText = `userHistory/${userDetails.userID}/carpool/${this.state.results.startAt.year}/${this.state.results.startAt.month}/${this.state.results.historyRef}`;
                                                        this.props.navigation.navigate('CarpoolTripDetails', {
                                                            data: data,
                                                            location: this.state.results.location,
                                                            destination: this.state.results.destination,
                                                            seatNumber: this.state.results.seatNumber,
                                                            tripAccepted: true,
                                                            userID: userDetails.userID,
                                                            now: now,
                                                            hours: new Date(this.state.results.rawDate).getHours(),
                                                            min: new Date(this.state.results.rawDate).getMinutes(),
                                                            rawDate: this.state.results.rawDate,
                                                            scheduled: true,
                                                            dateText: dateText,
                                                            onRefresh: () => { this.onRefresh() },
                                                            handleOnNavigateBack: () => { }
                                                        });
                                                        setTimeout(() => {
                                                            this.setState({ hideLoader: true })
                                                        }, 3000);
                                                    }).catch(error => { console.log(error.message) })
                                                })
                                            }} />
                                    </View>
                            :
                            <MaterialIndicator color={GREEN} size={y(100)} style={{ top: -y(40) }} />
                    }
                </View>
            </View>
        );
    };
};
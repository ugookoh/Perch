import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, Easing, LayoutAnimation, Platform, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { CustomLayoutLinear, x, y, colors } from '../../Functions/Functions';
import styles from './styles';

export default class Drivers extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            complete1: false,
            complete2: false,
            complete3: false,
            declined: false,
        };
        this.progress1 = new Animated.Value(0);
        this.progress2 = new Animated.Value(0);
        this.progress3 = new Animated.Value(0);
    };
    componentDidMount() {//PUT LISTENERS FOR ACCEPTANCE OR DENAIL HERE
        AsyncStorage.getItem('USER_DETAILS').then(result => {
            const userDetails = JSON.parse(result);
            switch (this.props.steps) {
                case 1: {
                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.key}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress1_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });
                } break;
                case 2: {
                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.start}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress1_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });

                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.end}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress2_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });
                } break;
                case 3: {
                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.start}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress1_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });

                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.middle}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress2_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });

                    database().ref(`/carpoolRequestsFromUsers/${this.props.data.end}/${userDetails.userID}/status`).on('value', snapshot => {
                        if (snapshot.val() == 'ACCEPTED')
                            this.progress3_.call(this);
                        else if (snapshot.val() == 'CANCELLED')
                            this.setState({ declined: true });
                    });
                } break;
            };

        }).catch(error => { console.log(error.message) });
    };
    progress1_() {
        this.setState({ complete1: true })
        Animated.timing(this.progress1, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };
    progress2_() {
        this.setState({ complete2: true })
        Animated.timing(this.progress2, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };
    progress3_() {
        this.setState({ complete3: true })
        Animated.timing(this.progress3, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };

    render() {

        let toDisplay = <></>, finished = false;
        switch (this.props.steps) {
            case 1: {
                if (this.state.complete1)
                    finished = true;
                else
                    finished = false;

                toDisplay =
                    <View style={styles.driverRow}>
                        <Text style={[styles.driverName, { color: colors.GREEN, marginVertical: y(10) }]}>{this.props.driver1 ? this.props.driver1.firstName : ''}</Text>
                        {this.state.complete1 ?
                            <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress1} style={{ width: x(50), height: x(50) }}
                                    colorFilters={[{
                                        keypath: "Shape Layer 3",
                                        color: colors.GREEN,
                                    }, {
                                        keypath: "Shape Layer 4",
                                        color: colors.GREEN,
                                    }]} />
                            </View> :
                            <View>
                                <MaterialIndicator color={colors.GREEN} size={x(20)} />
                            </View>
                        }
                    </View>
            } break;
            case 2: {
                if (this.state.complete1 && this.state.complete2)
                    finished = true;
                else
                    finished = false;

                toDisplay =
                    <>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: colors.GREEN, marginTop: y(10) }]}>{this.props.driver1 ? this.props.driver1.firstName : ''}</Text>
                            {this.state.complete1 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress1} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: colors.GREEN,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: colors.GREEN,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={colors.GREEN} size={x(20)} />
                                </View>
                            }
                        </View>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: colors.BLUE, marginBottom: y(10), marginTop: y(5) }]}>{this.props.driver2 ? this.props.driver2.firstName : ''}</Text>
                            {this.state.complete2 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress2} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: colors.BLUE,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: colors.BLUE,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={colors.BLUE} size={x(20)} />
                                </View>
                            }
                        </View>

                    </>
            } break;
            case 3: {
                if (this.state.complete1 && this.state.complete2 && this.state.complete3)
                    finished = true;
                else
                    finished = false;

                toDisplay =
                    <>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: colors.GREEN, marginTop: y(10) }]}>{this.props.driver1 ? this.props.driver1.firstName : ''}</Text>
                            {this.state.complete1 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress1} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: colors.GREEN,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: colors.GREEN,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={colors.GREEN} size={x(20)} />
                                </View>
                            }
                        </View>
                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: colors.BLUE, marginVertical: y(5) }]}>{this.props.driver2 ? this.props.driver2.firstName : ''}</Text>
                            {this.state.complete2 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12), }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress2} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: colors.BLUE,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: colors.BLUE,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={colors.BLUE} size={x(20)} />
                                </View>
                            }
                        </View>

                        <View style={styles.driverRow}>
                            <Text style={[styles.driverName, { color: colors.PURPLE, marginBottom: y(10) }]}>{this.props.driver3 ? this.props.driver3.firstName : ''}</Text>
                            {this.state.complete3 ?
                                <View style={{ position: 'absolute', right: -x(17), top: -x(12) }}>
                                    <LottieView source={require('../../Images/lottieAnimations/check.json')} progress={this.progress3} style={{ width: x(50), height: x(50) }}
                                        colorFilters={[{
                                            keypath: "Shape Layer 3",
                                            color: colors.PURPLE,
                                        }, {
                                            keypath: "Shape Layer 4",
                                            color: colors.PURPLE,
                                        }]} />
                                </View> :
                                <View>
                                    <MaterialIndicator color={colors.PURPLE} size={x(20)} />
                                </View>
                            }
                        </View>
                    </>
            } break;
        };

        if (Platform.OS == 'ios')
            if (finished)
                LayoutAnimation.configureNext(CustomLayoutLinear);

        if (finished)
            this.props.navigate();

        if (this.props.tripActive && this.state.declined == false)
            return (
                <View style={styles.driverContainer}>
                    {finished == false ?
                        <View style={styles.secondaryDriverConatiner_}>
                            {this.props.now ?
                                <Text style={[styles.driverTitle, { textAlign: 'center', marginVertical: y(5) }]}>Waiting for drivers to accept the ride request</Text> :
                                <Text style={[styles.driverTitle, { textAlign: 'center', marginVertical: y(5) }]}>Sending ride request to drivers</Text>
                            }
                            {toDisplay}
                            {this.props.now ?
                                <Text style={[styles.driverName, { textAlign: 'center', marginBottom: y(5), fontSize: y(12, true) }]}>Drivers will accept within <Text style={{ fontWeight: '700', }}>3 minutes</Text> and the trip would begin. If your trip is not accepted, you would be refunded fully</Text> :
                                <Text style={[styles.driverName, { textAlign: 'center', marginBottom: y(5), fontSize: y(12, true) }]}>We would send you a notification when this driver accepts your ride request. If your trip is not accepted, you would be refunded fully</Text>}

                        </View> :
                        <View style={[styles.secondaryDriverConatiner_, { justifyContent: 'center', alignItems: 'center', width: x(100), height: x(100) }]}>
                            <MaterialIndicator color={colors.GREEN} size={x(50)} />
                        </View>
                    }
                </View>
            );
        else {
            return (
                <View style={styles.driverContainer}>
                    <View style={styles.secondaryDriverConatiner_}>
                        <Text style={[styles.driverTitle, { textAlign: 'center', marginVertical: y(5), fontSize: y(16, true) }]}>Sadly a driver could not accept your request , please pick another trip</Text>
                        <TouchableOpacity style={styles.backButton} onPress={this.props.onPress}>
                            <Text style={[styles.driverTitle, { color: colors.WHITE, fontSize: y(15, true) }]}>Go back</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            );
        }
    };
};
import React from 'react';
import styles from './styles';
import AsyncStorage from '@react-native-community/async-storage';
import { Animated, View, Text, TouchableOpacity, Image, Easing, TouchableWithoutFeedback, PanResponder, StatusBar, Platform, Alert } from 'react-native';
import { signOut } from '../../Functions/Functions';
import Divider from '../../Components/Divider/Divider';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import storage from '@react-native-firebase/storage';

import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default class DrawerComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            userDetails: null,
            url: null,
        };
    }
    componentDidMount() {
        AsyncStorage.getItem('USER_DETAILS')
            .then(result => {
                if (result) {
                    const userDetails = JSON.parse(result);
                    this.setState({
                        userDetails: userDetails,
                    }, () => { this.setImage() })
                }
                else {
                    this.watchID = setInterval(() => {
                        AsyncStorage.getItem('USER_DETAILS')
                            .then((result_) => {
                                clearInterval(this.watchID);
                                const userDetails_ = JSON.parse(result_);
                                this.setState({
                                    userDetails: userDetails_,
                                }, () => { this.setImage() })
                            }).catch(error => { console.log(error.message) })
                    }, 300)
                }
            }).catch(error => { console.log(error.message) })
    };
    // componentDidUpdate() {
    //     AsyncStorage.getItem('USER_DETAILS')
    //         .then(r => {
    //             if (r) {
    //                 if (r !== JSON.stringify(this.state.userDetails ? this.state.userDetails : '')) {
    //                     AsyncStorage.getItem('USER_DETAILS')
    //                         .then(result => {
    //                             if (result) {
    //                                 const userDetails = JSON.parse(result);
    //                                 this.setState({
    //                                     userDetails: userDetails,
    //                                 }, () => { this.setImage() })
    //                             }
    //                             else {
    //                                 this.watchID = setInterval(() => {
    //                                     AsyncStorage.getItem('USER_DETAILS')
    //                                         .then((result_) => {
    //                                             clearInterval(this.watchID);
    //                                             const userDetails_ = JSON.parse(result_);
    //                                             this.setState({
    //                                                 userDetails: userDetails_,
    //                                             }, () => { this.setImage() })
    //                                         }).catch(error => { console.log(error.message) })
    //                                 }, 300)
    //                             }
    //                         }).catch(error => { console.log(error.message) })
    //                 }

    //             }
    //         }).catch(error => { console.log(error.message) })
    // };
    setImage = () => {
        if (this.props?.userDetails?.photoRef || this.state?.userDetails?.photoRef)
            storage().ref(`${this.props.userDetails ? this.props.userDetails.photoRef : this.state.userDetails.photoRef}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) })
    };
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.profile}>
                    <View style={[styles.profilePic, this.state.url ? { borderWidth: 0 } : {}]}>
                        {this.state.url ?
                            <Image
                                source={{ uri: this.state.url }}
                                resizeMode={'contain'}
                                style={{
                                    flex: 1,
                                    height: x(73),
                                    width: x(73),
                                }} />
                            : <></>}
                    </View>
                    <Text style={styles.name}>{this.props.userDetails ? this.props.userDetails.firstName + ' ' + this.props.userDetails.lastName : ''}</Text>
                    <Text style={styles.tripNo}>{`${this.props.userDetails ? this.props.choice == 'rideshare' ? this.props.userDetails.summarizedHistory.rideshare.displayTripNumber : this.props.userDetails.summarizedHistory.carpool.displayTripNumber : ''} ${this.props.userDetails ? (this.props.userDetails.summarizedHistory.carpool.displayTripNumber === 1 ? 'trip' : 'trips') : 'trips'}`}</Text>
                    <View style={[styles.rating, { alignItems: 'center' }]}>
                        <Text style={styles.ratingText}>{`${this.props.userDetails ? this.props.choice == 'rideshare' ? Number(this.props.userDetails.summarizedHistory.rideshare.rating).toFixed(1) : Number(this.props.userDetails.summarizedHistory.carpool.rating).toFixed(1) : ''} `}</Text>
                        <FontAwesome name={'star'} size={y(15)} color={'#FFC107'} />
                    </View>
                </View>

                <View style={styles.menu}>

                    <TouchableOpacity onPress={() => { this.props.hideMenu(); }}>
                        <View style={styles.menuList}>
                            <AntDesign name={'home'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Home</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('ScheduledTrips', { userDetails: this.props.userDetails })
                    }}>
                        <View style={styles.menuList}>
                            <AntDesign name={'calendar'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Scheduled trips</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>


                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('History', { userDetails: this.props.userDetails });
                    }}>
                        <View style={styles.menuList}>
                            <MaterialCommunityIcons name={'history'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>History</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('GetFreeRides', { userDetails: this.props.userDetails });
                    }}>
                        <View style={styles.menuList}>
                            <Octicons name={'gift'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Get free rides</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('Settings', {
                            userDetails: this.props.userDetails,
                            onReturnFromSavedPlaces: () => { this.props.onReturnFromSavedPlaces(); }
                        });
                    }}>
                        <View style={styles.menuList}>
                            <SimpleLineIcons name={'settings'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Settings</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity onPress={() => {
                        this.props.hideMenu();
                        this.props.navigation.navigate('ContactUs');
                    }}>
                        <View style={styles.menuList}>
                            <Feather name={'headphones'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Contact Us</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider}><Divider height={0.5} width={x(302)} borderRadius={0} borderColor={'#707070'} borderWidth={0.5} /></View>

                    <TouchableOpacity
                        onPress={() => {
                            if (this.props.status == 'OFFLINE')
                                Alert.alert(
                                    'Perch',
                                    'Are you sure you want to log out of Perch?',
                                    [
                                        {
                                            text: 'Cancel',
                                            //onPress: () => console.log('Cancel Pressed'),
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Log out',
                                            onPress: () => {
                                                signOut.call(this, this.props.forceUpdate);
                                                this.props.hideMenu();
                                            },
                                            style: 'destructive'
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            else if (this.props.status == 'ONLINE')
                                Alert.alert('Complete trip',
                                    'You cannot log out while you have an ongoing trip',
                                    [{
                                        text: 'OK',
                                    }])
                        }}
                    >
                        <View style={styles.menuList}>
                            <SimpleLineIcons name={'logout'} size={y(20)} style={styles.icons} />
                            <Text style={styles.menuText}>Log Out</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            </View>
        );
    }
};
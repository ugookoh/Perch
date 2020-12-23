import React from 'react';
import styles from './styles';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, ScrollView, Button, Platform, StatusBar, Alert } from 'react-native';
import { OfflineNotice, makeid, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import Icon from 'react-native-vector-icons/Feather';
import GetFreeRidesImage from '../../Images/svgImages/getFreeRides';
import Divider from '../../Components/Divider/Divider';
import Icon__ from 'react-native-vector-icons/Entypo';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default class GetFreeRides extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
            id: makeid(4).toUpperCase(),
        };

    }

    componentDidMount() {
        //this.closeAd();
    }
    render() {

        return (
            <View style={styles.container}>
                <View style={{ zIndex: 1, }}>
                    <Header name={'Get free rides'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                </View>
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.sharing}>
                    <GetFreeRidesImage />
                </View>
                <View style={styles.lowerContainer}>
                    <Text style={styles.mainText}>Share your code to start earning!</Text>
                    <Text style={styles.subText}>Get free kilometers whenever a friend uses your share code to create an account and book a ride ! You can see friends who used your link and the kilometers you got from the wallet screen.</Text>

                    <View style={[styles.share, { marginTop: y(10), marginBottom: y(45) }]}>
                        <View style={styles.shareCode}>
                            <Text style={styles.shareCodeText}>{`${this.state.id}-${this.props.route.params.userDetails.firstName.toUpperCase().replace(/ /g, '')}`}</Text>
                        </View>
                        <TouchableOpacity>
                            <View style={styles.send}>
                                <Icon__ name={'paper-plane'} color={WHITE} size={y(30)} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
};
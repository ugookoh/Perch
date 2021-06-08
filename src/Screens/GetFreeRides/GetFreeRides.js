import React from 'react';
import styles from './styles';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, ScrollView, Button, Platform, StatusBar, Alert } from 'react-native';
import { OfflineNotice, makeid, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import Clipboard from '@react-native-community/clipboard';
import GetFreeRidesImage from '../../Images/svgImages/getFreeRides';
import Divider from '../../Components/Divider/Divider';
import Icon__ from 'react-native-vector-icons/Entypo';
const [GREEN, WHITE, GREY, LIGHT_GREEN] = ['#4DB748', '#FFFFFF', '#918686', '#4db847'];

export default class GetFreeRides extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            userDetails: this.props.route.params.userDetails,
            animate: true
        };

        this.Y_START = y(55);
        this.Y_END = -y(100);
        this.position = new Animated.ValueXY({ x: 0, y: this.Y_END });

    }

    componentDidMount() {
        //this.closeAd();
    }

    animate = () => {
        if (this.state.animate)
            this.setState({ animate: false }, () => {
                Animated.spring(this.position, {
                    toValue: { x: 0, y: this.Y_START },
                    bounciness: 0,
                }).start(() => {
                    setTimeout(() => {
                        Animated.spring(this.position, {
                            toValue: { x: 0, y: this.Y_END },
                            bounciness: 0,
                        }).start(() => {
                            this.setState({ animate: true })
                        });
                    }, 2000);//HIDE BACK AFTER 2 SECONDS
                });
            });
    };

    render() {

        return (
            <View style={styles.container}>
                <Animated.View style={[{ width: width, alignItems: 'center', position: 'absolute', zIndex: 10, elevation: 10 }, this.position.getLayout()]}>
                    <View style={{ height: y(70), borderRadius: 10, width: x(313), backgroundColor: WHITE, justifyContent: 'space-around', alignItems: 'center', paddingVertical: y(20) }}>
                        <Text style={{ fontFamily: 'Gilroy-SemiBold', fontSize: y(14, true), color: GREEN }}>Copied to clipboard</Text>
                    </View>
                </Animated.View>
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
                            <Text style={styles.shareCodeText}>{this.state.userDetails.shareCode}</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            this.animate();
                            Clipboard.setString(`My Perch Share Code is ${this.state.userDetails.shareCode}`);
                        }}>
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
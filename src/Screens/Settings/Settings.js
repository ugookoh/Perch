import React from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon_ from 'react-native-vector-icons/Ionicons';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import { colors, OfflineNotice, openBrowser, signOut, x, y } from '../../Functions/Functions';
import CarInCity from '../../Images/svgImages/carInCity';
import GivingMoney from '../../Images/svgImages/givingMoney';
import styles from './styles';

export default class Settings extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
        };
        this.closeAd = this.closeAd.bind(this);
        this.animatedPosition = new Animated.Value(0);
        this.lowerposition = new Animated.Value(0);
    }
    closeAd() {
        Animated.spring(this.animatedPosition, {
            toValue: -y(170),
            bounciness: 0,
            useNativeDriver: false,
        }).start();

        Animated.spring(this.lowerposition, {
            toValue: -y(160),
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    }
    componentDidMount() {
        //this.closeAd();
    }
    render() {
        //const x=-this.animatedPosition;

        return (
            <View style={styles.container}>
                <Header name={'Settings'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />

                <TouchableOpacity style={{ zIndex: -1 }} onPress={() => { openBrowser(`https://perchrides.com/s/articles/why_should_you_be_a_perch_driver`) }}>
                    <Animated.View style={[styles.rWP, { top: this.animatedPosition }]}>
                        <TouchableOpacity style={[styles.rWP_x,]}
                            onPress={this.closeAd}
                        >
                            <Icon name={'x-circle'} color={colors.GREEN} size={y(23)} style={{ top: x(10), left: x(6) }} />
                        </TouchableOpacity>
                        <Text style={styles.rWP_Text}>{'Make money as you go home,\n to work, to school, anywhere.\nDrive with Perch now. '}</Text>
                        <View style={styles.rWP_GM}>
                            <GivingMoney height={'100%'} width={'100%'} />
                        </View>
                    </Animated.View>

                </TouchableOpacity>
                <Animated.View style={{ top: this.lowerposition }}>
                    <View>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('Profile', { userDetails: this.props.route.params.userDetails });
                        }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Profile</Text>
                                <Icon_ name={'ios-arrow-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('SavedPlaces', {
                                onReturn: () => { this.props.route.params.onReturnFromSavedPlaces(); }
                            })
                        }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Saved Places</Text>
                                <Icon_ name={'ios-arrow-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.navigate('Privacy')
                            }}>
                            <View style={styles.optionChoice}>
                                <Text style={styles.optionText}>Privacy</Text>
                                <Icon_ name={'ios-arrow-forward'} size={y(20)} />
                            </View>
                        </TouchableOpacity>
                        <Divider height={0.5} width={x(350)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} />
                    </View>

                    <View style={{ marginTop: y(20.5) }}>
                        <TouchableOpacity onPress={() => {
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
                                            signOut.call(this, () => { });
                                        },
                                        style: 'destructive'
                                    }
                                ],
                                { cancelable: false }
                            );

                        }}
                        >
                            <View style={styles.optionChoice}>
                                <Text style={styles.signOut}>Sign Out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={styles.cIC}>
                    <CarInCity />
                </View>

            </View>
        );
    }
};
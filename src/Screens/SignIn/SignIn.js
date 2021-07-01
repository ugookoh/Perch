import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import React from 'react';
import {
    BackHandler, Keyboard,
    LayoutAnimation, Platform, StatusBar,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, UIManager, View
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Button from '../../Components/Button/Button';
import {
    CustomLayoutLinear, handleConnectivityChange,
    handleLogin, Notifications, OfflineNotice,
    permissionLocation, x, y
} from '../../Functions/Functions';
import Logo from '../../Images/svgImages/logo';
import Icon from '../../Images/svgImages/signInIcons';
import styles from './styles';

export default class SignIn extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            email: '',
            password: '',
            errorMessage: '',
            loading: false,
            connection_Status: ""
        };
        this._keyboardDidShow = this._keyboardDidShow.bind(this);
    }

    componentDidMount() {
        SplashScreen.hide();
        permissionLocation();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.keyboardDidShowListener = Keyboard.addListener(('keyboardDidShow'), this._keyboardDidShow);
        this.netinfo = NetInfo.addEventListener(handleConnectivityChange.bind(this));
    }
    _keyboardDidShow(e) {
        if (Platform.OS === 'android') {
            AsyncStorage.getItem('ANDROID_KEYBOARD_HEIGHT')
                .then((value) => {
                    if (value == null) {
                        AsyncStorage.setItem('ANDROID_KEYBOARD_HEIGHT', JSON.stringify(e.endCoordinates.height))
                            .catch(error => { console.log(error.message) });
                    }
                })
                .catch((err) => { console.log(err.message) })
        }
    };
    handleBackButtonClick = () => {
        BackHandler.exitApp();
    };
    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.netinfo();
    };



    render() {
        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container} >
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <Notifications />
                    <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                    <View style={styles.logo}>
                        <Logo height={"100%"} width={"100%"} />
                    </View>
                    <View style={styles.signIn}>
                        <Text style={styles.sinUpText}>Sign In</Text>
                    </View>
                    <View style={styles.text1}>
                        <Text style={styles.regularText}>{`Log into your account to\ncontinue`}</Text>
                    </View>

                    <View style={[styles.searchSection, { position: 'absolute', top: y(285), left: x(27) }]}>
                        <View style={styles.envelope}><Icon height={"100%"} width={"100%"} margin={20.7} icon={'envelope'} /></View>
                        <TextInput
                            ref={(input) => { this.firstTextInput = input; }}
                            spellCheck={false}
                            keyboardType={'email-address'}
                            style={styles.textInput}
                            autoCapitalize={'none'}
                            placeholder={'Email Address'}
                            onChangeText={value => { this.setState({ email: value }) }}
                            value={this.state.email}
                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                            onSubmitEditing={() => {
                                if (this.state.password == '')
                                    this.secondTextInput.focus();
                                else
                                    Keyboard.dismiss();

                            }}
                        />
                    </View>
                    <View style={[styles.searchSection, { position: 'absolute', top: y(348), left: x(27) }]}>
                        <View style={styles.padlock}><Icon height={"100%"} width={"100%"} icon={'padlock'} /></View>
                        <TextInput
                            ref={(input) => { this.secondTextInput = input; }}
                            autoCapitalize={'none'}
                            spellCheck={false}
                            style={styles.textInput}
                            placeholder={'Password'}
                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                            onChangeText={value => { this.setState({ password: value }) }}
                            value={this.state.password}
                            onSubmitEditing={() => {
                                Keyboard.dismiss();
                            }}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={[styles.messageView, { top: y(StatusBar.currentHeight ? 408 : 412) }]}><Text style={[styles.error,]}>{this.state.errorMessage}</Text></View>
                    <Button text={'Log In'} width={x(322)} height={y(48)} top={y(470)} left={x(27)} loading={this.state.loading}
                        onPress={() => {
                            Keyboard.dismiss();
                            if (this.state.email == '')
                                this.setState({ errorMessage: 'Email cannot be left empty' });
                            else if (this.state.password == '')
                                this.setState({ errorMessage: 'Password cannot be left empty' });
                            else {
                                this.setState({ loading: true })
                                handleLogin.call(this);
                            }
                        }}
                    />
                    <TouchableOpacity
                        style={[styles.messageView, { top: y(535) }]}
                    >
                        <Text style={[styles.messageText, { color: '#000000' }]}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <View style={[styles.messageView, { top: y(667) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Don't have an account?</Text></View>
                    <TouchableOpacity onPress={() => { this.props.navigation.navigate('SignUp') }} style={[styles.messageView, { top: y(705) }]}><Text style={[styles.messageText, { color: '#4DB748', fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Create New Account</Text></TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }
};
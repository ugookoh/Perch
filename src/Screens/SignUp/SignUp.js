import React from 'react';
import styles from './styles';
import { Text, View, StatusBar, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, LayoutAnimation, UIManager, } from 'react-native';
import { createUserDetails, OfflineNotice, x, y, height, width, dimensionAssert, CustomLayoutLinear } from '../../Functions/Functions';
import AsyncStorage from '@react-native-community/async-storage';
import Logo from '../../Images/svgImages/logo';
import Button from '../../Components/Button/Button';
import Form from '../../Components/SignUpForm/SignUpForm';

export default class SignUp extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            errorMessage: '',
            loading: false,
        }
        this._keyboardDidShow = this._keyboardDidShow.bind(this);
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(('keyboardDidShow'), this._keyboardDidShow);
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
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
    }
    render() {
        const marginTop = y(5);
        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

                    <KeyboardAvoidingView behavior={'position'}>
                        <View style={styles.secContainer}>
                            <View style={styles.logo}>
                                <Logo height={"100%"} width={"100%"} />
                            </View>
                            <View style={styles.signUp}>
                                <Text style={styles.sinUpText}>Sign Up</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={styles.topInput}>
                                    <Form height={y(48)} width={x(154)} placeholder={'First Name'} onChangeText={(value) => { this.setState({ firstName: value }) }} value={this.state.firstName} form={'default'} onEndEditing={() => { }} />
                                    <Form height={y(48)} width={x(154)} placeholder={'Last Name'} onChangeText={(value) => { this.setState({ lastName: value }) }} value={this.state.lastName} form={'default'} onEndEditing={() => { }} />
                                </View>
                                <Form height={y(48)} width={x(322)} placeholder={'Email'} onChangeText={(value) => { this.setState({ email: value }) }} value={this.state.email} form={'email'} marginTop={marginTop} onEndEditing={() => { }} />
                                <Form height={y(48)} width={x(322)} placeholder={'Phone Number'} onChangeText={(value) => { this.setState({ phoneNumber: value }) }} value={this.state.phoneNumber} form={'number'} marginTop={marginTop} onEndEditing={() => { }} />
                                <Form height={y(48)} width={x(322)} placeholder={'Password'} onChangeText={(value) => { this.setState({ password: value }) }} value={this.state.password} form={'password'} marginTop={marginTop} onEndEditing={() => { }} />
                                <Form height={y(48)} width={x(322)} placeholder={'Confirm Password'} onChangeText={(value) => { this.setState({ confirmPassword: value }) }} value={this.state.confirmPassword} form={'password'} marginTop={marginTop} onEndEditing={() => { Keyboard.dismiss() }} />
                            </View>
                        </View>

                    </KeyboardAvoidingView>
                    {this.state.errorMessage == '' ? <></> : <Text style={styles.error}>{this.state.errorMessage}</Text>}
                    <Button text={'Sign Up'} height={y(48)} width={x(322)} left={x(27)} top={y(dimensionAssert() ? 590 : 550)}
                        onPress={() => {
                            Keyboard.dismiss();
                            //console.log(this.state)
                            if (this.state.firstName == '')
                                this.setState({ errorMessage: 'Please enter your first name' });
                            else if (this.state.lastName == '')
                                this.setState({ errorMessage: 'Please enter your last name' });
                            else if (this.state.email == '' || this.state.email.length < 4)
                                this.setState({ errorMessage: 'Please enter your email address' });
                            else if (this.state.phoneNumber == '')
                                this.setState({ errorMessage: 'Please enter your phone number' });
                            else if (this.state.password == '')
                                this.setState({ errorMessage: 'Please enter a password' });
                            else if (this.state.password !== this.state.confirmPassword)
                                this.setState({ errorMessage: 'Passwords do not match', confirmPassword: '' });
                            else {
                                this.setState({ loading: true });
                                createUserDetails.call(
                                    this, this.state.firstName,
                                    this.state.lastName,
                                    this.state.email,
                                    this.state.phoneNumber,
                                    this.state.password
                                )
                            }
                        }}
                        loading={this.state.loading} />

                    <View style={[styles.messageView, { top: y(667) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Have an account?</Text></View>
                    <TouchableOpacity onPress={() => { this.props.navigation.navigate('SignIn') }} style={[styles.messageView, { top: y(705) }]}><Text style={[styles.messageText, { color: '#4DB748', fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Log In</Text></TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }
};
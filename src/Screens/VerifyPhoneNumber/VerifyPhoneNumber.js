import React from 'react';
import styles from './styles';
import { Text, View, StatusBar, Dimensions, TouchableOpacity, KeyboardAvoidingView, SafeAreaView, Keyboard, Platform } from 'react-native';
import { OfflineNotice, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import Logo from '../../Images/svgImages/logo';
import Button from '../../Components/Button/Button';
import VerifyInputForm from '../../Components/VerifyInputForm/VerifyInputForm';
import OnScreenKeyboard from '../../Components/OnScreenKeyboard/OnScreenKeyboard';

export default class VerifyPhoneNumber extends React.Component {
    constructor() {
        super();
        this.state = {
            one_: '1',
            two_: '2',
            three_: '3',
            four_: '4',
            string: '1234',
            loading: false
        }

        this.deleteFunction = this.deleteFunction.bind(this);
        this.updateFunction = this.updateFunction.bind(this);
    }

    deleteFunction() {
        if (this.state.string.length === 0)
            return;
        else {
            const length = this.state.string.length;
            switch (length) {
                case 1: {
                    this.setState({ one_: '', string: this.state.string.substring(0, length - 1) });
                } break;
                case 2: {
                    this.setState({ two_: '', string: this.state.string.substring(0, length - 1) });
                } break;
                case 3: {
                    this.setState({ three_: '', string: this.state.string.substring(0, length - 1) });
                } break;
                case 4: {
                    this.setState({ four_: '', string: this.state.string.substring(0, length - 1) });
                } break;
            }
        }
    }
    updateFunction(data) {
        if (this.state.string.length === 4)
            return;
        else {
            const length = this.state.string.length;
            switch (length) {
                case 0: {
                    this.setState({ one_: data, string: (this.state.string + data) });
                } break;
                case 1: {
                    this.setState({ two_: data, string: (this.state.string + data) });
                } break;
                case 2: {
                    this.setState({ three_: data, string: (this.state.string + data) });
                } break;
                case 3: {
                    this.setState({ four_: data, string: (this.state.string + data) });
                } break;
            }
        }
    }
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.logo}>
                    <Logo height={"100%"} width={"100%"} />
                </View>
                <View style={styles.signUp}>
                    <Text style={styles.sinUpText}>Verify Phone Number</Text>
                </View>
                <View style={styles.text1}>
                    <Text style={styles.regularText}>{`Enter the 4 digit verification code\n sent to your device.`}</Text>
                </View>
                <View style={styles.form}>
                    <VerifyInputForm text={this.state.one_} />
                    <VerifyInputForm text={this.state.two_} />
                    <VerifyInputForm text={this.state.three_} />
                    <VerifyInputForm text={this.state.four_} />
                </View>
                <OnScreenKeyboard top={y(371)} left={x(56)} deleteFunction={this.deleteFunction} updateFunction={this.updateFunction} />
                <Button text={'Verify'} height={y(48)} width={x(322)} left={x(27)} top={y(655)} onPress={() => { this.props.navigation.navigate('Main') }} loading={this.state.loading} />
                <View style={[styles.messageView, { top: y(729) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Didn't recieve a code?</Text></View>
                <TouchableOpacity style={[styles.messageView, { top: y(767) }]}><Text style={[styles.messageText, { color: '#4DB748', fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Resend</Text></TouchableOpacity>
            </SafeAreaView>
        );
    }
}
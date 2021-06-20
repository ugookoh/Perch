import React from 'react';
import { Alert, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../Components/Button/Button';
import OnScreenKeyboard from '../../Components/OnScreenKeyboard/OnScreenKeyboard';
import VerifyInputForm from '../../Components/VerifyInputForm/VerifyInputForm';
import { OfflineNotice, sendVerification, width, x, y } from '../../Functions/Functions';
import Logo from '../../Images/svgImages/logo';
import styles from './styles';
export default class VerifyPhoneNumber extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            one_: '',
            two_: '',
            three_: '',
            four_: '',
            five_: '',
            six_: '',
            string: '',
            loading: false,
            timer: 0,
            userDetails: this.props.route.params.userDetails,
        }

        this.deleteFunction = this.deleteFunction.bind(this);
        this.updateFunction = this.updateFunction.bind(this);
    }
    resend = (type) => {
        this.setState({ timer: 60 }, () => {
            const time = setInterval(() => {
                if (this.state.timer == 0)
                    clearInterval(time);
                else
                    this.setState({ timer: this.state.timer - 1 })
            }, 1000);
        });
        sendVerification.call(this, this.state.userDetails.userID, type, 'storeAndSend', 'nocode', this.state.userDetails.phoneNumber, this.state.userDetails.email, this.state.userDetails.firstName, 'VerifyPhoneNumber');
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
                case 5: {
                    this.setState({ five_: '', string: this.state.string.substring(0, length - 1) });
                } break;
                case 6: {
                    this.setState({ six_: '', string: this.state.string.substring(0, length - 1) });
                } break;
            }
        }
    }
    updateFunction(data) {
        if (this.state.string.length === 6)
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
                case 4: {
                    this.setState({ five_: data, string: (this.state.string + data) });
                } break;
                case 5: {
                    this.setState({ six_: data, string: (this.state.string + data) });
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
                    <Text style={styles.regularText}>Enter the 6 digit verification code{'\n'} sent to <Text style={{ color: '#4DB748' }}>{this.state.userDetails.phoneNumber}</Text></Text>
                </View>
                <View style={styles.form}>
                    <VerifyInputForm text={this.state.one_} />
                    <VerifyInputForm text={this.state.two_} />
                    <VerifyInputForm text={this.state.three_} />
                    <VerifyInputForm text={this.state.four_} />
                    <VerifyInputForm text={this.state.five_} />
                    <VerifyInputForm text={this.state.six_} />
                </View>
                <OnScreenKeyboard top={y(371)} left={x(56)} deleteFunction={this.deleteFunction} updateFunction={this.updateFunction} />
                <Button text={'Verify'} height={y(48)} width={x(322)} left={x(27)} top={y(655)} onPress={() => {
                    if (this.state.string.length == 6)
                        this.setState({ loading: true }, () => {
                            sendVerification.call(this, this.state.userDetails.userID, 'phoneNumber', 'check', this.state.string, this.state.userDetails.phoneNumber, this.state.userDetails.email, this.state.userDetails.firstName, 'VerifyPhoneNumber');
                        })
                    else
                        Alert.alert('Verification code error', 'The code must be 6 digits long');
                }} loading={this.state.loading} />
                <View style={[styles.messageView, { top: y(729) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Didn't recieve a code?</Text></View>
                {
                    this.state.timer == 0 ?
                        <TouchableOpacity style={[styles.messageView, { top: y(767) }]} onPress={() => { this.resend('phoneNumber') }}><Text style={[styles.messageText, { color: '#4DB748', fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Resend</Text></TouchableOpacity> :
                        <Text style={[styles.messageText, { fontFamily: 'Gilroy-Bold', top: y(767), position: 'absolute', width: width, textAlign: 'center' }]}>Resend available in <Text style={{ color: '#4DB748', textDecorationLine: 'underline' }}>{`0:${('0' + this.state.timer).slice(-2)}`}</Text></Text>
                }
            </SafeAreaView>
        );
    }
}
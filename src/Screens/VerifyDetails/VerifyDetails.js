import React from 'react';
import styles from './styles';
import { Text, View, StatusBar, Dimensions, TouchableOpacity, KeyboardAvoidingView, SafeAreaView, Keyboard, Platform, Animated, Alert } from 'react-native';
import { OfflineNotice, signOut, x, y, height, width, sendVerification } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import axios from 'axios';
import Button from '../../Components/Button/Button';
import VerifyInputForm from '../../Components/VerifyInputForm/VerifyInputForm';
import OnScreenKeyboard from '../../Components/OnScreenKeyboard/OnScreenKeyboard';


export default class VerifyDetails extends React.Component {
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
            scrollY: new Animated.Value(0),
            timer: 0,
            userDetails: this.props.route.params.userDetails,
            display: this.props.route.params.display,
            type: this.props.route.params.type == 'Email' ? 'email' : 'phoneNumber',
        }

        this.deleteFunction = this.deleteFunction.bind(this);
        this.updateFunction = this.updateFunction.bind(this);
    };
    componentDidMount() {
        this.sendVerificationCode(this.state.type);
    }
    sendVerificationCode = (type) => {
        this.setState({ timer: 60 }, () => {
            const time = setInterval(() => {
                if (this.state.timer == 0)
                    clearInterval(time);
                else
                    this.setState({ timer: this.state.timer - 1 })
            }, 1000);
        });
        if (this.state.timer == 0)
            switch (type) {
                case 'email': {
                    sendVerification(this.state.userDetails.userID,
                        'email',
                        'storeAndSend',
                        '',
                        '',
                        this.state.display,
                        this.state.userDetails.firstName);
                } break;
                case 'phoneNumber': {
                    sendVerification(this.state.userDetails.userID,
                        'phoneNumber',
                        'storeAndSend',
                        '',
                        this.state.display,
                        '',
                        this.state.userDetails.firstName);
                } break;
            };
    };

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
            <View style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.header}>
                    <Header name={`Verify ${this.props.route.params.type}`} scrollY={this.state.scrollY} onPress={() => {
                        if (this.props.route.params.type !== 'Main')
                            this.props.navigation.goBack()
                    }} />
                </View>
                <View style={styles.text1}>
                    <Text style={styles.regularText}>Enter the 6 digit verification code{'\n'} sent to <Text style={{ color: '#4DB748' }}>{this.state.display}</Text></Text>
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
                    if (this.state.string.length == 6) {
                        this.setState({ loading: true }, () => {
                            const type = this.state.type;
                            const code = this.state.string;
                            switch (type) {
                                case 'email': {
                                    axios.post(`https://us-central1-perch-01.cloudfunctions.net/sendVerificationCode`,
                                        {
                                            userID: this.state.userDetails.userID,
                                            type: type,
                                            action: 'check',
                                            code: code,
                                            phoneNumber: '',
                                            email: this.state.display,
                                            name: this.state.userDetails.firstName
                                        })
                                        .then((r) => {
                                            if (r.data) {
                                                axios.post(`https://us-central1-perch-01.cloudfunctions.net/changeEmailAndPhoneNumberAfterVerifying`, {
                                                    userID: this.state.userDetails.userID,
                                                    type: type,
                                                    phoneNumber: '',
                                                    email: this.state.display,
                                                })
                                                    .then(() => {
                                                        Alert.alert('Verified', `Your ${this.props.route.params.type} has been successfully verified`,
                                                            [{
                                                                text: 'Ok',
                                                                onPress: () => { this.props.navigation.goBack(); },
                                                                style: 'cancel'
                                                            },],
                                                            { cancelable: false }
                                                        );
                                                    })
                                                    .catch((error) => {
                                                        Alert.alert('Network error', 'Please resend and try again',);
                                                        this.setState({ loading: false });
                                                    })
                                            }
                                            else
                                                Alert.alert('Error', 'Validation code is not valid, please resend and try again',)
                                            this.setState({ loading: false });
                                        })
                                        .catch((error) => {
                                            Alert.alert('Network error', 'Please resend and try again',);
                                            this.setState({ loading: false });
                                        })

                                } break;
                                case 'phoneNumber': {
                                    axios.post(`https://us-central1-perch-01.cloudfunctions.net/sendVerificationCode`,
                                        {
                                            userID: this.state.userDetails.userID,
                                            type: type,
                                            action: 'check',
                                            code: code,
                                            phoneNumber: this.state.display,
                                            email: '',
                                            name: this.state.userDetails.firstName
                                        })
                                        .then((r) => {
                                            if (r.data) {
                                                axios.post(`https://us-central1-perch-01.cloudfunctions.net/changeEmailAndPhoneNumberAfterVerifying`, {
                                                    userID: this.state.userDetails.userID,
                                                    type: type,
                                                    phoneNumber: '',
                                                    email: this.state.display,
                                                }).then(() => {
                                                    Alert.alert('Verified', `Your ${this.props.route.params.type} has been successfully verified`,
                                                        [{
                                                            text: 'Ok',
                                                            onPress: () => { this.props.navigation.goBack(); },
                                                            style: 'cancel'
                                                        },],
                                                        { cancelable: false }
                                                    );
                                                })
                                                    .catch((error) => {
                                                        Alert.alert('Network error', 'Please resend and try again',);
                                                        this.setState({ loading: false });
                                                    })
                                            }
                                            else {
                                                Alert.alert('Error', 'Validation code is not valid, please resend and try again',)
                                                this.setState({ loading: false });
                                            }
                                        })
                                        .catch((error) => {
                                            Alert.alert('Network error', 'Please resend and try again',);
                                            this.setState({ loading: false });
                                        })
                                } break;
                            }




                        })
                    }
                    else
                        Alert.alert('Verification code error', 'The code must be 6 digits long');
                }} loading={this.state.loading} />
                <View style={[styles.messageView, { top: y(729) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Didn't recieve a code?</Text></View>
                <View style={[styles.messageView, { top: y(767) }]}>
                    <View style={{ flexDirection: 'row', justifyContent: this.props.route.params.type == 'Main' ? 'space-between' : 'center', width: x(150) }}>
                        {
                            this.state.timer == 0 ?
                                <TouchableOpacity onPress={() => { this.sendVerificationCode(this.state.type) }} ><Text style={[styles.messageText, { color: '#4DB748', fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Resend</Text></TouchableOpacity> :
                                <Text style={[styles.messageText, { fontFamily: 'Gilroy-Bold', width: width, textAlign: 'center', }]}>Resend available in <Text style={{ color: '#4DB748', textDecorationLine: 'underline' }}>{`0:${('0' + this.state.timer).slice(-2)}`}</Text></Text>
                        }
                    </View>
                </View>
            </View>
        );
    }
};
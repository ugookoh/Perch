import React from 'react';
import styles from './styles';
import { Text, View, StatusBar, Dimensions, TouchableOpacity, KeyboardAvoidingView, SafeAreaView, Keyboard, Platform, Animated, Alert } from 'react-native';
import { OfflineNotice, signOut, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import Logo from '../../Images/svgImages/logo';
import Button from '../../Components/Button/Button';
import VerifyInputForm from '../../Components/VerifyInputForm/VerifyInputForm';
import OnScreenKeyboard from '../../Components/OnScreenKeyboard/OnScreenKeyboard';


/**
 * WE COME HERE WHEN THE USER OPENS THE APP AND HAS LOGGED IN BUT HAS NOT CONFIMED HIS EMAIL/PHONE NUMBER 
 * SO WE SHOW THIS SCREEN CAUSE THE NUMBER MUST AT LEAST BE VERIFIED  AND WE HAVE A SIGN OUT SCREEN AT THE BOTTOM TO GO BACK HOME IS YOU DONT WANT 
 * TO KEEP USING THAT ACCOUNT
 */
export default class VerifyDetails extends React.Component {
    constructor() {
        super();
        this.state = {
            one_: '',
            two_: '',
            three_: '',
            four_: '',
            string: '',
            loading: false,
            scrollY: new Animated.Value(0),
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
                    <Text style={styles.regularText}>{`Enter the 4 digit verification code\n sent to your device.`}</Text>
                </View>
                <View style={styles.form}>
                    <VerifyInputForm text={this.state.one_} />
                    <VerifyInputForm text={this.state.two_} />
                    <VerifyInputForm text={this.state.three_} />
                    <VerifyInputForm text={this.state.four_} />
                </View>
                <OnScreenKeyboard top={y(371)} left={x(56)} deleteFunction={this.deleteFunction} updateFunction={this.updateFunction} />
                <Button text={'Verify'} height={y(48)} width={x(322)} left={x(27)} top={y(655)} onPress={() => {
                    Alert.alert('Verified',
                        `Your ${this.props.route.params.type} has been successfully verified`,
                        [
                            {
                                text: 'Ok',
                                onPress: () => {
                                    if (this.props.route.params.type !== 'Main') {  //verify and change all the userdetails and then work on updating state for the profile screen at the goback()
                                        this.props.navigation.goBack()
                                    }
                                    else
                                        this.props.navigation.navigate('Main')
                                },
                                style: 'cancel'
                            },
                        ],
                        { cancelable: false }
                    )
                }} loading={this.state.loading} />
                <View style={[styles.messageView, { top: y(729) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Didn't recieve a code?</Text></View>
                <View style={[styles.messageView, { top: y(767) }]}>
                    <View style={{ flexDirection: 'row', justifyContent: this.props.route.params.type == 'Main' ? 'space-between' : 'center', width: x(150) }}>
                        <TouchableOpacity ><Text style={[styles.messageText, { color: '#4DB748', fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Resend</Text></TouchableOpacity>
                        {
                            this.props.route.params.type == 'Main' ?
                                <TouchableOpacity
                                    onPress={() => {
                                        signOut.call(this);
                                    }}><Text style={[styles.messageText, { color: '#FF0000', fontFamily: 'Gilroy-SemiBold', }]}>Sign Out</Text>
                                </TouchableOpacity> :
                                <></>
                        }
                    </View>
                </View>
            </View>
        );
    }
};
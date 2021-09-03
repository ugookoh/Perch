import database from '@react-native-firebase/database';
import axios from 'axios';
import React from 'react';
import {
    Alert, Animated,
    Keyboard, Platform, Text, TextInput,
    TouchableOpacity, TouchableWithoutFeedback,
    View
} from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import stripe from 'tipsi-stripe';
import Button from '../../Components/Button/Button';
import Header from '../../Components/Header/Header';
import {
    buyKilometers,
    OfflineNotice,
    x, y, colors
} from '../../Functions/Functions';
import ApplePayLogo from '../../Images/svgImages/applePayLogo';
import GenericPaymentCard from '../../Images/svgImages/genericPaymentCard';
import GooglePaylogo from '../../Images/svgImages/googlePayLogo';
import MasterCard from '../../Images/svgImages/mastercard';
import Visa from '../../Images/svgImages/visa';
import styles from './styles';

export default class AddFunds extends React.Component { //////////////***ADD A BREAKDOWN OF THE FUNDS LIKE TAX AND ALL THAT, NOT JUST A TOTAL. MAKE IT LIKE A LITTLE DYNAMIC LIST... WE MUST ALSO ADD THE PLANS */
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            kms: '',
            creditCard: true,//USE THIS TO TEST FOR CREDIT CARD
            userDetails: this.props.route.params.userDetails,
            loading: false,
            paymentCompleted: null,
            rate: 0,
            cost: 0,
            selected: 'NONE',
            cardDetails: null,
        };
    }

    componentDidMount() {
        database().ref(`costPerPerchKM`).on('value', snapshot => {
            this.setState({ rate: snapshot.val() });
        });

        database().ref(`cards/${this.state.userDetails.userID}/selected`).on('value', snapshot => {
            if (snapshot.val()) {
                if (snapshot.val() != 'applePay' && snapshot.val() != 'googlePay')
                    database().ref(`cards/${this.state.userDetails.userID}/${snapshot.val()}`).once('value', snap => {
                        this.setState({ cardDetails: snap.val(), selected: snapshot.val() })
                    })
                else
                    this.setState({ selected: snapshot.val(), });
            }
        })
    };

    render() {
        const title = `Add kilometers to your wallet`;
        const subTitle = `How many kilometers would you like to add to your Perch wallet. You can purchase a minimum of 20 kms and a maximum of 100 kms`;
        let card = <></>;

        switch (this.state.selected) {
            case 'NONE': {
                card = <View style={[styles.subContainer, {}]}>
                    <TouchableOpacity style={styles.innerContainer}
                        onPress={() => {
                            this.props.route.params.refresh(this.state.selected);
                            this.props.route.params.returnToAddfunds(true);
                            this.props.navigation.navigate('Wallet', {
                                userDetails: this.state.userDetails,
                                choice: this.state.selected,
                                TOP_OF_TRIPS: 0,
                            });
                        }}>
                        <Text style={styles.text}>Pick payment method</Text>
                        <Icon name={'arrow-right'} size={y(12)} />
                    </TouchableOpacity>
                </View>;
            } break;
            case 'applePay': {
                card = <View style={[styles.subContainer, {}]} >
                    <TouchableOpacity style={styles.innerContainer}
                        onPress={() => {
                            this.props.route.params.refresh(this.state.selected);
                            this.props.route.params.returnToAddfunds(true);
                            this.props.navigation.navigate('Wallet', {
                                userDetails: this.state.userDetails,
                                choice: this.state.selected,
                                TOP_OF_TRIPS: 0,
                            });
                        }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.visa}><ApplePayLogo /></View>
                            <Text style={[styles.text, { marginLeft: x(40) }]}>{`Apple Pay`}</Text>
                        </View>
                        <Icon name={'arrow-right'} size={y(12)} />
                    </TouchableOpacity>
                </View>
            } break;
            case 'googlePay': {
                card = <View style={[styles.subContainer, {}]} >
                    <TouchableOpacity style={styles.innerContainer}
                        onPress={() => {
                            this.props.route.params.refresh(this.state.selected);
                            this.props.route.params.returnToAddfunds(true);
                            this.props.navigation.navigate('Wallet', {
                                userDetails: this.state.userDetails,
                                choice: this.state.selected,
                                TOP_OF_TRIPS: 0,
                            });
                        }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.googlePayLogo}><GooglePaylogo /></View>
                            <Text style={[styles.text, { marginLeft: x(50) }]}>{`Google Pay`}</Text>
                        </View>
                        <Icon name={'arrow-right'} size={y(12)} />
                    </TouchableOpacity>
                </View>
            } break;
            default: {
                card = <View style={[styles.subContainer, {}]} >
                    <TouchableOpacity style={styles.innerContainer}
                        onPress={() => {
                            this.props.route.params.refresh(this.state.selected);
                            this.props.route.params.returnToAddfunds(true);
                            this.props.navigation.navigate('Wallet', {
                                userDetails: this.state.userDetails,
                                choice: this.state.selected,
                                TOP_OF_TRIPS: 0,
                            });
                        }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.visa}>
                                {this.state.cardDetails.card.brand == "Visa" ?
                                    <Visa /> :
                                    this.state.cardDetails.card.brand == "Mastercard" ?
                                        <MasterCard /> :
                                        <GenericPaymentCard />}
                            </View>
                            <Text style={[styles.text, { marginLeft: x(50) }]}>{`•••• •••• •••• ${this.state.cardDetails.card.last4}  -  ${(this.state.cardDetails.card.expMonth || this.state.cardDetails.card.exp_month)}/${(this.state.cardDetails.card.expYear || this.state.cardDetails.card.exp_year)}`}</Text>
                        </View>
                        <Icon name={'arrow-right'} size={y(12)} />
                    </TouchableOpacity>
                </View>
            };
        };

        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss();
            }}>
                <View style={styles.container}>
                    <View style={{ zIndex: 1 }}>
                        <Header name={'Add kilometers'} scrollY={this.state.scrollY} onPress={() => {
                            this.props.route.params.refresh(null)
                            this.props.route.params.returnToAddfunds(false)
                            this.props.navigation.goBack();
                        }} />
                    </View>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <Text style={[styles.title, { marginTop: y(30) }]}>{title}</Text>
                    <Text style={[styles.subTitle]}>{subTitle}</Text>
                    <View style={[styles.box, { marginTop: y(20) }]}>
                        <TextInput
                            ref={(ref) => { this.box = ref; }}
                            spellCheck={false}
                            style={[styles.textInput, {}]}
                            placeholder={'----'}
                            onChangeText={(value) => {
                                if (value.length <= 3) {
                                    const cost = Number(value) * this.state.rate;
                                    this.setState({ kms: value, cost: cost });
                                }
                            }}
                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                            value={this.state.kms}
                            keyboardType={'number-pad'}
                            blurOnSubmit={false}
                            onSubmitEditing={() => {
                                Keyboard.dismiss();
                            }}
                        />
                        <Text style={[styles.kmText]}>kilometers</Text>
                    </View>

                    <Text style={styles.cash}>$ {this.state.cost.toFixed(2)}</Text>
                    {card}
                    <View style={styles.button}>
                        <Button text={'Buy kilometers'} width={x(343)} height={y(54)} top={0} left={0} zIndex={2} onPress={() => {
                            Keyboard.dismiss()
                            if (this.state.kms == '')
                                Alert.alert('Enter quantity', 'Please enter the amount of kilometers you wish to purchase');
                            else if (Number(this.state.kms) < 20 || Number(this.state.kms) > 100)
                                Alert.alert('Limit error', 'You can purchase a minimum of 20 kilometers and a maximum of 100 kilometers')
                            else if (this.state.selected == 'NONE')
                                Alert.alert('Payment Method', 'Please pick a payment method', [{
                                    text: 'Ok',
                                }, {
                                    text: 'Select payment method',
                                    style: 'cancel',
                                    onPress: () => {
                                        this.props.route.params.refresh(this.state.selected);
                                        this.props.route.params.returnToAddfunds(true);
                                        this.props.navigation.navigate('Wallet', {
                                            userDetails: this.state.userDetails,
                                            choice: this.state.selected,
                                            TOP_OF_TRIPS: 0,
                                        });
                                    },
                                }])
                            else if (this.state.selected == 'applePay') {
                                stripe.canMakeNativePayPayments()
                                    .then(canUsePayment => {
                                        if (canUsePayment) {
                                            stripe.paymentRequestWithApplePay([
                                                { label: `Buy ${this.state.kms} Perch Kilometers`, amount: this.state.cost.toFixed(2) },
                                                { label: 'Perch', amount: this.state.cost.toFixed(2) },
                                            ], {
                                                currencyCode: 'CAD',
                                                countryCode: 'CA',
                                            })
                                                .then((result) => {
                                                    stripe.completeApplePayRequest()
                                                        .then(() => {
                                                            //PAYMENT PROCESSED
                                                            this.setState({ loading: true }, () => {
                                                                axios.post(`https://us-central1-perch-01.cloudfunctions.net/buyPerchKilometers`, {
                                                                    quantity: Number(this.state.kms),
                                                                    userID: this.state.userDetails.userID,
                                                                    timestamp: new Date().getTime(),
                                                                    status: 'payment_completed_on_client',
                                                                    nativePayType: 'applePay',
                                                                    paymentIntentId: result.tokenId
                                                                })
                                                                    .then(() => {
                                                                        this.setState({ paymentCompleted: true })
                                                                    })
                                                                    .catch(error => {
                                                                        Alert.alert('Payment Error', `Error: ${error.message}. Please contact us`);
                                                                        this.setState({ loading: false })
                                                                    })
                                                            })
                                                        })
                                                        .catch(error => {
                                                            Alert.alert('Payment Error', error.message);
                                                            stripe.cancelNativePayRequest()
                                                        })
                                                }).catch(error => {
                                                    Alert.alert('Payment Error', error.message);
                                                    stripe.cancelNativePayRequest()
                                                })
                                        }
                                        else
                                            Alert.alert('Payment Error', `You cannot use ${Platform.OS == 'ios' ? 'Apple Pay' : 'Google Pay'}, please select another payment method or add a credit/debit card`);
                                    })
                                    .catch(error => { Alert.alert('Payment Error', error.message) })
                            }
                            else if (this.state.selected == 'googlePay') {
                                stripe.canMakeNativePayPayments()
                                    .then(canUsePayment => {
                                        if (canUsePayment) {
                                            stripe.paymentRequestWithAndroidPay({
                                                total_price: this.state.cost.toFixed(2),
                                                currency_code: 'CAD',
                                                shipping_address_required: false,
                                                billing_address_required: false,
                                                shipping_countries: ["CA"],
                                                line_items: [{
                                                    currency_code: 'CAD',
                                                    description: 'Perch Kilometers',
                                                    total_price: this.state.cost.toFixed(2),
                                                    unit_price: this.state.cost.toFixed(2),
                                                    quantity: '1',
                                                }],
                                            })
                                                .then((result) => {
                                                    //PAYMENT PROCESSED
                                                    this.setState({ loading: true }, () => {
                                                        axios.post(`https://us-central1-perch-01.cloudfunctions.net/buyPerchKilometers`, {
                                                            quantity: Number(this.state.kms),
                                                            userID: this.state.userDetails.userID,
                                                            timestamp: new Date().getTime(),
                                                            status: 'payment_completed_on_client',
                                                            nativePayType: 'googlePay',
                                                            paymentIntentId: result.tokenId
                                                        })
                                                            .then(() => {
                                                                this.setState({ paymentCompleted: true })
                                                            })
                                                            .catch(error => {
                                                                Alert.alert('Payment Error', `Error: ${error.message}. Please contact us`);
                                                                this.setState({ loading: false })
                                                            })
                                                    })
                                                })
                                                .catch(error => {
                                                    Alert.alert('Payment Error', error.message);
                                                    stripe.cancelNativePayRequest()
                                                })
                                        }
                                        else
                                            Alert.alert('Payment Error', `You cannot use ${Platform.OS == 'ios' ? 'Apple Pay' : 'Google Pay'}, please select another payment method or add a credit/debit card`);
                                    })
                                    .catch(error => { Alert.alert('Payment Error', error.message) })
                            }
                            else {
                                buyKilometers.call(this, {
                                    cardId: this.state.cardDetails.card.cardId,
                                    customerID: this.state.userDetails.stripeCustomerID,
                                    quantity: Number(this.state.kms),
                                    userID: this.state.userDetails.userID,
                                    timestamp: new Date().getTime(),
                                })
                            }
                        }}
                        />
                    </View>
                    {this.state.loading ?
                        <View style={[styles.loading, {}]}>
                            <View style={styles.loadingContainer}>
                                {this.state.paymentCompleted ?
                                    <>
                                        <Text style={styles.conclusion}>Payment has been successfully processed, thank you for using Perch!</Text>
                                        <View style={[styles.button, { width: x(280), marginTop: y(10) }]}>
                                            <Button text={'Go back'} width={x(280)} height={y(54)} top={0} left={0} zIndex={2} onPress={() => {
                                                this.props.route.params.refresh(null)
                                                this.props.route.params.returnToAddfunds(false)
                                                this.props.navigation.goBack();
                                            }}
                                            />
                                        </View>
                                    </> :

                                    <MaterialIndicator size={y(90)} color={colors.GREEN} />

                                }
                            </View>
                        </View>
                        : <></>}
                </View>

            </TouchableWithoutFeedback>
        );
    }
};
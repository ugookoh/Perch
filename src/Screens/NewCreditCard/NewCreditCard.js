import React from 'react';
import styles from './styles';
import axios from 'axios';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, Keyboard, Platform, StatusBar, Alert, PanResponder, LayoutAnimation, UIManager, TouchableWithoutFeedback } from 'react-native';
import { OfflineNotice, x, y, height, width, storeCard, completePayment } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import Icon from 'react-native-vector-icons/Entypo';
import WalletImage from '../../Images/svgImages/wallet';
import stripe from 'tipsi-stripe';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
const [GREEN, WHITE, GREY, RED] = ['#4DB748', '#FFFFFF', '#918686', '#FF0000'];
stripe.setOptions({
    publishableKey: 'pk_test_RjADdW2vGwFAgOOk7ws1juNB002JV727O8',
    merchantId: 'merchant.com.perch',
})

export default class NewCreditCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            name: '',
            cardNumber: '',
            expiryDate: '',
            ccv: '',
            errorMessage: '',
            loading: false,
            userID: this.props.route.params.userID,
        };
    }

    componentDidMount() {
        this.name.focus();
    };
    createTokenWithCard = () => {
        this.setState({ loading: true }, () => {
            stripe.createTokenWithCard({
                number: this.formatCard(this.state.cardNumber),
                expMonth: Number(this.state.expiryDate.substring(0, 2)),
                expYear: Number(this.state.expiryDate.substring(5, 7)),
                cvc: (this.state.ccv),
                name: this.state.name,

            }).then(token => {
                storeCard.call(this, this.state.userID, token);
            }).catch(error => {
                this.setState({ loading: false }, () => {
                    Alert.alert('Error', error.message)
                });
            });
        });
    }
    formatCard(card) {
        const formattedCard = card.substring(0, 4) + card.substring(5, 9) + card.substring(10, 14) + card.substring(15, 19);
        return (formattedCard);
    }
    render() {

        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <View style={{ zIndex: 1 }}>
                        <Header name={'Add a new card'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                    </View>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <Text style={[styles.text, { width: x(343), marginTop: y(30), marginBottom: y(3) }]}>Name on card</Text>
                    <TextInput
                        ref={(ref) => { this.name = ref; }}
                        spellCheck={false}
                        style={[styles.textInput, { width: x(343) }]}
                        placeholder={'Enter name on card'}
                        placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                        onChangeText={(value) => {
                            this.setState({ name: value })
                        }}
                        value={this.state.name}
                        keyboardType={'default'}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                            if (this.state.cardNumber.length == 0)
                                this.cardNumber.focus()
                            else if (this.state.expiryDate.length == 0)
                                this.expiryDate.focus();
                            else if (this.state.ccv.length == 0)
                                this.ccv.focus();
                            else
                                Keyboard.dismiss();
                        }}

                    />

                    <Text style={[styles.text, { width: x(343), marginTop: y(10), marginBottom: y(3) }]}>Enter card number</Text>
                    <View style={styles.textInputIcon}>
                        <TextInput
                            ref={(ref) => { this.cardNumber = ref; }}
                            spellCheck={false}
                            style={[styles.textInput_,]}
                            placeholder={'0000 0000 0000 0000'}
                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                            onChangeText={(value) => {

                                let cardNumber = value;

                                if (cardNumber[cardNumber.length - 1] !== ' ') {

                                    if (cardNumber.length >= 5 && cardNumber[4] !== ' ')
                                        cardNumber = cardNumber.substring(0, 4) + ' ' + cardNumber.substring(4, cardNumber.length);
                                    if (cardNumber.length >= 10 && cardNumber[9] !== ' ')
                                        cardNumber = cardNumber.substring(0, 9) + ' ' + cardNumber.substring(9, cardNumber.length);
                                    if (cardNumber.length >= 15 && cardNumber[14] !== ' ')
                                        cardNumber = cardNumber.substring(0, 14) + ' ' + cardNumber.substring(14, cardNumber.length);

                                }

                                // if (cardNumber[cardNumber.length] !== ' ') {


                                if (cardNumber.length <= 19)
                                    this.setState({ cardNumber: cardNumber })
                            }
                            }
                            value={this.state.cardNumber}
                            keyboardType={'number-pad'}
                            blurOnSubmit={false}
                            onSubmitEditing={() => {
                                if (this.state.expiryDate.length == 0)
                                    this.expiryDate.focus();
                                else if (this.state.ccv.length == 0)
                                    this.ccv.focus();
                                else
                                    Keyboard.dismiss();
                            }}
                        />
                        <Icon name={'credit-card'} size={y(25)} style={{ opacity: 0.6 }} />
                    </View>

                    <View style={styles.spaceOut}>
                        <View>
                            <Text style={[styles.text, { marginBottom: y(3) }]}>Expiry Date</Text>
                            <TextInput
                                ref={(ref) => { this.expiryDate = ref; }}
                                spellCheck={false}
                                style={[styles.textInput, { width: x(150) }]}
                                placeholder={'MM/YYYY'}
                                placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                onChangeText={(value) => {
                                    let expiryDate = value;

                                    if (expiryDate.length >= 3 && expiryDate[2] !== '/')
                                        expiryDate = expiryDate.substring(0, 2) + '/' + expiryDate.substring(2, expiryDate.length);

                                    if (expiryDate.length <= 7)
                                        this.setState({ expiryDate: expiryDate })
                                }}
                                value={this.state.expiryDate}
                                keyboardType={'number-pad'}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    if (this.state.ccv.length == 0)
                                        this.ccv.focus();
                                    else
                                        Keyboard.dismiss();
                                }}
                            />
                        </View>

                        <View>
                            <Text style={[styles.text, { marginBottom: y(3) }]}>CCV</Text>
                            <TextInput
                                ref={(ref) => { this.ccv = ref; }}
                                spellCheck={false}
                                style={[styles.textInput, { width: x(150) }]}
                                placeholder={'000'}
                                placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                onChangeText={(value) => {
                                    if (value.length <= 4)
                                        this.setState({ ccv: value })
                                }}
                                value={this.state.ccv}
                                keyboardType={'number-pad'}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                }}

                            />
                        </View>
                    </View>
                    <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
                    <View style={styles.button}>
                        <Button text={'Add Card'} width={x(343)} height={y(50)} top={0} left={0} zIndex={2} loading={this.state.loading} onPress={() => {
                            if (this.state.name.length <= 3)
                                Alert.alert('Error', 'Please enter the name on the card')
                            else
                                this.createTokenWithCard();
                        }}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
};
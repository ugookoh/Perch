import database from '@react-native-firebase/database';
import React from 'react';
import { Alert, Animated, LayoutAnimation, PanResponder, Platform, Switch, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Button from '../../Components/Button/Button';
import Header from '../../Components/Header/Header';
import { CustomLayoutLinear, deleteCard, height, OfflineNotice, x, y, colors } from '../../Functions/Functions';
import ApplePayLogo from '../../Images/svgImages/applePayLogo';
import GenericPaymentCard from '../../Images/svgImages/genericPaymentCard';
import GooglePaylogo from '../../Images/svgImages/googlePayLogo';
import Logo from '../../Images/svgImages/logo';
import MasterCard from '../../Images/svgImages/mastercard';
import Visa from '../../Images/svgImages/visa';
import WalletImage from '../../Images/svgImages/wallet';
import styles from './styles';
const X_CONSTANT = 0;
const Y_START = y(20);

export default class Wallet extends React.Component {  /////   ADD SUPPORT FOR THE CASH ADDING WHEN ADDING RIDESHARE
    constructor(props) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            scrollY: new Animated.Value(0),
            toShow: null,
            userDetails: this.props.route.params.userDetails,
            cards: null,
            choice: this.props.route.params.choice,
            usePerchKms: false,
            selected: null,
            perchKms: 0,
            goToAddFunds: false,
            TOP_OF_TRIPS: this.props.route.params.TOP_OF_TRIPS ? this.props.route.params.TOP_OF_TRIPS : 0,
        };

        this.headerInverse = new Animated.Value(-Y_START);
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });//This is the value we are animating to.
        this.position.y.addListener(({ value }) => {
            this.headerInverse.setValue(-value);

            if ((value >= Y_START && this.direction === 'downwards')) {
                this.position.stopAnimation(() => {
                    if (value >= Y_START && this.direction === 'downwards')
                        this.direction = 'upwards';


                    const Y_POSITION = Number(JSON.stringify(this.position.y));
                    if ((Y_POSITION > Y_START && this.direction === 'upwards') && (!!!this.state.choice))
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: Y_START },
                        }).start();
                });
            }
            else if ((value <= this.state.TOP_OF_TRIPS) && this.direction === 'upwards') {
                this.direction = 'downwards';
                this.position.stopAnimation(() => {
                    if (value < this.state.TOP_OF_TRIPS)
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: (this.state.TOP_OF_TRIPS + 1) },
                        }).start();
                })
            }
        });
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (e, gestureState) => {
                return Math.abs(gestureState.dx) >= 4 || Math.abs(gestureState.dy) >= 4;

            },
            onPanResponderGrant: (evt, gestureState) => {
                this.position.stopAnimation();
                this.position.setOffset({ x: X_CONSTANT, y: this.position.y._value });   //SETS IT TO THE POSITION
                this.position.setValue({ x: 0, y: 0 });
                this.value = Number(JSON.stringify(this.position.y));
            },
            onPanResponderMove: (evt, gestureState) => {
                this.position.stopAnimation();
                const Y_POSITION = (this.value + gestureState.dy);
                if (Y_POSITION <= Y_START && Y_POSITION >= this.state.TOP_OF_TRIPS)
                    this.position.setValue({ x: X_CONSTANT, y: (gestureState.dy) });


                if (Math.sign(gestureState.vy) == 1) //going down
                    this.direction = 'downwards';
                else if (Math.sign(gestureState.vy) == -1)//going upwards
                    this.direction = 'upwards';
            },
            onPanResponderRelease: (evt, gestureState) => {
                this.position.flattenOffset();

                const Y_POSITION = Number(JSON.stringify(this.position.y));
                if (Y_POSITION < Y_START) {
                    Animated.decay(this.position, {
                        velocity: { x: 0, y: gestureState.vy }, // velocity from gesture release
                    }).start();

                    if (Math.sign(gestureState.vy) == 1) //going down
                        this.direction = 'downwards';
                    else if (Math.sign(gestureState.vy) == -1)//going upwards
                        this.direction = 'upwards';

                }
                else if (Y_POSITION > Y_START) {
                    this.direction = 'upwards';
                    Animated.spring(this.position, {
                        toValue: { x: X_CONSTANT, y: Y_START }, // velocity from gesture release
                    }).start();
                }
            },
        });

    }

    componentDidMount() {
        this.loadCards();

        database().ref(`perchKilometers/${this.state.userDetails.userID}/quantity`).on('value', snapshot => {
            this.setState({ perchKms: snapshot.val().toFixed(1) })
        })
        database().ref(`usePerchKilometers/${this.state.userDetails.userID}`).once('value', snapshot => {
            this.setState({ usePerchKms: snapshot.val() ? true : false })
        })
    };
    loadCards = () => {
        database().ref(`cards/${this.state.userDetails.userID}`).once('value', snapshot => {
            this.setState({ cards: snapshot.val(), selected: snapshot.val().selected ? snapshot.val().selected : null, });
        });

        if (this.state.choice)
            database().ref(`cards/${this.state.userDetails.userID}/selected`).on('value', snapshot => {
                if (snapshot.val())
                    this.setState({ toShow: snapshot.val(), })
            })
    };
    deleteCreditCard = () => {
        Alert.alert(
            'Delete Card',
            'Are you sure you want to delete this card?',
            [
                {
                    text: 'Cancel',
                    onPress: () => { this.setState({ toShow: null }); },
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        deleteCard.call(this, this.state.userDetails.userID, this.state.toShow, this.state.selected);
                        let cards = this.state.cards;
                        cards[this.state.toShow] = null;
                        this.setState({ cards: cards, toShow: null });
                    },
                    style: 'destructive'
                }
            ],
            { cancelable: false }
        );
    }
    render() {
        let cards = [];
        if (this.state.cards)
            for (let key in this.state.cards)
                if (this.state.cards[key] && key != 'selected')
                    cards.push(
                        <View style={[styles.subContainer, { marginTop: y(20) }]}
                        //ALL CREDIT CARDS SHOULD BE LISTED UNDER HERE JUST LIKE THIS! ...STORE CREDIT CARDS IN USER OBJECT(ENCRYPED)
                        >
                            <TouchableOpacity style={styles.innerContainer}
                                onPress={() => {
                                    if (this.state.choice)
                                        this.setState({ toShow: key })
                                    else
                                        this.setState({ toShow: this.state.toShow == key ? null : key })
                                }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={styles.visa}>{
                                        this.state.cards[key].card.brand == "Visa" ?
                                            <Visa /> :
                                            this.state.cards[key].card.brand == "Mastercard" ?
                                                <MasterCard /> :
                                                <GenericPaymentCard />
                                    }</View>
                                    <Text style={[styles.text, { marginLeft: x(40) }]}>•••• •••• •••• {key} - {('0' + (this.state.cards[key].card.expMonth || this.state.cards[key].card.exp_month)).slice(-2)}/{this.state.cards[key].card.expYear || this.state.cards[key].card.exp_year}</Text>
                                </View>
                                {this.state.toShow != key && !this.state.choice ? <Icon name={'arrow-right'} size={y(12)} /> : <></>}
                                {this.state.toShow == key && this.state.choice ? <Icon name={'check'} size={y(15)} color={colors.GREEN} /> : <></>}
                            </TouchableOpacity>
                            {this.state.toShow == key && !this.state.choice ?
                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity style={[styles.options, { backgroundColor: colors.WHITE }]} onPress={() => {
                                        if (!this.state.choice)
                                            this.setState({ toShow: null });
                                    }}>
                                        <Text style={[styles.text, { color: colors.GREEN }]}>Close</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.options, { backgroundColor: colors.RED }]}
                                        onPress={this.deleteCreditCard}>
                                        <Text style={[styles.text, { color: colors.WHITE }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View> :
                                <></>}
                        </View>
                    );
        return (
            <View style={styles.container}>
                <View style={{ zIndex: 1 }}>
                    <Header
                        name={this.state.choice ? 'Payment Method' : 'Wallet'}
                        scrollY={this.headerInverse}
                        onPress={() => {
                            if (this.state.goToAddFunds) {
                                if (this.state.toShow)
                                    database().ref(`cards/${this.state.userDetails.userID}`).update({ selected: this.state.toShow })
                                        .catch(error => { console.log(error.message) });

                                this.props.navigation.navigate('AddFunds', {
                                    userDetails: this.state.userDetails,
                                    refresh: (choice) => { this.setState({ choice: choice }) },
                                    returnToAddfunds: (choice) => { this.setState({ goToAddFunds: choice, }) }
                                });
                            }
                            else {
                                if (this.state.choice && this.state.selected) {
                                    database().ref(`cards/${this.state.userDetails.userID}`).update({ selected: this.state.toShow })
                                        .catch(error => { console.log(error.message) })
                                    this.props.navigation.goBack();
                                }
                                else
                                    this.props.navigation.goBack();
                            }
                        }} />
                </View>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Animated.View style={[this.position.getLayout(), { positon: 'relative' }]} {...this.panResponder.panHandlers}>
                    <View onLayout={(event) => {
                        this.setState({ TOP_OF_TRIPS: (-event.nativeEvent.layout.height + (height / (1.5))) });
                    }}>
                        {
                            this.state.choice ?
                                <></> :
                                <>
                                    <View style={styles.mainContainer}>
                                        <Text style={styles.titleText}>Perch Wallet</Text>
                                        <View style={styles.walletImage}>
                                            <WalletImage />
                                        </View>
                                        <Text style={styles.balanceText}>{this.state.perchKms} kms</Text>
                                        <View style={styles.button}>
                                            <Button text={'Add kilometers'} width={x(322)} height={y(48)} top={0} left={0} zIndex={2} onPress={() => {
                                                this.props.navigation.navigate('AddFunds', {
                                                    userDetails: this.state.userDetails,
                                                    refresh: (choice) => { this.setState({ choice: choice }) },
                                                    returnToAddfunds: (choice) => { this.setState({ goToAddFunds: choice, }) }
                                                });
                                            }}
                                            />
                                        </View>
                                    </View>

                                    <View style={[styles.subContainer, { marginTop: y(20) }]}>
                                        <TouchableOpacity style={styles.innerContainer}
                                            onPress={() => {
                                                this.props.navigation.navigate('CreditHistory', { userDetails: this.state.userDetails });
                                            }}>
                                            <Text style={styles.text}>Credit History</Text>
                                            <Icon name={'arrow-right'} size={y(12)} />
                                        </TouchableOpacity>
                                    </View>
                                </>}

                        {this.state.choice ?
                            <>
                                <View style={[styles.subContainer, { marginTop: 0 }]}>
                                    <View style={styles.innerContainer}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={styles.logo}><Logo /></View>
                                            <Text style={[styles.text, { marginLeft: x(40) }]}>Perch Kilometers - <Text style={{ color: colors.GREEN }}>{this.state.perchKms}km</Text></Text>
                                        </View>
                                        {/* {this.state.toShow != key ? <Icon name={'arrow-right'} size={y(12)} /> : <></>} */}
                                        <Switch
                                            trackColor={{ false: "#767577", true: "rgba(77, 183, 72, 0.8)" }}
                                            thumbColor={this.state.sendUserLocation ? "#FFFFFF" : "#f4f3f4"}
                                            onValueChange={(value) => {
                                                const toSet = !this.state.usePerchKms;
                                                this.setState({ usePerchKms: toSet }, () => {
                                                    database().ref(`usePerchKilometers`).update({
                                                        [this.state.userDetails.userID]: toSet,
                                                    })
                                                });
                                            }}
                                            value={this.state.usePerchKms}
                                            style={{ transform: [{ scaleX: .7 }, { scaleY: .7 }], position: 'absolute', right: x(0), top: y(-8) }}
                                        />
                                    </View>
                                </View>

                                <View style={[styles.subContainer, { marginTop: y(20) }]}>
                                    <TouchableOpacity style={styles.innerContainer}
                                        onPress={() => {
                                            this.setState({ toShow: Platform.OS == 'ios' ? 'applePay' : 'googlePay' });
                                        }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            {Platform.OS == 'ios' ?
                                                <View style={styles.visa}><ApplePayLogo /></View> :
                                                <View style={styles.googlePayLogo}><GooglePaylogo /></View>}
                                            <Text style={[styles.text, { marginLeft: x(45) }]}>{Platform.OS == 'ios' ? 'Apple Pay' : 'Google Pay'}</Text>
                                        </View>
                                        {this.state.toShow == 'applePay' || this.state.toShow == 'googlePay' ? <Icon name={'check'} size={y(15)} color={colors.GREEN} /> : <></>}
                                    </TouchableOpacity>
                                </View>
                            </> : <></>}
                        {cards}

                        <View style={[styles.subContainer, { marginVertical: y(20) }]}>
                            <TouchableOpacity style={styles.innerContainer}
                                onPress={() => {
                                    this.props.navigation.navigate('NewCreditCard', {
                                        userID: this.state.userDetails.userID,
                                        refreshCards: () => { this.loadCards() }
                                    });
                                }}>
                                <Text style={styles.text}>Add new credit/debit card</Text>
                                <Icon name={'arrow-right'} size={y(12)} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

            </View>
        );
    }
};
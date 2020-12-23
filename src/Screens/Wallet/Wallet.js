import React from 'react';
import styles from './styles';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, ScrollView, Platform, StatusBar, Alert, PanResponder, LayoutAnimation, UIManager, } from 'react-native';
import { OfflineNotice, x, y, height, width, dimensionAssert, CustomLayoutLinear } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import WalletImage from '../../Images/svgImages/wallet';
import Visa from '../../Images/svgImages/visa';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
const [GREEN, WHITE, GREY, RED] = ['#4DB748', '#FFFFFF', '#918686', '#FF0000'];
const X_CONSTANT = 0;
const Y_START = y(20);

export default class Wallet extends React.Component {  /////   ADD SUPPORT FOR THE CASH ADDING WHEN ADDING RIDESHARE
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            scrollY: new Animated.Value(0),
            show: false,
        };

        this.TOP_OF_TRIPS = 0;
        this.headerInverse = new Animated.Value(-Y_START);
        this.position = new Animated.ValueXY({ x: X_CONSTANT, y: Y_START });//This is the value we are animating to.
        this.position.y.addListener(({ value }) => {
            this.headerInverse.setValue(-value);

            if ((value >= Y_START && this.direction === 'downwards')) {
                this.position.stopAnimation(() => {
                    if (value >= Y_START && this.direction === 'downwards')
                        this.direction = 'upwards';


                    const Y_POSITION = Number(JSON.stringify(this.position.y));
                    if (Y_POSITION > Y_START && this.direction === 'upwards')
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: Y_START },
                        }).start();
                });
            }
            else if ((value <= this.TOP_OF_TRIPS) && this.direction === 'upwards') {
                this.direction = 'downwards';
                this.position.stopAnimation(() => {
                    if (value < this.TOP_OF_TRIPS)
                        Animated.spring(this.position, {
                            toValue: { x: X_CONSTANT, y: (this.TOP_OF_TRIPS + 1) },
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
                if (Y_POSITION <= Y_START && Y_POSITION >= this.TOP_OF_TRIPS)
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
        //this.closeAd();
    };
    deleteCreditCard() {
        Alert.alert(
            'Delete Card',
            'Are you sure you want to delete this card?',
            [
                {
                    text: 'Cancel',
                    //onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: () => {

                    },
                    style: 'destructive'
                }
            ],
            { cancelable: false }
        );
    }
    render() {
        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <View style={styles.container}>
                <View style={{ zIndex: 1 }}>
                    <Header name={'Wallet'} scrollY={this.headerInverse} onPress={() => { this.props.navigation.goBack(); }} />
                </View>
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Animated.View style={[this.position.getLayout(), { positon: 'relative' }]} {...this.panResponder.panHandlers}>
                    <View onLayout={(event) => {
                        this.TOP_OF_TRIPS = -event.nativeEvent.layout.height + (height / (1.5));
                    }}>
                        <View style={styles.mainContainer}>
                            <Text style={styles.titleText}>Perch Wallet</Text>
                            <View style={styles.walletImage}>
                                <WalletImage />
                            </View>
                            <Text style={styles.balanceText}>{`10.9 km`}</Text>
                            <View style={styles.button}>
                                <Button text={'Add kilometers'} width={x(322)} height={y(48)} top={0} left={0} zIndex={2} onPress={() => {
                                    this.props.navigation.navigate('AddFunds');
                                }}
                                />
                            </View>
                        </View>
                        <View style={[styles.subContainer, { marginTop: y(20) }]}>
                            <TouchableOpacity style={styles.innerContainer}
                                onPress={() => {
                                    this.props.navigation.navigate('CreditHistory');
                                }}>
                                <Text style={styles.text}>Credit History</Text>
                                <Icon name={'arrow-right'} size={y(12)} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.subContainer, { marginTop: y(20) }]} ///ALL CREDIT CARDS SHOULD BE LISTED UNDER HERE JUST LIKE THIS! ...STORE CREDIT CARDS IN USER OBJECT(ENCRYPED)
                        >
                            <TouchableOpacity style={styles.innerContainer}
                                onPress={() => {
                                    this.setState({ show: this.state.show ? false : true })
                                }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={styles.visa}><Visa /></View>
                                    <Text style={[styles.text, { marginLeft: x(40) }]}>XXXX XXXX XXX3 4536 - 02/24</Text>
                                </View>
                                {!this.state.show ? <Icon name={'arrow-right'} size={y(12)} /> : <></>}
                            </TouchableOpacity>
                            {this.state.show ?
                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity style={[styles.options, { backgroundColor: WHITE }]} onPress={() => {
                                        this.setState({ show: false });
                                    }}>
                                        <Text style={[styles.text, { color: GREEN }]}>Close</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.options, { backgroundColor: RED }]}
                                        onPress={this.deleteCreditCard}>
                                        <Text style={[styles.text, { color: WHITE }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View> :
                                <></>}
                        </View>

                        <View style={[styles.subContainer, { marginVertical: y(20) }]}>
                            <TouchableOpacity style={styles.innerContainer}
                                onPress={() => {
                                    this.props.navigation.navigate('NewCreditCard');
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
import React from 'react';
import styles from './styles';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, Keyboard, Platform, StatusBar, Alert, PanResponder, LayoutAnimation, UIManager, TouchableWithoutFeedback } from 'react-native';
import { OfflineNotice, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Visa from '../../Images/svgImages/visa';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
import { MaterialIndicator } from 'react-native-indicators';
const [GREEN, WHITE, GREY, RED] = ['#4DB748', '#FFFFFF', '#918686', '#FF0000'];

export default class AddFunds extends React.Component { //////////////***ADD A BREAKDOWN OF THE FUNDS LIKE TAX AND ALL THAT, NOT JUST A TOTAL. MAKE IT LIKE A LITTLE DYNAMIC LIST... WE MUST ALSO ADD THE PLANS */
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
            kms: '',
            creditCard: true,//USE THIS TO TEST FOR CREDIT CARD
            loading: false,
            paymentCompleted: null,

        };
    }

    componentDidMount() {
        //this.closeAd();
    };

    render() {
        const title = `Add kilometers to your wallet`;
        const subTitle = `How many kilometers would you like to add to your Perch wallet`;
        return (
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss();
            }}>
                <View style={styles.container}>
                    <View style={{ zIndex: 1 }}>
                        <Header name={'Add kilometers'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                    </View>
                     <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <Text style={[styles.title, { marginTop: y(30) }]}>{title}</Text>
                    <Text style={[styles.subTitle]}>{subTitle}</Text>
                    <View style={[styles.box, { marginTop: y(20) }]}>
                        <TextInput
                            ref={(ref) => { this.box = ref; }}
                            spellCheck={false}
                            style={[styles.textInput, {}]}
                            placeholder={'0000'}
                            onChangeText={(value) => {
                                if (value.length <= 4)
                                    this.setState({ kms: value });
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

                    <Text style={styles.cash}>{`$ 0.00`}</Text>
                    {this.state.creditCard ?
                        <View style={[styles.subContainer, {}]} >
                            <TouchableOpacity style={styles.innerContainer}
                                onPress={() => {
                                    this.setState({ show: this.state.show ? false : true })
                                }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={styles.visa}><Visa /></View>
                                    <Text style={[styles.text, { marginLeft: x(40) }]}>XXXX XXXX XXX3 4536  -  02/24</Text>
                                </View>
                                <Icon name={'arrow-right'} size={y(12)} />
                            </TouchableOpacity>
                        </View>
                        :
                        <View style={[styles.subContainer, {}]}>
                            <TouchableOpacity style={styles.innerContainer}
                                onPress={() => {

                                }}>
                                <Text style={styles.text}>Add new credit/debit card</Text>
                                <Icon name={'arrow-right'} size={y(12)} />
                            </TouchableOpacity>
                        </View>
                    }
                    <View style={styles.button}>
                        <Button text={'Buy kilometers'} width={x(343)} height={y(54)} top={0} left={0} zIndex={2} onPress={() => {

                        }}
                        />
                    </View>
                    {this.state.loading ?
                        <View style={[styles.loading, {}]}>
                            <View style={styles.loadingContainer}>
                                {this.state.paymentCompleted ?
                                    <>
                                        <Text style={styles.conclusion}>Payment has been successfully processed </Text>
                                        <View style={[styles.button, { width: x(280), position: 'absolute', bottom: x(10), }]}>
                                            <Button text={'Go back'} width={x(280)} height={y(54)} top={0} left={0} zIndex={2} onPress={() => {
                                                this.props.navigation.goBack();
                                            }}
                                            />
                                        </View>
                                    </> :

                                    <MaterialIndicator size={y(90)} color={GREEN} />

                                }
                            </View>
                        </View>
                        : <></>}
                </View>

            </TouchableWithoutFeedback>
        );
    }
};
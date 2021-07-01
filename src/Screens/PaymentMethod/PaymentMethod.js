import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../Components/Header/Header';
import { colors, OfflineNotice, y } from '../../Functions/Functions';
import CreditCard from '../../Images/svgImages/creditCard';
import Interac from '../../Images/svgImages/interac';
import Money from '../../Images/svgImages/moneyChoice';
import PaymentMethod from '../../Images/svgImages/paymentMethod';
import PerchCredit from '../../Images/svgImages/perchCredit';
import styles from './styles';

export default class Paymentmethod extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            choice: this.props.route.params.choice,
        };
    }
    render() {
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'Payment Method'} scrollY={this.state.scrollY} onPress={() => {
                    this.props.route.params.changePayment(this.state.choice);
                    this.props.navigation.goBack()
                }} />
                <View style={styles.paymentMethod}>
                    <PaymentMethod height={'100%'} width={'100%'} />
                </View>
                <View style={styles.options}>

                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ choice: 'creditCard' })
                        }}
                    >
                        <View style={styles.box}>
                            <View style={styles.cC}>
                                <CreditCard height={'100%'} width={'100%'} />
                            </View>
                            <Text style={styles.boxType}>Credit Card/Debit Card</Text>
                            {this.state.choice === 'creditCard' ? <View style={styles.icon}><Icon name={'md-checkmark'} color={colors.WHITE} size={y(18)} /></View> : <></>}
                        </View>
                    </TouchableOpacity>



                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ choice: 'interac' })
                        }}
                    >
                        <View style={styles.box}>
                            <View style={styles.bank}>
                                <Interac height={'100%'} width={'100%'} />
                            </View>
                            <Text style={styles.boxType}>Interac e-transfer</Text>
                            {this.state.choice === 'interac' ? <View style={styles.icon}><Icon name={'md-checkmark'} color={colors.WHITE} size={y(18)} /></View> : <></>}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ choice: 'cash' })
                        }}
                    >
                        <View style={styles.box}>
                            <View style={styles.cC}>
                                <Money height={'100%'} width={'100%'} />
                            </View>
                            <Text style={styles.boxType}>Cash</Text>
                            {this.state.choice === 'cash' ? <View style={styles.icon}><Icon name={'md-checkmark'} color={colors.WHITE} size={y(18)} /></View> : <></>}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={true}
                        onPress={() => {
                            this.setState({ choice: 'perchCredit' })
                        }}
                        style={{ opacity: 0.5 }}
                    >
                        <View style={styles.box}>
                            <View style={styles.pC}>
                                <PerchCredit height={'100%'} width={'100%'} />
                            </View>
                            <Text style={styles.boxType}>Perch Credit</Text>
                            {this.state.choice === 'perchCredit' ? <View style={styles.icon}><Icon name={'md-checkmark'} color={colors.WHITE} size={y(18)} /></View> : <></>}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
};
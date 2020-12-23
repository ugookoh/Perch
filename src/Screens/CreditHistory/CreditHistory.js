import React from 'react';
import styles from './styles';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, FlatList, Platform, StatusBar, Alert, PanResponder, LayoutAnimation, UIManager, } from 'react-native';
import { OfflineNotice, makeid, x, y, width, height, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import WalletImage from '../../Images/svgImages/wallet';
import Button from '../../Components/Button/Button';
import Divider from '../../Components/Divider/Divider';
import { MaterialIndicator } from 'react-native-indicators'
const [GREEN, WHITE, GREY, RED] = ['#4DB748', '#FFFFFF', '#918686', '#FF0000'];


let notifications = [//THIS IS THE SCHEMA FOR THIS PAGE. THE TIME WOULD HAVE AN ID APPENDED TO IT 
    {
        time: makeid(9),
        message: `You booked 6 rides so here's 6 kms for you! Thanks for riding with Perch -01/02/2020`, //ALWAYS APPEND THE DATE TO THE END OF THE NOTIFICATION
    },
];
for (let k = 0; k < 100; k++) {
    notifications.push({ message: notifications[0].message, time: makeid(9) })
}
export default class CreditHistory extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
            results: notifications,
            limitTo: 30,
        };
    }

    componentDidMount() {
        //this.closeAd();
    };

    render() {

        return (
            <View style={styles.container}>
                <View style={{ zIndex: 1 }}>
                    <Header name={'Credit History'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack(); }} />
                    <View style={styles.list}>
                        {this.state.results ?
                            <FlatList
                                //inverted={true}
                                initialNumToRender={4}
                                ref={ref => this.flatList = ref}
                                data={this.state.results.slice(0, this.state.limitTo)}//Its inverted so that we start at the bottom,
                                renderItem={({ item, index }) => {
                                    return (
                                        <>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.text}>{item.message}</Text>
                                            </View>
                                            <View style={styles.divider}><Divider height={0.5} width={x(343)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                                        </>
                                    );
                                }}
                                onEndReached={() => {
                                    this.setState({ limitTo: this.state.limitTo + 30 })
                                }}
                                onEndReachedThreshold={0.7}
                                keyExtractor={item => JSON.stringify(item.time)}

                            /> :
                            <View>
                                <MaterialIndicator color={GREEN} size={y(70)} style={{ bottom: x(dimensionAssert() ? 50 : 60) }} />
                            </View>}
                    </View>
                </View>
                 <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />

            </View>
        );
    }
};
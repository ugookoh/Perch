import React from 'react';
import styles from './styles';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, FlatList, Platform, StatusBar, Alert, PanResponder, LayoutAnimation, UIManager, } from 'react-native';
import { OfflineNotice, makeid, x, y, width, height, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import database from '@react-native-firebase/database';
import Divider from '../../Components/Divider/Divider';
import { MaterialIndicator } from 'react-native-indicators'
const [GREEN, WHITE, GREY, RED] = ['#4DB748', '#FFFFFF', '#918686', '#FF0000'];

export default class CreditHistory extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            results: null,
            limitTo: 30,
            userDetails: this.props.route.params.userDetails,
        };
    }

    componentDidMount() {
        database().ref(`perchKilometers/${this.state.userDetails.userID}`).once('value', snapshot => {
            const data = snapshot.val();
            let notifications = [];
            for (let key in data) {
                if (key != 'quantity')
                    notifications.push(data[key])
                this.setState({ results: notifications.sort((a, b) => { return b.timestamp - a.timestamp }) })

            }
        })
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
                                data={this.state.results.slice(0, this.state.limitTo)}// Its inverted so that we start at the bottom,
                                renderItem={({ item, index }) => {
                                    return (
                                        <>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.text}>{item.message} - {('0' + new Date(item.timestamp).getDate()).slice(-2)}/{('0' + (new Date(item.timestamp).getMonth() + 1)).slice(-2)}/{new Date(item.timestamp).getFullYear()} ({formatAMPM(new Date(item.timestamp))})</Text>
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
                            <View style={{ flex: 1 }}>
                                <MaterialIndicator color={GREEN} size={y(70)} style={{ bottom: x(dimensionAssert() ? 50 : 60) }} />
                            </View>}
                    </View>
                </View>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />

            </View>
        );
    }
};

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};
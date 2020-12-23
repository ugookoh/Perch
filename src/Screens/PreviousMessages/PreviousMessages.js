import React from 'react';
import styles from './styles';
import { TouchableWithoutFeedback, Animated, Text, View, FlatList, Dimensions, TouchableOpacity, ScrollView, Keyboard, KeyboardAvoidingView, Button, StatusBar, Platform, Alert } from 'react-native';
import { OfflineNotice, dateformat, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import Header from '../../Components/Header/Header';
import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
import { MaterialIndicator } from 'react-native-indicators';
import CatcusNoResults from '../../Images/svgImages/cactusNoResults';
import Divider from '../../Components/Divider/Divider';
import Entypo from 'react-native-vector-icons/Entypo';

const [GREEN, RED] = [`#4DB748`, `#FF0000`];
export default class PreviousMessages extends React.Component {
    constructor() {
        super();
        this.state = {
            scrollY: new Animated.Value(0),
            results: null,
            limitTo: 30,
        };

    };
    componentDidMount() {
        AsyncStorage.getItem('USER_DETAILS')
            .then(result => {
                const userID = JSON.parse(result).userID;
                database().ref(`userFeedback/${userID}`).once('value', snapshot => {
                    this.setState({ results: snapshot.val() ? snapshot.val() : 'NORESULTS' });
                })
            }).catch(error => { console.log(error.message) })
    };
    render() {
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={{ zIndex: 3 }}>
                    <Header scrollY={this.state.scrollY} name={'Previous Messages'} onPress={() => { this.props.navigation.goBack() }} />
                </View>
                {this.state.results ?
                    this.state.results != 'NORESULTS' ?
                        <FlatList
                            ref={ref => this.flatList = ref}
                            data={Object.keys(this.state.results).sort().reverse().slice(0, this.state.limitTo)}//Its inverted so that we start at the bottom,
                            renderItem={({ item, index }) => {
                                const data = this.state.results[item];
                                const date = dateformat(data.date);
                                return (
                                    <>
                                        <TouchableOpacity style={styles.block} onPress={() => { this.props.navigation.navigate('SupportMessage', data) }}>
                                            <View style={[styles.innerblock, { marginVertical: y(2) }]}>
                                                <Text numberOfLines={1} style={[styles.text, { maxWidth: x(220) }]}>{data.subject}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={styles.date}>{date}</Text>
                                                    <Entypo name={'dot-single'} size={y(34)} color={data.status == 'UNPROCESSED' ? RED : GREEN} style={{}} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{ opacity: 0.4 }}><Divider width={x(343)} height={0.5} borderRadius={0} borderColor={'rgba(145, 134, 134, 0.5'} borderWidth={1} /></View>

                                    </>
                                );
                            }}
                            onEndReached={() => {
                                this.setState({ limitTo: this.state.limitTo + 40 })
                            }}
                            onEndReachedThreshold={0.7}
                            keyExtractor={item => JSON.stringify(item)}
                        />
                        :
                        <>
                            <View style={styles.noResults}>
                                <CatcusNoResults />
                            </View>
                            <Text style={styles.noResultsText}>You haven't sent us any messages yet</Text>
                        </>
                    : <MaterialIndicator color={GREEN} size={y(80)} />}
            </View>
        )
    };
};

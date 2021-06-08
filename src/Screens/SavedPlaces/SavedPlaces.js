import React from 'react';
import styles from './styles';
import { Animated, Text, View, TextInput, Dimensions, TouchableOpacity, Keyboard, TouchableWithoutFeedback, LayoutAnimation, UIManager, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Header from '../../Components/Header/Header';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Geolocation from 'react-native-geolocation-service';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import { debouncer, getLocation, OfflineNotice, x, y, height, width, dimensionAssert, CustomLayoutLinear } from '../../Functions/Functions';
import CarInCity from '../../Images/svgImages/carInCity';
import WorkChair from '../../Images/svgImages/workChair';
import Home from '../../Images/svgImages/home';
import Divider from '../../Components/Divider/Divider';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default class SavedPlaces extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            scrollY: new Animated.Value(0),
            home: '',
            work: '',
            homeFocused: false,
            workFocused: false,
            currentLocation: '',
            predictions: [],

            homeAddress: null,
            workAddress: null,
        };
    }
    componentDidMount() {
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    currentLocation: `&location=${[position.coords.latitude, position.coords.longitude]}&radius=10000`,
                });
            },
            (error) => {
                console.log(error.code, error.message);
                Geolocation.requestAuthorization();
            },
            {
                distanceFilter: 10,
                enableHighAccuracy: Platform.OS == 'ios' ? false : true,
            }
        ).catch((error) => {
            console.log(error.code, error.message);
            Geolocation.requestAuthorization();
        });
        this.watchID = setInterval(() => {
            AsyncStorage.getItem('USER_DETAILS')
                .then((result_) => {
                    clearInterval(this.watchID);
                    const userDetails_ = JSON.parse(result_);
                    this.setState({
                        homeAddress: userDetails_.homeAddress ? userDetails_.homeAddress : null,
                        workAddress: userDetails_.workAddress ? userDetails_.workAddress : null,
                        home: userDetails_.homeAddress ? userDetails_.homeAddress.mainText : '',
                        work: userDetails_.workAddress ? userDetails_.workAddress.mainText : '',
                    });
                }).catch(error => { console.log(error.message) })
        }, 300);
    };
    render() {
        let predictions = this.state.predictions.map((value) => {
            return (
                <TouchableOpacity onPress={() => {
                    if (this.state.homeFocused) {
                        Keyboard.dismiss();
                        getLocation.call(this, value.mainText, value.description, value.place_id, 'home', 'SavedPlaces');
                    }
                    if (this.state.workFocused) {
                        Keyboard.dismiss();
                        getLocation.call(this, value.mainText, value.description, value.place_id, 'work', 'SavedPlaces');
                    }
                }}>
                    <View style={styles.predictionView}>
                        <Fontisto name={'map-marker-alt'} color={GREEN} size={y(20)} style={styles.icon} />
                        <View style={styles.predictionView_}>
                            <Text style={styles.predictionText}>{value.mainText}</Text>
                            <Text style={[styles.predictionText, { fontSize: y(12, true), marginTop: x(1) }]}>{value.description}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        });
        LayoutAnimation.configureNext(CustomLayoutLinear);

        return (
            <TouchableWithoutFeedback
                onPress={() => { Keyboard.dismiss() }}
            >
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <Header name={'Saved Places'} scrollY={this.state.scrollY} onPress={() => {
                        this.props.route.params.onReturn();
                        this.props.navigation.goBack();
                    }} />

                    <View style={styles.optionContainer}>
                        <View style={styles.home}>
                            <Home />
                        </View>

                        <TextInput
                            placeholder={'Enter Home ...'}
                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                            style={styles.textInput}
                            ref={(input) => { this.homeInput = input; }}
                            onFocus={() => { this.setState({ homeFocused: true }) }}
                            onEndEditing={() => { this.setState({ homeFocused: false, predictions: [] }) }}
                            onChangeText={(value) => {
                                this.setState({ home: value });
                                debouncer.call(this, value, 'SavedPlaces');
                            }}
                            value={this.state.home}
                        />

                        <TouchableOpacity style={styles.editPosition} onPress={() => { this.homeInput.focus() }}>
                            <Text style={styles.edit}>EDIT</Text>
                        </TouchableOpacity>
                    </View>
                    <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />


                    {this.state.home !== '' && this.state.homeFocused ?
                        <Animated.View style={[styles.predictions,]}>
                            {predictions}
                        </Animated.View> :
                        <></>
                    }

                    <View style={styles.optionContainer}>
                        <View style={styles.workChair}>
                            <WorkChair />
                        </View>

                        <TextInput
                            placeholder={'Enter Work ...'}
                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                            style={[styles.textInput, { marginLeft: x(6) }]}
                            ref={(input) => { this.workInput = input; }}
                            onFocus={() => { this.setState({ workFocused: true }) }}
                            onEndEditing={() => { this.setState({ workFocused: false, predictions: [] }) }}
                            onChangeText={(value) => {
                                this.setState({ work: value })
                                debouncer.call(this, value, 'SavedPlaces');
                            }}
                            value={this.state.work}
                        />

                        <TouchableOpacity style={styles.editPosition} onPress={() => { this.workInput.focus() }}>
                            <Text style={styles.edit}>EDIT</Text>
                        </TouchableOpacity>
                    </View>
                    <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />

                    {this.state.predictions.length != 0 ?
                        <Animated.View style={[styles.predictions,]}>
                            {predictions}
                        </Animated.View> :
                        <></>
                    }

                    <View style={styles.cIC}>
                        <CarInCity />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
};
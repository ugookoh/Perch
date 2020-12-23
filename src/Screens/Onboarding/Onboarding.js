import React, { Component } from 'react';
import styles from './styles';
import { Text, View, Dimensions, StatusBar, Platform, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import SplashScreen from 'react-native-splash-screen';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import { OnBoardingLogo, OnBoardingVector1, OnBoardingVector2, OnBoardingVector3 } from '../../Images/svgImages/onboardingResourses';
const [BROWN, GREY_LIGHT, GREY_DARKER] = [`#FBD5A2`, `#FDFCF7`, `#DFE3DF`];

export default class SwiperComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            index: 0,
        }
    }
    componentDidMount() {
        SplashScreen.hide();
    };

    render() {
        let statusbar = <></>;
        let activeDotColor = `#DDDBD1`;
        // switch (this.state.index) {
        //     case 0: { activeDotColor = `#BDA76F` } break;
        //     case 1: { activeDotColor = `#DDDBD1` } break;
        //     case 2: { activeDotColor = `#658280` } break;

        // }
        if (Platform.OS == 'android')
            statusbar = <StatusBar barStyle={'light-content'} backgroundColor={'#000000'} />;
        else if (Platform.OS == 'ios')
            statusbar = <StatusBar barStyle={'dark-content'} />
        return (
            <>
                {statusbar}
                <Swiper style={styles.wrapper} showsButtons={true} loop={false} onIndexChanged={(index) => {
                    this.setState({ index: index })
                }}
                    activeDotColor={activeDotColor}
                    activeDot={<View style={{ backgroundColor: activeDotColor, width: 12, height: 12, borderRadius: 12, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                    showsButtons={false}

                >
                    <View style={[styles.slide, { backgroundColor: GREY_LIGHT }]}>
                        <View style={styles.logo}></View>
                        <View style={styles.box}>
                            <View style={[styles.oB1,]}><OnBoardingVector1 /></View>
                        </View>
                        <Text style={[styles.title, { marginTop: y(dimensionAssert() ? 40 : 40) }]}>
                            {`Redefine the way you go about your daily commute`}
                        </Text>
                        <Text style={[styles.subtext, { marginTop: y(dimensionAssert() ? 10 : 10) }]}>
                            {`Perch provides you with low-cost convenient carpool options. The advanced algorithm does this by pairing you with one or more vehicles travelling in the same direction as you. This way, it is at no extra cost to the driver to take you along thus saving you time, money and adding comfort to your travels.`}
                        </Text>
                    </View>
                    <View style={[styles.slide, { backgroundColor: GREY_LIGHT }]}>
                        <View style={styles.logo}></View>
                        <View style={styles.box}>
                            <View style={[styles.oB2,]}><OnBoardingVector2 /></View>
                        </View>
                        <Text style={[styles.title, { marginTop: y(dimensionAssert() ? 40 : 40) }]}>
                            {`Pay based on the distance you travel`}
                        </Text>
                        <Text style={[styles.subtext, { marginTop: y(dimensionAssert() ? 10 : 10) }]}>
                            {`Since the drivers are already travelling in that direction, you don’t need to worry about irrelevant factors like demand, traffic situations and so on. The price rate is always fixed and as such you are guaranteed a low price every time.`}
                        </Text>
                    </View>
                    <View style={[styles.slide, { backgroundColor: GREY_LIGHT }]}>
                        <View style={styles.logo}></View>
                        <View style={styles.box}>
                            <View style={[styles.oB3,]}><OnBoardingVector3 /></View>
                        </View>
                        <Text style={[styles.title, { marginTop: y(dimensionAssert() ? 40 : 40) }]}>
                            {`Join the party now`}
                        </Text>
                        <Text style={[styles.subtext, { marginTop: y(dimensionAssert() ? 10 : 10) }]}>
                            {`Why use inconvenient means of transportation when you have access to comfort and affordability of Perch?`}
                        </Text>
                        <TouchableOpacity onPress={() => { this.props.navigation.navigate('SignIn') }} style={[styles.button, { marginTop: y(30) }]}>
                            <Text style={styles.buttonText}>Get started</Text>
                        </TouchableOpacity>
                    </View>
                </Swiper>
            </>
        )
    }
};
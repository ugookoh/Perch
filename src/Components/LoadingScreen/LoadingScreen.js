import React from 'react';
import styles from './styles';
import { View, Dimensions, Platform, StatusBar } from 'react-native';


import {
    BallIndicator,
    BarIndicator,
    DotIndicator,
    MaterialIndicator,
    PacmanIndicator,
    PulseIndicator,
    SkypeIndicator,
    UIActivityIndicator,
    WaveIndicator,
} from 'react-native-indicators';

import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default class LoadingScreen extends React.Component {
    render() {
        const zIndex = this.props.zIndex ? { zIndex: this.props.zIndex, elevation: this.props.zIndex } : {};
        return (
            <View style={[styles.container, zIndex]}>
                <StatusBar backgroundColor={'#000000'} barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
                <View style={styles.box}>
                    <MaterialIndicator color={GREEN} size={x(40)} count={8} />
                </View>
            </View>
        );
    }
};
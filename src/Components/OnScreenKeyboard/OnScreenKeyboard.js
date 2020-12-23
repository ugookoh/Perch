import React from 'react';
import styles from './styles';
import { TouchableOpacity, View, Text, ActivityIndicator, Dimensions, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default class OnScreenKeyBoard extends React.Component {
    keySetter(event) {

    }
    render() {
        return (
            <View style={[styles.container, { top: this.props.top, left: this.props.left }]}>
                <View style={styles.firstLayer}>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(1); }}><Text style={styles.text}>1</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(2); }}><Text style={styles.text}> 2</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(3); }}><Text style={styles.text}>3</Text></TouchableOpacity>
                </View>
                <View style={styles.firstLayer}>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(4); }}><Text style={styles.text}>4</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(5); }}><Text style={styles.text}>5</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(6); }}><Text style={styles.text}>6</Text></TouchableOpacity>
                </View>
                <View style={styles.firstLayer}>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(7); }}><Text style={styles.text}>7</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(8); }}><Text style={styles.text}>8</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(9); }}><Text style={styles.text}>9</Text></TouchableOpacity>
                </View>
                <View style={styles.firstLayer}>
                    <TouchableOpacity onPress={() => { this.props.updateFunction('*'); }}><Text style={styles.text}>*</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => { this.props.updateFunction(0); }}><Text style={styles.text}> 0</Text></TouchableOpacity>
                    <TouchableOpacity onPress={this.props.deleteFunction}><Icon name={'ios-arrow-back'} size={y(30)} style={styles.icon}/></TouchableOpacity>
                </View>
            </View>
        );
    }
};
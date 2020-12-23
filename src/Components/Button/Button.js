import React from 'react';
import styles from './styles';
import { TouchableWithoutFeedback, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';

export default class Button extends React.Component {
    constructor() {
        super();
    }
    render() {
        let display = this.props.loading ? <ActivityIndicator size='small' color='#FFFFFF' /> : <Text style={styles.text}>{this.props.text}</Text>;
        let zIndex = this.props.zIndex ? { zIndex: this.props.zIndex } : {};
        return (
            <View style={[styles.position, { top: this.props.top, left: this.props.left }]}>
                <TouchableOpacity
                    onPress={() => {
                        this.props.onPress();
                    }}
                    disabled={this.props.disabled ? true : false}
                >
                    <View style={[styles.button, { height: this.props.height, width: this.props.width }, zIndex]}>
                        {display}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

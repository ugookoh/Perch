import React from 'react';
import styles from './styles';
import { View, Text } from 'react-native';

export default class VerifyInputForm extends React.Component {
    render() {
        return (
            <View style={[styles.position]}>
                <Text style={styles.text}>{this.props.text}</Text>
            </View>
        );
    }
}

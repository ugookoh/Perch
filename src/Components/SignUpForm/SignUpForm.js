import React from 'react';
import styles from './styles';
import { View, TextInput, Keyboard } from 'react-native';

export default class SignUpForm extends React.Component {
    render() {
        let keyboardType;
        let password = false;
        if (this.props.form == 'email')
            keyboardType = 'email-address';
        else if (this.props.form == 'number')
            keyboardType = 'number-pad';
        else if (this.props.form == 'password') {
            password = true;
            keyboardType = 'default';
        }
        else keyboardType = 'default';
        return (
            <View style={[styles.view, { height: this.props.height, width: this.props.width, marginTop: this.props.marginTop ? this.props.marginTop : 0 }]}>
                <TextInput
                    spellCheck={false}
                    style={styles.textInput}
                    placeholder={this.props.placeholder}
                    placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                    onChangeText={this.props.onChangeText}
                    value={this.props.value}
                    keyboardType={keyboardType}
                    secureTextEntry={password}
                    blurOnSubmit={false}
                    onEndEditing={this.props.onEndEditing}
                    autoCapitalize={this.props.form == 'default' ? 'words' : 'none'}
                />
            </View>
        );
    }
}

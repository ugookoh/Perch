import React from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, LayoutAnimation, Platform, StatusBar, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, UIManager, View } from 'react-native';
import Button from '../../Components/Button/Button';
import Header from '../../Components/Header/Header';
import { changePassword, CustomLayoutLinear, OfflineNotice, sendPasswordResetLink, width, x, y } from '../../Functions/Functions';
import styles from './styles';


export default class ChangePassword extends React.Component {
    constructor(props) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            scrollY: new Animated.Value(0),
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            errorMessage: '',
            loading: false,
            userDetails: this.props.route.params.userDetails,
        };
    }
    render() {
        LayoutAnimation.configureNext(CustomLayoutLinear);

        return (
            <TouchableWithoutFeedback
                onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <View style={styles.header}>
                        <Header name={'Change Password'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />
                    </View>

                    <KeyboardAvoidingView behavior={'position'}>
                        <View style={styles.secondaryContainer}>
                            <TextInput
                                ref={(input) => { this.firstTextInput = input; }}
                                autoFocus={true}
                                placeholder={'Old Password'}
                                placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                style={styles.textInput}
                                returnKeyType={'next'}
                                secureTextEntry={true}
                                onChangeText={(value) => { this.setState({ oldPassword: value }) }}
                                value={this.state.oldPassword}
                                keyboardType={'default'}
                                autoCapitalize={'none'}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    if (this.state.newPassword == '')
                                        this.secondTextInput.focus();
                                    else if (this.state.confirmNewPassword == '')
                                        this.thirdTextInput.focus();
                                    else
                                        Keyboard.dismiss()

                                }}
                            />
                            <TextInput
                                ref={(input) => { this.secondTextInput = input; }}
                                placeholder={'New Password'}
                                placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                style={styles.textInput}
                                returnKeyType={'next'}
                                secureTextEntry={true}
                                autoCapitalize={'none'}
                                onChangeText={(value) => { this.setState({ newPassword: value }) }}
                                value={this.state.newPassword}
                                keyboardType={'default'}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    if (this.state.confirmNewPassword == '')
                                        this.thirdTextInput.focus();
                                    else
                                        Keyboard.dismiss();
                                }}
                            />
                            <TextInput
                                ref={(input) => { this.thirdTextInput = input; }}
                                placeholder={'Verify New Password'}
                                placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                style={styles.textInput}
                                secureTextEntry={true}
                                autoCapitalize={'none'}
                                onChangeText={(value) => { this.setState({ confirmNewPassword: value }) }}
                                value={this.state.confirmNewPassword}
                                keyboardType={'default'}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                }}
                            />
                            {this.state.errorMessage == '' ? <></> : <View style={{ width: width, alignItems: 'center', paddingHorizontal: x(12.5) }}>
                                <Text style={styles.error}>{this.state.errorMessage}</Text>
                            </View>}
                            <View style={styles.choices}>
                                <Text style={styles.fP}>Forgot password?</Text>
                                <TouchableOpacity style={{ top: (StatusBar.currentHeight ? x(3) : 0) }}
                                    onPress={() => {
                                        this.setState({ loading: true }, () => {
                                            sendPasswordResetLink.call(this, this.state.userDetails.email);
                                        })
                                    }}>
                                    <Text style={styles.vE}>Send verification email</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.button}>
                                <Button text={'Change Password'} width={x(322)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.loading} onPress={() => {
                                    Keyboard.dismiss();
                                    if (this.state.oldPassword == '') {
                                        this.setState({ errorMessage: 'Please enter your old password' });
                                        this.firstTextInput.focus();
                                    }
                                    else if (this.state.newPassword == '') {
                                        this.setState({ errorMessage: 'Please enter a new password' });
                                        this.secondTextInput.focus();
                                    }
                                    else if (this.state.newPassword !== this.state.confirmNewPassword) {
                                        this.setState({ errorMessage: 'Passwords do not match' });
                                        this.secondTextInput.focus();
                                    }
                                    else if (this.state.oldPassword === this.state.newPassword) {
                                        this.setState({ errorMessage: 'Please use a different new password' });
                                        this.secondTextInput.focus();
                                    }
                                    else {
                                        this.setState({ errorMessage: '' }, () => {
                                            changePassword.call(this, this.state.oldPassword, this.state.newPassword);
                                        });
                                    }
                                }}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>

                </View>
            </TouchableWithoutFeedback>
        )
    }
};
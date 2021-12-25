import { Picker } from '@react-native-community/picker';
import React from 'react';
import { Alert, Animated, Button, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button_ from '../../Components/Button/Button';
import Header from '../../Components/Header/Header';
import { dimensionAssert, OfflineNotice, sendFeedback, x, y, colors } from '../../Functions/Functions';
import styles from './styles';

export default class ContactUs extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
            form: '',
            issue: 'choice',
            choice: 'hidden',
            messageSent: false,
            loading: false,
        }
        this.pickerPosition = new Animated.Value(-y(310))
        this.showPicker = this.showPicker.bind(this);
        this.hidePicker = this.hidePicker.bind(this);
    }

    hidePicker() {
        Keyboard.dismiss();
        this.setState({ choice: 'hidden' });
        Animated.spring(this.pickerPosition, {
            toValue: dimensionAssert() ? -y(310) : -y(290),
            bounciness: 0,
            useNativeDriver:false,
        }).start();
    }
    showPicker() {
        Keyboard.dismiss();
        this.setState({ choice: 'shown' });
        Animated.spring(this.pickerPosition, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver:false,
        }).start();
    }
    render() {
        let text = '';
        switch (this.state.issue) {
            case 'choice': { text = 'Please explain what you would like discussed, we love to read ;)' } break;
            case 'Report a bug': { text = `Thanks for coming to us with this! Please describe the issue as precisely as you can and we would work on fixing it` } break;
            case 'Give feedback about our services': { text = `We appreciate the feedback! Remember to leave us a rating on the ${Platform.OS == 'ios' ? 'App Store' : 'Play Store'} :)` } break;
            case 'Report a driver': { text = `Note if reporting a driver , please include the name of the person if you remember for a faster processing time.` } break;
            case 'Missing Item': { text = `Please explain the item as accurately as you can and we would get back to you as soon as we get some information.` } break;
            case 'Work with us': { text = `Remember to visit our website to apply for a position as a Perch driver.` } break;
            case 'Change your name': { text = `Please enter the name you would like to change it to in the format (first name-last name)` } break;
            case 'Other': { text = `Please explain what you would like discussed, we love to read ;)` } break;

        }
        const form = this.state.messageSent == false ? true : false;//THIS CONTROLS BEFORE AND AFTER THE MESSAGE IS SENT
        const iconRotation = this.pickerPosition.interpolate({
            inputRange: [dimensionAssert() ? -y(310) : -y(290), 0],
            outputRange: ['0deg', '-180deg'],
            extrapolate: 'clamp',
        });
        if (form)
            return (
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        //this.hidePicker();
                    }}
                >
                    <View style={styles.container}>
                        <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                        <View style={{ zIndex: 3 }}>
                            <Header scrollY={this.state.scrollY} name={'Contact Us'} onPress={() => { this.props.navigation.goBack() }} />
                        </View>
                        <KeyboardAvoidingView behavior={'position'}>
                            <View style={styles.formContainer}>

                                <Text style={styles.feedbackTitle}>Feedback Form</Text>
                                <View style={styles.picker}>
                                    <TouchableOpacity onPress={() => {
                                        if (this.state.choice === 'hidden')
                                            this.showPicker();
                                        else if (this.state.choice === 'shown')
                                            this.hidePicker();
                                    }}>
                                        {this.state.issue === 'choice' ? <Text style={[styles.issueChoice, { color: colors.GREY }]}>Select a topic</Text> : <Text style={styles.issueChoice}>{this.state.issue}</Text>}
                                    </TouchableOpacity>
                                    <Animated.View style={[styles.dropDown, { transform: [{ rotate: iconRotation }] }]}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (this.state.choice === 'hidden')
                                                    this.showPicker();
                                                else if (this.state.choice === 'shown')
                                                    this.hidePicker();
                                            }}
                                        >
                                            <Icon name={'ios-arrow-down'} size={y(20)} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                                <View style={styles.textInputView}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={text}

                                        onChangeText={(value) => { this.setState({ form: value }) }}
                                        value={this.state.form}
                                        multiline={true}
                                        textAlignVertical={'top'}
                                    />
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                        <View style={[styles.button, {}]}>
                            <Button_ text={'Send feedback'} width={x(343)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.loading} onPress={() => {
                                if (this.state.form.length != 0)
                                    sendFeedback.call(this)
                                else
                                    Alert.alert('Body is empty', 'Please enter a message for us to process');

                            }} />
                        </View>
                        <Text style={styles.pM}>Previous messages</Text>
                        <TouchableOpacity
                            style={styles.pMView}
                            onPress={() => { this.props.navigation.navigate('PreviousMessages') }}>
                            <Text style={styles.pM_}>See all previous support messages</Text>
                        </TouchableOpacity>
                        {/* <View style={styles.image}>
                            <CustomerCare height={'100%'} width={'100%'} />
                        </View> */}
                        <Animated.View style={[styles.pickerView, { bottom: this.pickerPosition, }]}>
                            <View style={styles.pickerChoice}>
                                <View style={{ marginRight: x(20) }}>
                                    <Button
                                        onPress={this.hidePicker}
                                        title="Choose"
                                    />
                                </View>
                            </View>
                            <Picker
                                style={styles.picker_}
                                selectedValue={this.state.issue}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({ issue: itemValue });

                                    if (Platform.OS === 'android')
                                        this.hidePicker();
                                }}>
                                <Picker.Item label="---Select a topic---" value="choice" color={colors.GREY} />
                                <Picker.Item label="Give feedback about our services" value="Give feedback about our services" />
                                <Picker.Item label="Missing Item" value="Missing Item" />
                                <Picker.Item label="Change your name" value="Change your name" />
                                <Picker.Item label="Report a driver" value="Report a driver" />
                                <Picker.Item label="Work with us" value="Work with us" />
                                <Picker.Item label="Report a bug" value="Report a bug" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            );
        else
            return (
                <View style={styles.container}>
                    <View style={{ zIndex: 2 }}>
                        <Header scrollY={this.state.scrollY} name={'Contact Us'} />
                    </View>

                    <View style={[styles.formContainer, { justifyContent: 'center' }]}>
                        <Text style={[styles.issueChoice, { textAlign: 'center', fontSize: y(18, true), }]}>{'Thank you for contacting us!\nWe would get back to you as soon as possible.'}</Text>
                    </View>
                    <View style={styles.button}><Button_ text={'Home'} width={x(343)} height={y(48)} top={0} left={0} zIndex={2} onPress={() => { this.props.navigation.navigate('Main') }} /></View>
                    <Text style={styles.pM}>Previous messages</Text>
                    <TouchableOpacity
                        style={styles.pMView}
                        onPress={() => { this.props.navigation.navigate('PreviousMessages') }}>
                        <Text style={styles.pM_}>See all previous support messages</Text>
                    </TouchableOpacity>

                </View>
            );

    }
};
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import axios from 'axios';
import React from 'react';
import {
    Alert, Animated, Image,
    Keyboard, KeyboardAvoidingView,
    StatusBar, Text, TextInput,
    TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import {
    dimensionAssert, OfflineNotice,
    width, x, y, colors
} from '../../Functions/Functions';
import Avatar from '../../Images/svgImages/avatar';
import styles from './styles';


export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            firstName: this.props.route.params.userDetails.firstName,
            lastName: this.props.route.params.userDetails.lastName,
            email: this.props.route.params.userDetails.email,
            phoneNumber: this.props.route.params.userDetails.phoneNumber,
            loading: false,
            errorMessage: '',
            userDetails: this.props.route.params.userDetails,
            originalEmail: this.props.route.params.userDetails.email,
            originalPhoneNumber: this.props.route.params.userDetails.phoneNumber, //CHANGE THESE ORIGINAL VALUES WHEN YOU VERIFY AN EMAIL
            photoRef: this.props.route.params.userDetails.photoRef,
            url: null,

            phoneVerified: this.props.route.params.userDetails.summarizedHistory.phoneVerified,
            emailVerified: this.props.route.params.userDetails.summarizedHistory.emailVerified,
        };
        this.setImage();
    }
    componentDidMount() {
        database().ref(`users/${this.state.userDetails.userID}/summarizedHistory`).on('value', snapshot => {
            this.setState({ phoneVerified: snapshot.val().phoneVerified, emailVerified: snapshot.val().emailVerified })
        })
        database().ref(`users/${this.state.userDetails.userID}/phoneNumber`).on('value', snapshot => {
            this.setState({ originalPhoneNumber: snapshot.val() })
        })
        database().ref(`users/${this.state.userDetails.userID}/email`).on('value', snapshot => {
            this.setState({ originalEmail: snapshot.val() })
        })
    }
    setImage = () => {
        if (this.state?.userDetails?.photoRef)
            storage().ref(`${this.state.userDetails.photoRef}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) })
    };
    updateName() {
        Alert.alert(
            'We cannot update this field',
            'To update this field you need to contact us with the name you want to update it to',
            [
                {
                    text: 'Cancel',
                    //onPress: () => console.log('Cancel Pressed'),
                    style: 'default'
                },
                {
                    text: 'Contact Us',
                    onPress: () => {
                        this.props.navigation.navigate('ContactUs');
                    },
                    style: 'cancel'
                }
            ],
            { cancelable: false }
        );

    }
    render() {
        let phoneVerified = this.state.phoneVerified && this.state.originalPhoneNumber === this.state.phoneNumber ? true : false;
        let emailVerified = this.state.emailVerified && this.state.originalEmail === this.state.email ? true : false;


        return (
            <TouchableWithoutFeedback
                onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <View style={styles.header}>
                        <Header name={'Profile'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />
                    </View>

                    <KeyboardAvoidingView behavior={'position'}>
                        <View style={styles.secondaryContainer}>
                            <View style={[styles.avatarContainer, this.state.url ? {} : { backgroundColor: '#77DD73', }]}>
                                <TouchableOpacity>
                                    {this.state.url ?
                                        <Image
                                            source={{ uri: this.state.url }}
                                            resizeMode={'contain'}
                                            style={{
                                                flex: 1,
                                                width: x(113),
                                                height: x(113),
                                            }} /> :
                                        <View style={styles.avatar}>
                                            <Avatar />
                                        </View>}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.optionContainer}>
                                <View style={styles.option}>
                                    <Text style={styles.tag}>FIRST NAME</Text>

                                    <View style={styles.textInputContainer}>
                                        <TouchableOpacity onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.textInput, { opacity: 0.6 }]}>{this.state.firstName}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.tag, { color: colors.GREEN, }]}>EDIT</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                                <View style={styles.option}>
                                    <Text style={styles.tag}>LAST NAME</Text>

                                    <View style={styles.textInputContainer}>
                                        <TouchableOpacity onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.textInput, { opacity: 0.6 }]}>{this.state.lastName}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} onPress={() => { this.updateName.call(this) }}>
                                            <Text style={[styles.tag, { color: colors.GREEN }]}>EDIT</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                                <View style={styles.option}>
                                    <Text style={styles.tag}>EMAIL</Text>

                                    <View style={styles.textInputContainer}>
                                        <TextInput
                                            placeholder={'Enter your email...'}
                                            style={styles.textInput}
                                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                            onChangeText={(value) => { this.setState({ email: value }) }}
                                            value={this.state.email}
                                            keyboardType={'email-address'}
                                        />

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} disabled={emailVerified}
                                            onPress={() => {
                                                //SEND THE VERIFICATION CODE HERE
                                                Keyboard.dismiss();
                                                this.props.navigation.navigate('VerifyDetails', {
                                                    type: 'Email',
                                                    userDetails: this.state.userDetails,
                                                    display: this.state.email
                                                });
                                            }}>
                                            <Text style={[styles.tag, { top: y(dimensionAssert() ? -16 : 0), color: emailVerified ? colors.GREEN : colors.RED }]}>{emailVerified ? `VERIFIED` : `VERIFY`}</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                                <View style={styles.option}>
                                    <Text style={styles.tag}>PHONE NUMBER</Text>

                                    <View style={styles.textInputContainer}>
                                        <TextInput
                                            placeholder={'Enter your phone number...'}
                                            style={styles.textInput}
                                            placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                            onChangeText={(value) => { this.setState({ phoneNumber: value }) }}
                                            value={this.state.phoneNumber}
                                            keyboardType={'number-pad'}
                                        />

                                        <TouchableOpacity style={{ bottom: (StatusBar.currentHeight ? x(12) : 0) }} disabled={phoneVerified}
                                            onPress={() => {
                                                //SEND THE VERIFICATION CODE HERE
                                                Keyboard.dismiss();

                                                axios.post(`https://us-central1-perch-01.cloudfunctions.net/checkIfPhoneNumberIsFree`, { phoneNumber: this.state.phoneNumber })
                                                    .then((r) => {
                                                        if (r.data) {
                                                            this.props.navigation.navigate('VerifyDetails', {
                                                                type: 'Phone Number',
                                                                userDetails: this.state.userDetails,
                                                                display: this.state.phoneNumber,
                                                            });
                                                        }
                                                        else
                                                            Alert.alert('Error', 'Phone number already in use by another account')
                                                    })
                                                    .catch(error => {
                                                        Alert.alert('Error', error.message)
                                                    })


                                            }}>
                                            <Text style={[styles.tag, { top: y(dimensionAssert() ? -16 : 0), color: phoneVerified ? colors.GREEN : colors.RED }]}>{phoneVerified ? `VERIFIED` : `VERIFY`}</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                    <View style={[styles.option,/* { top: x(dimensionAssert() ? -9 : 0) } */]}>
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                this.props.navigation.navigate('ChangePassword', { userDetails: this.state.userDetails })
                            }}
                            style={styles.changePassword}>
                            <Text style={[styles.delete,]}>Change Password</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: width, alignItems: 'center', top: x(dimensionAssert() ? -55 : -10), paddingHorizontal: x(12.5) }}>
                        <Text numberOfLines={2} style={styles.errorMessage}>{this.state.errorMessage}</Text>
                    </View>
                    {/* <View style={styles.buttonContainer}>
                        <View style={[styles.button, {}]}>
                            <Button text={'Save changes'} width={x(343)} height={y(48)} top={0} left={0} zIndex={2} loading={this.state.loading} onPress={() => {


                            }} />
                        </View>
                    </View> */}
                </View>
            </TouchableWithoutFeedback>
        )
    }
};
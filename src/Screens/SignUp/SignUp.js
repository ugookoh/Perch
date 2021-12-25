import AsyncStorage from '@react-native-community/async-storage';
import { Picker } from '@react-native-community/picker';
import React from 'react';
import {
    Animated, Button as Button_,
    Keyboard, KeyboardAvoidingView,
    LayoutAnimation, Platform,
    StatusBar, Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, UIManager, View
} from 'react-native';
import Button from '../../Components/Button/Button';
import Form from '../../Components/SignUpForm/SignUpForm';
import {
    createUserDetails, CustomLayoutLinear,
    dimensionAssert, OfflineNotice, x, y
} from '../../Functions/Functions';
import Logo from '../../Images/svgImages/logo';
import styles from './styles';

export default class SignUp extends React.Component {
    constructor() {
        super();

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            errorMessage: '',
            loading: false,
            choice: 'hidden',
            countryCode: 'Canada (+1)',
            referralCode: '',
        }
        this._keyboardDidShow = this._keyboardDidShow.bind(this);
        this.pickerPosition = new Animated.Value(-y(310))
    }
    hidePicker = () => {
        Keyboard.dismiss();
        this.setState({ choice: 'hidden' });
        Animated.spring(this.pickerPosition, {
            toValue: dimensionAssert() ? -y(310) : -y(290),
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    }
    showPicker = () => {
        Keyboard.dismiss();
        this.setState({ choice: 'shown' });
        Animated.spring(this.pickerPosition, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    }
    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(('keyboardDidShow'), this._keyboardDidShow);
    }
    countryCode = () => {

        const formattedString = this.state.countryCode
        let b1 = 0; b2 = 0;

        for (k = 0; k < formattedString.length; k++)
            if (formattedString[k] == '(')
                b1 = k + 2;
            else if (formattedString[k] == ')')
                b2 = k;

        return formattedString.substring(b1, b2);
    }
    _keyboardDidShow(e) {
        if (Platform.OS === 'android') {
            AsyncStorage.getItem('ANDROID_KEYBOARD_HEIGHT')
                .then((value) => {
                    if (value == null) {
                        AsyncStorage.setItem('ANDROID_KEYBOARD_HEIGHT', JSON.stringify(e.endCoordinates.height))
                            .catch(error => { console.log(error.message) });
                    }
                })
                .catch((err) => { console.log(err.message) })
        }
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
    }
    render() {
        const marginTop = y(5);
        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                <View style={styles.container}>
                    <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                    <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

                    <KeyboardAvoidingView behavior={'position'}>
                        <View style={styles.secContainer}>
                            <View style={styles.logo}>
                                <Logo height={"100%"} width={"100%"} />
                            </View>
                            <View style={styles.signUp}>
                                <Text style={styles.sinUpText}>Sign Up</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={styles.topInput}>
                                    <Form height={y(48)} width={x(158)} placeholder={'First Name'} onChangeText={(value) => { this.setState({ firstName: value }) }} value={this.state.firstName} form={'default'} onEndEditing={() => { }} />
                                    <Form height={y(48)} width={x(158)} placeholder={'Last Name'} onChangeText={(value) => { this.setState({ lastName: value }) }} value={this.state.lastName} form={'default'} onEndEditing={() => { }} />
                                </View>
                                <Form height={y(48)} width={x(322)} placeholder={'Email'} onChangeText={(value) => { this.setState({ email: value }) }} value={this.state.email} form={'email'} marginTop={marginTop} onEndEditing={() => { }} />
                                <View style={[styles.view, { height: y(48), width: x(322), marginTop: marginTop }]}>
                                    <TouchableOpacity style={styles.countryCodeBox} onPress={this.showPicker}>
                                        <Text style={{ fontFamily: 'Gilroy-Regular', fontSize: y(15, true), }}>{`+${this.countryCode()}`}</Text>
                                    </TouchableOpacity>
                                    <TextInput
                                        spellCheck={false}
                                        style={styles.textInput}
                                        placeholder={'Phone Number'}
                                        placeholderTextColor={`rgba(204, 206, 211,0.9)`}
                                        onChangeText={(value) => { this.setState({ phoneNumber: value }) }}
                                        value={this.state.phoneNumber}
                                        keyboardType={'number-pad'}
                                        blurOnSubmit={false}
                                        autoCapitalize={'none'}
                                    />
                                </View>
                                <View style={[styles.topInput, { marginTop: marginTop }]}>
                                    <Form height={y(48)} width={x(158)} placeholder={'Password'} onChangeText={(value) => { this.setState({ password: value }) }} value={this.state.password} form={'password'} onEndEditing={() => { }} />
                                    <Form height={y(48)} width={x(158)} placeholder={'Confirm Password'} onChangeText={(value) => { this.setState({ confirmPassword: value }) }} value={this.state.confirmPassword} form={'password'} onEndEditing={() => { }} />
                                </View>
                                <Form height={y(48)} width={x(322)} placeholder={'Referral Code'} onChangeText={(value) => { this.setState({ referralCode: value }) }} value={this.state.referralCode} form={'default'} marginTop={marginTop} onEndEditing={() => { Keyboard.dismiss() }} />
                            </View>
                        </View>

                    </KeyboardAvoidingView>
                    {this.state.errorMessage == '' ? <></> : <Text style={styles.error}>{this.state.errorMessage}</Text>}
                    <Button text={'Sign Up'} height={y(48)} width={x(322)} left={x(27)} top={y(dimensionAssert() ? 590 : 550)}
                        onPress={() => {
                            Keyboard.dismiss();
                            //console.log(this.state)
                            if (this.state.firstName == '')
                                this.setState({ errorMessage: 'Please enter your first name' });
                            else if (this.state.lastName == '')
                                this.setState({ errorMessage: 'Please enter your last name' });
                            else if (this.state.email == '' || this.state.email.length < 4)
                                this.setState({ errorMessage: 'Please enter your email address' });
                            else if (this.state.phoneNumber == '')
                                this.setState({ errorMessage: 'Please enter your phone number' });
                            else if (this.state.password == '')
                                this.setState({ errorMessage: 'Please enter a password' });
                            else if (this.state.password !== this.state.confirmPassword)
                                this.setState({ errorMessage: 'Passwords do not match', confirmPassword: '' });
                            else {
                                this.setState({ loading: true });
                                createUserDetails.call(
                                    this, this.state.firstName,
                                    this.state.lastName,
                                    this.state.email,
                                    `+${this.countryCode()}${this.state.phoneNumber}`,
                                    this.state.password,
                                    false,
                                    this.state.referralCode
                                )
                            }
                        }}
                        loading={this.state.loading} />

                    <View style={[styles.messageView, { top: y(667) }]}><Text style={[styles.messageText, { color: '#000000', opacity: 0.5 }]}>Have an account?</Text></View>
                    <TouchableOpacity onPress={() => { this.props.navigation.navigate('SignIn') }} style={[styles.messageView, { top: y(705) }]}><Text style={[styles.messageText, { color: '#4DB748', fontFamily: 'Gilroy-Bold', textDecorationLine: 'underline' }]}>Log In</Text></TouchableOpacity>
                    <Animated.View style={[styles.pickerView, { bottom: this.pickerPosition, }]}>
                        <View style={styles.pickerChoice}>
                            <View style={{ marginRight: x(20) }}>
                                <Button_
                                    onPress={this.hidePicker}
                                    title="Choose"
                                />
                            </View>
                        </View>
                        <Picker
                            style={styles.picker_}
                            selectedValue={this.state.countryCode}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ countryCode: itemValue });

                                if (Platform.OS === 'android')
                                    this.hidePicker();
                            }}>
                            <Picker.Item value="Algeria (+213)" label="Algeria (+213)" />
                            <Picker.Item value="Andorra (+376)" label="Andorra (+376)" />
                            <Picker.Item value="Angola (+244)" label="Angola (+244)" />
                            <Picker.Item value="Anguilla (+1264)" label="Anguilla (+1264)" />
                            <Picker.Item value="Antigua &amp; Barbuda (+1268)" label="Antigua &amp; Barbuda (+1268)" />
                            <Picker.Item value="Argentina (+54)" label="Argentina (+54)" />
                            <Picker.Item value="Armenia (+374)" label="Armenia (+374)" />
                            <Picker.Item value="Aruba (+297)" label="Aruba (+297)" />
                            <Picker.Item value="Australia (+61)" label="Australia (+61)" />
                            <Picker.Item value="Austria (+43)" label="Austria (+43)" />
                            <Picker.Item value="Azerbaijan (+994)" label="Azerbaijan (+994)" />
                            <Picker.Item value="Bahamas (+1242)" label="Bahamas (+1242)" />
                            <Picker.Item value="Bahrain (+973)" label="Bahrain (+973)" />
                            <Picker.Item value="Bangladesh (+880)" label="Bangladesh (+880)" />
                            <Picker.Item value="Barbados (+1246)" label="Barbados (+1246)" />
                            <Picker.Item value="Belarus (+375)" label="Belarus (+375)" />
                            <Picker.Item value="Belgium (+32)" label="Belgium (+32)" />
                            <Picker.Item value="Belize (+501)" label="Belize (+501)" />
                            <Picker.Item value="Benin (+229)" label="Benin (+229)" />
                            <Picker.Item value="Bermuda (+1441)" label="Bermuda (+1441)" />
                            <Picker.Item value="Bhutan (+975)" label="Bhutan (+975)" />
                            <Picker.Item value="Bolivia (+591)" label="Bolivia (+591)" />
                            <Picker.Item value="Bosnia Herzegovina (+387)" label="Bosnia Herzegovina (+387)" />
                            <Picker.Item value="Botswana (+267)" label="Botswana (+267)" />
                            <Picker.Item value="Brazil (+55)" label="Brazil (+55)" />
                            <Picker.Item value="Brunei (+673)" label="Brunei (+673)" />
                            <Picker.Item value="Bulgaria (+359)" label="Bulgaria (+359)" />
                            <Picker.Item value="Burkina Faso (+226)" label="Burkina Faso (+226)" />
                            <Picker.Item value="Burundi (+257)" label="Burundi (+257)" />
                            <Picker.Item value="Cambodia (+855)" label="Cambodia (+855)" />
                            <Picker.Item value="Cameroon (+237)" label="Cameroon (+237)" />
                            <Picker.Item value="Canada (+1)" label="Canada (+1)" />
                            <Picker.Item value="Cape Verde Islands (+238)" label="Cape Verde Islands (+238)" />
                            <Picker.Item value="Cayman Islands (+1345)" label="Cayman Islands (+1345)" />
                            <Picker.Item value="Central African Republic (+236)" label="Central African Republic (+236)" />
                            <Picker.Item value="Chile (+56)" label="Chile (+56)" />
                            <Picker.Item value="China (+86)" label="China (+86)" />
                            <Picker.Item value="Colombia (+57)" label="Colombia (+57)" />
                            <Picker.Item value="Comoros (+269)" label="Comoros (+269)" />
                            <Picker.Item value="Congo (+242)" label="Congo (+242)" />
                            <Picker.Item value="Cook Islands (+682)" label="Cook Islands (+682)" />
                            <Picker.Item value="Costa Rica (+506)" label="Costa Rica (+506)" />
                            <Picker.Item value="Croatia (+385)" label="Croatia (+385)" />
                            <Picker.Item value="Cuba (+53)" label="Cuba (+53)" />
                            <Picker.Item value="Cyprus North (+90392)" label="Cyprus North (+90392)" />
                            <Picker.Item value="Cyprus South (+357)" label="Cyprus South (+357)" />
                            <Picker.Item value="Czech Republic (+42)" label="Czech Republic (+42)" />
                            <Picker.Item value="Denmark (+45)" label="Denmark (+45)" />
                            <Picker.Item value="Djibouti (+253)" label="Djibouti (+253)" />
                            <Picker.Item value="Dominica (+1809)" label="Dominica (+1809)" />
                            <Picker.Item value="Dominican Republic (+1809)" label="Dominican Republic (+1809)" />
                            <Picker.Item value="Ecuador (+593)" label="Ecuador (+593)" />
                            <Picker.Item value="Egypt (+20)" label="Egypt (+20)" />
                            <Picker.Item value="El Salvador (+503)" label="El Salvador (+503)" />
                            <Picker.Item value="Equatorial Guinea (+240)" label="Equatorial Guinea (+240)" />
                            <Picker.Item value="Eritrea (+291)" label="Eritrea (+291)" />
                            <Picker.Item value="Estonia (+372)" label="Estonia (+372)" />
                            <Picker.Item value="Ethiopia (+251)" label="Ethiopia (+251)" />
                            <Picker.Item value="Falkland Islands (+500)" label="Falkland Islands (+500)" />
                            <Picker.Item value="Faroe Islands (+298)" label="Faroe Islands (+298)" />
                            <Picker.Item value="Fiji (+679)" label="Fiji (+679)" />
                            <Picker.Item value="Finland (+358)" label="Finland (+358)" />
                            <Picker.Item value="France (+33)" label="France (+33)" />
                            <Picker.Item value="French Guiana (+594)" label="French Guiana (+594)" />
                            <Picker.Item value="French Polynesia (+689)" label="French Polynesia (+689)" />
                            <Picker.Item value="Gabon (+241)" label="Gabon (+241)" />
                            <Picker.Item value="Gambia (+220)" label="Gambia (+220)" />
                            <Picker.Item value="Georgia (+7880)" label="Georgia (+7880)" />
                            <Picker.Item value="Germany (+49)" label="Germany (+49)" />
                            <Picker.Item value="Ghana (+233)" label="Ghana (+233)" />
                            <Picker.Item value="Gibraltar (+350)" label="Gibraltar (+350)" />
                            <Picker.Item value="Greece (+30)" label="Greece (+30)" />
                            <Picker.Item value="Greenland (+299)" label="Greenland (+299)" />
                            <Picker.Item value="Grenada (+1473)" label="Grenada (+1473)" />
                            <Picker.Item value="Guadeloupe (+590)" label="Guadeloupe (+590)" />
                            <Picker.Item value="Guam (+671)" label="Guam (+671)" />
                            <Picker.Item value="Guatemala (+502)" label="Guatemala (+502)" />
                            <Picker.Item value="Guinea (+224)" label="Guinea (+224)" />
                            <Picker.Item value="Guinea - Bissau (+245)" label="Guinea - Bissau (+245)" />
                            <Picker.Item value="Guyana (+592)" label="Guyana (+592)" />
                            <Picker.Item value="Haiti (+509)" label="Haiti (+509)" />
                            <Picker.Item value="Honduras (+504)" label="Honduras (+504)" />
                            <Picker.Item value="Hong Kong (+852)" label="Hong Kong (+852)" />
                            <Picker.Item value="Hungary (+36)" label="Hungary (+36)" />
                            <Picker.Item value="Iceland (+354)" label="Iceland (+354)" />
                            <Picker.Item value="India (+91)" label="India (+91)" />
                            <Picker.Item value="Indonesia (+62)" label="Indonesia (+62)" />
                            <Picker.Item value="Iran (+98)" label="Iran (+98)" />
                            <Picker.Item value="Iraq (+964)" label="Iraq (+964)" />
                            <Picker.Item value="Ireland (+353)" label="Ireland (+353)" />
                            <Picker.Item value="Israel (+972)" label="Israel (+972)" />
                            <Picker.Item value="Italy (+39)" label="Italy (+39)" />
                            <Picker.Item value="Jamaica (+1876)" label="Jamaica (+1876)" />
                            <Picker.Item value="Japan (+81)" label="Japan (+81)" />
                            <Picker.Item value="Jordan (+962)" label="Jordan (+962)" />
                            <Picker.Item value="Kazakhstan (+7)" label="Kazakhstan (+7)" />
                            <Picker.Item value="Kenya (+254)" label="Kenya (+254)" />
                            <Picker.Item value="Kiribati (+686)" label="Kiribati (+686)" />
                            <Picker.Item value="Korea North (+850)" label="Korea North (+850)" />
                            <Picker.Item value="Korea South (+82)" label="Korea South (+82)" />
                            <Picker.Item value="Kuwait (+965)" label="Kuwait (+965)" />
                            <Picker.Item value="Kyrgyzstan (+996)" label="Kyrgyzstan (+996)" />
                            <Picker.Item value="Laos (+856)" label="Laos (+856)" />
                            <Picker.Item value="Latvia (+371)" label="Latvia (+371)" />
                            <Picker.Item value="Lebanon (+961)" label="Lebanon (+961)" />
                            <Picker.Item value="Lesotho (+266)" label="Lesotho (+266)" />
                            <Picker.Item value="Liberia (+231)" label="Liberia (+231)" />
                            <Picker.Item value="Libya (+218)" label="Libya (+218)" />
                            <Picker.Item value="Liechtenstein (+417)" label="Liechtenstein (+417)" />
                            <Picker.Item value="Lithuania (+370)" label="Lithuania (+370)" />
                            <Picker.Item value="Luxembourg (+352)" label="Luxembourg (+352)" />
                            <Picker.Item value="Macao (+853)" label="Macao (+853)" />
                            <Picker.Item value="Macedonia (+389)" label="Macedonia (+389)" />
                            <Picker.Item value="Madagascar (+261)" label="Madagascar (+261)" />
                            <Picker.Item value="Malawi (+265)" label="Malawi (+265)" />
                            <Picker.Item value="Malaysia (+60)" label="Malaysia (+60)" />
                            <Picker.Item value="Maldives (+960)" label="Maldives (+960)" />
                            <Picker.Item value="Mali (+223)" label="Mali (+223)" />
                            <Picker.Item value="Malta (+356)" label="Malta (+356)" />
                            <Picker.Item value="Marshall Islands (+692)" label="Marshall Islands (+692)" />
                            <Picker.Item value="Martinique (+596)" label="Martinique (+596)" />
                            <Picker.Item value="Mauritania (+222)" label="Mauritania (+222)" />
                            <Picker.Item value="Mayotte (+269)" label="Mayotte (+269)" />
                            <Picker.Item value="Mexico (+52)" label="Mexico (+52)" />
                            <Picker.Item value="Micronesia (+691)" label="Micronesia (+691)" />
                            <Picker.Item value="Moldova (+373)" label="Moldova (+373)" />
                            <Picker.Item value="Monaco (+377)" label="Monaco (+377)" />
                            <Picker.Item value="Mongolia (+976)" label="Mongolia (+976)" />
                            <Picker.Item value="Montserrat (+1664)" label="Montserrat (+1664)" />
                            <Picker.Item value="Morocco (+212)" label="Morocco (+212)" />
                            <Picker.Item value="Mozambique (+258)" label="Mozambique (+258)" />
                            <Picker.Item value="Myanmar (+95)" label="Myanmar (+95)" />
                            <Picker.Item value="Namibia (+264)" label="Namibia (+264)" />
                            <Picker.Item value="Nauru (+674)" label="Nauru (+674)" />
                            <Picker.Item value="Nepal (+977)" label="Nepal (+977)" />
                            <Picker.Item value="Netherlands (+31)" label="Netherlands (+31)" />
                            <Picker.Item value="New Caledonia (+687)" label="New Caledonia (+687)" />
                            <Picker.Item value="New Zealand (+64)" label="New Zealand (+64)" />
                            <Picker.Item value="Nicaragua (+505)" label="Nicaragua (+505)" />
                            <Picker.Item value="Niger (+227)" label="Niger (+227)" />
                            <Picker.Item value="Nigeria (+234)" label="Nigeria (+234)" />
                            <Picker.Item value="Niue (+683)" label="Niue (+683)" />
                            <Picker.Item value="Norfolk Islands (+672)" label="Norfolk Islands (+672)" />
                            <Picker.Item value="Northern Marianas (+670)" label="Northern Marianas (+670)" />
                            <Picker.Item value="Norway (+47)" label="Norway (+47)" />
                            <Picker.Item value="Oman (+968)" label="Oman (+968)" />
                            <Picker.Item value="Palau (+680)" label="Palau (+680)" />
                            <Picker.Item value="Panama (+507)" label="Panama (+507)" />
                            <Picker.Item value="Papua New Guinea (+675)" label="Papua New Guinea (+675)" />
                            <Picker.Item value="Paraguay (+595)" label="Paraguay (+595)" />
                            <Picker.Item value="Peru (+51)" label="Peru (+51)" />
                            <Picker.Item value="Philippines (+63)" label="Philippines (+63)" />
                            <Picker.Item value="Poland (+48)" label="Poland (+48)" />
                            <Picker.Item value="Portugal (+351)" label="Portugal (+351)" />
                            <Picker.Item value="Puerto Rico (+1787)" label="Puerto Rico (+1787)" />
                            <Picker.Item value="Qatar (+974)" label="Qatar (+974)" />
                            <Picker.Item value="Reunion (+262)" label="Reunion (+262)" />
                            <Picker.Item value="Romania (+40)" label="Romania (+40)" />
                            <Picker.Item value="Russia (+7)" label="Russia (+7)" />
                            <Picker.Item value="Rwanda (+250)" label="Rwanda (+250)" />
                            <Picker.Item value="San Marino (+378)" label="San Marino (+378)" />
                            <Picker.Item value="Sao Tome &amp; Principe (+239)" label="Sao Tome &amp; Principe (+239)" />
                            <Picker.Item value="Saudi Arabia (+966)" label="Saudi Arabia (+966)" />
                            <Picker.Item value="Senegal (+221)" label="Senegal (+221)" />
                            <Picker.Item value="Serbia (+381)" label="Serbia (+381)" />
                            <Picker.Item value="Seychelles (+248)" label="Seychelles (+248)" />
                            <Picker.Item value="Sierra Leone (+232)" label="Sierra Leone (+232)" />
                            <Picker.Item value="Singapore (+65)" label="Singapore (+65)" />
                            <Picker.Item value="Slovak Republic (+421)" label="Slovak Republic (+421)" />
                            <Picker.Item value="Slovenia (+386)" label="Slovenia (+386)" />
                            <Picker.Item value="Solomon Islands (+677)" label="Solomon Islands (+677)" />
                            <Picker.Item value="Somalia (+252)" label="Somalia (+252)" />
                            <Picker.Item value="South Africa (+27)" label="South Africa (+27)" />
                            <Picker.Item value="Spain (+34)" label="Spain (+34)" />
                            <Picker.Item value="Sri Lanka (+94)" label="Sri Lanka (+94)" />
                            <Picker.Item value="St. Helena (+290)" label="St. Helena (+290)" />
                            <Picker.Item value="St. Kitts (+1869)" label="St. Kitts (+1869)" />
                            <Picker.Item value="St. Lucia (+1758)" label="St. Lucia (+1758)" />
                            <Picker.Item value="Sudan (+249)" label="Sudan (+249)" />
                            <Picker.Item value="Suriname (+597)" label="Suriname (+597)" />
                            <Picker.Item value="Swaziland (+268)" label="Swaziland (+268)" />
                            <Picker.Item value="Sweden (+46)" label="Sweden (+46)" />
                            <Picker.Item value="Switzerland (+41)" label="Switzerland (+41)" />
                            <Picker.Item value="Syria (+963)" label="Syria (+963)" />
                            <Picker.Item value="Taiwan (+886)" label="Taiwan (+886)" />
                            <Picker.Item value="Tajikstan (+7)" label="Tajikstan (+7)" />
                            <Picker.Item value="Thailand (+66)" label="Thailand (+66)" />
                            <Picker.Item value="Togo (+228)" label="Togo (+228)" />
                            <Picker.Item value="Tonga (+676)" label="Tonga (+676)" />
                            <Picker.Item value="Trinidad &amp; Tobago (+1868)" label="Trinidad &amp; Tobago (+1868)" />
                            <Picker.Item value="Tunisia (+216)" label="Tunisia (+216)" />
                            <Picker.Item value="Turkey (+90)" label="Turkey (+90)" />
                            <Picker.Item value="Turkmenistan (+7)" label="Turkmenistan (+7)" />
                            <Picker.Item value="Turkmenistan (+993)" label="Turkmenistan (+993)" />
                            <Picker.Item value="Turks &amp; Caicos Islands (+1649)" label="Turks &amp; Caicos Islands (+1649)" />
                            <Picker.Item value="Tuvalu (+688)" label="Tuvalu (+688)" />
                            <Picker.Item value="Uganda (+256)" label="Uganda (+256)" />
                            <Picker.Item value="UK (+44)" label="UK (+44)" />
                            <Picker.Item value="Ukraine (+380)" label="Ukraine (+380)" />
                            <Picker.Item value="United Arab Emirates (+971)" label="United Arab Emirates (+971)" />
                            <Picker.Item value="Uruguay (+598)" label="Uruguay (+598)" />
                            <Picker.Item value="USA (+1)" label="USA (+1)" />
                            <Picker.Item value="Uzbekistan (+7)" label="Uzbekistan (+7)" />
                            <Picker.Item value="Vanuatu (+678)" label="Vanuatu (+678)" />
                            <Picker.Item value="Vatican City (+379)" label="Vatican City (+379)" />
                            <Picker.Item value="Venezuela (+58)" label="Venezuela (+58)" />
                            <Picker.Item value="Vietnam (+84)" label="Vietnam (+84)" />
                            <Picker.Item value="Virgin Islands - British (+1284)" label="Virgin Islands - British (+1284)" />
                            <Picker.Item value="Virgin Islands - US (+1340)" label="Virgin Islands - US (+1340)" />
                            <Picker.Item value="Wallis &amp; Futuna (+681)" label="Wallis &amp; Futuna (+681)" />
                            <Picker.Item value="Yemen (North)(+969)" label="Yemen (North)(+969)" />
                            <Picker.Item value="Yemen (South)(+967)" label="Yemen (South)(+967)" />
                            <Picker.Item value="Zambia (+260)" label="Zambia (+260)" />
                            <Picker.Item value="Zimbabwe (+263)" label="Zimbabwe (+263)" />
                        </Picker>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
};
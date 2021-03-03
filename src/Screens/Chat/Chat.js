import React from 'react';
import styles from './styles';
import { YellowBox, View, Text, Animated, TextInput, FlatList, Keyboard, StatusBar, Platform, LayoutAnimation, UIManager, Alert } from 'react-native';
import { OfflineNotice, makeid, Notifications, x, y, height, width, dimensionAssert, CustomLayoutLinear } from '../../Functions/Functions';
import database from '@react-native-firebase/database';
import ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import Icon_ from 'react-native-vector-icons/Entypo';
import StarRating from 'react-native-star-rating';
import { Message, UserMessage, DayMonthYear } from '../../Components/TextMessages/TextMessages';
import axios from 'axios';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#F5F5F5'];
const BLOCKER_HEIGHT = (dimensionAssert() ? y(65) / 3 : y(189) / 2);
const DRIVER_PROFILE_HEIGHT_HIDDEN = -y(132);

let keyboardEvent1 = 'keyboardWillShow';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        };

        this.state = {
            message: '',
            chatTop: 10,//arbitrary value,
            keyboardHeight: '',
            messageArray: [],
            riderID: this.props.route.params.riderID,
            driverID: this.props.route.params.driverID,
            messageLoadedInit: false,
            recieverDetails: null,
            recieverToken: null,
            mainDriverID: this.props.route.params.driverID.substring(0, this.props.route.params.driverID.length - 6),
            userFirstName: null,
            url: null,
            limitTo: 20,

        };
        this._keyboardDidShow = this._keyboardDidShow.bind(this);
        this._keyboardDidHide = this._keyboardDidHide.bind(this);
        this.dateAppended = false;
        this.keyboardPosition = new Animated.Value(0);
        this.firstMessagesGotten = false;
        this.keys = [];
    }

    componentDidMount() {
        this.setImage();
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardDidHide);
        if (Platform.OS === 'android')
            AsyncStorage.getItem('ANDROID_KEYBOARD_HEIGHT')
                .then(result => {
                    if (result)
                        this.setState({ keyboardHeight: JSON.parse(result) });
                    else
                        keyboardEvent1 = 'keyboardDidShow';
                })
                .catch(err => { console.log(err.message) });
        database().ref(`chats/${this.state.riderID}-${this.state.driverID}/`).once('value', snap => {
            this.keys = Object.keys(snap.val() || {});
            this.lastIdInSnapshot = this.keys[this.keys.length - 1];
            if (snap.val()) {
                let arrayToAppend = [], i = 0;
                snap.forEach(val => {
                    arrayToAppend[i] = val.val();
                    i++;
                });
                this.setState({ messageArray: arrayToAppend.reverse(), messageLoadedInit: true }, () => {
                    this.firstMessagesGotten = true;
                });
            }
            else {
                this.setState({ messageArray: [], messageLoadedInit: true }, () => {
                    this.firstMessagesGotten = true;
                });

            }
        });
        database().ref(`chats/${this.state.riderID}-${this.state.driverID}/`).on('child_added', snapshot => {
            if (this.firstMessagesGotten && this.keys.includes(snapshot.key) == false) {
                let newMessages = this.state.messageArray;
                newMessages.unshift(snapshot.val());
                this.setState({ messageArray: newMessages, });//IN THE REGULAR SCREEN WE WOULD SIMPLY SEND NOTIFICATIONS AND IF THEY PRESS IT WE SEND THEM HERE
            };
        });
        //user details and token
        axios.post(`https://us-central1-perch-01.cloudfunctions.net/chatGetUserDetails`, { userID: this.state.mainDriverID })
            .then((result) => {
                const snapshot = result.data;
                this.setState({
                    recieverDetails: {
                        name: `${snapshot.firstName} ${snapshot.lastName}`,
                        history: snapshot.driverSummarizedHistory.carpool,
                    },
                });
            }).catch(error => { console.log(error.message) });
        database().ref(`deviceID/${this.state.mainDriverID}/token`).on('value', token => {
            this.setState({ recieverToken: token.val() ? token.val() : null });
        });

        AsyncStorage.getItem(`USER_DETAILS`)
            .then(result => {
                if (result)
                    this.setState({ userFirstName: JSON.parse(result).firstName })
            })
            .catch(error => { console.log(error.message) })
    };
    _keyboardDidShow(e) {

        const animatevalue = (e ? e.endCoordinates.height : this.state.keyboardHeight) + (dimensionAssert() ? 0 : y(65));

        if (e || this.state.keyboardHeight !== '')
            Animated.spring(this.keyboardPosition, {
                toValue: animatevalue - BLOCKER_HEIGHT,
                bounciness: 0,
            }).start();

        if (Platform.OS === 'android' && keyboardEvent1 === 'keyboardDidShow') {
            AsyncStorage.setItem('ANDROID_KEYBOARD_HEIGHT', JSON.stringify(e.endCoordinates.height))
                .catch(error => { console.log(error.message) });
        };


        this.setState({ chatTop: animatevalue - BLOCKER_HEIGHT });
        Animated.spring(this.keyboardPosition, {
            toValue: animatevalue - BLOCKER_HEIGHT,
            bounciness: 0,
        }).start();
    };
    _keyboardDidHide(e) {
        //this.chatTop =
        Animated.spring(this.keyboardPosition, {
            toValue: 0,
            bounciness: 0,
        }).start();
    };
    permissionCamera() {
        return new Promise(resolve => {
            let permission_;
            if (Platform.OS === 'ios')
                permission_ = PERMISSIONS.IOS.CAMERA;
            else if (Platform.OS === 'android')
                permission_ = PERMISSIONS.ANDROID.CAMERA;
            check(permission_)
                .then(result => {//STORE THE RESULT IN ASYNC STORAGE AND SO WE CHECK WHENEVR WE WANT TO USE IT.
                    switch (result) {
                        case RESULTS.UNAVAILABLE: {
                            resolve(false);
                        }
                            break;
                        case RESULTS.DENIED: {
                            resolve(false);
                        }
                            break;
                        case RESULTS.GRANTED:
                            resolve(true);
                            break;
                        case RESULTS.BLOCKED:
                            resolve(false);
                    }
                })
                .catch(error => {
                    console.log(error.message)
                });
        })
    };
    setImage = () => {
        database().ref(`userImage/${this.state.mainDriverID}`).once('value', snapshot => {
            storage().ref(`${snapshot.val()}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) })
        }).catch(error => { console.log(error.message) })
    };
    getImage = () => {
        this.permissionCamera()
            .then(p => {
                if (p) {
                    const options = {
                        title: 'Select photo',
                        storageOptions: {
                            skipBackup: true,
                            path: 'images',
                        },
                        quality: 0.7,
                        maxWidth: width,
                        maxHeight: width,
                    };

                    ImagePicker.showImagePicker(options, (response) => {
                        if (response.didCancel) {
                            //console.log('User cancelled image picker');
                        } else if (response.error) {
                            //console.log('ImagePicker Error: ', response.error);
                        } else {
                            const ID = makeid(15);
                            const pathToFile = Platform.OS == 'ios' ? response.uri : response.path;
                            storage().ref(`chats/${this.state.riderID}-${this.state.driverID}/${ID}`).putFile(pathToFile)
                                .then(() => { this.sendMessage(ID); })
                                .catch(error => { console.log(error.message) })
                        }
                    });
                }
                else {
                    Alert.alert('Permission to access camera',
                        'Please provide Perch with camera access in order to send images',
                        [
                            {
                                text: 'Cancel',
                            },
                            {
                                text: 'Provide access',
                                style: 'cancel',
                                onPress: () => {
                                    let permission_;
                                    if (Platform.OS === 'ios')
                                        permission_ = PERMISSIONS.IOS.CAMERA;
                                    else if (Platform.OS === 'android')
                                        permission_ = PERMISSIONS.ANDROID.CAMERA;
                                    request(permission_)
                                },
                            }
                        ])
                }
            })
            .catch(error => { console.log(error.message) })
    };
    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    };
    sendMessage(ID) {
        const DAY = new Date().getDate();
        const MONTH = new Date().getMonth();
        const YEAR = new Date().getFullYear();
        const m = ID ? 'Image' : this.state.message;

        let str = this.state.message;
        if (/\S/.test(str) || ID) {
            // found something other than a space or line break
            database().ref(`chats/${this.state.riderID}-${this.state.driverID}`).push().set({ //DRIVERS ALSO COME TO THIS ROUTE.
                sender: 'U',
                m: ID ? 'Image' : this.state.message,
                tS: getTime(),
                time: new Date().getTime() + `-${makeid(7)}`,//TO SEPERATE KEYS ,TIME SEPERATED BY - TO A ID
                date: `${DAY}/${MONTH + 1}/${YEAR}`,
                imageID: ID,
            })
                .then(() => {
                    this.setState({ message: '' });
                    axios.post(`https://us-central1-perch-01.cloudfunctions.net/sendNotification`, {
                        data: {
                            navigateTo: 'Chat',
                            driverID: this.state.driverID,
                            riderID: this.state.riderID,
                        },
                        notification: {
                            title: `New message${this.state.userFirstName ? ` from ${this.state.userFirstName}` : ''}`,
                            body: m,
                        },
                        recieverID: this.state.mainDriverID,
                        recieverToken: this.state.recieverToken,

                    }).catch(error => { console.log(error.message) })

                })
                .catch(error => { console.log(error.message) })
        }
    };
    render() {
        const camera = (
            this.state.message == '' ?
                <View style={{ left: x(20) }}>
                    <TouchableOpacity onPress={() => { this.getImage() }}>
                        <Icon_ name={'camera'} style={styles.camera} size={y(20)} />
                    </TouchableOpacity>
                </View> :
                <></>
        );
        const marginLeft = (this.state.message == '' ? x(31.8) : x(10));
        const messagePosition = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [(-DRIVER_PROFILE_HEIGHT_HIDDEN + y(47)), (y(120))],
            extrapolate: 'clamp'
        });
        const messageHeight = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [
                y(540 + (StatusBar.currentHeight ? StatusBar.currentHeight : 0)),
                (dimensionAssert() ?
                    y(230 + (StatusBar.currentHeight ? x(43) : 0)) :
                    y(290 + (StatusBar.currentHeight ? x(43) : 0)))
            ],
            extrapolate: 'clamp'
        });
        const driverHeight = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [(-DRIVER_PROFILE_HEIGHT_HIDDEN), (-DRIVER_PROFILE_HEIGHT_HIDDEN * (5 / 6))],
            extrapolate: 'clamp'
        });
        const profileScale = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [1, 0.4],
            extrapolate: 'clamp'
        });
        const profileFrameLeft = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [x(17), dimensionAssert() ? x(-9.5) : x(-15)],
            extrapolate: 'clamp'
        });
        const profileOpacity = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [1, 0],
            extrapolate: 'clamp'
        });
        const name_Top = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [dimensionAssert() ? y(StatusBar.currentHeight ? 25 : 30) : y(StatusBar.currentHeight ? 31 : 36), dimensionAssert() ? y(54) : y(63),],
            extrapolate: 'clamp'
        });
        const name_Left = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [x(133), x(77)],
            extrapolate: 'clamp'
        });
        const profileWidth = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [x(343), width],
            extrapolate: 'clamp'
        });
        const profileTop = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [y(44), 0],
            extrapolate: 'clamp'
        });
        const profileFrameTop = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [0, dimensionAssert() ? y(10) : y(19)],
            extrapolate: 'clamp'
        });
        const cancelScale = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [1, 1.2],
            extrapolate: 'clamp'
        });
        const cancelTop = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [x(17), dimensionAssert() ? x(47) : x(StatusBar.currentHeight ? 56 : 62)],
            extrapolate: 'clamp'
        });
        const cancelRight = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [x(17), x(18)],
            extrapolate: 'clamp'
        });
        const blockerHeight = this.keyboardPosition.interpolate({
            inputRange: [0, this.state.chatTop],
            outputRange: [x(-30), dimensionAssert() ? y(-403) : y(-332)],
            extrapolate: 'clamp'
        });

        LayoutAnimation.configureNext(CustomLayoutLinear);
        return (

            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={{ alignItems: 'center', top: (StatusBar.currentHeight ? (dimensionAssert() ? -StatusBar.currentHeight : 0) : 0) }}>
                    <StatusBar backgroundColor="#FFFFFF" barStyle={'dark-content'} />
                    <Animated.View style={[styles.driverView, { height: driverHeight, width: profileWidth, top: profileTop, }]}>

                        <Animated.View style={[styles.x, { top: cancelTop, right: cancelRight, transform: [{ scale: cancelScale }] }]}>
                            <TouchableOpacity onPress={() => {
                                this.props.navigation.goBack();
                            }}>
                                <Icon name={'x'} size={y(22)} />
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={styles.driverCentralize}>
                            <Animated.View style={[styles.profileFrame, { transform: [{ scale: profileScale }], left: profileFrameLeft, top: profileFrameTop }, this.state.url ? { borderWidth: 0 } : {}]}>
                                {this.state.url ?
                                    <Animated.Image
                                        source={{ uri: this.state.url }}
                                        resizeMode={'contain'}
                                        style={[{
                                            flex: 1,
                                            width: y(102.72),
                                            height: y(102.72),
                                        },
                                        ]} />
                                    : <></>}
                            </Animated.View>
                            <Animated.Text numberOfLines={1} style={[styles.driverName, { top: name_Top, left: name_Left }]}>{this.state.recieverDetails ? this.state.recieverDetails.name : ''}</Animated.Text>
                            <Animated.Text style={[styles.driverTripNumber, { opacity: profileOpacity }]}>{`${this.state.recieverDetails ? this.state.recieverDetails.history.tripNumber : '0'} trips`}</Animated.Text>
                            <Animated.View style={[styles.star, { opacity: profileOpacity }]}>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={this.state.recieverDetails ? Number(this.state.recieverDetails.history.rating) : 0}
                                    fullStarColor={'#FFAA00'}
                                    emptyStarColor={'#FFAA00'}
                                    starSize={y(13)}
                                />
                            </Animated.View>

                        </View>
                    </Animated.View>

                    <Animated.View style={[styles.messageContainer, { top: messagePosition, height: messageHeight, }]}>
                        {this.state.messageLoadedInit ?
                            <FlatList
                                inverted={true}
                                ref={ref => this.flatList = ref}
                                data={this.state.messageArray.slice(0, this.state.limitTo)}//Its inverted so that we start at the bottom,
                                renderItem={({ item, index }) => {
                                    const sender = item.sender;
                                    let marginTop = null, marginBottom = null, date = <></>, newdate = <></>;
                                    if (index === 0) {
                                        marginBottom = y(15);
                                    };

                                    if ((index < this.state.messageArray.length - 1) && (sender !== this.state.messageArray[index + 1].sender)) {
                                        marginTop = y(15);
                                    };

                                    if (index == this.state.messageArray.length - 1 && item.date)
                                        date = <DayMonthYear text={item.date ? item.date : 'New Day'} />;
                                    else if (item.date && index >= 1) {
                                        let currentTextDate = formattedDateToValue(item.date);
                                        let lastTextDate = formattedDateToValue(this.state.messageArray[index - 1].date);
                                        if (lastTextDate > currentTextDate)
                                            newdate = <DayMonthYear text={this.state.messageArray[index - 1].date} />;
                                    };




                                    if (sender === 'U') {
                                        return (
                                            <>
                                                {newdate}
                                                <UserMessage
                                                    data={item}
                                                    marginTop={marginTop}
                                                    marginBottom={marginBottom}
                                                    imageRef={`chats/${this.state.riderID}-${this.state.driverID}/`}
                                                    urlRef={this.state.url}
                                                />
                                                {date}
                                            </>
                                        )
                                    }
                                    else if (sender === 'O') {
                                        return (
                                            <>
                                                {newdate}
                                                <Message
                                                    data={item}
                                                    marginTop={marginTop}
                                                    marginBottom={marginBottom}
                                                    imageRef={`chats/${this.state.riderID}-${this.state.driverID}/`}
                                                    urlRef={this.state.url}
                                                />
                                                {date}
                                            </>
                                        )
                                    }


                                }}
                                keyExtractor={item => JSON.stringify(item)}
                                onEndReached={() => {
                                    this.setState({ limitTo: this.state.limitTo + 10 })
                                }}
                                onEndReachedThreshold={0.7}
                            /> : <></>}
                    </Animated.View>


                    <View style={styles.textInputWrapper}>

                        <Animated.View style={[styles.textInputView, { bottom: this.keyboardPosition }]}>

                            {camera}
                            <TextInput
                                placeholder={'Type a message ...'}
                                style={[styles.textInput, { marginLeft: marginLeft }]}
                                onChangeText={(value) => { this.setState({ message: value }) }}
                                value={this.state.message}
                                multiline={true}
                                textAlignVertical={'top'}
                                onFocus={() => {
                                    if (Platform.OS === 'android' && keyboardEvent1 !== 'keyboardDidShow')
                                        Keyboard.emit('keyboardWillShow')
                                }}
                                onEndEditing={() => {
                                    if (Platform.OS === 'android')
                                        Keyboard.emit('keyboardWillHide')
                                }}
                            />
                            <View style={styles.send}>
                                <TouchableOpacity onPress={() => { this.sendMessage.call(this) }} >
                                    <Icon_ name={'paper-plane'} color={GREEN} size={y(30)} />
                                </TouchableOpacity>
                            </View>

                        </Animated.View>

                        <Animated.View style={[styles.blocker, { top: blockerHeight }]}></Animated.View>
                    </View>
                </View>
                <Notifications />
            </View>
        );
    }
};


YellowBox.ignoreWarnings([
    'Each child in a list should have a unique "key" prop.',
]);


function getTime() {
    const currentTime = new Date().getSeconds() + (new Date().getMinutes() * 60) + (new Date().getHours() * 60 * 60);

    const CURRENTTIME = (new Date((currentTime) * 1000).toISOString().substr(11, 8));
    const hour_ = Number(CURRENTTIME.substr(0, 2));
    const minutes = (CURRENTTIME.substr(3, 2))
    const meridien = hour_ >= 12 ? 'PM' : 'AM';
    const hour = hour_ > 12 ? hour_ - 12 : (hour_ == 0 ? 12 : hour_);
    const TIME = `${hour}:${minutes} ${meridien}`;
    return TIME;
};

function formattedDateToValue(date) {

    let slash1 = 0, slash2 = 0;
    for (let k = 0; k < date.length; k++) {
        if (date.charAt(k) == '/')
            slash1 == 0 ? slash1 = k : slash2 = k;
    }
    const DAY_ = date.substring(0, slash1);
    const MONTH_ = date.substring(slash1 + 1, slash2);
    const YEAR_ = date.substring(slash2 + 1);

    const NUMBERDAY = Number(YEAR_ + MONTH_ + DAY_);
    return NUMBERDAY;
}
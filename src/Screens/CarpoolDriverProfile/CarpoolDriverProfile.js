import React from 'react';
import styles from './styles';
import { View, Text, Dimensions, Image, Animated, StatusBar, Platform } from 'react-native';
import Header from '../../Components/Header/Header';
import Divider from '../../Components/Divider/Divider';
import StarRating from 'react-native-star-rating';
import { OfflineNotice, x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
const [GREEN, WHITE, GOLD] = ['#4DB748', '#FFFFFF', '#FFAA00'];


export default class CarpoolDriverProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            driver: this.props.route.params.driver,
            url: null,
            joinedText: null,
        }
    }
    componentDidMount() {
        this.setImage();
    }
    setImage = () => {
        database().ref(`userImage/${this.state.driver.mainID}`).once('value', snap => {
            storage().ref(`${snap.val()}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) });
            this.setState({ joinedText: snap.val().driverJoinedText })
        })
    };
    render() {
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header scrollY={this.state.scrollY} name={'Driver Profile'} onPress={this.props.navigation.goBack} />
                <View style={styles.container1}>
                    <View style={[styles.profilePic, this.state.url ? { borderWidth: 0 } : {borderWidth: 0}]}>
                        {
                            this.state.url ?
                                <Image
                                    source={{ uri: this.state.url }}
                                    resizeMode={'contain'}
                                    style={{
                                        flex: 1,
                                        width: y(116),
                                        height: y(116),
                                    }} />
                                : <></>
                        }
                    </View>
                    <View style={styles.profileDetails}>
                        <Text style={[styles.mainText, { fontSize: y(25) }]}>{this.state.driver.name}</Text>
                        <Text style={[styles.mainText, { fontSize: y(15), }]}>{`${this.state.driver.history.rating.toFixed(1)} • ${this.state.driver.history.tripNumber} trips`}</Text>
                        <View style={styles.star_joined}>
                            <View style={styles.starContainer}>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={this.state.driver.history.rating}
                                    fullStarColor={GOLD}
                                    emptyStarColor={GOLD}
                                    starSize={y(16)}
                                />
                            </View>
                            <Text style={[styles.joined, { opacity: this.state.joinedText ? 1 : 0 }]}>{this.state.joinedText ? this.state.joinedText : `Joined September 2020`}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.divider,]}><Divider height={0.5} width={x(349)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                <View style={styles.carDetails}>
                    <Text style={styles.carText}>{`${this.state.driver.carDetails.color} ${this.state.driver.carDetails.year} ${this.state.driver.carDetails.make} ${this.state.driver.carDetails.model}`}</Text>
                    <Text style={[styles.carText, { color: GREEN }]}>{this.state.driver.carDetails.plateNumber}</Text>
                </View>
                <View style={styles.security_container}>
                    <Text style={[styles.carText, { fontSize: y(18), marginBottom: y(4) }]}>Important Security Tips</Text>
                    <View style={{ marginBottom: y(12) }}><Divider height={0.5} width={x(349)} borderRadius={3} borderColor={'#707070'} borderWidth={0.5} /></View>
                    <View style={styles.bulletView}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletTip}>Verify the plate number to ensure it is the same as the provided plate.</Text>
                    </View>
                    <View style={styles.bulletView}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletTip}>Check the profile picture and that of the vehicle driver.</Text>
                    </View>
                    <View style={styles.bulletView}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletTip}>Remember that you have to be at the pickup spot before the driver arrives to avoid delays, additional costs or even missing your trip.</Text>
                    </View>
                    <View style={styles.bulletView}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletTip}>Ensure that you picked the correct number of seats that would be needed for the commute.</Text>
                    </View>
                </View>
            </View>
        )
    }
};
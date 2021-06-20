import React from 'react';
import { Animated, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import AndroidOpenSettings from 'react-native-android-open-settings';
import Icon from 'react-native-vector-icons/Ionicons';
import Divider from '../../Components/Divider/Divider';
import Header from '../../Components/Header/Header';
import { OfflineNotice, openBrowser, x, y } from '../../Functions/Functions';
import Woman from '../../Images/svgImages/woman';
import styles from './styles';

export default class Privacy extends React.Component {
    constructor() {
        super();

        this.state = {
            scrollY: new Animated.Value(0),
        };
    }
    render() {
        return (
            <View style={styles.container}>
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <Header name={'Privacy'} scrollY={this.state.scrollY} onPress={() => { this.props.navigation.goBack() }} />

                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'ios')
                            Linking.openURL('app-settings:');
                        else if (Platform.OS === 'android')
                            AndroidOpenSettings.appNotificationSettings()

                    }}>
                    <View style={styles.option}>
                        <Text style={styles.text}>Notifications</Text>

                        <Icon name={'ios-arrow-forward'} size={y(18)} />
                    </View>
                </TouchableOpacity>
                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'ios')
                            Linking.openURL('app-settings:');
                        else if (Platform.OS === 'android')
                            AndroidOpenSettings.locationSourceSettings()

                    }}>
                    <View style={styles.option}>
                        <Text style={styles.text}>Location</Text>

                        <Icon name={'ios-arrow-forward'} size={y(18)} />
                    </View>
                </TouchableOpacity>
                <Divider width={x(350)} height={0.5} borderRadius={0} borderColor={'#D3D3D3'} borderWidth={1} />
                <TouchableOpacity
                    onPress={() => {
                        openBrowser('https://perchrides.com/s/db/udash')
                    }}>
                    <View style={styles.option}>
                        <Text style={styles.delete}>Delete Account</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.w}>
                    <Woman />
                </View>
            </View>
        )
    }
};

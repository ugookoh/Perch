import { Picker } from '@react-native-community/picker';
import database from '@react-native-firebase/database';
import React from 'react';
import { Animated, Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../Components/Header/Header';
import { CarpoolCard, RideShareCard } from '../../Components/HistoryCards/HistoryCards';
import { colors, dimensionAssert, monthNames, OfflineNotice, x, y } from '../../Functions/Functions';
import CatcusNoResults from '../../Images/svgImages/cactusNoResults';
import styles from './styles';

export default class History extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scrollY: new Animated.Value(0),
            modePicker: false,
            choice: 'carpool',
            month: monthNames[new Date().getMonth()],
            year: new Date().getFullYear(),
            results: null,
            userID: this.props.route.params.userDetails.userID,
            limitTo: 20,
        }
        this.togglePicker = this.togglePicker.bind(this);
        this.toDisplay = 'Carpool';
        this.toHide = 'Rideshare';
        this.pickerHeight = new Animated.Value(0);

        this.pickerPosition = new Animated.Value(-y(310))
        this.showPicker = this.showPicker.bind(this);
        this.hidePicker = this.hidePicker.bind(this);

    };
    componentDidMount() {
        this.loadResults.call(this);
    }
    loadResults() {
        this.setState({ results: null }, () => {
            database().ref(`userHistory/${this.state.userID}/${this.state.choice}/${this.state.year}/${this.state.month}`).once('value', snapshot => {
                this.setState({ results: snapshot.val() ? snapshot.val() : 'NORESULTS' });
            }).catch(error => { alert(error.message) })
        });
    };
    togglePicker(choice) {
        if (this.state.modePicker) {//make it false

            if (choice) {
                const l = this.toDisplay;
                this.toDisplay = this.toHide;
                this.setState({ choice: this.toDisplay === 'Carpool' ? 'carpool' : 'rideshare' }, () => {
                    this.loadResults.call(this);
                });
                Animated.spring(this.pickerHeight, {
                    toValue: 0,
                    bounciness: 0,
                    useNativeDriver: false,
                }).start(() => {
                    this.toHide = l;
                });
                this.setState({ modePicker: false });
            }
            else
                Animated.spring(this.pickerHeight, {
                    toValue: 0,
                    bounciness: 0,
                    useNativeDriver: false,
                }).start();
            this.setState({ modePicker: false });
        }
        else {//make it true
            Animated.spring(this.pickerHeight, {
                toValue: y(dimensionAssert() ? 35 : 30.5),
                bounciness: 0,
                useNativeDriver: false,
            }).start();
            this.setState({ modePicker: true });
        }
    };
    hidePicker() {
        this.loadResults.call(this);
        Animated.spring(this.pickerPosition, {
            toValue: dimensionAssert() ? -y(310) : -y(290),
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };
    showPicker() {
        Animated.spring(this.pickerPosition, {
            toValue: 0,
            bounciness: 0,
            useNativeDriver: false,
        }).start();
    };
    timeAndDate(time, month, year) {
        let slash1 = 0, slash2 = 0, slash3 = 0;
        for (let k = 0; k < time.length; k++) {
            if (time.charAt(k) == '-')
                slash1 == 0 ? slash1 = k : slash2 == 0 ? slash2 = k : slash3 = k;
        }

        const HOUR = Number(time.substring(slash1 + 1, slash2)) == 0 ? 12 : Number(time.substring(slash1 + 1, slash2)) > 12 ? Number(time.substring(slash1 + 1, slash2)) - 12 : Number(time.substring(slash1 + 1, slash2));
        const MIN = Number(time.substring(slash2 + 1, slash3)) < 10 ? `0` + time.substring(slash2 + 1, slash3) : Number(time.substring(slash2 + 1, slash3));
        const MERIDIAN = Number(time.substring(slash1 + 1, slash2)) < 12 ? 'AM' : 'PM';
        const DAY = time.substring(0, slash1);
        const MONTH = monthNames.indexOf(month) + 1;
        const formattedDate = `${DAY}/${MONTH}/${year}, ${HOUR}:${MIN} ${MERIDIAN}`;

        return (formattedDate);
    };
    sorter(a, b) {
        function numbergetter(time) {
            let slash1 = 0, slash2 = 0, slash3 = 0;
            for (let k = 0; k < time.length; k++) {
                if (time.charAt(k) == '-')
                    slash1 == 0 ? slash1 = k : slash2 == 0 ? slash2 = k : slash3 = k;
            };

            const DAY = Number(time.substring(0, slash1)) * 86400;
            const HOUR = Number(time.substring(slash1 + 1, slash2)) * 3600;
            const MINS = Number(time.substring(slash2 + 1, slash3)) * 60;
            const SECS = Number(time.substring(slash3 + 1, time.length));

            return (DAY + HOUR + MINS + SECS)
        };

        let a_time = numbergetter(a)
        let b_time = numbergetter(b)

        if (a_time > b_time)
            return -1;
        else
            return 1
    };
    render() {
        const iconRotation = this.pickerHeight.interpolate({
            inputRange: [0, y(dimensionAssert() ? 35 : 30.5)],
            outputRange: ['0deg', '-180deg'],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.container}>
                <Header scrollY={this.state.scrollY} name={'History'} onPress={() => {
                    this.props.navigation.goBack();
                }} />
                <OfflineNotice navigation={this.props.navigation} screenName={this.props.route.name} />
                <View style={styles.pickerContainer}>

                    <View style={styles.picker}>
                        <TouchableOpacity style={[styles.choice, { left: x(27), top: 0, }]} onPress={() => { this.togglePicker(false) }} disabled={true}>
                            <Text style={styles.choiceLetter}>{this.toDisplay}</Text>
                            {/* <View style={styles.downArrow}>
                                <Animated.View style={[{ transform: [{ rotate: iconRotation }] }]}><Icon name={'ios-arrow-down'} size={y(30)} /></Animated.View>
                            </View> */}
                        </TouchableOpacity>


                        <View style={[styles.choice, { right: x(27), top: 0, }]}>

                            <TouchableOpacity
                                onPress={this.showPicker}
                                style={{ flexDirection: 'row' }}>
                                <Text style={styles.date}>{this.state.month} {this.state.year}</Text>
                                <View><Icon name={'ios-calendar'} size={y(20)} color={'#4DB748'} /></View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Animated.View style={[styles.pickerAnimated, { height: this.pickerHeight }]}>
                        <TouchableOpacity
                            style={styles.choiceSecond}
                            onPress={() => { this.togglePicker('CHOICEMADE') }}>
                            <Text style={[styles.choiceLetter, { marginLeft: x(26), }]}>{this.toHide}</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.results}>
                        {this.state.results
                            ?
                            this.state.results == 'NORESULTS' ?
                                <View style={styles.noResultsConatiner}>
                                    <View style={styles.noResults}>
                                        <CatcusNoResults />
                                    </View>
                                    <Text style={styles.noResultsText}>It seems you don't have any travel history with us during this time...weird.</Text>
                                </View>
                                :
                                <View style={styles.results_}>
                                    <FlatList
                                        //inverted={true}
                                        initialNumToRender={4}
                                        ref={ref => this.flatList = ref}
                                        data={Object.keys(this.state.results).sort(this.sorter).slice(0, this.state.limitTo)}//Its inverted so that we start at the bottom,
                                        renderItem={({ item, index }) => {
                                            //FORMAT `${DAY}-${HOUR}-${MIN}-${SECOND}`
                                            const data = this.state.results[item]//OBJECT
                                            const date = this.timeAndDate(item, this.state.month, this.state.year);
                                            if (this.state.results != null) {
                                                const historyRef = `userHistory/${this.state.userID}/${this.state.choice}/${this.state.year}/${this.state.month}/${item}`;
                                                if (this.state.choice == 'carpool')
                                                    return (
                                                        <CarpoolCard date={date} data={data} navigation={this.props.navigation} historyRef={historyRef} userID={this.state.userID} loadResults={() => { this.loadResults.call(this) }} />
                                                    )
                                                else
                                                    return (
                                                        <RideShareCard date={date} data={data} navigation={this.props.navigation} historyRef={historyRef} userID={this.state.userID} loadResults={() => { this.loadResults.call(this) }} />
                                                    )
                                            }

                                        }}
                                        onEndReached={() => {
                                            this.setState({ limitTo: this.state.limitTo + 10 })
                                        }}
                                        onEndReachedThreshold={0.7}
                                        keyExtractor={item => JSON.stringify(item)}

                                    />
                                </View>
                            :
                            <View>
                                <MaterialIndicator color={colors.GREEN} size={y(70)} style={{ bottom: x(dimensionAssert() ? 50 : 60) }} />
                            </View>}
                    </View>
                </View>

                <Animated.View style={[styles.pickerView, { bottom: this.pickerPosition, }]}>
                    <View style={styles.pickerChoice}>
                        <View style={{ marginRight: x(20) }}>
                            <Button
                                onPress={this.hidePicker}
                                title="Choose"

                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Picker
                            style={styles.picker_}
                            selectedValue={this.state.month}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ month: itemValue })
                                //this.hidePicker();
                            }}>
                            <Picker.Item label="January" value="January" />
                            <Picker.Item label="February" value="February" />
                            <Picker.Item label="March" value="March" />
                            <Picker.Item label="April" value="April" />
                            <Picker.Item label="May" value="May" />
                            <Picker.Item label="June" value="June" />
                            <Picker.Item label="July" value="July" />
                            <Picker.Item label="August" value="August" />
                            <Picker.Item label="September" value="September" />
                            <Picker.Item label="October" value="October" />
                            <Picker.Item label="November" value="November" />
                            <Picker.Item label="December" value="December" />
                        </Picker>
                        <Picker
                            style={styles.picker_}
                            selectedValue={this.state.year}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ year: itemValue })
                                //this.hidePicker();
                            }}>
                            <Picker.Item label="2020" value="2020" />
                            <Picker.Item label="2021" value="2021" />
                            <Picker.Item label="2022" value="2022" />
                            <Picker.Item label="2023" value="2023" />
                            <Picker.Item label="2024" value="2024" />
                            <Picker.Item label="2025" value="2025" />
                            <Picker.Item label="2026" value="2026" />
                            <Picker.Item label="2027" value="2027" />
                            <Picker.Item label="2028" value="2028" />
                            <Picker.Item label="2029" value="2029" />
                            <Picker.Item label="2030" value="2030" />
                            <Picker.Item label="2031" value="2031" />
                            <Picker.Item label="2032" value="2032" />
                            <Picker.Item label="2033" value="2033" />
                            <Picker.Item label="2034" value="2034" />
                            <Picker.Item label="2035" value="2035" />
                            <Picker.Item label="2036" value="2036" />
                            <Picker.Item label="2037" value="2037" />
                            <Picker.Item label="2038" value="2038" />
                            <Picker.Item label="2039" value="2039" />
                            <Picker.Item label="2040" value="2040" />
                            <Picker.Item label="2041" value="2041" />
                        </Picker>
                    </View>
                </Animated.View>
            </View>
        );
    }
};
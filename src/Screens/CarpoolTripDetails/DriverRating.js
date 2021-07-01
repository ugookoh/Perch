import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import React from 'react';
import { Image, Text, View } from 'react-native';
import StarRating from 'react-native-star-rating';
import { x, y } from '../../Functions/Functions';
import styles from './styles';

export default class DriverRating extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            driver: this.props.driver,
            url: null
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
            <View style={styles.driverRatingContainer}>
                <View style={[styles.driverRatingdp, this.state.url ? { borderWidth: 0 } : {}]}>
                    {
                        this.state.url ?
                            <Image
                                source={{ uri: this.state.url }}
                                resizeMode={'contain'}
                                style={{
                                    flex: 1,
                                    height: x(60),
                                    width: x(60),
                                }} />
                            : <></>
                    }
                </View>
                <Text style={[styles.ratingDriverName, { marginVertical: y(5) }]}>{this.props.driverName}</Text>
                <View style={styles.star}>
                    <StarRating
                        disabled={false}
                        maxStars={5}
                        rating={Number(this.props.rating)}
                        fullStarColor={this.props.starColor}
                        emptyStarColor={this.props.starColor}
                        starSize={x(40)}
                        selectedStar={(rating) => { this.props.ratingAdjust(rating) }}
                    />
                </View>

            </View>
        )
    }
};
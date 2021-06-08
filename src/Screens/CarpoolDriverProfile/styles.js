import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    container1: {
        marginTop: y(27),
        height: y(116),
        width: x(349),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profilePic: {
        height: y(116),
        width: y(116),
        borderRadius: 10,
        borderWidth: 2,
        overflow: 'hidden',
    },
    profileDetails: {
        height: y(116),
        width: x(206),
        justifyContent: 'flex-end'
    },
    divider: {
        marginTop: y(17),
    },
    carDetails: {
        width: x(349),
        marginTop: y(18.5),
    },
    mainText: {
        fontFamily: 'Gilroy-SemiBold',
    },
    carText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(23, true),
    },
    security_container: {
        width: x(349),
        marginTop: y(28),
    },
    bulletView: {
        flexDirection: 'row',
    },
    bullet: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(15, true),
        marginRight: x(4),
    },
    bulletTip: {
        fontSize: y(16, true),
        fontFamily: 'Gilroy-Regular',
    },
    starContainer: {
        width: x(90),
    },
    star_joined: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: x(206),
        marginTop: y(3),
    },
    joined: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(8, true),
        top: x(4),
    },
});
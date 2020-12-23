import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    _title: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(20),
        color: 'rgba(77, 183, 72, 0.7)',
        width: x(343),
    },
    divider: {
        alignItems: 'center',
        opacity: 0.25,
    },
    scrollView: {
        marginTop: y(10),
        height: y(550),
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noResultView: {
        top: -y(50),
        alignItems: 'center'
    },
    noResult: {
        height: y(290),
        width: y(290),
        opacity: 0.7
    },
    noResultText: {
        top: y(5),
        textAlign: 'center',
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(14),
        color: '#4DB748'
    },
});
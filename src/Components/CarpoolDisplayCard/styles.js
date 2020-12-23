import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        height: y(dimensionAssert() ? 170 : 160),
    },
    card: {
        width: x(333),
        height: y(dimensionAssert() ? 140 : 130),
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.36,
        shadowRadius: 6.68,
        elevation: 11,
    },
    loader: {
        width: x(333),
        height: y(dimensionAssert() ? 140 : 130),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 1,
        backgroundColor: 'rgba(180, 179, 179, 0.50)',
    },
    cost: {
        position: 'absolute',
        bottom: y(3),
        left: x(8.2),
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(22),
    },
    distance: {
        position: 'absolute',
        bottom: y(27),
        right: x(15),
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15),
        //textAlign:'right'
    },
    time: {
        position: 'absolute',
        bottom: y(3),
        right: x(15),
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15),
        //textAlign:'right'
    },
    tripBreakdownSingleTrip: {
        height: y(64.16),
        width: x(333),
        backgroundColor: '#4DB748',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        position: 'absolute',
        top: (0),
        left: (0),
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripBreakdownContainer: {
        height: y(64.16),
        width: x(333),
        borderRadius: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        flexDirection: 'row'
    },
    tripBreakdown2trip_1: {
        height: y(64.16),
        borderTopLeftRadius: 10,
        backgroundColor: '#4DB748',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripBreakdown2trip_2: {
        height: y(64.16),
        borderTopRightRadius: 10,
        backgroundColor: '#1970A7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripBreakdown3trip_1: {
        height: y(64.16),
        borderTopLeftRadius: 10,
        backgroundColor: '#4DB748',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripBreakdown3trip_2: {
        height: y(64.16),
        backgroundColor: '#1970A7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripBreakdown3trip_3: {
        height: y(64.16),
        borderTopRightRadius: 10,
        backgroundColor: '#A031AF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
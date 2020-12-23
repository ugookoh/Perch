import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    paymentMethod: {
        height: y(189.46),
        width: x(247.38),
        marginTop: y(20.1),
    },
    options: {
        height: y(382),
        width: x(334),
        marginTop: y(20),
        justifyContent: 'space-between',
    },
    box: {
        width: x(334),
        height: y(80),
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.19,
        shadowRadius: 4.65,
        elevation:3,
    },
    icon: {
        height: x(23),
        width: x(23),
        borderRadius: 20,
        backgroundColor: '#4DB748',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: x(15),
    },
    boxType: {
        fontFamily: 'Gilroy-Medium',
        fontSize: y(15),
        position: 'absolute',
        left: x(63),
    },
    cC: {
        width: x(31.11),
        height: y(22.53),
        position: 'absolute',
        left: x(16),
    },
    bank: {
        width: x(30.56),
        height: y(27.02),
        position: 'absolute',
        left: x(16),
    },
    pP: {
        width: x(19.66),
        height: y(23.02),
        position: 'absolute',
        left: x(16),
    },
    pC: {
        width: x(31.11),
        height: y(34.18),
        position: 'absolute',
        left: x(16),
    },
});

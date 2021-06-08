import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    slide: {
        flex: 1,
        alignItems: 'center',
    },
    logo: {
        height: y(65.42),
        width: x(41.61),
        marginTop: y(60),
        zIndex: 1,
        top: x(30),
    },
    oB1: {
        width: width,
        height: y(276.85),
        position: 'absolute',
        bottom: 0,
    },
    oB2: {
        width: x(304.56),
        height: y(211.26),
        position: 'absolute',
        bottom: 0,
    },
    oB3: {
        width: width,
        height: y(dimensionAssert() ? 290 : 239.16),
        position: 'absolute',
        bottom: 0,
    },
    title: {
        fontSize: y(22, true),
        fontFamily: 'Gilroy-SemiBold',
        textAlign: 'center',
        maxWidth: x(343),
    },
    subtext: {
        fontSize: y(13, true),
        fontFamily: 'Gilroy-Regular',
        textAlign: 'center',
        maxWidth: x(343),
        lineHeight: y(20),
    },
    box: {
        height: y(350),
        width: width,
        alignItems: 'center'
    },
    button: {
        width: x(343),
        height: y(48),
        backgroundColor: '#658280',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: y(15, true),
        fontFamily: 'Gilroy-Bold',
    },

});

import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    option: {
        height: dimensionAssert() ? y(72) : y(62),
        width: x(340),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    text: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(21, true),
    },
    delete: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(21, true),
        color: '#FF0000',
    },


    w: {
        width: width,
        height: y(298.79),

        position: 'absolute',
        bottom: 0,
    },
});

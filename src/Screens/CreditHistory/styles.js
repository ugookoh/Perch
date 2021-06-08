import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',

    },

    list: {
        width: width,
        height: y(dimensionAssert() ? 640 : 641),
    },
    text: {
        fontSize: y(15, true),
        fontFamily: 'Gilroy-Regular',
        width: x(343),
    },
    divider: {
        width: width,
        alignItems: 'center',
    },
    textContainer: {
        width: width,
        marginVertical: x(10),
        alignItems: 'center',
    },
});

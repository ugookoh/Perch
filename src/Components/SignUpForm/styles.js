import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
export default StyleSheet.create({
    view: {
        borderWidth: 1,
        borderColor: 'rgba(149,149,149,0.25)',
        borderRadius: 5,
        justifyContent: 'center'
    },
    textInput: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15, true),
        paddingLeft: x(10),
        color: '#000000',
    },
});
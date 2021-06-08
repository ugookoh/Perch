import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        position: 'absolute',
        height: y(263),
        width: x(263),
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    firstLayer: {
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    text: {
        fontFamily: 'Comfortaa-Bold',
        fontSize: y(20, true),
        //backgroundColor:'red',
        padding:x(13),
    },
    icon:{
        padding:x(13),
        //backgroundColor:'red'
    },
});